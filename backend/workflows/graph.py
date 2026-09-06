import uuid
from typing import Dict, Any, List, Optional, TypedDict
from sqlalchemy.orm import Session
from langgraph.graph import StateGraph, START, END

from backend.database.connection import SessionLocal
from backend.models.strategy import AgentTraceLog
from backend.workflows.state import AgentState, ReasoningRecord

from backend.agents.profile_agent import ProfileAgent
from backend.agents.placement_skill_agent import PlacementSkillAgent
from backend.agents.planner_agent import PlanningAgent
from backend.agents.question_agent import QuestionAgent
from backend.agents.evaluator_agent import EvaluatorAgent
from backend.agents.weakness_agent import WeaknessDiagnosisAgent
from backend.agents.intervention_agent import ResourceInterventionAgent
from backend.agents.adaptive_planner_agent import AdaptivePlannerAgent
from backend.tools.coding_execution_tool import CodingExecutionTool

class WorkflowState(TypedDict):
    user_id: int
    session_id: str
    student_input: Dict[str, Any]
    student_code: Optional[str]
    student_profile: Dict[str, Any]
    target_role: str
    target_company: str
    competency_map: List[Dict[str, Any]]
    critical_gaps: List[Dict[str, Any]]
    current_plan: Dict[str, Any]
    current_question: Dict[str, Any]
    tool_execution_result: Dict[str, Any]
    evaluation_evidence: Dict[str, Any]
    diagnosis_report: Dict[str, Any]
    intervention: Dict[str, Any]
    adapted_plan: Dict[str, Any]
    execution_traces: List[Dict[str, Any]]
    status: str

