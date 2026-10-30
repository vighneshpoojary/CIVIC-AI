import os
import glob
import pandas as pd
import numpy as np

raw_dir = r"E:\prompt warz\dataset\raw"
processed_dir = r"E:\prompt warz\dataset\processed"
os.makedirs(processed_dir, exist_ok=True)

print("Starting CivicAI Dataset Processing Pipeline...\n")

# Category normalization mapping
CATEGORY_MAP = {
    "Road Maintenance(Engg)": ("Roads and Infrastructure", "Potholes / Road Damage"),
    "Solid Waste (Garbage) Related": ("Waste Management", "Garbage Collection / Overflow"),
    "Electrical": ("Streetlights", "Street Light Not Working"),
    "Storm Water Drain": ("Drainage and Sewage", "Blocked Drains"),
    "Sanitation": ("Drainage and Sewage", "Sewage Overflow / Sanitation"),
    "Forest": ("Public Facilities", "Fallen Trees / Branch Pruning"),
    "veterinary": ("Public Safety", "Stray Animals / Safety"),
    "CORONA COVID19": ("Other", "Public Health Emergency"),
    "Revenue Department": ("Other", "Property / Revenue Inquiries"),
    "Others": ("Other", "General Civic Grievance")
}

# Status normalization mapping
STATUS_MAP = {
    "Registered": "Awaiting Review",
    "In Progress": "In Progress",
    "Long Term Solution": "In Progress",
    "Closed": "Resolved",
    "Resolved": "Resolved",
    "ReOpen": "Reopened",
    "Non Relevant": "Rejected",
    "Rejected": "Rejected"
}

# Key Bengaluru Ward Centroids (Latitude, Longitude) for accurate spatial display
WARD_COORDINATES = {
    "Puttenahalli": (12.8943, 77.5872),
    "Kumaraswamy Layout": (12.9064, 77.5583),
    "Vishveshwarapura": (12.9525, 77.5772),
    "Jnana Bharathi": (12.9366, 77.4984),
    "Anjanapura": (12.8594, 77.5683),
    "Hampi Nagar": (12.9567, 77.5332),
    "Sunkenahalli": (12.9463, 77.5684),
    "Vasanthapura": (12.8953, 77.5456),
    "Jakkasandra": (12.9238, 77.6338),
    "Binnipet": (12.9654, 77.5543),
    "Ganesh Mandir": (12.9284, 77.5612),
    "Aramane Nagara": (13.0076, 77.5786),
    "Thanisandra": (13.0548, 77.6324),
    "Muneshwara Nagar": (12.9972, 77.6253),
    "Cottonpete": (12.9689, 77.5714),
    "Madivala": (12.9216, 77.6186),
    "Rajaji Nagar": (12.9901, 77.5528),
    "Neelasandra": (12.9554, 77.6143),
    "HSR Layout": (12.9121, 77.6446),
    "Nagarabhavi": (12.9608, 77.5113),
    "Hoysala Nagar": (12.9798, 77.6492),
    "Siddapura": (12.9387, 77.5889),
    "Rajamahal Guttahalli": (13.0012, 77.5783),
    "Vijnanapura": (12.9954, 77.6698),
    "Nayandahalli": (12.9443, 77.5256),
    "Jaraganahalli": (12.8987, 77.5765),
    "Sampangiram Nagar": (12.9698, 77.5923),
    "Sagayarapuram": (13.0034, 77.6156),
    "Hemmigepura": (12.8845, 77.5023),
    "Shakambari Nagar": (12.9145, 77.5754),
    "Lingarajapura": (13.0112, 77.6301),
    "Chalavadipalya": (12.9623, 77.5645),
    "Sarakki": (12.9056, 77.5789),
    "Dodda Bommasandra": (13.0645, 77.5612),
    "Azad Nagar": (12.9587, 77.5501),
    "Sriramamandira": (12.9845, 77.5567),
    "Lakkasandra": (12.9423, 77.6012),
    "Prakash Nagar": (12.9898, 77.5512),
    "Basaveshwara Nagar": (12.9876, 77.5401),
    "Dodda Nekkundi": (12.9712, 77.6987),
    "Malleswaram": (13.0031, 77.5689),
    "Chickpet": (12.9701, 77.5756),
    "S K Garden": (13.0012, 77.6089),
    "Shettihalli": (13.0456, 77.5234),
    "Begur": (12.8789, 77.6301),
    "Gurappanpalya": (12.9245, 77.6012),
    "Kempapura Agrahara": (12.9678, 77.5456),
    "Agaram": (12.9345, 77.6256),
    "Vannarpet": (12.9567, 77.6189),
    "Bommanahalli": (12.9012, 77.6234),
    "Bellanduru": (12.9260, 77.6762),
    "Koramangala": (12.9352, 77.6245),
    "Marathahalli": (12.9591, 77.6974),
    "Whitefield": (12.9698, 77.7499),
    "Indiranagar": (12.9784, 77.6408),
    "Yelahanka": (13.1007, 77.5963),
    "Hebbal": (13.0358, 77.5970),
    "Jayanagar": (12.9304, 77.5833),
    "BTM Layout": (12.9165, 77.6101),
}

