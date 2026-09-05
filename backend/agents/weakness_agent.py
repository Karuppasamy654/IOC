from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models.student import StudentCompetency
from backend.memory.mistake_memory import MistakeMemory
from backend.llm.gemini_client import call_gemini_json, is_available

_WEAKNESS_PROMPT_TEMPLATE = """You are the Weakness Diagnosis Agent of PlacementEvolve AI.
Your role is to perform a deep, evidence-based diagnosis of WHY a student is underperforming
in a placement preparation context — NOT to suggest job listings.

You must distinguish between these four weakness categories:
1. "implementation_weakness" - Knows theory but fails in live coding
2. "conceptual_weakness" - Lacks foundational understanding of concepts
3. "pattern_recognition" - Cannot map problems to correct algorithms
4. "time_management" - Correct logic but too slow

Return ONLY valid JSON matching this schema exactly:
{{
  "primary_diagnosis": "<human-readable category name>",
  "diagnosis_category": "<one of: implementation_weakness | conceptual_weakness | pattern_recognition | time_management>",
  "concept_knowledge": "<GOOD | MODERATE | WEAK>",
  "implementation_mastery": "<GOOD | MODERATE | WEAK>",
  "time_management": "<GOOD | MODERATE | WEAK>",
  "root_cause_explanation": "<2-3 sentence evidence-based explanation>",
  "specific_error_pattern": "<what specific type of mistake the student keeps making>",
  "recommended_focus": "<what the student should practice immediately>",
  "observation": "<1 sentence summary>",
  "evidence": ["<evidence point 1>", "<evidence point 2>", "<evidence point 3>"],
  "decision": "<what intervention to apply>",
  "confidence": <float 0.85-0.99>
}}
"""

