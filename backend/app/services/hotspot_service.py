import os
import math
import pandas as pd
from typing import List, Dict, Any

class HotspotService:
    def __init__(self):
        self.ward_aggregates: List[Dict[str, Any]] = []
        self._load_ward_aggregates()

    def _load_ward_aggregates(self):
        ward_csv = r"E:\prompt warz\dataset\processed\bbmp_ward_aggregated_2022.csv"
        if os.path.exists(ward_csv):
            try:
                df = pd.read_csv(ward_csv)
                self.ward_aggregates = df.to_dict(orient="records")
            except Exception as e:
                print(f"Notice: Failed to load ward aggregates ({e})")

    @staticmethod
    def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance in meters between two lat/lon coordinates."""
        R = 6371000.0  # Earth radius in meters
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi / 2.0) ** 2 +
             math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return R * c

    def detect_hotspots(self, complaints: List[Dict[str, Any]], eps_meters: float = 500.0, min_samples: int = 3) -> List[Dict[str, Any]]:
        """
        Pure-Python DBSCAN spatial clustering with Haversine distance metric.
        Guarantees zero native DLL issues while remaining 100% mathematically equivalent to sklearn.
        """
        valid_items = [
            c for c in complaints 
            if c.get("latitude") is not None and c.get("longitude") is not None and not pd.isna(c["latitude"])
        ]
        
        n = len(valid_items)
        if n < min_samples:
            return []

        # Find epsilon neighbors for every point
        neighbors = []
        for i in range(n):
            lat1, lon1 = valid_items[i]["latitude"], valid_items[i]["longitude"]
            nbrs = []
            for j in range(n):
                lat2, lon2 = valid_items[j]["latitude"], valid_items[j]["longitude"]
                if self.haversine_distance(lat1, lon1, lat2, lon2) <= eps_meters:
                    nbrs.append(j)
            neighbors.append(nbrs)

        visited = [False] * n
        cluster_labels = [-1] * n  # -1 represents noise
        cluster_id = 0

        for i in range(n):
            if visited[i]:
                continue
            visited[i] = True

            if len(neighbors[i]) < min_samples:
                cluster_labels[i] = -1
            else:
                cluster_labels[i] = cluster_id
                queue = list(neighbors[i])
                
                # Expand cluster
                head = 0
                while head < len(queue):
                    p = queue[head]
                    head += 1
                    
                    if not visited[p]:
                        visited[p] = True
                        if len(neighbors[p]) >= min_samples:
                            for q in neighbors[p]:
                                if q not in queue:
                                    queue.append(q)
                    
                    if cluster_labels[p] == -1:
                        cluster_labels[p] = cluster_id
                
                cluster_id += 1

        # Group points by cluster
        clusters: Dict[int, List[Dict[str, Any]]] = {}
        for idx, cid in enumerate(cluster_labels):
            if cid == -1:
                continue
            if cid not in clusters:
                clusters[cid] = []
            clusters[cid].append(valid_items[idx])

        hotspots = []
        for cid, items in clusters.items():
            lats = [it["latitude"] for it in items]
            lngs = [it["longitude"] for it in items]
            categories = [it["category"] for it in items]
            dominant_category = max(set(categories), key=categories.count)
            critical_count = sum(1 for it in items if it.get("priority") in ["Critical", "High"])

            hotspots.append({
                "hotspot_id": f"HOTSPOT-BLR-{cid + 1:03d}",
                "center_latitude": round(sum(lats) / len(lats), 6),
                "center_longitude": round(sum(lngs) / len(lngs), 6),
                "radius_meters": eps_meters,
                "complaint_count": len(items),
                "critical_count": critical_count,
                "dominant_category": dominant_category,
                "ward": items[0].get("ward", "Bengaluru"),
                "severity": "Critical" if critical_count >= 2 else "High",
                "sample_complaints": [it["reference_id"] for it in items[:5]]
            })

        return sorted(hotspots, key=lambda x: x["complaint_count"], reverse=True)

    def get_ward_aggregates(self) -> List[Dict[str, Any]]:
        return self.ward_aggregates

hotspot_service = HotspotService()
