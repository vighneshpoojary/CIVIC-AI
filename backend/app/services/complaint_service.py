import os
import uuid
import json
import logging
import urllib.request
import pandas as pd
from datetime import datetime
from typing import List, Optional, Dict, Any, Set
from collections import defaultdict, Counter
from app.core.config import settings

logger = logging.getLogger(__name__)

class ComplaintService:
    def __init__(self):
        self.complaints_db: Dict[str, Dict[str, Any]] = {}
        self.status_history_db: Dict[str, List[Dict[str, Any]]] = {}
        
        # Inverted index data structures for O(1) filtering
        self._category_idx: Dict[str, Set[str]] = defaultdict(set)
        self._priority_idx: Dict[str, Set[str]] = defaultdict(set)
        self._status_idx: Dict[str, Set[str]] = defaultdict(set)
        self._ward_idx: Dict[str, Set[str]] = defaultdict(set)
        self._ref_id_idx: Dict[str, str] = {}
        
        # In-memory analytics cache
        self._analytics_cache: Optional[Dict[str, Any]] = None
        self._ward_rankings_cache: Optional[List[Dict[str, Any]]] = None

        self.load_initial_data()

    def _index_record(self, cid: str, rec: Dict[str, Any]):
        """Adds a complaint ID to secondary inverted indexes."""
        if rec.get("category"):
            self._category_idx[rec["category"]].add(cid)
        if rec.get("priority"):
            self._priority_idx[rec["priority"]].add(cid)
        if rec.get("status"):
            self._status_idx[rec["status"]].add(cid)
        if rec.get("ward"):
            self._ward_idx[rec["ward"]].add(cid)
        if rec.get("reference_id"):
            self._ref_id_idx[rec["reference_id"]] = cid
        self._invalidate_analytics_cache()

    def _unindex_record(self, cid: str, rec: Dict[str, Any]):
        """Removes a complaint ID from secondary inverted indexes."""
        if rec.get("category") and cid in self._category_idx[rec["category"]]:
            self._category_idx[rec["category"]].discard(cid)
        if rec.get("priority") and cid in self._priority_idx[rec["priority"]]:
            self._priority_idx[rec["priority"]].discard(cid)
        if rec.get("status") and cid in self._status_idx[rec["status"]]:
            self._status_idx[rec["status"]].discard(cid)
        if rec.get("ward") and cid in self._ward_idx[rec["ward"]]:
            self._ward_idx[rec["ward"]].discard(cid)
        if rec.get("reference_id") and rec["reference_id"] in self._ref_id_idx:
            del self._ref_id_idx[rec["reference_id"]]
        self._invalidate_analytics_cache()

    def _invalidate_analytics_cache(self):
        self._analytics_cache = None
        self._ward_rankings_cache = None

    def load_initial_data(self):
        seed_csv = r"E:\prompt warz\dataset\processed\civicai_seed_complaints.csv"
        if os.path.exists(seed_csv):
            try:
                df = pd.read_csv(seed_csv, nrows=500)  # Load first 500 for fast local dev
                for _, row in df.iterrows():
                    cid = str(uuid.uuid4())
                    ref_id = str(row.get("reference_id", f"BLR-2024-{cid[:6].upper()}"))
                    record = {
                        "id": cid,
                        "reference_id": ref_id,
                        "citizen_id": "seed-citizen-01",
                        "title": str(row.get("title", "Civic Issue")),
                        "description": str(row.get("description", "Reported civic issue")),
                        "category": str(row.get("normalized_category", "Other")),
                        "subcategory": str(row.get("normalized_subcategory", "General")),
                        "address": f"Ward {row.get('Ward Name', 'Bengaluru')}, Bengaluru",
                        "city": "Bengaluru",
                        "ward": str(row.get("Ward Name", "Bengaluru")),
                        "latitude": float(row.get("latitude", 12.9716)),
                        "longitude": float(row.get("longitude", 77.5946)),
                        "priority": str(row.get("priority", "Medium")),
                        "status": str(row.get("normalized_status", "Awaiting Review")),
                        "assigned_department_id": str(row.get("normalized_category", "Roads and Infrastructure")),
                        "assigned_officer_id": str(row.get("officer_name", "Unassigned")),
                        "is_synthetic": False,
                        "source_name": "BBMP Grievances 2024",
                        "created_at": datetime.utcnow().isoformat(),
                        "updated_at": datetime.utcnow().isoformat(),
                        "resolved_at": datetime.utcnow().isoformat() if row.get("normalized_status") == "Resolved" else None
                    }
                    self.complaints_db[cid] = record
                    self._index_record(cid, record)
                logger.info(f"Indexed {len(self.complaints_db)} initial complaints into memory.")
            except Exception as e:
                logger.warning(f"Notice: Could not load seed CSV ({e}). Starting with empty store.")

    def get_all(self, category: Optional[str] = None, priority: Optional[str] = None, 
                status: Optional[str] = None, ward: Optional[str] = None, 
                search: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        """
        High-performance filtered complaint retrieval utilizing inverted index set intersections.
        Reduces time complexity from O(N) to O(1) set candidate operations.
        """
        candidate_ids: Optional[Set[str]] = None

        if category and category != "All":
            c_set = self._category_idx.get(category, set())
            candidate_ids = c_set if candidate_ids is None else candidate_ids & c_set
            if not candidate_ids:
                return []

        if priority and priority != "All":
            p_set = self._priority_idx.get(priority, set())
            candidate_ids = p_set if candidate_ids is None else candidate_ids & p_set
            if not candidate_ids:
                return []

        if status and status != "All":
            s_set = self._status_idx.get(status, set())
            candidate_ids = s_set if candidate_ids is None else candidate_ids & s_set
            if not candidate_ids:
                return []

        if ward and ward != "All":
            w_set = self._ward_idx.get(ward, set())
            candidate_ids = w_set if candidate_ids is None else candidate_ids & w_set
            if not candidate_ids:
                return []

        if candidate_ids is not None:
            results = [self.complaints_db[cid] for cid in candidate_ids if cid in self.complaints_db]
        else:
            results = list(self.complaints_db.values())

        if search:
            q = search.lower()
            results = [c for c in results if q in c["title"].lower() or q in c["description"].lower() or q in c["reference_id"].lower()]
            
        return results[offset: offset + limit]

    def get_by_id(self, complaint_id: str) -> Optional[Dict[str, Any]]:
        return self.complaints_db.get(complaint_id)

    def _sync_record_to_supabase(self, record: Dict[str, Any]):
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            return
        try:
            url = f"{settings.SUPABASE_URL}/rest/v1/complaints?on_conflict=reference_id"
            payload = {
                "reference_id": record["reference_id"],
                "title": record["title"],
                "description": record["description"],
                "category": record["category"],
                "subcategory": record.get("subcategory", "General"),
                "address": record["address"],
                "city": record.get("city", "Bengaluru"),
                "ward": record.get("ward", "Bengaluru Central"),
                "latitude": float(record.get("latitude", 12.9716)),
                "longitude": float(record.get("longitude", 77.5946)),
                "priority": record.get("priority", "Medium"),
                "status": record.get("status", "Submitted"),
                "assigned_department_id": record.get("assigned_department_id"),
                "assigned_officer_id": record.get("assigned_officer_id"),
                "is_synthetic": record.get("is_synthetic", False),
                "source_name": record.get("source_name", "Citizen Portal")
            }
            req = urllib.request.Request(
                url,
                data=json.dumps(payload).encode('utf-8'),
                headers={
                    'apikey': settings.SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}',
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates'
                },
                method='POST'
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception as e:
            logger.debug(f"Supabase sync notice: {e}")

    def _sync_patch_to_supabase(self, complaint_id: str, patch_data: Dict[str, Any], ref_id: Optional[str] = None):
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            return
        try:
            filter_param = f"reference_id=eq.{ref_id}" if ref_id else f"id=eq.{complaint_id}"
            url = f"{settings.SUPABASE_URL}/rest/v1/complaints?{filter_param}"
            req = urllib.request.Request(
                url,
                data=json.dumps(patch_data).encode('utf-8'),
                headers={
                    'apikey': settings.SUPABASE_SERVICE_ROLE_KEY,
                    'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}',
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                method='PATCH'
            )
            urllib.request.urlopen(req, timeout=3)
        except Exception as e:
            logger.debug(f"Supabase patch notice: {e}")

    def get_by_reference_id(self, ref_id: str) -> Optional[Dict[str, Any]]:
        """O(1) index lookup by reference ID, falling back to Supabase if not in memory."""
        cid = self._ref_id_idx.get(ref_id)
        if cid and cid in self.complaints_db:
            return self.complaints_db[cid]
            
        # Fallback to direct Supabase PostgreSQL query
        if settings.SUPABASE_URL and settings.SUPABASE_SERVICE_ROLE_KEY:
            try:
                url = f"{settings.SUPABASE_URL}/rest/v1/complaints?reference_id=eq.{ref_id}&select=*&limit=1"
                req = urllib.request.Request(
                    url,
                    headers={
                        'apikey': settings.SUPABASE_SERVICE_ROLE_KEY,
                        'Authorization': f'Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}'
                    }
                )
                with urllib.request.urlopen(req, timeout=3) as resp:
                    data = json.loads(resp.read().decode())
                    if data and len(data) > 0:
                        rec = data[0]
                        self.complaints_db[rec["id"]] = rec
                        self._index_record(rec["id"], rec)
                        return rec
            except Exception as e:
                logger.debug(f"Supabase fetch by ref notice: {e}")
        return None

    def create(self, data: Dict[str, Any], citizen_id: str = "citizen-demo-01") -> Dict[str, Any]:
        cid = str(uuid.uuid4())
        ref_id = f"BLR-2026-{uuid.uuid4().hex[:6].upper()}"
        now = datetime.utcnow().isoformat()
        
        record = {
            "id": cid,
            "reference_id": ref_id,
            "citizen_id": citizen_id,
            "title": data["title"],
            "description": data["description"],
            "category": data["category"],
            "subcategory": data.get("subcategory", "General"),
            "address": data["address"],
            "city": data.get("city", "Bengaluru"),
            "ward": data.get("ward", "Bengaluru Central"),
            "latitude": data.get("latitude", 12.9716),
            "longitude": data.get("longitude", 77.5946),
            "priority": "Medium",  # Default before AI review
            "status": "Submitted",
            "assigned_department_id": None,
            "assigned_officer_id": None,
            "is_synthetic": False,
            "source_name": "Citizen Portal",
            "created_at": now,
            "updated_at": now,
            "resolved_at": None
        }
        self.complaints_db[cid] = record
        self._index_record(cid, record)
        
        # Initial status history
        self.status_history_db[cid] = [{
            "status": "Submitted",
            "changed_by": "Citizen",
            "timestamp": now,
            "public_note": "Complaint submitted by citizen and pending AI assessment."
        }]
        
        # Live sync to Supabase PostgreSQL
        self._sync_record_to_supabase(record)
        return record

    def update_status(self, complaint_id: str, new_status: str, actor: str = "Admin", note: str = "") -> Optional[Dict[str, Any]]:
        if complaint_id not in self.complaints_db:
            return None
        c = self.complaints_db[complaint_id]
        old_status = c.get("status")
        c["status"] = new_status
        now_str = datetime.utcnow().isoformat()
        c["updated_at"] = now_str
        if new_status == "Resolved":
            c["resolved_at"] = now_str
            
        # Update status index
        if old_status and complaint_id in self._status_idx[old_status]:
            self._status_idx[old_status].discard(complaint_id)
        self._status_idx[new_status].add(complaint_id)
        self._invalidate_analytics_cache()

        if complaint_id not in self.status_history_db:
            self.status_history_db[complaint_id] = []
            
        self.status_history_db[complaint_id].append({
            "status": new_status,
            "changed_by": actor,
            "timestamp": now_str,
            "public_note": note or f"Status transitioned to {new_status}"
        })
        
        # Live sync patch to Supabase
        self._sync_patch_to_supabase(complaint_id, {"status": new_status, "updated_at": now_str}, ref_id=c.get("reference_id"))
        return c

    def get_status_history(self, complaint_id: str) -> List[Dict[str, Any]]:
        return self.status_history_db.get(complaint_id, [])

    def get_analytics_metrics(self) -> Dict[str, Any]:
        """Cached KPI aggregation with O(1) retrieval."""
        if self._analytics_cache is not None:
            return self._analytics_cache

        all_complaints = list(self.complaints_db.values())
        total = len(all_complaints)
        
        status_counts = Counter(c["status"] for c in all_complaints)
        priority_counts = Counter(c["priority"] for c in all_complaints)
        category_counts = Counter(c["category"] for c in all_complaints)

        self._analytics_cache = {
            "total_complaints": total,
            "awaiting_review": status_counts.get("Awaiting Review", 0) + status_counts.get("Submitted", 0),
            "in_progress": status_counts.get("In Progress", 0) + status_counts.get("Assigned", 0),
            "resolved": status_counts.get("Resolved", 0),
            "rejected": status_counts.get("Rejected", 0),
            "high_or_critical": priority_counts.get("Critical", 0) + priority_counts.get("High", 0),
            "category_distribution": [
                {"category": k, "count": v} for k, v in category_counts.most_common(8)
            ],
            "priority_distribution": [
                {"priority": k, "count": v} for k, v in priority_counts.items()
            ]
        }
        return self._analytics_cache

    def get_ward_rankings_metrics(self) -> List[Dict[str, Any]]:
        """Cached ward ranking metrics."""
        if self._ward_rankings_cache is not None:
            return self._ward_rankings_cache

        all_complaints = list(self.complaints_db.values())
        ward_counts = Counter(c.get("ward", "Unknown") for c in all_complaints if c.get("ward"))
        self._ward_rankings_cache = [{"ward": w, "count": cnt} for w, cnt in ward_counts.most_common(15)]
        return self._ward_rankings_cache

complaint_service = ComplaintService()
