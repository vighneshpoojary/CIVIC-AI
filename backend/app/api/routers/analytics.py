from fastapi import APIRouter
from typing import Dict, Any, List
from app.services.complaint_service import complaint_service

router = APIRouter(prefix="/analytics", tags=["Analytics & KPIs"])

@router.get("/summary")
def get_analytics_summary() -> Dict[str, Any]:
    """Calculates live KPI metrics with O(1) in-memory caching."""
    return complaint_service.get_analytics_metrics()

@router.get("/ward-rankings")
def get_ward_rankings() -> List[Dict[str, Any]]:
    """Returns top wards by complaint volume with O(1) in-memory caching."""
    return complaint_service.get_ward_rankings_metrics()

