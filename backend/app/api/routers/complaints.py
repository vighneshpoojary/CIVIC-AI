from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Dict, Any
from app.services.complaint_service import complaint_service
from app.services.ai_service import ai_service
from app.schemas.complaint import ComplaintCreate, ComplaintResponse, ComplaintUpdate

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.get("", response_model=List[Dict[str, Any]])
def list_complaints(
    category: Optional[str] = Query(None),
    priority: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    ward: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0)
):
    """Retrieve filtered, searchable list of complaints."""
    return complaint_service.get_all(
        category=category, priority=priority, status=status,
        ward=ward, search=search, limit=limit, offset=offset
    )

@router.post("", status_code=201)
async def create_complaint(complaint_in: ComplaintCreate):
    """
    Submits a new civic complaint. Automatically triggers AI assessment
    for categorization, summarization, and explainable priority scoring.
    """
    data = complaint_in.model_dump()
    new_record = complaint_service.create(data)
    
    # Trigger AI analysis asynchronously / immediately
    try:
        assessment = await ai_service.analyze_complaint(
            title=new_record["title"],
            description=new_record["description"],
            category=new_record["category"],
            ward=new_record.get("ward", "Bengaluru")
        )
        new_record["ai_assessment"] = assessment.model_dump()
        new_record["priority"] = assessment.priority_recommendation
        new_record["suggested_department"] = assessment.suggested_department
    except Exception as e:
        print(f"Notice: AI assessment fallback used: {e}")
        
    return new_record

@router.get("/{complaint_id}")
def get_complaint(complaint_id: str):
    """Retrieve full details of a specific complaint by UUID."""
    c = complaint_service.get_by_id(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    c_copy = dict(c)
    c_copy["timeline"] = complaint_service.get_status_history(complaint_id)
    return c_copy

@router.get("/ref/{reference_id}")
def get_complaint_by_ref(reference_id: str):
    """Public tracking endpoint: Retrieve complaint status and public timeline by reference ID."""
    c = complaint_service.get_by_reference_id(reference_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint reference ID not found")
    c_copy = dict(c)
    c_copy["timeline"] = complaint_service.get_status_history(c["id"])
    return c_copy

@router.patch("/{complaint_id}/status")
def update_status(complaint_id: str, update: ComplaintUpdate):
    """Update complaint status and record audit transition."""
    if not update.status:
        raise HTTPException(status_code=400, detail="New status must be provided")
    res = complaint_service.update_status(
        complaint_id, update.status, 
        actor="Municipal Officer", 
        note=update.internal_notes or f"Updated status to {update.status}"
    )
    if not res:
        raise HTTPException(status_code=404, detail="Complaint not found")
    return res

@router.post("/{complaint_id}/assign")
def assign_complaint(complaint_id: str, update: ComplaintUpdate):
    """Assign department and officer to a complaint."""
    c = complaint_service.get_by_id(complaint_id)
    if not c:
        raise HTTPException(status_code=404, detail="Complaint not found")
    if update.assigned_department_id:
        c["assigned_department_id"] = update.assigned_department_id
    if update.assigned_officer_id:
        c["assigned_officer_id"] = update.assigned_officer_id
    if update.priority:
        c["priority"] = update.priority
        
    # Transition status to Assigned if currently Awaiting Review or Submitted
    if c["status"] in ["Submitted", "Awaiting Review"]:
        complaint_service.update_status(
            complaint_id, "Assigned", 
            actor="Admin", 
            note=f"Assigned to {c.get('assigned_officer_id', 'Officer')} ({c.get('assigned_department_id', 'Department')})"
        )
    return c
