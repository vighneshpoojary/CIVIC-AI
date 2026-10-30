from fastapi import APIRouter
from pydantic import BaseModel, Field
from typing import Dict, Any
from app.services.ai_service import ai_service
from app.services.duplicate_service import duplicate_service
from app.services.complaint_service import complaint_service
from app.schemas.ai import AIAssessmentResponse, DuplicateCheckResponse

router = APIRouter(prefix="/ai", tags=["AI Engine"])

class AnalyzeDraftRequest(BaseModel):
    title: str = Field(..., min_length=3)
    description: str = Field(..., min_length=5)
    category: str = "Other"
    ward: str = "Bengaluru"

class CheckDuplicateRequest(BaseModel):
    title: str
    description: str
    category: str
    latitude: float = 12.9716
    longitude: float = 77.5946

@router.post("/analyze", response_model=AIAssessmentResponse)
async def analyze_draft(req: AnalyzeDraftRequest):
    """
    Live AI analysis endpoint: Generates category suggestion, subcategory,
    priority recommendation with explainable reasons, risk factors, and summary.
    """
    return await ai_service.analyze_complaint(
        title=req.title,
        description=req.description,
        category=req.category,
        ward=req.ward
    )

@router.post("/check-duplicates", response_model=DuplicateCheckResponse)
def check_duplicates(req: CheckDuplicateRequest):
    """
    Checks if a complaint is a potential duplicate of existing reports
    within a 300-meter radius using multi-factor similarity.
    """
    new_item = req.model_dump()
    existing = complaint_service.get_all(limit=200)
    return duplicate_service.check_duplicates(new_item, existing)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)

@router.post("/chat")
async def chat_with_civic_ai(req: ChatRequest):
    """
    Interactive citizen assistant endpoint powered by Gemini.
    """
    return await ai_service.chat(message=req.message)
