from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional
from backend.database.connection import get_db
from backend.models.strategy import AdaptivePlanSchedule, StrategyRecord, AgentTraceLog
from backend.models.performance import EpisodicLog, MistakeRecord

router = APIRouter(prefix="/api/progress", tags=["Progress & Strategy Telemetry"])

@router.get("/plan")
def get_current_plan(user_id: int = 1, db: Session = Depends(get_db)):
    plan = db.query(AdaptivePlanSchedule).filter(
        AdaptivePlanSchedule.user_id == user_id,
        AdaptivePlanSchedule.is_active == True
    ).order_by(AdaptivePlanSchedule.version.desc()).first()

    if not plan:
        plan = db.query(AdaptivePlanSchedule).order_by(AdaptivePlanSchedule.id.desc()).first()

    if not plan:
        return {
            "version": 1,
            "plan_title": "Default SDE Placement Plan",
            "adaptation_reason": "Default schedule",
            "schedule_blocks": []
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
def get_plan_history(user_id: int = 1, db: Session = Depends(get_db)):
    plans = db.query(AdaptivePlanSchedule).filter(
        AdaptivePlanSchedule.user_id == user_id
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
def get_episodic_logs(user_id: int = 1, db: Session = Depends(get_db)):
    episodes = db.query(EpisodicLog).filter(EpisodicLog.user_id == user_id).order_by(EpisodicLog.timestamp.desc()).limit(20).all()
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
def get_mistakes(user_id: int = 1, db: Session = Depends(get_db)):
    mistakes = db.query(MistakeRecord).filter(MistakeRecord.user_id == user_id).order_by(MistakeRecord.occurrence_count.desc()).all()
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
def get_agent_traces(user_id: int = 1, session_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(AgentTraceLog)
    if user_id:
        query = query.filter(AgentTraceLog.user_id == user_id)
    if session_id:
        query = query.filter(AgentTraceLog.session_id == session_id)

    traces = query.order_by(AgentTraceLog.timestamp.desc(), AgentTraceLog.step_number.desc()).limit(30).all()
    # Return in chronological order
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
