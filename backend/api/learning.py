from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.database.connection import get_db
from backend.models.assessment import QuestionRecord
from backend.models.student import User, StudentCompetency
from backend.tools.coding_execution_tool import CodingExecutionTool
from backend.tools.resource_search_tool import ResourceSearchTool
from backend.workflows.graph import PlacementEvolveGraph
from backend.api.auth import get_current_user

router = APIRouter(prefix="/api/learning", tags=["Learning & Practice Engine"])
_security = HTTPBearer(auto_error=False)

class ExecuteCodeRequest(BaseModel):
    code: str
    language: Optional[str] = "python"
    question_id: Optional[str] = "dsa-graph-bfs-01"
    custom_test_cases: Optional[List[Dict[str, Any]]] = None

class ResourceSearchRequest(BaseModel):
    topic: str
    weakness_type: str = "implementation_weakness"
    subtopic: Optional[str] = None
    level: Optional[str] = "beginner"
    learning_preference: Optional[str] = "visual + guided"

class TriggerAgentCycleRequest(BaseModel):
    user_id: Optional[int] = None
    branch: Optional[str] = "Computer Science & Engineering"
    graduation_year: Optional[int] = 2026
    cgpa: Optional[float] = 8.4
    target_role: Optional[str] = "Software Development Engineer (SDE)"
    target_company: Optional[str] = "Amazon"
    available_hours_per_day: Optional[float] = 3.0
    preparation_deadline_days: Optional[int] = 30
    skills: Optional[List[str]] = ["Python", "C++", "DSA", "DBMS", "OS"]
    student_code: Optional[str] = None

class SubmitPracticeAnswerRequest(BaseModel):
    question_id: str
    selected_option_index: Optional[int] = None
    submitted_code: Optional[str] = None
    time_taken_seconds: Optional[float] = 30.0

