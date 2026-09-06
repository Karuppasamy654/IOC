from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional

from backend.database.connection import get_db
from backend.models.strategy import AdaptivePlanSchedule, StrategyRecord, AgentTraceLog
from backend.models.performance import EpisodicLog, MistakeRecord
from backend.models.student import User
from backend.api.auth import get_current_user

router = APIRouter(prefix="/api/progress", tags=["Progress & Strategy Telemetry"])

@router.get("/plan")
def get_current_plan(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plan = db.query(AdaptivePlanSchedule).filter(
        AdaptivePlanSchedule.user_id == current_user.id,
        AdaptivePlanSchedule.is_active == True
    ).order_by(AdaptivePlanSchedule.version.desc()).first()

    if not plan:
        # Check any historical plan for user
        plan = db.query(AdaptivePlanSchedule).filter(
            AdaptivePlanSchedule.user_id == current_user.id
        ).order_by(AdaptivePlanSchedule.version.desc()).first()

    if not plan:
        return {
            "version": 0,
            "plan_title": "No Adaptive Plan Generated Yet",
            "adaptation_reason": "Complete baseline assessment to generate your personalized placement preparation schedule.",
            "schedule_blocks": [],
            "total_study_minutes_per_day": 0,
            "target_deadline_days": 30
        }

    return {
        "id": plan.id,
        "version": plan.version,
        "plan_title": plan.plan_title,
        "adaptation_reason": plan.adaptation_reason,
        "schedule_blocks": plan.schedule_blocks,
        "total_study_minutes_per_day": plan.total_study_minutes_per_day,
        "target_deadline_days": plan.target_deadline_days,
        "created_at": plan.created_at.isoformat() if plan.created_at else None
    }

@router.get("/plans/history")
def get_plan_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    plans = db.query(AdaptivePlanSchedule).filter(
        AdaptivePlanSchedule.user_id == current_user.id
    ).order_by(AdaptivePlanSchedule.version.desc()).all()

    return [
        {
            "id": p.id,
            "version": p.version,
            "plan_title": p.plan_title,
            "adaptation_reason": p.adaptation_reason,
            "schedule_blocks": p.schedule_blocks,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in plans
    ]

@router.get("/episodes")
def get_episodic_logs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    episodes = db.query(EpisodicLog).filter(
        EpisodicLog.user_id == current_user.id
    ).order_by(EpisodicLog.timestamp.desc()).limit(20).all()

    return [
        {
            "id": e.id,
            "timestamp": e.timestamp.isoformat() if e.timestamp else None,
            "topic": e.topic,
            "subtopic": e.subtopic,
            "activity_type": e.activity_type,
            "score_before": e.score_before,
            "score_after": e.score_after,
            "improvement": e.improvement,
            "mistake_summary": e.mistake_summary,
            "intervention_applied": e.intervention_applied,
            "outcome_status": e.outcome_status
        }
        for e in episodes
    ]

@router.get("/strategies")
def get_strategy_effectiveness(db: Session = Depends(get_db)):
    strats = db.query(StrategyRecord).order_by(StrategyRecord.average_improvement.desc()).all()
    return [
        {
            "id": s.id,
            "strategy_name": s.strategy_name,
            "topic": s.topic,
            "weakness_type": s.weakness_type,
            "context": s.context_description,
            "intervention_sequence": s.intervention_sequence,
            "average_before_score": s.average_before_score,
            "average_after_score": s.average_after_score,
            "average_improvement": s.average_improvement,
            "sample_count": s.sample_count,
            "success_rate": s.success_rate,
            "effectiveness_rating": s.effectiveness_rating
        }
        for s in strats
    ]

@router.get("/mistakes")
def get_mistakes(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mistakes = db.query(MistakeRecord).filter(
        MistakeRecord.user_id == current_user.id
    ).order_by(MistakeRecord.occurrence_count.desc()).all()

    return [
        {
            "id": m.id,
            "topic": m.topic,
            "subtopic": m.subtopic,
            "mistake_type": m.mistake_type,
            "description": m.description,
            "occurrence_count": m.occurrence_count,
            "status": m.status,
            "last_occurred_at": m.last_occurred_at.isoformat() if m.last_occurred_at else None
        }
        for m in mistakes
    ]

@router.get("/traces")
def get_agent_traces(
    session_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(AgentTraceLog).filter(AgentTraceLog.user_id == current_user.id)
    if session_id:
        query = query.filter(AgentTraceLog.session_id == session_id)

    traces = query.order_by(AgentTraceLog.timestamp.desc(), AgentTraceLog.step_number.desc()).limit(30).all()
    traces.reverse()

    return [
        {
            "id": t.id,
            "step_number": t.step_number,
            "session_id": t.session_id,
            "agent_name": t.agent_name,
            "observation": t.observation,
            "evidence": t.evidence,
            "decision": t.decision,
            "action": t.action,
            "tool_called": t.tool_called,
            "tool_result_summary": t.tool_result_summary,
            "memory_retrieved_summary": t.memory_retrieved_summary,
            "confidence": t.confidence,
            "outcome_summary": t.outcome_summary,
            "next_agent": t.next_agent,
            "timestamp": t.timestamp.isoformat() if t.timestamp else None
        }
        for t in traces
    ]