class WeaknessDiagnosisAgent:
    """
    Agent 6: Weakness Diagnosis Agent
    Diagnoses WHY the student is underperforming by distinguishing
    Conceptual Weakness vs. Implementation Weakness vs. Pattern Recognition vs. Time Management.
    Uses Gemini LLM for deep, nuanced root-cause analysis.
    """

    def __init__(self, db: Session):
        self.db = db
        self.mistake_memory = MistakeMemory(db)
        self._use_llm = is_available()

    def diagnose(self, user_id: int, structured_evidence: Dict[str, Any]) -> Dict[str, Any]:
        topic = structured_evidence.get("topic", "Graphs")
        accuracy_val = structured_evidence.get("accuracy_value", 40.0)
        concept_level = structured_evidence.get("concept_mastery", "Moderate")
        repeated_error = structured_evidence.get("repeated_error", "None")
        subtopic = structured_evidence.get("subtopic", "General")
        avg_time = structured_evidence.get("average_time", "Unknown")

        # Fetch student competency state
        comp = self.db.query(StudentCompetency).filter(
            StudentCompetency.user_id == user_id,
            StudentCompetency.topic == topic
        ).first()

        concept_score = comp.concept_mastery if comp else 72.0
        impl_score = accuracy_val
        time_score = comp.time_management_score if comp else 64.0

        # Retrieve mistake history for richer context
        recent_mistakes = self.mistake_memory.get_recurring_mistakes(user_id, topic=topic)
        mistake_summary = "; ".join(
            [f"{m['mistake_type']} (x{m['frequency']})" for m in recent_mistakes[:3]]
        ) if recent_mistakes else "No prior recorded mistakes"

        # --- Gemini LLM Diagnosis ---
        if self._use_llm:
            try:
                prompt = f"""{_WEAKNESS_PROMPT_TEMPLATE}

Student Evidence for Diagnosis:
- Topic: {topic}
- Subtopic: {subtopic}
- Concept Knowledge Score: {concept_score}%
- Live Coding Accuracy: {impl_score}%
- Time Management Score: {time_score}%
- Average Time Taken: {avg_time}
- Detected Error Pattern (this session): {repeated_error}
- Historical Mistake Memory: {mistake_summary}
- Concept mastery level: {concept_level}

Perform a rigorous diagnosis and return the JSON response."""
                llm_data = call_gemini_json(prompt)

                diagnosis_report = {
                    "topic": topic,
                    "primary_diagnosis": llm_data.get("primary_diagnosis", "Implementation Weakness"),
                    "diagnosis_category": llm_data.get("diagnosis_category", "implementation_weakness"),
                    "concept_knowledge": llm_data.get("concept_knowledge", "GOOD"),
                    "concept_score": concept_score,
                    "implementation_mastery": llm_data.get("implementation_mastery", "WEAK"),
                    "implementation_score": impl_score,
                    "time_management": llm_data.get("time_management", "MODERATE"),
                    "time_score": time_score,
                    "detected_error_pattern": repeated_error,
                    "root_cause_explanation": llm_data.get("root_cause_explanation", ""),
                    "specific_error_pattern": llm_data.get("specific_error_pattern", repeated_error),
                    "recommended_focus": llm_data.get("recommended_focus", f"Targeted {topic} coding drills")
                }

                reasoning = {
                    "agent": "Weakness Diagnosis Agent",
                    "powered_by": "Gemini 1.5 Flash",
                    "observation": llm_data.get("observation", f"Diagnosed {topic} performance gap."),
                    "evidence": llm_data.get("evidence", [
                        f"Concept score: {concept_score}%",
                        f"Implementation score: {impl_score}%",
                        f"Error: {repeated_error}"
                    ]),
                    "decision": llm_data.get("decision", f"Apply {diagnosis_report['diagnosis_category']} intervention."),
                    "action": "Hand off diagnostic classification to Resource/Intervention Agent.",
                    "confidence": llm_data.get("confidence", 0.93)
                }
            except Exception as e:
                diagnosis_report, reasoning = self._fallback_diagnose(
                    topic, concept_score, impl_score, time_score, repeated_error, str(e)
                )
        else:
            diagnosis_report, reasoning = self._fallback_diagnose(
                topic, concept_score, impl_score, time_score, repeated_error
            )

        # Update competency table with newly measured implementation score
        if comp:
            comp.implementation_mastery = impl_score
            comp.mastery_score = round((comp.concept_mastery * 0.4) + (impl_score * 0.6), 1)
            comp.status = ("Critical Weakness" if comp.mastery_score < 45
                           else ("Needs Improvement" if comp.mastery_score < 70 else "Proficient"))
            self.db.commit()

        return {
            "diagnosis_report": diagnosis_report,
            "reasoning": reasoning,
            "next_agent": "ResourceInterventionAgent"
        }

    def _fallback_diagnose(self, topic, concept_score, impl_score, time_score, repeated_error, err=""):
        if concept_score >= 65.0 and impl_score < 60.0:
            primary_diagnosis = "Implementation Weakness"
            root_cause = f"Student demonstrates solid theoretical grasp ({concept_score}%), but commits syntax, queue state synchronization, or visited-array logic errors during live coding ({impl_score}%)."
            diagnosis_category = "implementation_weakness"
        elif concept_score < 60.0 and impl_score < 60.0:
            primary_diagnosis = "Conceptual Weakness"
            root_cause = f"Student lacks foundational grasp of {topic} invariants, graph traversal properties, or state transitions."
            diagnosis_category = "conceptual_weakness"
        elif impl_score >= 70.0 and time_score < 50.0:
            primary_diagnosis = "Time-Management & Speed Deficit"
            root_cause = "Student reaches correct logic but exceeds optimal time threshold."
            diagnosis_category = "time_management"
        else:
            primary_diagnosis = "Pattern Recognition Gap"
            root_cause = f"Student struggles to map problem statement to optimal algorithmic schema."
            diagnosis_category = "pattern_recognition"

        diagnosis_report = {
            "topic": topic,
            "primary_diagnosis": primary_diagnosis,
            "diagnosis_category": diagnosis_category,
            "concept_knowledge": "GOOD" if concept_score >= 65 else ("MODERATE" if concept_score >= 50 else "WEAK"),
            "concept_score": concept_score,
            "implementation_mastery": "WEAK" if impl_score < 60 else ("MODERATE" if impl_score < 75 else "GOOD"),
            "implementation_score": impl_score,
            "time_management": "MODERATE" if time_score >= 50 else "WEAK",
            "time_score": time_score,
            "detected_error_pattern": repeated_error,
            "root_cause_explanation": root_cause,
            "specific_error_pattern": repeated_error,
            "recommended_focus": f"Targeted {topic} implementation practice"
        }

        reasoning = {
            "agent": "Weakness Diagnosis Agent",
            "powered_by": "Rule-based fallback" + (f" (LLM error: {err[:60]})" if err else ""),
            "observation": f"Diagnosed {topic}: Concept Knowledge: {diagnosis_report['concept_knowledge']} vs Implementation: {diagnosis_report['implementation_mastery']}.",
            "evidence": [
                f"Concept score: {concept_score}% | Live coding accuracy: {impl_score}%",
                f"Repeated error signature: {repeated_error}",
                f"Root cause: {root_cause}"
            ],
            "decision": f"Classify primary bottleneck as '{primary_diagnosis}' and request targeted intervention.",
            "action": "Hand off diagnostic classification to Resource/Intervention Agent.",
            "confidence": 0.90
        }
        return diagnosis_report, reasoning
