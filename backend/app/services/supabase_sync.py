import os
import json
import urllib.request
import pandas as pd
from app.core.config import settings

def sync_complaints_to_supabase(limit: int = 100):
    """Syncs curated BBMP complaints from local CSV to live Supabase PostgreSQL."""
    csv_path = r"E:\prompt warz\dataset\processed\civicai_seed_complaints.csv"
    if not os.path.exists(csv_path):
        print("Seed CSV not found.")
        return

    df = pd.read_csv(csv_path, nrows=limit)
    records = []
    for _, row in df.iterrows():
        records.append({
            "reference_id": str(row.get("reference_id")),
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
            "source_name": "BBMP Grievances 2024"
        })

    url = f"{settings.SUPABASE_URL}/rest/v1/complaints?on_conflict=reference_id"
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    
    req = urllib.request.Request(
        url,
        data=json.dumps(records).encode('utf-8'),
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
        },
        method='POST'
    )

    try:
        with urllib.request.urlopen(req) as resp:
            print(f"SUCCESS: Synced {len(records)} records to Supabase! Status:", resp.status)
    except urllib.error.HTTPError as e:
        print(f"Sync Notice: Status {e.code} - {e.read().decode()}")

def sync_officers_to_supabase(limit: int = 100):
    """Syncs extracted BBMP officers directory to Supabase."""
    csv_path = r"E:\prompt warz\dataset\processed\extracted_officers_directory.csv"
    if not os.path.exists(csv_path):
        print("Officers CSV not found.")
        return

    df = pd.read_csv(csv_path, nrows=limit)
    records = []
    for _, r in df.iterrows():
        raw_name = str(r.get("officer_name", "Municipal Engineer"))
        name = f"Officer {raw_name}" if raw_name.isdigit() else raw_name
        records.append({
            "officer_name": name,
            "officer_designation": str(r.get("officer_designation", "Assistant Executive Engineer")),
            "department_name": str(r.get("normalized_category", "Roads and Infrastructure")),
            "cases_handled": int(r.get("cases_handled", 0)),
            "is_active": True
        })

    url = f"{settings.SUPABASE_URL}/rest/v1/officers"
    key = settings.SUPABASE_SERVICE_ROLE_KEY
    req = urllib.request.Request(
        url,
        data=json.dumps(records).encode('utf-8'),
        headers={
            'apikey': key,
            'Authorization': f'Bearer {key}',
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal'
        },
        method='POST'
    )
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"SUCCESS: Synced {len(records)} officers to Supabase! Status:", resp.status)
    except urllib.error.HTTPError as e:
        print(f"Officers Sync Notice: Status {e.code} - {e.read().decode()}")

if __name__ == "__main__":
    sync_complaints_to_supabase(limit=500)
    sync_officers_to_supabase(limit=100)
