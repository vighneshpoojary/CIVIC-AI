from fastapi import APIRouter, Query
from typing import List, Dict, Any
from app.services.hotspot_service import hotspot_service
from app.services.complaint_service import complaint_service

router = APIRouter(prefix="/hotspots", tags=["Hotspots & Maps"])

@router.get("", response_model=List[Dict[str, Any]])
def get_hotspots(eps_meters: float = Query(500.0, ge=100.0, le=2000.0), min_samples: int = Query(3, ge=2, le=20)):
    """
    Returns geographical hotspots detected using DBSCAN spatial clustering
    over real complaint coordinate data in Bengaluru.
    """
    complaints = complaint_service.get_all(limit=500)
    return hotspot_service.detect_hotspots(complaints, eps_meters=eps_meters, min_samples=min_samples)

@router.get("/wards", response_model=List[Dict[str, Any]])
def get_ward_aggregates():
    """
    Returns the 199 BBMP ward aggregates with coordinates and complaint counts.
    """
    return hotspot_service.get_ward_aggregates()
