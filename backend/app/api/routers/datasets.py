from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/datasets", tags=["Datasets"])

@router.get("", response_model=List[Dict[str, Any]])
def list_datasets():
    """Lists registered civic datasets with provenance, row count, and coverage."""
    return [
        {
            "id": "ds-01",
            "name": "BBMP Grievances 2024",
            "source": "Bruhat Bengaluru Mahanagara Palike (BBMP)",
            "file_name": "bbmp_grievances_normalized_2024.csv",
            "record_count": 207016,
            "geographic_coverage": "Bengaluru (198 Wards)",
            "data_type": "Real Public Municipal Records",
            "validation_status": "Verified & Normalized",
            "processing_status": "Processed"
        },
        {
            "id": "ds-02",
            "name": "BBMP Fix My Street 2022 Aggregated",
            "source": "BBMP Fix My Street Portal",
            "file_name": "bbmp_ward_aggregated_2022.csv",
            "record_count": 199,
            "geographic_coverage": "Bengaluru (Ward-Level Aggregates)",
            "data_type": "Real Municipal Summary Data",
            "validation_status": "Verified & Centroids Mapped",
            "processing_status": "Processed"
        },
        {
            "id": "ds-03",
            "name": "CivicAI Curated Seed Dataset",
            "source": "Curated BBMP Grievances (Normalized)",
            "file_name": "civicai_seed_complaints.csv",
            "record_count": 3500,
            "geographic_coverage": "Bengaluru (All Zones)",
            "data_type": "Real Stratified Sample with Spatial Mapping",
            "validation_status": "Active Demo Database",
            "processing_status": "Loaded"
        },
        {
            "id": "ds-04",
            "name": "BBMP Grievances 2025",
            "source": "BBMP Open Data Portal",
            "file_name": "1342a93b-9a61-4766-9c34-c8357b7926c2.csv",
            "record_count": 126974,
            "geographic_coverage": "Bengaluru (199 Wards)",
            "data_type": "Real Public Municipal Records",
            "validation_status": "Raw Verified",
            "processing_status": "Available in Raw"
        },
        {
            "id": "ds-05",
            "name": "BBMP Grievances 2023",
            "source": "BBMP Open Data Portal",
            "file_name": "fae120ab-d95c-4281-aa86-5bf694712472.csv",
            "record_count": 119140,
            "geographic_coverage": "Bengaluru (198 Wards)",
            "data_type": "Real Public Municipal Records",
            "validation_status": "Raw Verified",
            "processing_status": "Available in Raw"
        }
    ]
