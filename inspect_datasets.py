import os
import glob
import pandas as pd

raw_dir = r"E:\prompt warz\dataset\raw"
files = sorted(glob.glob(os.path.join(raw_dir, "*.csv")))

print(f"Detailed Analysis of {len(files)} CSV files in {raw_dir}:\n")

summary = []

for fpath in files:
    fname = os.path.basename(fpath)
    size_mb = os.path.getsize(fpath) / (1024 * 1024)
    
    # Read CSV
    try:
        df = pd.read_csv(fpath, low_memory=False)
        row_count = len(df)
        cols = list(df.columns)
        
        info = {
            "filename": fname,
            "size_mb": round(size_mb, 2),
            "rows": row_count,
            "columns": cols,
        }
        
        if "Grievance Date" in df.columns:
            # Parse dates
            df["parsed_date"] = pd.to_datetime(df["Grievance Date"], errors="coerce")
            min_date = df["parsed_date"].min()
            max_date = df["parsed_date"].max()
            null_dates = df["parsed_date"].isnull().sum()
            cats = df["Category"].dropna().unique().tolist()[:5]
            statuses = df["Grievance Status"].dropna().unique().tolist()
            wards_count = df["Ward Name"].nunique()
            
            info.update({
                "type": "BBMP Grievances",
                "date_range": f"{min_date} to {max_date}",
                "null_dates": null_dates,
                "sample_categories": cats,
                "statuses": statuses,
                "unique_wards": wards_count
            })
        elif "Ward Name" in df.columns and "Number of Complaints" in df.columns:
            total_complaints = df["Number of Complaints"].dropna().sum()
            info.update({
                "type": "BBMP Ward-Level Aggregated Count",
                "total_complaints_sum": total_complaints,
                "wards_listed": df["Ward Name"].nunique()
            })
        
        summary.append(info)
        print(f"Completed {fname}: {row_count} rows")
    except Exception as e:
        print(f"Error analyzing {fname}: {e}")

print("\n" + "="*80)
for s in summary:
    print(f"File: {s['filename']} ({s['size_mb']} MB)")
    print(f"  Rows: {s['rows']}")
    if "type" in s:
        print(f"  Type: {s['type']}")
    if "date_range" in s:
        print(f"  Date Range: {s['date_range']}")
        print(f"  Unique Wards: {s['unique_wards']}")
        print(f"  Statuses: {s['statuses']}")
        print(f"  Top Categories: {s['sample_categories']}")
    if "total_complaints_sum" in s:
        print(f"  Total Wards Listed: {s['wards_listed']}")
        print(f"  Total Complaints Sum: {s['total_complaints_sum']}")
    print("-" * 50)
