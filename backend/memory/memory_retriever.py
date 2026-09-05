from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from backend.models.strategy import StrategyRecord
from backend.models.performance import EpisodicLog, MistakeRecord

class MemoryRetriever:
    """
    Tier E: Semantic & Vector Memory Retriever
    Uses vector cosine similarity over strategy and episodic embeddings
    to retrieve high-yield strategies matching diagnosed weaknesses.
    """

    def __init__(self, db: Session):
        self.db = db

    def retrieve_best_strategy(
        self,
        topic: str,
        weakness_type: str,
        diagnosis_context: str
    ) -> Optional[Dict[str, Any]]:
        """
        Retrieve the most statistically effective strategy for a given topic and weakness diagnosis.
        """
        strategies = self.db.query(StrategyRecord).all()
        if not strategies:
            return None

        # Build query representation
        query_text = f"{topic} {weakness_type} {diagnosis_context}"
        corpus = [s.embedding_text or f"{s.topic} {s.weakness_type} {s.context_description} {s.strategy_name}" for s in strategies]
        corpus.append(query_text)

        # Compute TF-IDF vector similarity
        vectorizer = TfidfVectorizer(stop_words='english')
        tfidf_matrix = vectorizer.fit_transform(corpus)

        query_vec = tfidf_matrix[-1]
        strategy_vecs = tfidf_matrix[:-1]

        sim_scores = cosine_similarity(query_vec, strategy_vecs)[0]

        # Combine semantic similarity with empirical effectiveness rating score
        ranked_strategies = []
        for idx, s in enumerate(strategies):
            base_sim = float(sim_scores[idx])
            # Boost strategy if topic or weakness matches directly
            if s.topic.lower() in topic.lower():
                base_sim += 0.3
            if s.weakness_type.lower() in weakness_type.lower():
                base_sim += 0.2

            # Weighted combination of similarity and historical improvement delta
            effectiveness_factor = (s.average_improvement / 50.0) * s.success_rate
            total_score = (base_sim * 0.6) + (effectiveness_factor * 0.4)

            ranked_strategies.append((total_score, s))

        ranked_strategies.sort(key=lambda x: x[0], reverse=True)
        best_score, best_strat = ranked_strategies[0]

        return {
            "strategy_id": best_strat.id,
            "strategy_name": best_strat.strategy_name,
            "topic": best_strat.topic,
            "weakness_type": best_strat.weakness_type,
            "context_description": best_strat.context_description,
            "intervention_sequence": best_strat.intervention_sequence,
            "historical_improvement": best_strat.average_improvement,
            "success_rate": best_strat.success_rate,
            "effectiveness_rating": best_strat.effectiveness_rating,
            "match_confidence": round(min(best_score, 0.98), 2)
        }

    def retrieve_student_context(self, user_id: int, topic: str) -> Dict[str, Any]:
        """
        Retrieve combined memory context: recurring mistakes + recent episodic history.
        """
        mistakes = self.db.query(MistakeRecord).filter(
            MistakeRecord.user_id == user_id,
            MistakeRecord.topic == topic
        ).all()

        episodes = self.db.query(EpisodicLog).filter(
            EpisodicLog.user_id == user_id,
            EpisodicLog.topic == topic
        ).order_by(EpisodicLog.timestamp.desc()).limit(5).all()

        return {
            "topic": topic,
            "recurring_mistakes": [
                {"mistake_type": m.mistake_type, "count": m.occurrence_count, "desc": m.description, "status": m.status}
                for m in mistakes
            ],
            "recent_episodes": [
                {"before": e.score_before, "after": e.score_after, "delta": e.improvement, "intervention": e.intervention_applied}
                for e in episodes
            ]
        }
