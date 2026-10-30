from fastapi import APIRouter
from typing import Dict, Any, List
from collections import Counter
from app.services.complaint_service import complaint_service

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/summary")
def get_analytics_summary() -> Dict[str, Any]:
    """Calculates live KPI metrics directly from stored complaint records."""
    all_complaints = complaint_service.get_all(limit=1000)
    total = len(all_complaints)
    
    status_counts = Counter(c["status"] for c in all_complaints)
    priority_counts = Counter(c["priority"] for c in all_complaints)
    category_counts = Counter(c["category"] for c in all_complaints)
    
    return {
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

@router.get("/ward-rankings")
def get_ward_rankings() -> List[Dict[str, Any]]:
    """Returns top wards by complaint volume."""
    all_complaints = complaint_service.get_all(limit=1000)
    ward_counts = Counter(c.get("ward", "Unknown") for c in all_complaints if c.get("ward"))
    return [{"ward": w, "count": cnt} for w, cnt in ward_counts.most_common(15)]
