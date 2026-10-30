import math
from typing import List, Dict, Any
from app.schemas.ai import DuplicateCheckResponse, DuplicateMatch

class DuplicateService:
    @staticmethod
    def haversine_distance_meters(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Calculates distance in meters between two lat/lon coordinates."""
        R = 6371000.0
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lon2 - lon1)
        
        a = (math.sin(delta_phi / 2.0) ** 2 +
             math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2))
        c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
        return round(R * c, 1)

    @staticmethod
    def text_similarity(s1: str, s2: str) -> float:
        """Token set jaccard similarity ratio."""
        tokens1 = set(s1.lower().replace("-", " ").split())
        tokens2 = set(s2.lower().replace("-", " ").split())
        if not tokens1 or not tokens2:
            return 0.0
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return len(intersection) / len(union)

    def check_duplicates(self, new_complaint: Dict[str, Any], existing_complaints: List[Dict[str, Any]], 
                         max_distance_meters: float = 300.0) -> DuplicateCheckResponse:
        matches: List[DuplicateMatch] = []
        new_lat = new_complaint.get("latitude")
        new_lon = new_complaint.get("longitude")
        new_cat = new_complaint.get("category", "")
        new_text = f"{new_complaint.get('title', '')} {new_complaint.get('description', '')}"

        for ex in existing_complaints:
            # Skip comparing to self
            if ex.get("id") == new_complaint.get("id"):
                continue

            ex_lat = ex.get("latitude")
            ex_lon = ex.get("longitude")
            
            # Check spatial proximity if both have coordinates
            distance = 999999.0
            if new_lat and new_lon and ex_lat and ex_lon:
                distance = self.haversine_distance_meters(new_lat, new_lon, ex_lat, ex_lon)
                
            # If outside max distance, skip
            if distance > max_distance_meters:
                continue

            # Text similarity
            ex_text = f"{ex.get('title', '')} {ex.get('description', '')}"
            txt_sim = self.text_similarity(new_text, ex_text)
            
            # Category match bonus
            cat_match = 1.0 if ex.get("category") == new_cat else 0.2
            
            # Distance score (closer = higher)
            dist_score = max(0.0, 1.0 - (distance / max_distance_meters))
            
            # Weighted score: 50% text, 30% distance, 20% category
            combined_score = round((0.50 * txt_sim) + (0.30 * dist_score) + (0.20 * cat_match), 2)
            
            if combined_score >= 0.55: # Flag threshold
                matches.append(DuplicateMatch(
                    reference_id=ex.get("reference_id", "REF-UNKNOWN"),
                    title=ex.get("title", ""),
                    similarity_score=combined_score,
                    distance_meters=distance,
                    match_rationale=f"Reported {distance}m away within same category '{new_cat}'. High keyword similarity ({round(txt_sim*100)}%).",
                    status="Suggested Match"
                ))

        matches.sort(key=lambda m: m.similarity_score, reverse=True)
        is_dup = len(matches) > 0 and matches[0].similarity_score >= 0.70
        highest = matches[0].similarity_score if matches else 0.0

        return DuplicateCheckResponse(
            is_potential_duplicate=is_dup,
            highest_similarity=highest,
            matches=matches[:5]
        )

duplicate_service = DuplicateService()
