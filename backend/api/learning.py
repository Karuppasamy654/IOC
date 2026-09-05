from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from backend.database.connection import get_db
from backend.models.assessment import QuestionRecord
from backend.tools.coding_execution_tool import CodingExecutionTool
from backend.tools.resource_search_tool import ResourceSearchTool
from backend.workflows.graph import PlacementEvolveGraph

router = APIRouter(prefix="/api/learning", tags=["Learning & Practice Engine"])

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
    user_id: Optional[int] = 1
    branch: Optional[str] = "Computer Science & Engineering"
    graduation_year: Optional[int] = 2026
    cgpa: Optional[float] = 8.4
    target_role: Optional[str] = "Software Development Engineer (SDE)"
    available_hours_per_day: Optional[float] = 3.0
    preparation_deadline_days: Optional[int] = 30
    skills: Optional[List[str]] = ["Python", "C++", "DSA", "DBMS", "OS"]
    student_code: Optional[str] = None

@router.get("/questions")
def list_questions(topic: Optional[str] = None, question_type: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(QuestionRecord)
    if topic:
        query = query.filter(QuestionRecord.topic == topic)
    if question_type:
        query = query.filter(QuestionRecord.question_type == question_type)
    records = query.all()

    return [
        {
            "id": r.id,
            "topic": r.topic,
            "subtopic": r.subtopic,
            "title": r.title,
            "difficulty": r.difficulty,
            "question_type": r.question_type,
            "description": r.description,
            "starter_code": r.starter_code,
            "options": r.options,
            "test_cases": [tc for tc in r.test_cases if not tc.get("is_hidden", False)],
            "total_test_cases": len(r.test_cases)
        }
        for r in records
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
def trigger_agent_cycle(req: TriggerAgentCycleRequest, db: Session = Depends(get_db)):
    """
    Executes the complete multi-agent workflow:
    Profile -> Skills -> Planner -> Question -> Sandbox -> Evaluator -> Weakness -> Intervention -> Adaptive Planner
    """
    graph = PlacementEvolveGraph(db)
    student_input = {
        "branch": req.branch,
        "graduation_year": req.graduation_year,
        "cgpa": req.cgpa,
        "target_role": req.target_role,
        "available_hours_per_day": req.available_hours_per_day,
        "preparation_deadline_days": req.preparation_deadline_days,
        "skills": req.skills
    }
    final_state = graph.run_full_adaptive_cycle(
        user_id=req.user_id or 1,
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
