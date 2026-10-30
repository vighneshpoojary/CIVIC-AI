from pydantic import BaseModel, Field
from typing import List, Optional

class AIAssessmentResponse(BaseModel):
    summary: str = Field(..., description="Concise executive summary of the civic complaint")
    category: str = Field(..., description="Identified standard municipal category")
    subcategory: str = Field(..., description="Specific subcategory issue")
    suggested_department: str = Field(..., description="Suggested municipal department")
    priority_recommendation: str = Field(..., description="Recommended priority: Critical, High, Medium, or Low")
    confidence_score: float = Field(..., ge=0.0, le=1.0, description="Model confidence score between 0 and 1")
    risk_factors: List[str] = Field(default=[], description="Key risk factors identified, such as school proximity or waterlogging")
    priority_reasoning: List[str] = Field(default=[], description="Bullet-point explainable reasons behind the priority score")

class DuplicateMatch(BaseModel):
    reference_id: str
    title: str
    similarity_score: float
    distance_meters: float
    match_rationale: str
    status: str

class DuplicateCheckResponse(BaseModel):
    is_potential_duplicate: bool
    highest_similarity: float
    matches: List[DuplicateMatch]
