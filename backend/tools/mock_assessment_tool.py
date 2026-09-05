import uuid
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from backend.models.assessment import QuestionRecord, AssessmentSession

class MockAssessmentTool:
    """
    Mandatory Tool 3: Mock Placement Assessment Tool
    Generates customized placement assessments, handles multi-topic distribution,
    evaluates submissions deterministically, and produces diagnostic reports.
    """

    def __init__(self, db_session: Session):
        self.db = db_session

    def generate_assessment(
        self,
        user_id: int,
        title: str = "Full Placement Diagnostic Mock OA",
        target_role: str = "Software Development Engineer (SDE)",
        difficulty: str = "Medium",
        topic_distribution: Optional[Dict[str, int]] = None,
        duration_minutes: int = 60
    ) -> Dict[str, Any]:
        """
        Generate a multi-topic assessment session.
        Default distribution: Graphs/DSA (2), OS (1), DBMS/SQL (1), OOP/Networks (1).
        """
        if not topic_distribution:
            topic_distribution = {
                "Graphs": 1,
                "Dynamic Programming": 1,
                "Operating Systems": 1,
                "DBMS": 1,
                "SQL": 1
            }

        session_id = f"mock-oa-{uuid.uuid4().hex[:8]}"
        selected_questions = []

        for topic, count in topic_distribution.items():
            records = self.db.query(QuestionRecord).filter(QuestionRecord.topic == topic).limit(count).all()
            for r in records:
                selected_questions.append({
                    "id": r.id,
                    "topic": r.topic,
                    "subtopic": r.subtopic,
                    "title": r.title,
                    "difficulty": r.difficulty,
                    "question_type": r.question_type,
                    "description": r.description,
                    "starter_code": r.starter_code,
                    "options": r.options,
                    "test_cases_count": len(r.test_cases) if r.test_cases else 0
                })

        # If questions in DB were fewer than needed, query all available
        if not selected_questions:
            all_qs = self.db.query(QuestionRecord).limit(5).all()
            for r in all_qs:
                selected_questions.append({
                    "id": r.id,
                    "topic": r.topic,
                    "subtopic": r.subtopic,
                    "title": r.title,
                    "difficulty": r.difficulty,
                    "question_type": r.question_type,
                    "description": r.description,
                    "starter_code": r.starter_code,
                    "options": r.options,
                    "test_cases_count": len(r.test_cases) if r.test_cases else 0
                })

        assessment_record = AssessmentSession(
            id=session_id,
            user_id=user_id,
            title=title,
            assessment_type="mock_oa",
            duration_minutes=duration_minutes,
            topic_breakdown={t: 0.0 for t in topic_distribution.keys()},
            detailed_results=[],
            completed=False
        )
        self.db.add(assessment_record)
        self.db.commit()

        return {
            "session_id": session_id,
            "title": title,
            "target_role": target_role,
            "duration_minutes": duration_minutes,
            "total_questions": len(selected_questions),
            "questions": selected_questions
        }

    def evaluate_assessment_submission(
        self,
        session_id: str,
        submissions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Evaluate full assessment submission list:
        [{ "question_id": "...", "answer": ..., "code_eval_result": {...} }]
        """
        session_obj = self.db.query(AssessmentSession).filter(AssessmentSession.id == session_id).first()
        total_questions = len(submissions)
        if total_questions == 0:
            return {"score_percentage": 0.0, "topic_breakdown": {}}

        total_earned_score = 0.0
        max_possible_score = total_questions * 100.0
        topic_scores: Dict[str, List[float]] = {}
        detailed_evaluations = []

        for sub in submissions:
            q_id = sub.get("question_id")
            q_record = self.db.query(QuestionRecord).filter(QuestionRecord.id == q_id).first()
            topic = q_record.topic if q_record else "General"
            if topic not in topic_scores:
                topic_scores[topic] = []

            earned = 0.0
            verdict = "Incorrect"

            if q_record and q_record.question_type == "mcq":
                chosen = sub.get("selected_option_index")
                if chosen is not None and chosen == q_record.correct_option_index:
                    earned = 100.0
                    verdict = "Correct"
                else:
                    earned = 0.0
                    verdict = "Incorrect"
            elif q_record and q_record.question_type == "coding":
                eval_data = sub.get("code_eval_result", {})
                passed = eval_data.get("passed", 0)
                total_tc = eval_data.get("total", 1) or 1
                earned = (passed / total_tc) * 100.0
                verdict = "Accepted" if passed == total_tc else (f"Passed {passed}/{total_tc}")
            else:
                # Default credit based on submission presence
                earned = sub.get("score_override", 50.0)
                verdict = "Evaluated"

            topic_scores[topic].append(earned)
            total_earned_score += earned

            detailed_evaluations.append({
                "question_id": q_id,
                "topic": topic,
                "verdict": verdict,
                "score": earned,
                "title": q_record.title if q_record else "Assessment Item"
            })

        overall_percentage = round((total_earned_score / max_possible_score) * 100.0, 1)
        final_topic_breakdown = {
            t: round(sum(scores) / len(scores), 1) for t, scores in topic_scores.items()
        }

        if session_obj:
            session_obj.total_score = total_earned_score
            session_obj.max_score = max_possible_score
            session_obj.score_percentage = overall_percentage
            session_obj.topic_breakdown = final_topic_breakdown
            session_obj.detailed_results = detailed_evaluations
            session_obj.completed = True
            self.db.commit()

        return {
            "session_id": session_id,
            "overall_score_percentage": overall_percentage,
            "topic_breakdown": final_topic_breakdown,
            "detailed_evaluations": detailed_evaluations,
            "readiness_delta": round(overall_percentage * 0.15, 1)
        }

if __name__ == "__main__":
    from backend.database.connection import SessionLocal
    from backend.database.init_db import init_database

    init_database()
    db = SessionLocal()
    tool = MockAssessmentTool(db)

    print("=" * 70)
    print("MANDATORY TOOL 3: MOCK PLACEMENT ASSESSMENT TOOL")
    print("=" * 70)

    print("\n--- 1. GENERATING MULTI-TOPIC SIMULATED PLACEMENT OA ---")
    assessment = tool.generate_assessment(
        user_id=1,
        title="Software Engineering Placement Mock Assessment",
        duration_minutes=45
    )

    print(f"Session ID:       {assessment['session_id']}")
    print(f"Target Role:      {assessment['target_role']}")
    print(f"Duration:         {assessment['duration_minutes']} minutes")
    print(f"Total Questions:  {assessment['total_questions']}")
    for idx, q in enumerate(assessment['questions']):
        print(f"  [{idx + 1}] {q['title']} ({q['topic']} - {q['difficulty']})")

    print("\n--- 2. DETERMINISTIC ASSESSMENT EVALUATION ---")
    mock_submissions = [
        {"question_id": q["id"], "selected_option_index": 1, "code_eval_result": {"passed": 4, "total": 4}}
        for q in assessment["questions"]
    ]
    eval_result = tool.evaluate_assessment_submission(assessment["session_id"], mock_submissions)

    print(f"Overall Score:    {eval_result['overall_score_percentage']}%")
    print(f"Readiness Boost:  +{eval_result['readiness_delta']}%")
    print("Topic Breakdown:")
    for t, s in eval_result['topic_breakdown'].items():
        print(f"  - {t:<22}: {s}%")
    print("=" * 70)
    db.close()

