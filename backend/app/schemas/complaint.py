from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class ComplaintBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=150)
    description: str = Field(..., min_length=10, max_length=2000)
    category: str
    subcategory: Optional[str] = None
    address: str
    city: str = "Bengaluru"
    ward: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ComplaintCreate(ComplaintBase):
    image_paths: Optional[List[str]] = []

class ComplaintUpdate(BaseModel):
    priority: Optional[str] = None
    status: Optional[str] = None
    assigned_department_id: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    internal_notes: Optional[str] = None

class ComplaintResponse(ComplaintBase):
    id: str
    reference_id: str
    citizen_id: str
    priority: str
    status: str
    assigned_department_id: Optional[str] = None
    assigned_officer_id: Optional[str] = None
    is_synthetic: bool = False
    source_name: Optional[str] = "Citizen Portal"
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True
