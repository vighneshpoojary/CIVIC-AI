import os
import json
from typing import Dict, Any, List
from app.core.config import settings
from app.schemas.ai import AIAssessmentResponse

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.client = None
        if self.api_key and self.api_key != "your_gemini_api_key_here":
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"Notice: Google GenAI client initialization skipped: {e}")

    async def analyze_complaint(self, title: str, description: str, category: str, ward: str = "Bengaluru") -> AIAssessmentResponse:
        """
        Analyzes citizen complaint using Gemini 2.5 Flash if configured,
        or falls back to a deterministic civic rule engine.
        """
        if self.client:
            try:
                prompt = f"""
                You are CivicAI Municipal Analysis Engine for Bengaluru, Karnataka, India.
                Analyze the following citizen complaint and provide structured JSON output.

                Complaint Title: {title}
                Complaint Description: {description}
                Reported Category: {category}
                Reported Ward/Area: {ward}

                Requirements:
                1. Categorize into one of: Roads and Infrastructure, Waste Management, Water Supply, Streetlights, Drainage and Sewage, Public Safety, Public Facilities, Other.
                2. Suggest subcategory and responsible municipal department.
                3. Recommend priority: Critical, High, Medium, or Low.
                4. Provide 2-4 bullet-point explainable justifications for the priority score.
                5. List identifiable risk factors (e.g., proximity to schools/hospitals, monsoon flooding, pedestrian traffic, night darkness).
                6. Generate a clear 1-2 sentence executive summary.
                """
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                    config={
                        'response_mime_type': 'application/json',
                        'response_schema': AIAssessmentResponse,
                        'temperature': 0.1,
                    }
                )
                data = json.loads(response.text)
                return AIAssessmentResponse(**data)
            except Exception as e:
                print(f"Warning: Gemini API call failed ({e}). Using explainable heuristic fallback.")

        # Deterministic civic heuristic engine fallback
        return self._heuristic_analysis(title, description, category, ward)

    def _heuristic_analysis(self, title: str, description: str, category: str, ward: str) -> AIAssessmentResponse:
        text = f"{title} {description}".lower()
        
        # Risk factors detection
        risks = []
        if any(w in text for w in ["school", "college", "children", "student"]):
            risks.append("Proximity to educational institution")
        if any(w in text for w in ["hospital", "clinic", "ambulance", "elderly"]):
            risks.append("Proximity to healthcare facility")
        if any(w in text for w in ["rain", "monsoon", "waterlog", "flood"]):
            risks.append("High monsoon flood / waterlogging risk")
        if any(w in text for w in ["night", "dark", "crime", "women safety"]):
            risks.append("Night visibility and public safety hazard")
        if any(w in text for w in ["open manhole", "deep hole", "exposed wire", "electric shock"]):
            risks.append("Severe immediate life-safety hazard")

        # Category and department mapping
        subcat = "General"
        dept = "Municipal Administration"
        norm_cat = category or "Other"

        if any(w in text for w in ["pothole", "road", "tar", "footpath", "crater"]):
            norm_cat = "Roads and Infrastructure"
            subcat = "Potholes / Road Damage"
            dept = "Major Roads and Infrastructure"
        elif any(w in text for w in ["garbage", "trash", "waste", "dump", "bin"]):
            norm_cat = "Waste Management"
            subcat = "Garbage Collection / Overflow"
            dept = "Solid Waste Management"
        elif any(w in text for w in ["street light", "streetlight", "lamp", "dark road"]):
            norm_cat = "Streetlights"
            subcat = "Street Light Not Working"
            dept = "Electrical Engineering"
        elif any(w in text for w in ["drain", "sewage", "gutter", "overflow", "stink"]):
            norm_cat = "Drainage and Sewage"
            subcat = "Blocked Drain / Sewage Leak"
            dept = "Storm Water Drains & Sanitation"
        elif any(w in text for w in ["water leak", "pipeline", "drinking water", "no water"]):
            norm_cat = "Water Supply"
            subcat = "Water Pipeline Leakage"
            dept = "BWSSB / Water Supply"

        # Explainable Priority Scoring
        priority = "Medium"
        reasons = []

        if any(w in text for w in ["open manhole", "exposed wire", "electric shock", "danger to life", "accident"]):
            priority = "Critical"
            reasons.append("Presents immediate physical danger or life-safety risk to commuters/pedestrians.")
        elif any(w in text for w in ["school", "hospital", "main road", "traffic", "large pothole"]):
            priority = "High"
            reasons.append("High public exposure area impacting vulnerable populations or transit corridors.")
        elif any(w in text for w in ["overflow", "garbage", "dark"]):
            priority = "Medium"
            reasons.append("Standard civic grievance requiring routine departmental intervention within SLA.")
        else:
            priority = "Low"
            reasons.append("Minor inconvenience with localized impact; low risk of rapid escalation.")

        if risks:
            reasons.append(f"Compounded by environmental risk factors: {', '.join(risks[:2])}.")

        summary = f"{subcat} reported in {ward}. Priority classified as {priority} due to {reasons[0].lower()}"

        return AIAssessmentResponse(
            summary=summary,
            category=norm_cat,
            subcategory=subcat,
            suggested_department=dept,
            priority_recommendation=priority,
            confidence_score=0.88,
            risk_factors=risks,
            priority_reasoning=reasons
        )

    async def chat(self, message: str) -> Dict[str, Any]:
        """
        Interactive civic assistant powered by Gemini.
        Returns conversational response and contextual quick navigation actions.
        """
        if self.client:
            try:
                system_instruction = (
                    "You are CivicAI Assistant, the official civic helper for Bengaluru (BBMP), Karnataka, India. "
                    "Your mission is to help citizens understand civic issues (potholes, garbage collection, streetlights, drainage, water supply), "
                    "track their complaint status, explain priority scoring, and navigate municipal services. "
                    "Always be courteous, concise (2-4 sentences max), and accurate to Bengaluru's municipal structure."
                )
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=f"{system_instruction}\n\nCitizen Query: {message}"
                )
                text = response.text.strip()

                action = None
                lower = (message + " " + text).lower()
                if any(w in lower for w in ['submit', 'report', 'pothole', 'garbage', 'broken', 'leak', 'file']):
                    action = {"label": "File Grievance", "path": "/submit"}
                elif any(w in lower for w in ['track', 'status', 'reference id', 'blr-']):
                    action = {"label": "Track Complaint", "path": "/track"}
                elif any(w in lower for w in ['map', 'hotspot', 'ward', 'explore', 'cluster']):
                    action = {"label": "View Civic Map", "path": "/public-map"}

                return {"reply": text, "action": action}
            except Exception as e:
                print(f"Warning: Gemini chat call failed ({e}). Using heuristic fallback.")

        # Heuristic fallback
        lower = message.lower()
        if any(w in lower for w in ['pothole', 'road', 'crater']):
            return {
                "reply": "Road potholes are handled by BBMP Major Roads and Infrastructure department. You can report an issue with GPS coordinates and photos on our submission portal.",
                "action": {"label": "Report Pothole", "path": "/submit"}
            }
        elif any(w in lower for w in ['track', 'status', 'blr-']):
            return {
                "reply": "You can track the live progression of any complaint from Submission to Verification, Assignment, In Progress, and Resolution using your Reference ID.",
                "action": {"label": "Track Complaint", "path": "/track"}
            }
        elif any(w in lower for w in ['garbage', 'trash', 'waste', 'dump']):
            return {
                "reply": "Solid Waste Management issues are routed directly to the Ward Junior Health Inspector (JHI) for 24-hour resolution.",
                "action": {"label": "Report Waste Issue", "path": "/submit"}
            }
        elif any(w in lower for w in ['priority', 'score', 'urgent']):
            return {
                "reply": "CivicAI uses an explainable AI priority model: Critical (immediate danger/life hazard), High (school/hospital proximity or traffic corridor), Medium (standard SLA), and Low (minor maintenance).",
                "action": None
            }
        return {
            "reply": f"Thank you for contacting CivicAI for Bengaluru. I can assist you with filing grievances, checking complaint status, or viewing civic hotspots across the city.",
            "action": {"label": "Explore Civic Map", "path": "/public-map"}
        }

ai_service = AIService()
