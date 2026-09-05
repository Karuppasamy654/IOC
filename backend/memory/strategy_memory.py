from datetime import datetime
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.strategy import StrategyRecord

class StrategyMemory:
    """
    Tier C: Strategy Memory
    The central intelligence component: stores strategies, intervention sequences,
    and their measured real-world effectiveness across student topics and weakness types.
    """

    def __init__(self, db: Session):
        self.db = db

    def record_or_update_strategy(
        self,
        strategy_id: str,
        strategy_name: str,
        topic: str,
        weakness_type: str,
        context_description: str,
        intervention_sequence: List[str],
        before_score: float,
        after_score: float
    ) -> Dict[str, Any]:
        delta = round(after_score - before_score, 2)
        is_successful = (delta >= 15.0)

        existing = self.db.query(StrategyRecord).filter(StrategyRecord.id == strategy_id).first()

        if existing:
            total_samples = existing.sample_count + 1
            new_avg_before = round(((existing.average_before_score * existing.sample_count) + before_score) / total_samples, 2)
            new_avg_after = round(((existing.average_after_score * existing.sample_count) + after_score) / total_samples, 2)
            new_avg_delta = round(new_avg_after - new_avg_before, 2)

            prev_successes = existing.success_rate * existing.sample_count
            new_successes = prev_successes + (1.0 if is_successful else 0.0)
            new_success_rate = round(new_successes / total_samples, 2)

            rating = "Highly Effective" if new_avg_delta >= 20.0 else ("Moderate" if new_avg_delta >= 10.0 else "Ineffective")

            existing.average_before_score = new_avg_before
            existing.average_after_score = new_avg_after
            existing.average_improvement = new_avg_delta
            existing.sample_count = total_samples
            existing.success_rate = new_success_rate
            existing.effectiveness_rating = rating
            existing.last_updated = datetime.utcnow()
            self.db.commit()
            self.db.refresh(existing)
            record = existing
        else:
            rating = "Highly Effective" if delta >= 20.0 else ("Moderate" if delta >= 10.0 else "Ineffective")
            record = StrategyRecord(
                id=strategy_id,
                strategy_name=strategy_name,
                topic=topic,
                weakness_type=weakness_type,
                context_description=context_description,
                intervention_sequence=intervention_sequence,
                average_before_score=before_score,
                average_after_score=after_score,
                average_improvement=delta,
                sample_count=1,
                success_rate=1.0 if is_successful else 0.0,
                effectiveness_rating=rating,
                embedding_text=f"{topic} {weakness_type} {context_description} {strategy_name}",
                last_updated=datetime.utcnow()
            )
            self.db.add(record)
            self.db.commit()
            self.db.refresh(record)

        return {
            "strategy_id": record.id,
            "strategy_name": record.strategy_name,
            "topic": record.topic,
            "average_improvement": record.average_improvement,
            "effectiveness_rating": record.effectiveness_rating,
            "success_rate": record.success_rate,
            "sample_count": record.sample_count
        }

    def list_all_strategies(self) -> List[Dict[str, Any]]:
        strats = self.db.query(StrategyRecord).order_by(StrategyRecord.average_improvement.desc()).all()
        return [
            {
                "id": s.id,
                "strategy_name": s.strategy_name,
                "topic": s.topic,
                "weakness_type": s.weakness_type,
                "context_description": s.context_description,
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

if __name__ == "__main__":
    from backend.database.connection import SessionLocal
    from backend.database.init_db import init_database

    init_database()
    db = SessionLocal()
    mem = StrategyMemory(db)

    print("=" * 70)
    print("PLACEMENTEVOLVE AI: STRATEGY MEMORY DEMONSTRATION")
    print("=" * 70)

    print("\n--- 1. RECORDING MEASURED STRATEGY OUTCOME ---")
    update_result = mem.record_or_update_strategy(
        strategy_id="strat-guided-coding-graphs",
        strategy_name="Visual Breakdown + Guided Coding + Targeted Practice",
        topic="Graphs",
        weakness_type="implementation_weakness",
        context_description="Student understands BFS theory but omits visited array update.",
        intervention_sequence=[
            "Visual BFS state diagram with animated traversal",
            "Worked example highlighting visited[node] placement before queue push",
            "Guided coding sandbox exercise with incremental test feedback",
            "Targeted independent practice problem"
        ],
        before_score=38.0,
        after_score=68.0
    )
    print(f"Strategy ID:         {update_result['strategy_id']}")
    print(f"Strategy Name:       {update_result['strategy_name']}")
    print(f"Topic:               {update_result['topic']}")
    print(f"Average Improvement: +{update_result['average_improvement']}%")
    print(f"Success Rate:        {int(update_result['success_rate'] * 100)}% (Samples: {update_result['sample_count']})")
    print(f"Rating:              {update_result['effectiveness_rating']}")

    print("\n--- 2. ALL STRATEGIES STORED IN PERSISTENT MEMORY ---")
    print(f"{'Rating':<18} | {'Strategy Name':<38} | {'Topic':<12} | {'Yield'}")
    print("-" * 75)
    for s in mem.list_all_strategies():
        print(f"{s['effectiveness_rating']:<18} | {s['strategy_name'][:36]:<38} | {s['topic']:<12} | +{s['average_improvement']}% (Win Rate: {int(s['success_rate']*100)}%)")
    print("=" * 75)
    db.close()

