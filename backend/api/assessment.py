from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

from backend.database.connection import get_db
from backend.models.assessment import AssessmentSession, QuestionRecord
from backend.models.student import User, StudentCompetency, StudentProfile
from backend.tools.mock_assessment_tool import MockAssessmentTool
from backend.api.auth import get_current_user

router = APIRouter(prefix="/api/assessment", tags=["Placement Assessments"])

class GenerateAssessmentRequest(BaseModel):
    title: Optional[str] = "Placement Baseline Diagnostic Assessment"
    target_role: Optional[str] = "Software Development Engineer (SDE)"
    target_company: Optional[str] = "Amazon"
    subject_focus: Optional[str] = "All Subjects"
    difficulty: Optional[str] = "Medium"
    duration_minutes: Optional[int] = 30
    question_count: Optional[int] = 10
    use_dynamic_ai: Optional[bool] = False
    scheduled_topics: Optional[List[str]] = None
    topic_distribution: Optional[Dict[str, int]] = None

class SubmitAssessmentRequest(BaseModel):
    session_id: str
    submissions: List[Dict[str, Any]]

@router.post("/generate")
def generate_assessment(
    req: GenerateAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tool = MockAssessmentTool(db)
    result = tool.generate_assessment(
        user_id=current_user.id,
        title=req.title or "Placement Baseline Diagnostic Assessment",
        target_role=req.target_role or (current_user.profile.target_role if current_user.profile else "Software Development Engineer (SDE)"),
        difficulty=req.difficulty or "Medium",
        topic_distribution=req.topic_distribution,
        duration_minutes=req.duration_minutes or 30,
        target_company=req.target_company or "Amazon",
        subject_focus=req.subject_focus or "All Subjects",
        question_count=req.question_count or 10,
        use_dynamic_ai=bool(req.use_dynamic_ai),
        scheduled_topics=req.scheduled_topics
    )
    return result

@router.post("/submit")
def submit_assessment(
    req: SubmitAssessmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    tool = MockAssessmentTool(db)
    evaluation = tool.evaluate_assessment_submission(
        session_id=req.session_id,
        submissions=req.submissions
    )

    # Persist topic performance into StudentCompetency records
    topic_breakdown = evaluation.get("topic_breakdown", {})
    overall_score = evaluation.get("overall_score_percentage", 0.0)

    for topic, score in topic_breakdown.items():
        comp = db.query(StudentCompetency).filter(
            StudentCompetency.user_id == current_user.id,
            StudentCompetency.topic == topic
        ).first()

        status_str = (
            "Mastered" if score >= 85.0
            else "Proficient" if score >= 70.0
            else "Needs Improvement" if score >= 50.0
            else "Critical Weakness"
        )

        if comp:
            comp.mastery_score = score
            comp.concept_mastery = score
            comp.implementation_mastery = max(20.0, score - 15.0) if score < 70 else score
            comp.status = status_str
            comp.last_assessed = datetime.utcnow()
        else:
            new_comp = StudentCompetency(
                user_id=current_user.id,
                topic=topic,
                mastery_score=score,
                concept_mastery=score,
                implementation_mastery=max(20.0, score - 15.0) if score < 70 else score,
                time_management_score=60.0,
                status=status_str,
                last_assessed=datetime.utcnow()
            )
            db.add(new_comp)

    # Update overall profile readiness
    if current_user.profile:
        current_user.profile.readiness_score = overall_score

    db.commit()
    return evaluation

@router.get("/sessions")
def get_assessment_sessions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    sessions = db.query(AssessmentSession).filter(
        AssessmentSession.user_id == current_user.id
    ).order_by(AssessmentSession.created_at.desc()).all()

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
