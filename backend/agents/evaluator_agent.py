from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.models.assessment import QuestionSubmission, QuestionRecord
from backend.models.student import StudentCompetency
from backend.memory.episodic_memory import EpisodicMemory
from backend.memory.mistake_memory import MistakeMemory
from backend.llm.gemini_client import call_gemini_json, is_available

_EVALUATOR_PROMPT = """You are the Evaluation Agent of PlacementEvolve AI — a placement preparation system.
Your task is to evaluate a student's submission and produce structured diagnostic evidence.
You analyze accuracy, error patterns, and mastery levels to build an objective evidence record.

Return ONLY valid JSON with this schema:
{{
  "observation": "<1 sentence evaluation summary>",
  "evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>", "<evidence 4>"],
  "decision": "<what diagnostic action to take next>",
  "action": "<what records are being generated>",
  "confidence": <float 0.88-0.99>,
  "evaluation_feedback": "<2-3 sentence detailed feedback for the student>",
  "key_mistake_identified": "<the most important mistake or null if clean>",
  "mastery_assessment": "<brief assessment of current mastery level>",
  "next_steps": "<specific recommendation for immediate next action>"
}}
"""

class EvaluatorAgent:
    """
    Agent 5: Evaluation Agent
    Analyzes student submissions, sandbox execution results, pass rates,
    runtime, and repeated error occurrences to produce structured diagnostic evidence.
    Uses Gemini LLM to generate detailed, personalized evaluation feedback.
    """

    def __init__(self, db: Session):
        self.db = db
        self.episodic_memory = EpisodicMemory(db)
        self.mistake_memory = MistakeMemory(db)
        self._use_llm = is_available()

    def evaluate_submission(
        self,
        user_id: int,
        question_id: str,
        submission_code_or_answer: str,
        tool_execution_result: Dict[str, Any],
        time_taken_seconds: float = 180.0
    ) -> Dict[str, Any]:
        question = self.db.query(QuestionRecord).filter(QuestionRecord.id == question_id).first()
        topic = question.topic if question else "Graphs"
        subtopic = question.subtopic if question else "General"
        question_title = question.title if question else f"{topic} Problem"

        passed = tool_execution_result.get("passed", 0)
        total = tool_execution_result.get("total", 1) or 1
        accuracy_pct = round((passed / total) * 100.0, 1)

        # Retrieve prior competency
        comp = self.db.query(StudentCompetency).filter(
            StudentCompetency.user_id == user_id,
            StudentCompetency.topic == topic
        ).first()

        prev_accuracy = comp.implementation_mastery if comp else 38.0
        improvement_delta = round(accuracy_pct - prev_accuracy, 1)

        flaw = tool_execution_result.get("flaw_detected")
        repeated_error = None
        if flaw:
            repeated_error = "Visited-state handling / omission" if "visited" in flaw else flaw.replace("_", " ").title()
            self.mistake_memory.record_mistake(
                user_id=user_id,
                topic=topic,
                subtopic=subtopic,
                mistake_type=flaw,
                description=f"Automated test suite detected failure pattern '{flaw}' during {topic} problem execution."
            )

        concept_level = "High" if (comp and comp.concept_mastery >= 70) else "Moderate"
        impl_level = "High" if accuracy_pct >= 80 else ("Moderate" if accuracy_pct >= 60 else "Low")

        # Gemini-powered evaluation feedback
        evaluation_feedback = f"Accuracy: {accuracy_pct}% ({passed}/{total} tests passed). Detected flaw: {repeated_error or 'None'}."
        key_mistake = repeated_error
        next_steps = f"Focus on {topic} practice."

        if self._use_llm:
            try:
                sign = "+" if improvement_delta >= 0 else ""
                prompt = f"""{_EVALUATOR_PROMPT}

Evaluation Context:
- Question: "{question_title}"
- Topic: {topic} / {subtopic}
- Student's Code/Answer:
```
{submission_code_or_answer[:800]}
```
- Test Cases Passed: {passed}/{total} ({accuracy_pct}%)
- Previous Accuracy: {prev_accuracy}%
- Change: {sign}{improvement_delta}%
- Time Taken: {round(time_taken_seconds/60.0, 1)} minutes
- Detected Error Pattern: {repeated_error or 'None detected'}
- Concept Mastery Level: {concept_level}
- Implementation Mastery Level: {impl_level}
- Execution Result Status: {tool_execution_result.get('status', 'evaluated')}

Evaluate this submission and return the JSON."""
                llm_data = call_gemini_json(prompt)
                evaluation_feedback = llm_data.get("evaluation_feedback", evaluation_feedback)
                key_mistake = llm_data.get("key_mistake_identified") or repeated_error
                next_steps = llm_data.get("next_steps", next_steps)
                reasoning = {
                    "agent": "Evaluation Agent",
                    "powered_by": "Gemini 1.5 Flash",
                    "observation": llm_data.get("observation", f"Evaluated submission: {passed}/{total} tests passed ({accuracy_pct}%)."),
                    "evidence": llm_data.get("evidence", [
                        f"Accuracy: {accuracy_pct}% (previous: {prev_accuracy}%, delta: {sign}{improvement_delta}%)",
                        f"Time: {round(time_taken_seconds/60.0, 1)} minutes",
                        f"Error: {repeated_error or 'Clean execution'}",
                        f"Mastery: Concept={concept_level}, Implementation={impl_level}"
                    ]),
                    "decision": llm_data.get("decision", "Forward structured evidence to Weakness Diagnosis Agent."),
                    "action": llm_data.get("action", "Generated evaluation telemetry record."),
                    "confidence": llm_data.get("confidence", 0.96),
                    "evaluation_feedback": evaluation_feedback,
                    "next_steps": next_steps
                }
            except Exception as e:
                reasoning = self._fallback_reasoning(
                    question_title, topic, accuracy_pct, prev_accuracy, improvement_delta,
                    time_taken_seconds, repeated_error, concept_level, impl_level, str(e)
                )
        else:
            reasoning = self._fallback_reasoning(
                question_title, topic, accuracy_pct, prev_accuracy, improvement_delta,
                time_taken_seconds, repeated_error, concept_level, impl_level
            )

        # Save submission record
        sub_record = QuestionSubmission(
            user_id=user_id,
            question_id=question_id,
            submitted_code_or_answer=submission_code_or_answer,
            language="python",
            status=tool_execution_result.get("status", "evaluated"),
            test_cases_passed=passed,
            total_test_cases=total,
            runtime_ms=tool_execution_result.get("runtime_ms", 0.0),
            time_taken_seconds=time_taken_seconds,
            detected_errors=[flaw] if flaw else [],
            evaluation_feedback=evaluation_feedback
        )
        self.db.add(sub_record)
        self.db.commit()

        sign = "+" if improvement_delta >= 0 else ""
        structured_evidence = {
            "topic": topic,
            "subtopic": subtopic,
            "accuracy": f"{accuracy_pct}%",
            "accuracy_value": accuracy_pct,
            "previous_accuracy": f"{prev_accuracy}%",
            "previous_accuracy_value": prev_accuracy,
            "average_time": f"{round(time_taken_seconds / 60.0, 1)} minutes",
            "repeated_error": repeated_error or "None detected",
            "concept_mastery": concept_level,
            "implementation_mastery": impl_level,
            "improvement": f"{sign}{improvement_delta}%",
            "improvement_value": improvement_delta,
            "test_cases_passed": passed,
            "total_test_cases": total,
            "evaluation_feedback": evaluation_feedback,
            "next_steps": next_steps
        }

        return {
            "structured_evidence": structured_evidence,
            "reasoning": reasoning,
            "next_agent": "WeaknessDiagnosisAgent"
        }

    def _fallback_reasoning(self, question_title, topic, accuracy_pct, prev_accuracy, improvement_delta, time_taken_seconds, repeated_error, concept_level, impl_level, err=""):
        sign = "+" if improvement_delta >= 0 else ""
        return {
            "agent": "Evaluation Agent",
            "powered_by": "Rule-based fallback" + (f" (LLM error: {err[:60]})" if err else ""),
            "observation": f"Evaluated submission for '{question_title}': {accuracy_pct}% accuracy.",
            "evidence": [
                f"Accuracy: {accuracy_pct}% (previous: {prev_accuracy}%, improvement: {sign}{improvement_delta}%)",
                f"Execution time: {round(time_taken_seconds / 60.0, 1)} minutes",
                f"Identified error pattern: {repeated_error or 'Clean execution'}",
                f"Mastery breakdown -> Concept: {concept_level}, Implementation: {impl_level}"
            ],
            "decision": "Forward structured evidence to Weakness Diagnosis Agent to identify underlying root cause.",
            "action": "Generated objective evaluation telemetry record.",
            "confidence": 0.95,
            "evaluation_feedback": f"Accuracy: {accuracy_pct}% ({topic}). Error: {repeated_error or 'None'}.",
            "next_steps": f"Review {topic} concepts and practice edge cases."
        }