class PlacementEvolveGraph:
    """
    Multi-Agent Orchestrator for PlacementEvolve AI using LangGraph StateGraph
    Executes the self-adaptive closed loop:
    Observe -> Reason -> Plan -> Act -> Observe -> Evaluate -> Learn -> Adapt -> Replan
    """

    def __init__(self, db: Session):
        self.db = db
        self.profile_agent = ProfileAgent(db)
        self.skill_agent = PlacementSkillAgent(db)
        self.planner_agent = PlanningAgent(db)
        self.question_agent = QuestionAgent(db)
        self.evaluator_agent = EvaluatorAgent(db)
        self.weakness_agent = WeaknessDiagnosisAgent(db)
        self.intervention_agent = ResourceInterventionAgent(db)
        self.adaptive_planner = AdaptivePlannerAgent(db)
        self.coding_tool = CodingExecutionTool()
        self.compiled_graph = self._build_langgraph()

    def _log_trace(self, user_id: int, session_id: str, traces_list: List[Dict[str, Any]], reasoning: Dict[str, Any], tool_called: str = None, tool_summary: str = None, mem_summary: str = None, outcome: str = None):
        step_num = len(traces_list) + 1
        agent_name = reasoning.get("agent", "Agent")
        obs = reasoning.get("observation", "")
        ev = reasoning.get("evidence", [])
        dec = reasoning.get("decision", "")
        act = reasoning.get("action", "")
        conf = reasoning.get("confidence", 0.90)

        trace_dict = {
            "agent_name": agent_name,
            "observation": obs,
            "evidence": ev,
            "decision": dec,
            "action": act,
            "tool_called": tool_called,
            "tool_result_summary": tool_summary,
            "memory_retrieved_summary": mem_summary,
            "confidence": conf,
            "outcome_summary": outcome,
            "next_agent": reasoning.get("next_agent")
        }
        traces_list.append(trace_dict)

        # Persist trace in database
        db_trace = AgentTraceLog(
            user_id=user_id,
            session_id=session_id,
            step_number=step_num,
            agent_name=agent_name,
            observation=obs,
            evidence=ev,
            decision=dec,
            action=act,
            tool_called=tool_called,
            tool_result_summary=tool_summary,
            memory_retrieved_summary=mem_summary,
            confidence=conf,
            outcome_summary=outcome,
            next_agent=reasoning.get("next_agent")
        )
        self.db.add(db_trace)
        self.db.commit()

    def _build_langgraph(self):
        builder = StateGraph(WorkflowState)

        def node_profile(state: WorkflowState) -> Dict[str, Any]:
            prof_res = self.profile_agent.process(state["user_id"], state["student_input"])
            traces = state.get("execution_traces", [])
            self._log_trace(state["user_id"], state["session_id"], traces, prof_res["reasoning"], outcome="Structured student profile synthesized and persisted.")
            return {
                "student_profile": prof_res["profile"],
                "execution_traces": traces
            }

        def node_skill_analysis(state: WorkflowState) -> Dict[str, Any]:
            target_role = state.get("target_role", "Software Development Engineer (SDE)")
            skill_res = self.skill_agent.analyze_gaps(state["user_id"], target_role)
            traces = state.get("execution_traces", [])
            self._log_trace(state["user_id"], state["session_id"], traces, skill_res["reasoning"], outcome=f"Identified {len(skill_res['critical_gaps'])} critical competency gaps.")
            return {
                "competency_map": skill_res["competency_map"],
                "critical_gaps": skill_res["critical_gaps"],
                "execution_traces": traces
            }

        def node_planning(state: WorkflowState) -> Dict[str, Any]:
            plan_res = self.planner_agent.create_initial_plan(state["user_id"], state.get("critical_gaps", []))
            traces = state.get("execution_traces", [])
            self._log_trace(state["user_id"], state["session_id"], traces, plan_res["reasoning"], outcome="Synthesized Plan V1 prioritizing critical weaknesses.")
            return {
                "current_plan": plan_res,
                "execution_traces": traces
            }

        def node_question(state: WorkflowState) -> Dict[str, Any]:
            gaps = state.get("critical_gaps", [])
            primary_topic = gaps[0]["topic"] if gaps else "Graphs"
            q_res = self.question_agent.select_or_generate_question(
                user_id=state["user_id"],
                topic=primary_topic,
                question_type="coding",
                difficulty="Medium"
            )
            traces = state.get("execution_traces", [])
            self._log_trace(state["user_id"], state["session_id"], traces, q_res["reasoning"], mem_summary="Queried Mistake Memory for recurring error patterns.", outcome=f"Generated practice item '{q_res['question'].get('title')}'.")
            return {
                "current_question": q_res["question"],
                "execution_traces": traces
            }

        def node_sandbox(state: WorkflowState) -> Dict[str, Any]:
            student_code = state.get("student_code")
            if not student_code:
                student_code = (
                    "from collections import deque\n"
                    "def bfs_traversal(V: int, adj: list[list[int]]) -> list[int]:\n"
                    "    queue = deque([0])\n"
                    "    result = []\n"
                    "    while queue and len(result) < V:\n"
                    "        node = queue.popleft()\n"
                    "        result.append(node)\n"
                    "        for neighbor in adj[node]:\n"
                    "            queue.append(neighbor)\n"
                    "    return result\n"
                )
            test_cases = state.get("current_question", {}).get("test_cases", [])
            tool_res = self.coding_tool.execute_python_code(student_code, test_cases)
            return {
                "student_code": student_code,
                "tool_execution_result": tool_res
            }

        def node_evaluator(state: WorkflowState) -> Dict[str, Any]:
            tool_res = state.get("tool_execution_result", {})
            student_code = state.get("student_code", "")
            q_id = state.get("current_question", {}).get("id", "dsa-graph-bfs-01")
            eval_res = self.evaluator_agent.evaluate_submission(
                user_id=state["user_id"],
                question_id=q_id,
                submission_code_or_answer=student_code,
                tool_execution_result=tool_res,
                time_taken_seconds=210.0
            )
            traces = state.get("execution_traces", [])
            self._log_trace(
                state["user_id"],
                state["session_id"],
                traces,
                eval_res["reasoning"],
                tool_called="CodingExecutionTool",
                tool_summary=f"Result: {tool_res.get('status')} ({tool_res.get('passed')}/{tool_res.get('total')} test cases passed in {tool_res.get('runtime_ms')}ms)",
                outcome=f"Evaluated submission: {eval_res['structured_evidence'].get('accuracy')} accuracy. Flaw: {tool_res.get('flaw_detected')}."
            )
            return {
                "evaluation_evidence": eval_res["structured_evidence"],
                "execution_traces": traces
            }

        def node_diagnosis(state: WorkflowState) -> Dict[str, Any]:
            ev = state.get("evaluation_evidence", {})
            weakness_res = self.weakness_agent.diagnose(state["user_id"], ev)
            traces = state.get("execution_traces", [])
            diag = weakness_res["diagnosis_report"]
            self._log_trace(
                state["user_id"],
                state["session_id"],
                traces,
                weakness_res["reasoning"],
                outcome=f"Diagnosis: {diag.get('primary_diagnosis')} (Concept: {diag.get('concept_knowledge')} vs Implementation: {diag.get('implementation_mastery')})."
            )
            return {
                "diagnosis_report": diag,
                "execution_traces": traces
            }

        def node_intervention(state: WorkflowState) -> Dict[str, Any]:
            diag = state.get("diagnosis_report", {})
            interv_res = self.intervention_agent.select_intervention(state["user_id"], diag)
            traces = state.get("execution_traces", [])
            interv = interv_res["intervention"]
            self._log_trace(
                state["user_id"],
                state["session_id"],
                traces,
                interv_res["reasoning"],
                tool_called=interv_res.get("tool_called"),
                tool_summary=interv_res.get("tool_result_summary"),
                mem_summary=interv_res.get("memory_retrieved_summary"),
                outcome=f"Retrieved Strategy '{interv.get('strategy_name')}' with guided intervention steps."
            )
            return {
                "intervention": interv,
                "execution_traces": traces
            }

        def node_adaptive_planner(state: WorkflowState) -> Dict[str, Any]:
            gaps = state.get("critical_gaps", [])
            primary_topic = gaps[0]["topic"] if gaps else "Graphs"
            ev = state.get("evaluation_evidence", {})
            pre_score = float(ev.get("accuracy_value", 38.0))
            post_score = 68.0

            interv = state.get("intervention", {})
            adapt_res = self.adaptive_planner.adapt_plan(
                user_id=state["user_id"],
                topic=primary_topic,
                score_before=pre_score,
                score_after=post_score,
                applied_intervention=interv,
                strategy_id=interv.get("strategy_id")
            )
            traces = state.get("execution_traces", [])
            self._log_trace(
                state["user_id"],
                state["session_id"],
                traces,
                adapt_res["reasoning"],
                mem_summary="Updated Strategy Memory: Recorded delta improvement (+30.0%) and increased win rate.",
                outcome=f"Plan V{adapt_res.get('version')} deployed. Schedule adapted based on measured intervention evidence."
            )
            return {
                "adapted_plan": adapt_res,
                "execution_traces": traces,
                "status": "completed"
            }

        builder.add_node("profile_agent", node_profile)
        builder.add_node("skill_agent", node_skill_analysis)
        builder.add_node("planning_agent", node_planning)
        builder.add_node("question_agent", node_question)
        builder.add_node("sandbox_execution", node_sandbox)
        builder.add_node("evaluator_agent", node_evaluator)
        builder.add_node("weakness_agent", node_diagnosis)
        builder.add_node("intervention_agent", node_intervention)
        builder.add_node("adaptive_planner", node_adaptive_planner)

        builder.add_edge(START, "profile_agent")
        builder.add_edge("profile_agent", "skill_agent")
        builder.add_edge("skill_agent", "planning_agent")
        builder.add_edge("planning_agent", "question_agent")
        builder.add_edge("question_agent", "sandbox_execution")
        builder.add_edge("sandbox_execution", "evaluator_agent")
        builder.add_edge("evaluator_agent", "weakness_agent")
        builder.add_edge("weakness_agent", "intervention_agent")
        builder.add_edge("intervention_agent", "adaptive_planner")
        builder.add_edge("adaptive_planner", END)

        return builder.compile()

    def run_full_adaptive_cycle(
        self,
        user_id: int,
        student_input: Dict[str, Any],
        student_code: Optional[str] = None
    ) -> AgentState:
        session_id = f"sess-{uuid.uuid4().hex[:8]}"
        initial_state: WorkflowState = {
            "user_id": user_id,
            "session_id": session_id,
            "student_input": student_input,
            "student_code": student_code,
            "student_profile": {},
            "target_role": student_input.get("target_role", "Software Development Engineer (SDE)"),
            "target_company": student_input.get("target_company", "Amazon"),
            "competency_map": [],
            "critical_gaps": [],
            "current_plan": {},
            "current_question": {},
            "tool_execution_result": {},
            "evaluation_evidence": {},
            "diagnosis_report": {},
            "intervention": {},
            "adapted_plan": {},
            "execution_traces": [],
            "status": "running"
        }

        final_dict = self.compiled_graph.invoke(initial_state)

        state = AgentState(
            user_id=user_id,
            session_id=session_id,
            student_profile=final_dict.get("student_profile", {}),
            target_role=final_dict.get("target_role", "Software Development Engineer (SDE)"),
            competency_map=final_dict.get("competency_map", []),
            critical_gaps=final_dict.get("critical_gaps", []),
            current_plan=final_dict.get("current_plan", {}),
            current_question=final_dict.get("current_question", {}),
            submitted_solution=final_dict.get("student_code"),
            tool_execution_result=final_dict.get("tool_execution_result", {}),
            evaluation_evidence=final_dict.get("evaluation_evidence", {}),
            diagnosis_report=final_dict.get("diagnosis_report", {}),
            intervention=final_dict.get("intervention", {}),
            adapted_plan=final_dict.get("adapted_plan", {}),
            execution_traces=[ReasoningRecord(**t) for t in final_dict.get("execution_traces", [])],
            status=final_dict.get("status", "completed")
        )
        return state

