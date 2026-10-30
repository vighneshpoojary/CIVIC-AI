# CivicAI Data Catalog & Provenance Specification

This document details the municipal datasets used, cleaning transformations, and data integrity guarantees.

## 1. Raw Datasets (Untouched in `dataset/raw/`)

1. **`2a3f29ef-a7a1-4fc3-b125-cbcc958a89d1.csv`**:
   - **Identity**: BBMP Grievances 2024
   - **Rows**: 207,016
   - **Date Range**: `2024-01-01` to `2024-12-31`
   - **Columns**: `_id`, `Complaint ID`, `Category`, `Sub Category`, `Grievance Date`, `Ward Name`, `Grievance Status`, `Staff Remarks`, `Staff Name`

2. **`ed85c3cd-f047-4512-9f2e-11af472202d3.csv`**:
   - **Identity**: BBMP Fix My Street 2022 Aggregated
   - **Rows**: 200 (199 wards + Grand Total)
   - **Coverage**: Total reported grievances per ward and constituency level totals.

3. **Historical Grievance Files**:
   - `1342a93b-9a61-4766-9c34-c8357b7926c2.csv`: 126,974 rows (2025 records)
   - `fae120ab-d95c-4281-aa86-5bf694712472.csv`: 119,140 rows (2023 records)
   - `bada528d-f4f5-4ace-9dd1-8ac459fe350b.csv`: 103,504 rows (2021 records)
   - `58808356-4b0a-4b02-9d70-75993b4dcd1c.csv`: 91,620 rows (2020 records)

---

## 2. Processed Datasets (in `dataset/processed/`)

1. **`bbmp_grievances_normalized_2024.csv`** (207,016 rows):
   - Mapped to standardized civic categories (`Roads and Infrastructure`, `Waste Management`, `Streetlights`, `Drainage and Sewage`, `Public Safety`, `Public Facilities`, `Other`).
   - Standardized status lifecycle labels (`Awaiting Review`, `In Progress`, `Resolved`, `Reopened`, `Rejected`).
   - Parsed officer name and designation from `Staff Name` field.
   - Tagged: `geographic_coverage: "Bengaluru"`, `is_synthetic: false`.

2. **`bbmp_ward_aggregated_2022.csv`** (199 wards):
   - Mapped ward centroids (lat/long) for spatial choropleth maps.
   - Stripped aggregate summary totals to preserve raw per-ward precision.

3. **`civicai_seed_complaints.csv`** (3,500 curated rows):
   - Stratified sample across all categories and BBMP wards.
   - Micro-jitter applied around verified ward centroids (50m–300m) to simulate realistic street-level reporting.
   - Unique reference IDs assigned (`BLR-2024-XXXXX`).

4. **`extracted_officers_directory.csv`** (1,009 unique municipal officers):
   - Aggregated workload and department mapping for Assistant Executive Engineers (AEE), Junior Engineers (JE), Junior Health Inspectors (JHI).

---

## 3. Data Integrity & Privacy Principles
- **No Coordinate Fabrication**: Ward aggregate totals remain ward-level data and are not represented as fictitious street pins.
- **Privacy Preservation**: No real citizen phone numbers, emails, or personal names exist in the grievance datasets.
- **Strict Labeling**: Synthetic demo records are explicitly labeled `is_synthetic: true`.