# Default Bengaluru central coordinates fallback
DEFAULT_LAT, DEFAULT_LNG = 12.9716, 77.5946

# 1. Process Ward Aggregated Count
ward_file = os.path.join(raw_dir, "ed85c3cd-f047-4512-9f2e-11af472202d3.csv")
if os.path.exists(ward_file):
    print("Processing BBMP Ward Aggregated Dataset...")
    df_ward = pd.read_csv(ward_file)
    # Clean and filter out Grand Total
    df_ward_clean = df_ward[df_ward["Ward Name"].notnull() & (df_ward["Ward Name"] != "Grand Total")].copy()
    
    # Assign Centroids
    coords = [WARD_COORDINATES.get(w.strip(), (DEFAULT_LAT, DEFAULT_LNG)) for w in df_ward_clean["Ward Name"].astype(str)]
    df_ward_clean["latitude"] = [c[0] for c in coords]
    df_ward_clean["longitude"] = [c[1] for c in coords]
    df_ward_clean["city"] = "Bengaluru"
    df_ward_clean["source_name"] = "BBMP Fix My Street 2022"
    
    out_ward_path = os.path.join(processed_dir, "bbmp_ward_aggregated_2022.csv")
    df_ward_clean.to_csv(out_ward_path, index=False)
    print(f"-> Saved: {out_ward_path} ({len(df_ward_clean)} wards)")