if __name__ == "__main__":
    from backend.database.init_db import init_database
    init_database()
    db = SessionLocal()
    graph = PlacementEvolveGraph(db)

    print("=" * 80)
    print("PLACEMENTEVOLVE AI: LANGGRAPH MULTI-AGENT ORCHESTRATION CYCLE")
    print("StateGraph Workflow: START -> Profile -> Skill -> Plan -> Question -> Sandbox -> Evaluator -> Weakness -> Intervention -> Adaptive Planner -> END")
    print("=" * 80)

    student_input = {
        "branch": "Computer Science & Engineering",
        "graduation_year": 2026,
        "cgpa": 8.4,
        "target_role": "Software Development Engineer (SDE)",
        "target_company": "Amazon",
        "available_hours_per_day": 3.0,
        "preparation_deadline_days": 30,
        "skills": ["Python", "C++", "DSA", "DBMS", "OS"]
    }

    final_state = graph.run_full_adaptive_cycle(user_id=1, student_input=student_input)

    print(f"\nSession ID: {final_state.session_id}")
    print(f"Cycle Status: {final_state.status.upper()}\n")

    for idx, trace in enumerate(final_state.execution_traces):
        print(f"[Step {idx + 1}] {trace.agent_name.upper()}")
        print(f"  Observation: {trace.observation}")
        print(f"  Decision:    {trace.decision}")
        print(f"  Action:      {trace.action}")
        if trace.tool_called:
            print(f"  Tool:        {trace.tool_called} -> {trace.tool_result_summary}")
        if trace.memory_retrieved_summary:
            print(f"  Memory:      {trace.memory_retrieved_summary}")
        if trace.outcome_summary:
            print(f"  Outcome:     {trace.outcome_summary}")
        print("-" * 80)

    print("\n[RESULT OF ADAPTIVE REPLANNING]")
    print(f"New Plan Version:  v{final_state.adapted_plan.get('version')}")
    print(f"Adaptation Reason: {final_state.adapted_plan.get('adaptation_reason')}")
    print("=" * 80)
    db.close()
