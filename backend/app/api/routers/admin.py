import os
import pandas as pd
from fastapi import APIRouter
from typing import List, Dict, Any

router = APIRouter(prefix="/admin", tags=["Administration"])

@router.get("/officers", response_model=List[Dict[str, Any]])
def get_officers():
    """Returns directory of municipal officers extracted from BBMP records."""
    officers_csv = r"E:\prompt warz\dataset\processed\extracted_officers_directory.csv"
    if os.path.exists(officers_csv):
        try:
            df = pd.read_csv(officers_csv)
            return df.head(50).to_dict(orient="records")
        except Exception as e:
            print(f"Notice: Failed to read officers directory ({e})")
            
    # Sample officers fallback
    return [
        {"officer_name": "Suresh Kumar", "officer_designation": "AEE", "normalized_category": "Roads and Infrastructure", "cases_handled": 42},
        {"officer_name": "Nagendra Babu", "officer_designation": "JHI", "normalized_category": "Waste Management", "cases_handled": 38},
        {"officer_name": "Vinay Kumar", "officer_designation": "AE", "normalized_category": "Streetlights", "cases_handled": 29},
        {"officer_name": "Syed Zameer", "officer_designation": "JE", "normalized_category": "Drainage and Sewage", "cases_handled": 35},
    ]

@router.get("/departments", response_model=List[Dict[str, Any]])
def get_departments():
    """Lists municipal departments and heads."""
    return [
        {"id": "DEPT-ROAD", "name": "Roads and Infrastructure", "head": "Chief Engineer Roads", "category": "Roads and Infrastructure"},
        {"id": "DEPT-SWM", "name": "Waste Management", "head": "Superintending Engineer SWM", "category": "Waste Management"},
        {"id": "DEPT-ELEC", "name": "Streetlights & Electrical", "head": "Executive Engineer Electrical", "category": "Streetlights"},
        {"id": "DEPT-SWD", "name": "Drainage and Sewage", "head": "Chief Engineer SWD", "category": "Drainage and Sewage"},
        {"id": "DEPT-WATER", "name": "Water Supply (BWSSB)", "head": "Executive Engineer Water", "category": "Water Supply"},
        {"id": "DEPT-SAFETY", "name": "Public Safety", "head": "Joint Commissioner Public Safety", "category": "Public Safety"},
    ]