# 2. Process BBMP Grievances 2024 (Primary current dataset)
f_2024 = os.path.join(raw_dir, "2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1.csv")
if os.path.exists(f_2024):
    print("\nProcessing BBMP Grievances 2024 (207k records)...")
    df_2024 = pd.read_csv(f_2024, low_memory=False)
    
    # Standardize columns
    df_2024["normalized_category"] = df_2024["Category"].map(lambda c: CATEGORY_MAP.get(str(c).strip(), ("Other", "General Civic Grievance"))[0])
    df_2024["normalized_subcategory"] = df_2024["Category"].map(lambda c: CATEGORY_MAP.get(str(c).strip(), ("Other", "General Civic Grievance"))[1])
    df_2024["normalized_status"] = df_2024["Grievance Status"].map(lambda s: STATUS_MAP.get(str(s).strip(), "Awaiting Review"))
    df_2024["city"] = "Bengaluru"
    df_2024["is_synthetic"] = False
    df_2024["source_name"] = "BBMP Grievances 2024"
    
    # Parse Staff Name & Designation
    def split_staff(val):
        if pd.isna(val):
            return "", ""
        parts = str(val).split("/")
        name = parts[0].strip()
        desig = parts[1].strip() if len(parts) > 1 else "Officer"
        return name, desig

    staff_info = df_2024["Staff Name"].apply(split_staff)
    df_2024["officer_name"] = [s[0] for s in staff_info]
    df_2024["officer_designation"] = [s[1] for s in staff_info]
    
    out_2024 = os.path.join(processed_dir, "bbmp_grievances_normalized_2024.csv")
    df_2024.to_csv(out_2024, index=False)
    print(f"-> Saved: {out_2024} ({len(df_2024)} records)")
    
    # 3. Extract Officers Directory
    print("\nExtracting Officers Directory...")
    officers_df = df_2024[df_2024["officer_name"] != ""][["officer_name", "officer_designation", "normalized_category", "Ward Name"]].drop_duplicates()
    officers_summary = officers_df.groupby(["officer_name", "officer_designation", "normalized_category"]).size().reset_index(name="cases_handled")
    out_officers = os.path.join(processed_dir, "extracted_officers_directory.csv")
    officers_summary.to_csv(out_officers, index=False)
    print(f"-> Saved: {out_officers} ({len(officers_summary)} unique officers)")
    
    # 4. Generate Curated Seed Dataset (3,000 diverse, high-utility complaints for instant demo)
    print("\nGenerating Curated Seed Dataset (civicai_seed_complaints.csv)...")
    # Sample proportionally across categories and statuses
    sample_dfs = []
    for cat in df_2024["normalized_category"].unique():
        cat_df = df_2024[df_2024["normalized_category"] == cat]
        n_sample = min(len(cat_df), 500)
        sample_dfs.append(cat_df.sample(n=n_sample, random_state=42))
    
    seed_df = pd.concat(sample_dfs).sample(frac=1, random_state=42).reset_index(drop=True)
    
    # Assign realistic coordinates based on Ward + slight jitter for street level realism
    def assign_coords(ward_name):
        base = WARD_COORDINATES.get(str(ward_name).strip(), (DEFAULT_LAT, DEFAULT_LNG))
        # Add small jitter ~50-300m
        lat_jitter = np.random.normal(0, 0.003)
        lng_jitter = np.random.normal(0, 0.003)
        return round(base[0] + lat_jitter, 6), round(base[1] + lng_jitter, 6)
    
    coords = seed_df["Ward Name"].apply(assign_coords)
    seed_df["latitude"] = [c[0] for c in coords]
    seed_df["longitude"] = [c[1] for c in coords]
    
    # Generate realistic citizen titles & descriptions from subcategory and ward
    def make_title(row):
        sub = row.get("Sub Category", "")
        ward = row.get("Ward Name", "Bengaluru")
        if pd.isna(sub) or str(sub).strip() == "":
            sub = row.get("normalized_subcategory", "Civic Issue")
        return f"{sub} reported near {ward}"

    def make_description(row):
        sub = row.get("Sub Category", "")
        ward = row.get("Ward Name", "Bengaluru")
        cat = row.get("normalized_category", "Civic Issue")
        remarks = row.get("Staff Remarks", "")
        desc = f"Citizen complaint regarding {sub} in ward {ward}. Category: {cat}."
        if pd.notna(remarks) and str(remarks).strip() != "":
            desc += f" Initial note from inspection: {remarks}."
        return desc

    seed_df["title"] = seed_df.apply(make_title, axis=1)
    seed_df["description"] = seed_df.apply(make_description, axis=1)
    
    # Map priority based on category urgency
    def assign_priority(cat):
        if cat in ["Roads and Infrastructure", "Public Safety"]:
            return np.random.choice(["High", "Critical", "Medium"], p=[0.45, 0.25, 0.30])
        elif cat in ["Drainage and Sewage", "Waste Management"]:
            return np.random.choice(["High", "Medium", "Low"], p=[0.35, 0.50, 0.15])
        else:
            return np.random.choice(["Medium", "Low"], p=[0.60, 0.40])

    seed_df["priority"] = seed_df["normalized_category"].apply(assign_priority)
    seed_df["reference_id"] = [f"BLR-2024-{i:05d}" for i in range(1, len(seed_df) + 1)]
    
    out_seed = os.path.join(processed_dir, "civicai_seed_complaints.csv")
    seed_df.to_csv(out_seed, index=False)
    print(f"-> Saved: {out_seed} ({len(seed_df)} curated records with coordinates & reference IDs)")

print("\nETL Pipeline completed successfully! All processed files ready in E:\\prompt warz\\dataset\\processed\\")
