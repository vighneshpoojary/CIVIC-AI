import os
import uuid
import json
import urllib.request
import pandas as pd
from datetime import datetime
from typing import List, Optional, Dict, Any
from app.core.config import settings

class ComplaintService:
    def __init__(self):
        self.complaints_db: Dict[str, Dict[str, Any]] = {}
        self.status_history_db: Dict[str, List[Dict[str, Any]]] = {}
        self.load_initial_data()

    def load_initial_data(self):
        seed_csv = r"E:\prompt warz\dataset\processed\civicai_seed_complaints.csv"
        if os.path.exists(seed_csv):
            try:
                df = pd.read_csv(seed_csv, nrows=500) # Load first 500 for fast local dev
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
                print(f"Loaded {len(self.complaints_db)} initial complaints into memory.")
            except Exception as e:
                print(f"Notice: Could not load seed CSV ({e}). Starting with empty store.")

    def get_all(self, category: Optional[str] = None, priority: Optional[str] = None, 
                status: Optional[str] = None, ward: Optional[str] = None, 
                search: Optional[str] = None, limit: int = 50, offset: int = 0) -> List[Dict[str, Any]]:
        results = list(self.complaints_db.values())
        
        if category and category != "All":
            results = [c for c in results if c["category"] == category]
        if priority and priority != "All":
            results = [c for c in results if c["priority"] == priority]
        if status and status != "All":
            results = [c for c in results if c["status"] == status]
        if ward and ward != "All":
            results = [c for c in results if c["ward"] == ward]
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
            print(f"Supabase sync notice: {e}")

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
            print(f"Supabase patch notice: {e}")

    def get_by_reference_id(self, ref_id: str) -> Optional[Dict[str, Any]]:
        for c in self.complaints_db.values():
            if c["reference_id"] == ref_id:
                return c
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
                        return rec
            except Exception as e:
                print(f"Supabase fetch by ref notice: {e}")
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
            "priority": "Medium", # Default before AI review
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
        c["status"] = new_status
        now_str = datetime.utcnow().isoformat()
        c["updated_at"] = now_str
        if new_status == "Resolved":
            c["resolved_at"] = now_str
            
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

complaint_service = ComplaintService()
