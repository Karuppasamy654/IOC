from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.performance import MistakeRecord

class MistakeMemory:
    """
    Tier D: Mistake Memory
    Tracks repeated error patterns, frequency counts, and status (recurring vs. resolved).
    Used by Question/Practice Agent to synthesize targeted recovery drills.
    """

    def __init__(self, db: Session):
        self.db = db

    def record_mistake(
        self,
        user_id: int,
        topic: str,
        mistake_type: str,
        description: str,
        subtopic: Optional[str] = None
    ) -> Dict[str, Any]:
        existing = self.db.query(MistakeRecord).filter(
            MistakeRecord.user_id == user_id,
            MistakeRecord.topic == topic,
            MistakeRecord.mistake_type == mistake_type
        ).first()

        if existing:
            existing.occurrence_count += 1
            existing.last_occurred_at = datetime.utcnow()
            existing.status = "recurring" if existing.occurrence_count >= 2 else "initial"
            existing.description = description
            self.db.commit()
            self.db.refresh(existing)
            return {
                "id": existing.id,
                "topic": existing.topic,
                "mistake_type": existing.mistake_type,
                "occurrence_count": existing.occurrence_count,
                "status": existing.status
            }
        else:
            new_mistake = MistakeRecord(
                user_id=user_id,
                topic=topic,
                subtopic=subtopic,
                mistake_type=mistake_type,
                description=description,
                occurrence_count=1,
                status="initial",
                last_occurred_at=datetime.utcnow()
            )
            self.db.add(new_mistake)
            self.db.commit()
            self.db.refresh(new_mistake)
            return {
                "id": new_mistake.id,
                "topic": new_mistake.topic,
                "mistake_type": new_mistake.mistake_type,
                "occurrence_count": 1,
                "status": "initial"
            }

    def get_recurring_mistakes(self, user_id: int, topic: Optional[str] = None) -> List[Dict[str, Any]]:
        query = self.db.query(MistakeRecord).filter(MistakeRecord.user_id == user_id)
        if topic:
            query = query.filter(MistakeRecord.topic == topic)
        mistakes = query.order_by(MistakeRecord.occurrence_count.desc()).all()

        return [
            {
                "id": m.id,
                "topic": m.topic,
                "subtopic": m.subtopic,
                "mistake_type": m.mistake_type,
                "description": m.description,
                "occurrence_count": m.occurrence_count,
                "frequency": m.occurrence_count,
                "status": m.status,
                "last_occurred_at": m.last_occurred_at.isoformat() if m.last_occurred_at else None
            }
            for m in mistakes
        ]

    def mark_mistake_resolved(self, user_id: int, topic: str, mistake_type: str):
        existing = self.db.query(MistakeRecord).filter(
            MistakeRecord.user_id == user_id,
            MistakeRecord.topic == topic,
            MistakeRecord.mistake_type == mistake_type
        ).first()
        if existing:
            existing.status = "resolved"
            existing.resolved_at = datetime.utcnow()
            self.db.commit()
