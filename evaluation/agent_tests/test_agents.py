import pytest
from backend.database.connection import SessionLocal
from backend.database.init_db import init_database
from backend.agents.profile_agent import ProfileAgent
from backend.agents.placement_skill_agent import PlacementSkillAgent
from backend.agents.planner_agent import PlanningAgent
from backend.agents.question_agent import QuestionAgent
from backend.agents.evaluator_agent import EvaluatorAgent
from backend.agents.weakness_agent import WeaknessDiagnosisAgent
from backend.agents.intervention_agent import ResourceInterventionAgent
from backend.agents.adaptive_planner_agent import AdaptivePlannerAgent
from backend.tools.coding_execution_tool import CodingExecutionTool

@pytest.fixture(scope="module")
def db():
    init_database()
    session = SessionLocal()
    yield session
    session.close()

def test_profile_agent(db):
    agent = ProfileAgent(db)
    res = agent.process(user_id=1, raw_input={
        "branch": "Computer Science",
        "graduation_year": 2026,
        "cgpa": 8.8,
        "target_role": "Software Development Engineer (SDE)",
        "available_hours_per_day": 3.5,
        "preparation_deadline_days": 30,
        "skills": ["Python", "DSA", "DBMS"]
    })
    assert res["profile"]["cgpa"] == 8.8
    assert res["profile"]["target_role"] == "Software Development Engineer (SDE)"
    assert res["reasoning"]["agent"] == "Profile Agent"

def test_placement_skill_agent(db):
    agent = PlacementSkillAgent(db)
    res = agent.analyze_gaps(user_id=1, target_role="Software Development Engineer (SDE)")
    assert len(res["competency_map"]) >= 5
    assert "critical_gaps" in res
    assert res["reasoning"]["agent"] == "Placement Skill Analysis Agent"

def test_planner_agent(db):
    agent = PlanningAgent(db)
    res = agent.create_initial_plan(user_id=1, critical_gaps=[{"topic": "Graphs"}, {"topic": "Operating Systems"}])
    assert len(res["schedule_blocks"]) == 6
    assert res["schedule_blocks"][0]["topic"] == "Graphs"
    assert res["reasoning"]["agent"] == "Planning Agent"

def test_question_agent(db):
    agent = QuestionAgent(db)
    res = agent.select_or_generate_question(user_id=1, topic="Graphs", question_type="coding")
    assert res["question"]["topic"] == "Graphs"
    assert len(res["question"]["test_cases"]) > 0
    assert res["reasoning"]["agent"] == "Question/Practice Agent"

def test_evaluator_and_weakness_agents(db):
    coding_tool = CodingExecutionTool()
    # Flawed BFS code
    flawed_code = "def bfs_traversal(V, adj):\n    return [0, 1]"
    tool_res = coding_tool.execute_python_code(flawed_code, [
        {"input": {"V": 5, "adj": [[1, 2, 3], [], [4], [], []]}, "expected": [0, 1, 2, 3, 4]}
    ])

    eval_agent = EvaluatorAgent(db)
    eval_res = eval_agent.evaluate_submission(
        user_id=1,
        question_id="dsa-graph-bfs-01",
        submission_code_or_answer=flawed_code,
        tool_execution_result=tool_res
    )
    assert "structured_evidence" in eval_res
    assert eval_res["structured_evidence"]["topic"] == "Graphs"

    # Weakness Diagnosis Agent
    weakness_agent = WeaknessDiagnosisAgent(db)
    diag_res = weakness_agent.diagnose(user_id=1, structured_evidence=eval_res["structured_evidence"])
    assert diag_res["diagnosis_report"]["topic"] == "Graphs"
    assert diag_res["diagnosis_report"]["primary_diagnosis"] == "Implementation Weakness"
    assert diag_res["reasoning"]["agent"] == "Weakness Diagnosis Agent"

def test_intervention_and_adaptive_planner(db):
    intervention_agent = ResourceInterventionAgent(db)
    interv_res = intervention_agent.select_intervention(user_id=1, diagnosis_report={
        "topic": "Graphs",
        "diagnosis_category": "implementation_weakness",
        "root_cause_explanation": "Visited state omitted"
    })
    assert "intervention" in interv_res
    assert interv_res["tool_called"] == "LearningResourceSearchTool"

    # Adaptive Planner
    adaptive_planner = AdaptivePlannerAgent(db)
    adapt_res = adaptive_planner.adapt_plan(
        user_id=1,
        topic="Graphs",
        score_before=38.0,
        score_after=68.0,
        applied_intervention=interv_res["intervention"]
    )
    assert adapt_res["is_effective"] is True
    assert adapt_res["improvement_delta"] == 30.0
    assert adapt_res["reasoning"]["agent"] == "Adaptive Planner Agent"
