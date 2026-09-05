import json
import os
from datetime import datetime
from backend.database.connection import engine, Base, SessionLocal
from backend.models.student import User, StudentProfile, StudentCompetency
from backend.models.assessment import QuestionRecord, AssessmentSession
from backend.models.performance import EpisodicLog, MistakeRecord, ReadinessScoreRecord
from backend.models.strategy import StrategyRecord, AdaptivePlanSchedule, AgentTraceLog

def init_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
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

        # Create demo student if not exists
        demo_user = db.query(User).filter(User.email == "demo@placementevolve.ai").first()
        if not demo_user:
            print("Creating demo student...")
            demo_user = User(
                email="demo@placementevolve.ai",
                name="Rahul Sharma",
                hashed_password="demo_hashed_password"
            )
            db.add(demo_user)
            db.flush()

            profile = StudentProfile(
                user_id=demo_user.id,
                branch="Computer Science & Engineering",
                graduation_year=2026,
                cgpa=8.4,
                target_role="Software Development Engineer (SDE)",
                available_hours_per_day=3.0,
                preparation_deadline_days=30,
                skills=["Python", "C++", "DSA", "DBMS", "OS"],
                preferred_subjects=["DSA", "Operating Systems", "DBMS"],
                readiness_score=48.5
            )
            db.add(profile)

            competencies = [
                StudentCompetency(user_id=demo_user.id, topic="Graphs", mastery_score=35.0, concept_mastery=72.0, implementation_mastery=39.0, time_management_score=64.0, status="Critical Weakness"),
                StudentCompetency(user_id=demo_user.id, topic="Dynamic Programming", mastery_score=42.0, concept_mastery=45.0, implementation_mastery=40.0, time_management_score=50.0, status="Needs Improvement"),
                StudentCompetency(user_id=demo_user.id, topic="Binary Search", mastery_score=52.0, concept_mastery=65.0, implementation_mastery=50.0, time_management_score=55.0, status="Needs Improvement"),
                StudentCompetency(user_id=demo_user.id, topic="DBMS", mastery_score=78.0, concept_mastery=82.0, implementation_mastery=75.0, time_management_score=80.0, status="Proficient"),
                StudentCompetency(user_id=demo_user.id, topic="Operating Systems", mastery_score=45.0, concept_mastery=50.0, implementation_mastery=40.0, time_management_score=60.0, status="Needs Improvement"),
                StudentCompetency(user_id=demo_user.id, topic="SQL", mastery_score=85.0, concept_mastery=88.0, implementation_mastery=82.0, time_management_score=85.0, status="Mastered"),
                StudentCompetency(user_id=demo_user.id, topic="OOP", mastery_score=68.0, concept_mastery=70.0, implementation_mastery=66.0, time_management_score=70.0, status="Proficient"),
                StudentCompetency(user_id=demo_user.id, topic="Computer Networks", mastery_score=61.0, concept_mastery=65.0, implementation_mastery=58.0, time_management_score=60.0, status="Proficient")
            ]
            db.add_all(competencies)

            # Initial adaptive plan
            initial_plan = AdaptivePlanSchedule(
                user_id=demo_user.id,
                version=1,
                plan_title="SDE 30-Day Adaptive Placement Plan",
                adaptation_reason="Initial baseline: Prioritizing critical weakness in Graphs & Operating Systems",
                schedule_blocks=[
                    {"time": "10:00 - 10:30", "topic": "Graphs", "activity": "BFS Concept & Traversal Theory", "type": "concept", "priority": "High"},
                    {"time": "10:30 - 11:00", "topic": "Graphs", "activity": "Guided BFS Coding & Visited Handling", "type": "guided_coding", "priority": "Critical"},
                    {"time": "11:00 - 11:30", "topic": "Graphs", "activity": "Targeted Undirected Graph Practice", "type": "practice", "priority": "High"},
                    {"time": "11:30 - 12:00", "topic": "Operating Systems", "activity": "Deadlock & Coffman Conditions Drill", "type": "concept", "priority": "Medium"},
                    {"time": "12:00 - 12:30", "topic": "SQL", "activity": "Window Functions Quick Assessment", "type": "assessment", "priority": "Low"},
                    {"time": "12:30 - 01:00", "topic": "Mock OA", "activity": "Mini Mock Assessment & Review", "type": "mock_oa", "priority": "High"}
                ],
                total_study_minutes_per_day=180,
                target_deadline_days=30,
                is_active=True
            )
            db.add(initial_plan)

            # Mistake record for Graphs visited state
            mistake = MistakeRecord(
                user_id=demo_user.id,
                topic="Graphs",
                subtopic="BFS Traversal",
                mistake_type="visited_array_omission",
                description="Omitted visited array update prior to queue enqueue, triggering infinite loop / duplicate expansions.",
                occurrence_count=5,
                status="recurring"
            )
            db.add(mistake)

            # Readiness breakdown
            readiness = ReadinessScoreRecord(
                user_id=demo_user.id,
                overall_readiness=48.5,
                dsa_score=43.0,
                dbms_score=78.0,
                os_score=45.0,
                oop_score=68.0,
                sql_score=85.0,
                networks_score=61.0,
                coding_score=40.0,
                mock_oa_score=42.0,
                time_management_score=60.0
            )
            db.add(readiness)

        db.commit()
        print("Database initialization complete.")
    except Exception as e:
        db.rollback()
        print(f"Error initializing database: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
