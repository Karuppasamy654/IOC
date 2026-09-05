from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.memory.memory_retriever import MemoryRetriever
from backend.tools.resource_search_tool import ResourceSearchTool
from backend.llm.gemini_client import call_gemini_json, is_available

_INTERVENTION_PROMPT = """You are the Resource/Intervention Agent of PlacementEvolve AI — a placement preparation system.
Your task is to select or design the most effective pedagogical intervention for a student's identified weakness.

Given a diagnosis report, create a targeted multi-step intervention strategy.
Return ONLY valid JSON with this schema:
{{
  "strategy_name": "<name of the intervention strategy>",
  "intervention_steps": [
    "<Step 1: specific activity>",
    "<Step 2: specific activity>",
    "<Step 3: specific activity>",
    "<Step 4: specific activity>"
  ],
  "guided_action_plan": "<1-2 sentence description of the intervention pipeline>",
  "expected_improvement": "<expected improvement percentage e.g. +25%>",
  "rationale": "<why this intervention was chosen>",
  "observation": "<1 sentence summary of the intervention decision>",
  "evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
  "decision": "<intervention decision>",
  "confidence": <float 0.88-0.99>
}}
"""

class ResourceInterventionAgent:
    """
    Agent 7: Resource / Intervention Agent
    Synthesizes targeted pedagogical interventions (visual explanation, guided coding,
    step-by-step invariant drills) by consulting Strategy Memory and invoking
    the Resource Search Tool when external scaffolding is required.
    Uses Gemini LLM to generate tailored intervention plans.
    """

    def __init__(self, db: Session):
        self.db = db
        self.memory_retriever = MemoryRetriever(db)
        self.resource_tool = ResourceSearchTool()
        self._use_llm = is_available()

    def select_intervention(self, user_id: int, diagnosis_report: Dict[str, Any]) -> Dict[str, Any]:
        topic = diagnosis_report.get("topic", "Graphs")
        weakness_category = diagnosis_report.get("diagnosis_category", "implementation_weakness")
        root_cause = diagnosis_report.get("root_cause_explanation", "")
        concept_score = diagnosis_report.get("concept_score", 70.0)
        impl_score = diagnosis_report.get("implementation_score", 40.0)
        specific_error = diagnosis_report.get("specific_error_pattern", "Unknown")
        recommended_focus = diagnosis_report.get("recommended_focus", f"{topic} practice")

        # 1. Retrieve most historically successful strategy from persistent memory
        retrieved_strategy = self.memory_retriever.retrieve_best_strategy(
            topic=topic,
            weakness_type=weakness_category,
            diagnosis_context=root_cause
        )

        # 2. Invoke resource tool for supporting materials
        resources_found = []
        tool_called = None
        tool_result_summary = None

        if weakness_category in ["implementation_weakness", "conceptual_weakness"]:
            tool_called = "LearningResourceSearchTool"
            resources_found = self.resource_tool.search(
                topic=topic,
                weakness_type=weakness_category,
                learning_preference="visual + guided"
            )
            tool_result_summary = f"Retrieved {len(resources_found)} curated resources focusing on {topic} implementation patterns."

        # 3. Gemini-powered intervention design
        if self._use_llm:
            try:
                prior_strategy = retrieved_strategy.get("strategy_name", "No prior strategy") if retrieved_strategy else "No prior strategy"
                prior_yield = f"+{retrieved_strategy.get('historical_improvement', 0.0)}%" if retrieved_strategy else "Unknown"

                prompt = f"""{_INTERVENTION_PROMPT}

Student Diagnosis Report:
- Topic: {topic}
- Primary Weakness: {diagnosis_report.get('primary_diagnosis', 'Implementation Weakness')}
- Diagnosis Category: {weakness_category}
- Concept Knowledge Score: {concept_score}%
- Live Coding Accuracy: {impl_score}%
- Root Cause: {root_cause}
- Specific Error Pattern: {specific_error}
- Recommended Focus: {recommended_focus}
- Best Prior Strategy from Memory: "{prior_strategy}" (historical improvement: {prior_yield})
- Supporting Resources Available: {len(resources_found)} resources found

Design the optimal intervention strategy and return the JSON."""
                llm_data = call_gemini_json(prompt)

                strategy_name = llm_data.get("strategy_name", "Gemini-Designed Adaptive Intervention")
                intervention_steps = llm_data.get("intervention_steps", self._fallback_steps(weakness_category, topic))
                guided_action_plan = llm_data.get("guided_action_plan", "Execute visual review -> guided coding -> targeted assessment")
                expected_improvement = llm_data.get("expected_improvement", "+25%")

                intervention_payload = {
                    "strategy_id": retrieved_strategy.get("strategy_id") if retrieved_strategy else f"strat-llm-{topic.lower().replace(' ', '-')}",
                    "strategy_name": strategy_name,
                    "topic": topic,
                    "weakness_type": weakness_category,
                    "historical_improvement": expected_improvement,
                    "intervention_sequence": intervention_steps,
                    "recommended_resources": resources_found,
                    "guided_action_plan": guided_action_plan
                }

                reasoning = {
                    "agent": "Resource/Intervention Agent",
                    "powered_by": "Gemini 1.5 Flash",
                    "observation": llm_data.get("observation", f"Designed intervention for {weakness_category} on {topic}."),
                    "evidence": llm_data.get("evidence", [
                        f"Root cause: {root_cause[:80]}",
                        f"Strategy: {strategy_name}",
                        f"Tool invocation: {tool_called} returned {len(resources_found)} modules"
                    ]),
                    "decision": llm_data.get("decision", f"Apply {strategy_name} intervention pipeline."),
                    "action": "Dispatched intervention package to Adaptive Planner Agent for schedule integration.",
                    "confidence": llm_data.get("confidence", 0.94)
                }
            except Exception as e:
                intervention_payload, reasoning = self._fallback_intervention(
                    topic, weakness_category, retrieved_strategy, resources_found, tool_called, str(e)
                )
        else:
            intervention_payload, reasoning = self._fallback_intervention(
                topic, weakness_category, retrieved_strategy, resources_found, tool_called
            )

        return {
            "intervention": intervention_payload,
            "tool_called": tool_called,
            "tool_result_summary": tool_result_summary,
            "memory_retrieved_summary": f"Retrieved Strategy: '{retrieved_strategy.get('strategy_name', 'N/A') if retrieved_strategy else 'None'}'" ,
            "reasoning": reasoning,
            "next_agent": "AdaptivePlannerAgent"
        }

    def _fallback_steps(self, weakness_category: str, topic: str) -> List[str]:
        if weakness_category == "implementation_weakness":
            return [
                f"Visual {topic} state diagram with step-by-step trace",
                f"Worked example highlighting correct {topic} algorithm placement",
                "Guided coding sandbox exercise with incremental test feedback",
                "Targeted independent practice problem"
            ]
        elif weakness_category == "conceptual_weakness":
            return [
                f"Foundational {topic} concept review with visual aids",
                f"Interactive flashcard drill on {topic} invariants and properties",
                "Concept verification quiz with explanations",
                "Guided problem walkthrough from scratch"
            ]
        else:
            return [
                "Pattern recognition exercise with similar problem templates",
                "Timed practice with 3 variations of the same pattern",
                "Speed drill: identify algorithm from problem description",
                "Targeted practice on identified pattern"
            ]

    def _fallback_intervention(self, topic, weakness_category, retrieved_strategy, resources_found, tool_called, err=""):
        strategy_name = retrieved_strategy.get("strategy_name", "Guided Coding & Invariant Drill") if retrieved_strategy else "Guided Scaffolding"
        intervention_steps = retrieved_strategy.get("intervention_sequence", self._fallback_steps(weakness_category, topic)) if retrieved_strategy else self._fallback_steps(weakness_category, topic)

        intervention_payload = {
            "strategy_id": retrieved_strategy.get("strategy_id") if retrieved_strategy else "strat-guided-coding-graphs",
            "strategy_name": strategy_name,
            "topic": topic,
            "weakness_type": weakness_category,
            "historical_improvement": f"+{retrieved_strategy.get('historical_improvement', 29.0)}%" if retrieved_strategy else "+25.0%",
            "intervention_sequence": intervention_steps,
            "recommended_resources": resources_found,
            "guided_action_plan": "Execute Step 1 (Visual Breakdown) -> Step 2 (Guided Coding) -> Step 3 (Targeted Reassessment)"
        }
        reasoning = {
            "agent": "Resource/Intervention Agent",
            "powered_by": "Rule-based fallback" + (f" (LLM error: {err[:60]})" if err else ""),
            "observation": f"Retrieved strategy '{strategy_name}' for {weakness_category}.",
            "evidence": [
                f"Memory lookup query: topic='{topic}', weakness='{weakness_category}'",
                f"Retrieved strategy ID: {intervention_payload['strategy_id']}",
                f"Tool invocation: {tool_called} returned {len(resources_found)} modules"
            ],
            "decision": f"Apply intervention pipeline: {' -> '.join(intervention_steps[:3])}",
            "action": "Dispatched intervention package to Adaptive Planner Agent for schedule integration.",
            "confidence": 0.91
        }
        return intervention_payload, reasoning
