from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.performance import EpisodicLog

class EpisodicMemory:
    """
    Tier B: Episodic Learning Memory
    Chronicles specific student learning experiences, interventions applied,
    pre- and post-scores, and measured delta improvement.
    """

    def __init__(self, db: Session):
        self.db = db

    def record_episode(
        self,
        user_id: int,
        topic: str,
        activity_type: str,
        score_before: float,
        score_after: float,
        mistake_summary: Optional[str] = None,
        intervention_applied: Optional[str] = None,
        question_id: Optional[str] = None,
        subtopic: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        delta = round(score_after - score_before, 2)
        outcome = "success" if delta > 10 else ("partial" if delta > 0 else "failed")

        log = EpisodicLog(
            user_id=user_id,
            timestamp=datetime.utcnow(),
            topic=topic,
            subtopic=subtopic,
            activity_type=activity_type,
            question_id=question_id,
            score_before=score_before,
            score_after=score_after,
            improvement=delta,
            mistake_summary=mistake_summary,
            intervention_applied=intervention_applied,
            outcome_status=outcome,
            metadata_json=metadata or {}
        )
        self.db.add(log)
        self.db.commit()
        self.db.refresh(log)

        return {
            "id": log.id,
            "topic": log.topic,
            "score_before": log.score_before,
            "score_after": log.score_after,
            "improvement": log.improvement,
            "intervention": log.intervention_applied,
            "outcome": log.outcome_status
        }

    def get_recent_episodes(self, user_id: int, topic: Optional[str] = None, limit: int = 10) -> List[Dict[str, Any]]:
        query = self.db.query(EpisodicLog).filter(EpisodicLog.user_id == user_id)
        if topic:
            query = query.filter(EpisodicLog.topic == topic)
        logs = query.order_by(EpisodicLog.timestamp.desc()).limit(limit).all()

        return [
            {
                "id": l.id,
                "timestamp": l.timestamp.isoformat(),
                "topic": l.topic,
                "subtopic": l.subtopic,
                "activity_type": l.activity_type,
                "score_before": l.score_before,
                "score_after": l.score_after,
                "improvement": l.improvement,
                "mistake_summary": l.mistake_summary,
                "intervention_applied": l.intervention_applied,
                "outcome_status": l.outcome_status
            }
            for l in logs
        ]
