from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from backend.database.connection import get_db
from backend.models.student import User, StudentProfile, StudentCompetency
from backend.models.performance import ReadinessScoreRecord
from backend.memory.profile_memory import ProfileMemory
from backend.api.auth import get_current_user

router = APIRouter(prefix="/api/student", tags=["Student Profile & Readiness"])

class ProfileUpdateRequest(BaseModel):
    branch: Optional[str] = None
    graduation_year: Optional[int] = None
    cgpa: Optional[float] = None
    target_role: Optional[str] = None
    target_company: Optional[str] = None
    preferred_job_type: Optional[str] = None
    available_hours_per_day: Optional[float] = None
    preparation_deadline_days: Optional[int] = None
    skills: Optional[List[str]] = None
    preferred_subjects: Optional[List[str]] = None
    learning_style: Optional[str] = None
    user_requirements: Optional[str] = None
    tech_familiarity: Optional[Dict[str, str]] = None

@router.get("/profile")
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mem = ProfileMemory(db)
    prof = mem.get_profile(current_user.id)
    if not prof:
        return {
            "user_id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "branch": "Computer Science",
            "graduation_year": 2026,
            "cgpa": 8.0,
            "target_role": "Software Development Engineer (SDE)",
            "target_company": "Amazon",
            "available_hours_per_day": 3.0,
            "preparation_deadline_days": 30,
            "skills": [],
            "preferred_subjects": [],
            "learning_style": "Mixed",
            "user_requirements": None,
            "readiness_score": None
        }
    prof["name"] = current_user.name
    prof["email"] = current_user.email
    return prof

@router.put("/profile")
def update_profile(
    req: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mem = ProfileMemory(db)
    updated = mem.update_profile(current_user.id, req.dict(exclude_unset=True))
    updated["name"] = current_user.name
    updated["email"] = current_user.email
    return updated

@router.get("/competencies")
def get_competencies(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == current_user.id).all()
    return [
        {
            "id": c.id,
            "topic": c.topic,
            "mastery_score": round(c.mastery_score, 1),
            "concept_mastery": round(c.concept_mastery, 1),
            "implementation_mastery": round(c.implementation_mastery, 1),
            "time_management_score": round(c.time_management_score, 1),
            "status": c.status,
            "last_assessed": c.last_assessed.isoformat() if c.last_assessed else None
        }
        for c in comps
    ]

@router.get("/readiness")
def get_readiness_score(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == current_user.id).all()
    if not comps:
        return {
            "overall_readiness": None,
            "breakdown": {},
            "interpretation": "No assessment completed yet. Complete your baseline assessment to generate your readiness profile.",
            "target_readiness": 85.0,
            "gap": None
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

    overall = round(total_weighted / total_weight_applied, 1) if total_weight_applied > 0 else 0.0

    interpretation = (
        "Strong Readiness - High probability of clearing Tier-1 placement rounds." if overall >= 75
        else "Intermediate Readiness - Solid theoretical foundation with practical implementation gaps." if overall >= 55
        else "Developing Readiness - Requires focused adaptive intervention on weak areas."
    )

    return {
        "overall_readiness": overall,
        "breakdown": breakdown,
        "interpretation": interpretation,
        "target_readiness": 85.0,
        "gap": round(max(0.0, 85.0 - overall), 1)
    }

@router.get("/weaknesses")
def get_weakness_breakdown(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == current_user.id).all()
    weaknesses = []

    for c in comps:
        if c.mastery_score < 70.0:
            impl_gap = c.concept_mastery - c.implementation_mastery
            primary = "Implementation Weakness" if impl_gap > 15 else ("Conceptual Weakness" if c.concept_mastery < 60 else "Time Management")
            weaknesses.append({
                "topic": c.topic,
                "overall_score": round(c.mastery_score, 1),
                "concept_mastery": round(c.concept_mastery, 1),
                "implementation_mastery": round(c.implementation_mastery, 1),
                "time_management": round(c.time_management_score, 1),
                "primary_weakness": primary,
                "status": c.status,
                "recommended_action": "Visual walkthrough + guided coding drill" if primary == "Implementation Weakness" else "Core concept revision"
            })

    weaknesses.sort(key=lambda x: x["overall_score"])
    return weaknesses
