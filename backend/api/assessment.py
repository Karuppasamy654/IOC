from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.database.connection import get_db
from backend.models.assessment import AssessmentSession, QuestionRecord
from backend.tools.mock_assessment_tool import MockAssessmentTool

router = APIRouter(prefix="/api/assessment", tags=["Placement Assessments"])

class GenerateAssessmentRequest(BaseModel):
    title: Optional[str] = "Placement Mock Diagnostic Assessment"
    target_role: Optional[str] = "Software Development Engineer (SDE)"
    difficulty: Optional[str] = "Medium"
    duration_minutes: Optional[int] = 45
    topic_distribution: Optional[Dict[str, int]] = None

class SubmitAssessmentRequest(BaseModel):
    session_id: str
    submissions: List[Dict[str, Any]]

@router.post("/generate")
def generate_assessment(req: GenerateAssessmentRequest, user_id: int = 1, db: Session = Depends(get_db)):
    tool = MockAssessmentTool(db)
    result = tool.generate_assessment(
        user_id=user_id,
        title=req.title or "Placement Mock Diagnostic Assessment",
        target_role=req.target_role or "Software Development Engineer (SDE)",
        difficulty=req.difficulty or "Medium",
        topic_distribution=req.topic_distribution,
        duration_minutes=req.duration_minutes or 45
    )
    return result

@router.post("/submit")
def submit_assessment(req: SubmitAssessmentRequest, db: Session = Depends(get_db)):
    tool = MockAssessmentTool(db)
    evaluation = tool.evaluate_assessment_submission(
        session_id=req.session_id,
        submissions=req.submissions
    )
    return evaluation

@router.get("/sessions")
def get_assessment_sessions(user_id: int = 1, db: Session = Depends(get_db)):
    sessions = db.query(AssessmentSession).filter(AssessmentSession.user_id == user_id).order_by(AssessmentSession.created_at.desc()).all()
    return [
        {
            "id": s.id,
            "title": s.title,
            "score_percentage": s.score_percentage,
            "topic_breakdown": s.topic_breakdown,
            "completed": s.completed,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in sessions
    ]
