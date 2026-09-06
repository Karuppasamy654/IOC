import json
import os
from sqlalchemy import text
from backend.database.connection import engine, Base, SessionLocal
from backend.models.student import User, StudentProfile, StudentCompetency
from backend.models.assessment import QuestionRecord, AssessmentSession
from backend.models.performance import EpisodicLog, MistakeRecord, ReadinessScoreRecord
from backend.models.strategy import StrategyRecord, AdaptivePlanSchedule, AgentTraceLog

def init_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if company column exists in SQLite
        try:
            db.execute(text("ALTER TABLE question_records ADD COLUMN company VARCHAR(100) DEFAULT 'Amazon'"))
            db.commit()
            print("Added missing 'company' column to question_records table.")
        except Exception:
            db.rollback()

        # Re-seed or seed questions
        db.query(QuestionRecord).delete()
        db.commit()

        print("Seeding questions...")
        if db.query(QuestionRecord).count() == 0:
            print("Seeding questions...")
            # Load DSA questions
            dsa_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "questions", "dsa_questions.json")
            if os.path.exists(dsa_path):
                with open(dsa_path, "r", encoding="utf-8") as f:
                    dsa_data = json.load(f)
                    for q in dsa_data:
                        q_rec = QuestionRecord(
                            id=q["id"],
                            company=q.get("company", "Amazon"),
                            topic=q["topic"],
                            subtopic=q.get("subtopic"),
                            title=q["title"],
                            difficulty=q.get("difficulty", "Medium"),
                            question_type=q.get("type", "coding"),
                            description=q["description"],
                            starter_code=q.get("starter_code", {}),
                            test_cases=q.get("test_cases", []),
                            options=q.get("options", []),
                            correct_option_index=q.get("correct_option_index"),
                            flaw_triggers=q.get("flaw_triggers", {}),
                            reference_solution=q.get("reference_solution", {}),
                            explanation=q.get("explanation")
                        )
                        db.add(q_rec)

            # Load Core CS questions
            core_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "questions", "core_cs_questions.json")
            if os.path.exists(core_path):
                with open(core_path, "r", encoding="utf-8") as f:
                    core_data = json.load(f)
                    for q in core_data:
                        q_rec = QuestionRecord(
                            id=q["id"],
                            company=q.get("company", "Amazon"),
                            topic=q["topic"],
                            subtopic=q.get("subtopic"),
                            title=q["title"],
                            difficulty=q.get("difficulty", "Medium"),
                            question_type=q.get("type", "mcq"),
                            description=q["description"],
                            starter_code=q.get("starter_code", {}),
                            test_cases=q.get("test_cases", []),
                            options=q.get("options", []),
                            correct_option_index=q.get("correct_option_index"),
                            flaw_triggers=q.get("flaw_triggers", {}),
                            reference_solution=q.get("reference_solution", {}),
                            explanation=q.get("explanation")
                        )
                        db.add(q_rec)

        # Seed strategies
        if db.query(StrategyRecord).count() == 0:
            print("Seeding strategies...")
            strat_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "strategies", "seed_strategies.json")
            if os.path.exists(strat_path):
                with open(strat_path, "r", encoding="utf-8") as f:
                    strat_data = json.load(f)
                    for s in strat_data:
                        s_rec = StrategyRecord(
                            id=s["strategy_id"],
                            strategy_name=s["strategy_name"],
                            topic=s["topic"],
                            weakness_type=s["weakness_type"],
                            context_description=s["context"],
                            intervention_sequence=s["intervention_sequence"],
                            average_before_score=s["historical_before_score"],
                            average_after_score=s["historical_after_score"],
                            average_improvement=s["historical_delta"],
                            sample_count=s.get("sample_size", 10),
                            success_rate=s.get("success_rate", 0.85),
                            effectiveness_rating=s.get("effectiveness", "Highly Effective"),
                            embedding_text=f"{s['topic']} {s['weakness_type']} {s['context']} {s['strategy_name']}"
                        )
                        db.add(s_rec)
        db.commit()
        print("Database schema and seed question/strategy banks initialized successfully.")
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