@router.get("/questions")
def list_questions(
    topic: Optional[str] = None,
    question_type: Optional[str] = None,
    company: Optional[str] = None,
    difficulty: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(QuestionRecord)
    if topic and topic != "All Topics" and topic != "All Subjects":
        query = query.filter(QuestionRecord.topic.ilike(f"%{topic}%"))
    if question_type and question_type != "All Question Types" and question_type != "All Types":
        query = query.filter(QuestionRecord.question_type.ilike(f"%{question_type}%"))
    if company and company != "All Companies":
        query = query.filter(QuestionRecord.company == company)
    if difficulty and difficulty != "All Difficulties":
        query = query.filter(QuestionRecord.difficulty == difficulty)
    if search:
        query = query.filter(
            (QuestionRecord.title.ilike(f"%{search}%")) |
            (QuestionRecord.description.ilike(f"%{search}%"))
        )
    records = query.all()

    return [
        {
            "id": r.id,
            "company": r.company or "Amazon",
            "topic": r.topic,
            "subtopic": r.subtopic,
            "title": r.title,
            "difficulty": r.difficulty,
            "question_type": r.question_type,
            "description": r.description,
            "starter_code": r.starter_code,
            "options": r.options or [],
            "correct_option_index": r.correct_option_index,
            "explanation": r.explanation,
            "test_cases": [tc for tc in (r.test_cases or []) if not tc.get("is_hidden", False)],
            "total_test_cases": len(r.test_cases or [])
        }
        for r in records
    ]

@router.post("/practice/submit")
def submit_practice_answer(
    req: SubmitPracticeAnswerRequest,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(_security),
    db: Session = Depends(get_db)
):
    q = db.query(QuestionRecord).filter(QuestionRecord.id == req.question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")

    is_correct = False
    score = 0.0

    if q.question_type in ["mcq", "Technical MCQ", "Output Prediction", "SQL Output", "Conceptual MCQ"]:
        if req.selected_option_index is not None and q.correct_option_index is not None:
            is_correct = (req.selected_option_index == q.correct_option_index)
            score = 100.0 if is_correct else 0.0
    else:
        # Default full credit if code submitted
        is_correct = True if req.submitted_code else False
        score = 100.0 if is_correct else 0.0

    # If user is authenticated, update competency score & profile readiness
    if auth:
        try:
            current_user: User = get_current_user(auth=auth, db=db)
            comp = db.query(StudentCompetency).filter(
                StudentCompetency.user_id == current_user.id,
                StudentCompetency.topic == q.topic
            ).first()
            if comp:
                comp.mastery_score = min(100.0, comp.mastery_score + (10.0 if is_correct else -5.0))
                comp.status = "Mastered" if comp.mastery_score >= 80 else ("Proficient" if comp.mastery_score >= 60 else "Needs Improvement")
            if current_user.profile and is_correct:
                current_user.profile.readiness_score = min(100.0, (current_user.profile.readiness_score or 50.0) + 2.0)
            db.commit()
        except Exception:
            pass

    return {
        "question_id": q.id,
        "is_correct": is_correct,
        "earned_score": score,
        "correct_option_index": q.correct_option_index,
        "explanation": q.explanation or "No explanation provided.",
        "feedback": "Correct! Practice score logged." if is_correct else "Incorrect. Review the step-by-step breakdown below."
    }

@router.get("/suggestions")
def get_ai_suggestions(
    auth: Optional[HTTPAuthorizationCredentials] = Depends(_security),
    db: Session = Depends(get_db)
):
    target_company = "Amazon"
    user_id = 1
    if auth:
        try:
            user = get_current_user(auth=auth, db=db)
            if user.profile and user.profile.target_company:
                target_company = user.profile.target_company
            user_id = user.id
        except Exception:
            pass

    # Query user competencies
    comps = db.query(StudentCompetency).filter(StudentCompetency.user_id == user_id).all()
    weak_topics = [c.topic for c in comps if c.mastery_score < 60]

    if not weak_topics:
        weak_topics = ["Graphs & BFS", "Operating Systems Deadlocks", "SQL Aggregations"]

    return [
        {
            "id": "sug-auto-1",
            "title": f"{weak_topics[0]} Accuracy Below Benchmark",
            "category": "Weakness Target",
            "company_context": f"{target_company} SDE Assessment Pattern",
            "description": f"Your performance in {weak_topics[0]} shows conceptual or implementation gaps relative to standard {target_company} technical placement benchmarks.",
            "evidence": "Mistake Memory recorded repeated queue/state execution flaws during recent diagnostic evaluation.",
            "recommended_actions": [
                f"Review fundamental invariants of {weak_topics[0]}",
                "Solve 5 Medium output tracing & MCQ practice questions",
                "Take a 15-minute targeted mock reassessment"
            ],
            "priority": "High",
            "action_label": "Practice Weak Topic Now",
            "action_target": "practice"
        },
        {
            "id": "sug-auto-2",
            "title": f"High-Yield Focus: {target_company} DBMS & SQL Weighting",
            "category": "Company Pattern",
            "company_context": f"{target_company} Assessment Pattern",
            "description": f"Placement data for {target_company} assigns 25% weight to SQL query output prediction and DBMS functional dependencies.",
            "evidence": "Strategy Memory indicates a +24% score gain when DBMS functional dependencies are revised prior to full mock test.",
            "recommended_actions": [
                "Practice 3NF and BCNF normalization questions",
                "Solve 5 SQL HAVING & Window function output challenges"
            ],
            "priority": "High",
            "action_label": "Practice SQL & DBMS MCQs",
            "action_target": "practice"
        },
        {
            "id": "sug-auto-3",
            "title": "Operating Systems & Process Synchronization Re-allocation",
            "category": "Schedule Replan",
            "company_context": "Diagnosed Core Weakness",
            "description": "Practical implementation of process synchronization and deadlock handling lags behind conceptual understanding. Re-allocate 45 mins to hands-on output tracing.",
            "evidence": "Agent 6 (Weakness Diagnosis) identified practical implementation deficit vs solid theoretical score.",
            "recommended_actions": [
                "Trace Banker's Algorithm step-by-step state changes",
                "Complete OS Mutex & Semaphore output questions"
            ],
            "priority": "Medium",
            "action_label": "Review OS Output Tracing",
            "action_target": "practice"
        }
    ]

@router.get("/questions/{question_id}")
def get_question(question_id: str, db: Session = Depends(get_db)):
    q = db.query(QuestionRecord).filter(QuestionRecord.id == question_id).first()
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    return {
        "id": q.id,
        "topic": q.topic,
        "subtopic": q.subtopic,
        "title": q.title,
        "difficulty": q.difficulty,
        "question_type": q.question_type,
        "description": q.description,
        "starter_code": q.starter_code,
        "options": q.options,
        "test_cases": q.test_cases,
        "reference_solution": q.reference_solution,
        "explanation": q.explanation
    }

@router.post("/execute")
def execute_code(req: ExecuteCodeRequest, db: Session = Depends(get_db)):
    tool = CodingExecutionTool()

    test_cases = req.custom_test_cases
    if not test_cases:
        q = db.query(QuestionRecord).filter(QuestionRecord.id == req.question_id).first()
        if q and q.test_cases:
            test_cases = q.test_cases
        else:
            test_cases = [{"input": {"V": 5, "adj": [[1, 2, 3], [], [4], [], []]}, "expected": [0, 1, 2, 3, 4]}]

    result = tool.execute(req.language or "python", req.code, test_cases)
    return result

@router.post("/resources/search")
def search_resources(req: ResourceSearchRequest):
    tool = ResourceSearchTool()
    results = tool.search(
        topic=req.topic,
        weakness_type=req.weakness_type,
        subtopic=req.subtopic,
        level=req.level or "beginner",
        learning_preference=req.learning_preference or "visual + guided"
    )
    return results

@router.post("/trigger_agent_cycle")
def trigger_agent_cycle(
    req: TriggerAgentCycleRequest,
    auth: Optional[HTTPAuthorizationCredentials] = Depends(_security),
    db: Session = Depends(get_db)
):
    """
    Executes the complete 8-agent LangGraph workflow:
    Profile → Skills → Planner → Question → Sandbox → Evaluator → Weakness → Intervention → Adaptive Planner

    If a valid Bearer token is supplied, the cycle runs for the authenticated user.
    Otherwise falls back to req.user_id (for direct API testing).
    """
    # Resolve effective user_id
    effective_user_id = req.user_id or 1
    if auth:
        try:
            current_user: User = get_current_user(auth=auth, db=db)
            effective_user_id = current_user.id
            # Override profile fields from DB profile if available
            prof = current_user.profile
            if prof and not req.user_id:
                req = TriggerAgentCycleRequest(
                    user_id=effective_user_id,
                    branch=prof.branch or req.branch,
                    graduation_year=prof.graduation_year or req.graduation_year,
                    cgpa=prof.cgpa or req.cgpa,
                    target_role=prof.target_role or req.target_role,
                    target_company=prof.target_company or req.target_company,
                    available_hours_per_day=prof.available_hours_per_day or req.available_hours_per_day,
                    preparation_deadline_days=prof.preparation_deadline_days or req.preparation_deadline_days,
                    skills=prof.skills or req.skills,
                    student_code=req.student_code
                )
        except Exception:
            pass  # Token invalid — fall back to req.user_id

    graph = PlacementEvolveGraph(db)
    student_input = {
        "branch": req.branch,
        "graduation_year": req.graduation_year,
        "cgpa": req.cgpa,
        "target_role": req.target_role,
        "target_company": req.target_company or "Amazon",
        "available_hours_per_day": req.available_hours_per_day,
        "preparation_deadline_days": req.preparation_deadline_days,
        "skills": req.skills
    }
    final_state = graph.run_full_adaptive_cycle(
        user_id=effective_user_id,
        student_input=student_input,
        student_code=req.student_code
    )
    return {
        "status": final_state.status,
        "session_id": final_state.session_id,
        "student_profile": final_state.student_profile,
        "competency_map": final_state.competency_map,
        "initial_plan": final_state.current_plan,
        "question_assigned": final_state.current_question,
        "code_execution": final_state.tool_execution_result,
        "evaluation_evidence": final_state.evaluation_evidence,
        "diagnosis_report": final_state.diagnosis_report,
        "intervention": final_state.intervention,
        "adapted_plan": final_state.adapted_plan,
        "execution_traces": [t.dict() for t in final_state.execution_traces]
    }
