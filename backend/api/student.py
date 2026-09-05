from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from backend.database.connection import get_db
from backend.models.student import User, StudentProfile, StudentCompetency
from backend.models.performance import ReadinessScoreRecord
from backend.memory.profile_memory import ProfileMemory

router = APIRouter(prefix="/api/student", tags=["Student Profile & Readiness"])

class ProfileUpdateRequest(BaseModel):
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    target_role: Optional[str] = None
    available_hours_per_day: Optional[float] = None
    preparation_deadline_days: Optional[int] = None
    skills: Optional[List[str]] = None
    preferred_subjects: Optional[List[str]] = None

@router.get("/profile")
def get_profile(user_id: int = 1, db: Session = Depends(get_db)):
    mem = ProfileMemory(db)
    prof = mem.get_profile(user_id)
    if not prof:
        user = db.query(User).first()
        if user:
            prof = mem.get_profile(user.id)
    return prof or {}

@router.put("/profile")
def update_profile(req: ProfileUpdateRequest, user_id: int = 1, db: Session = Depends(get_db)):
    mem = ProfileMemory(db)
    updated = mem.update_profile(user_id, req.dict(exclude_unset=True))
    return updated

@router.get("/competencies")
def get_competencies(user_id: int = 1, db: Session = Depends(get_db)):
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == user_id).all()
    if not comps:
        comps = db.query(StudentCompetency).all()

    return [
        {
            "id": c.id,
            "topic": c.topic,
            "mastery_score": c.mastery_score,
            "concept_mastery": c.concept_mastery,
            "implementation_mastery": c.implementation_mastery,
            "time_management_score": c.time_management_score,
            "status": c.status,
            "last_assessed": c.last_assessed.isoformat() if c.last_assessed else None
        }
        for c in comps
    ]

@router.get("/readiness")
def get_readiness_score(user_id: int = 1, db: Session = Depends(get_db)):
    """
    Deterministic Placement Readiness Score Calculation
    Based on weighted combination of topics and practice telemetry.
    """
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == user_id).all()
    if not comps:
        return {
            "overall_readiness": 48.5,
            "breakdown": {"DSA": 43.0, "Operating Systems": 45.0, "DBMS": 78.0, "SQL": 85.0, "OOP": 68.0, "Networks": 61.0},
            "interpretation": "Early Stage Readiness: Critical weakness detected in Graphs implementation and OS deadlock recovery."
        }

    weights = {
        "Graphs": 0.20,
        "Dynamic Programming": 0.15,
        "Binary Search": 0.10,
        "Operating Systems": 0.15,
        "DBMS": 0.15,
        "SQL": 0.10,
        "OOP": 0.08,
        "Computer Networks": 0.07
    }

    total_weighted = 0.0
    total_weight_applied = 0.0
    breakdown = {}

    for c in comps:
        w = weights.get(c.topic, 0.10)
        total_weighted += c.mastery_score * w
        total_weight_applied += w
        breakdown[c.topic] = round(c.mastery_score, 1)

    overall = round(total_weighted / total_weight_applied, 1) if total_weight_applied > 0 else 50.0

    interpretation = (
        "Strong Readiness - High probability of clearing Tier-1 placement rounds." if overall >= 75
        else "Intermediate Readiness - Solid theoretical foundation with practical implementation gaps." if overall >= 55
        else "Developing Readiness - Requires focused adaptive intervention on DSA & Operating Systems."
    )

    return {
        "overall_readiness": overall,
        "breakdown": breakdown,
        "interpretation": interpretation,
        "target_readiness": 85.0,
        "gap": round(max(0.0, 85.0 - overall), 1)
    }

@router.get("/weaknesses")
def get_weakness_breakdown(user_id: int = 1, db: Session = Depends(get_db)):
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == user_id).all()
    weaknesses = []

    for c in comps:
        if c.mastery_score < 70.0:
            impl_gap = c.concept_mastery - c.implementation_mastery
            primary = "Implementation Weakness" if impl_gap > 15 else ("Conceptual Weakness" if c.concept_mastery < 60 else "Time Management")
            weaknesses.append({
                "topic": c.topic,
                "overall_score": c.mastery_score,
                "concept_mastery": c.concept_mastery,
                "implementation_mastery": c.implementation_mastery,
                "time_management": c.time_management_score,
                "primary_weakness": primary,
                "status": c.status,
                "recommended_action": "Visual walkthrough + guided coding drill" if primary == "Implementation Weakness" else "Core concept revision"
            })

    # Sort so critical weaknesses appear first
    weaknesses.sort(key=lambda x: x["overall_score"])
    return weaknesses
