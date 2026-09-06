from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.models.assessment import QuestionRecord
from backend.memory.mistake_memory import MistakeMemory
from backend.llm.gemini_client import call_gemini_json, is_available

_QUESTION_GEN_PROMPT = """You are the Question/Practice Agent of PlacementEvolve AI.
Your role is to generate targeted placement preparation questions for software engineering roles.
Questions should be company-style, rigorous, and calibrated to the student's mistake history.

Return ONLY valid JSON with this schema:
{{
  "title": "<concise question title>",
  "description": "<complete question description with context, input/output format, constraints>",
  "difficulty": "<Easy | Medium | Hard>",
  "question_type": "<coding | mcq | output_prediction | debugging | sql>",
  "topic": "<topic name>",
  "subtopic": "<subtopic>",
  "starter_code": {{
    "python": "<Python starter code with function signature>",
    "cpp": "<C++ starter code (optional)>"
  }},
  "explanation": "<detailed explanation of approach and common mistakes to avoid>",
  "test_cases": [
    {{"input": "<test input>", "expected_output": "<expected output>", "description": "<what this tests>"}},
    {{"input": "<test input>", "expected_output": "<expected output>", "description": "<edge case>"}},
    {{"input": "<test input>", "expected_output": "<expected output>", "description": "<stress test>"}}
  ],
  "observation": "<why this question was selected for this student>",
  "evidence": ["<reason 1>", "<reason 2>"],
  "decision": "<what skill this question evaluates>",
  "confidence": <float 0.88-0.99>
}}
"""

class QuestionAgent:
    """
    Agent 4: Question/Practice Agent
    Generates placement-oriented questions (MCQ, Coding, Debugging, SQL),
    integrating Mistake Memory to target recurring student flaws.
    Uses Gemini LLM to generate novel, targeted questions when DB has no match.
    """

    def __init__(self, db: Session):
        self.db = db
        self.mistake_memory = MistakeMemory(db)
        self._use_llm = is_available()

    def select_or_generate_question(
        self,
        user_id: int,
        topic: str = "Graphs",
        subtopic: Optional[str] = None,
        difficulty: str = "Medium",
        question_type: str = "coding",
        target_mistake_type: Optional[str] = None
    ) -> Dict[str, Any]:
        recurring_mistakes = self.mistake_memory.get_recurring_mistakes(user_id, topic=topic)
        highlighted_mistake = target_mistake_type or (recurring_mistakes[0]["mistake_type"] if recurring_mistakes else None)
        mistake_summary = "; ".join(
            [f"{m['mistake_type']} (x{m.get('frequency', m.get('occurrence_count', 1))})" for m in recurring_mistakes[:3]]
        ) if recurring_mistakes else "No recurring mistakes"

        # Try to find a matching question in DB first
        query = self.db.query(QuestionRecord).filter(QuestionRecord.topic == topic)
        if question_type:
            query = query.filter(QuestionRecord.question_type == question_type)
        if difficulty:
            query = query.filter(QuestionRecord.difficulty == difficulty)
        question = query.first()

        if not question:
            question = self.db.query(QuestionRecord).filter(QuestionRecord.topic == topic).first()

        # If DB has a question, use it (with LLM-enhanced reasoning)
        if question:
            q_dict = {
                "id": question.id,
                "topic": question.topic,
                "subtopic": question.subtopic,
                "title": question.title,
                "difficulty": question.difficulty,
                "question_type": question.question_type,
                "description": question.description,
                "starter_code": question.starter_code,
                "test_cases": question.test_cases,
                "options": question.options,
                "explanation": question.explanation
            }
            reasoning = self._build_reasoning(q_dict["title"], topic, difficulty, question_type, highlighted_mistake, q_dict["test_cases"], use_llm=False)
        elif self._use_llm:
            # Generate a new question using Gemini LLM
            try:
                prompt = f"""{_QUESTION_GEN_PROMPT}

Question Generation Context:
- Topic: {topic}
- Subtopic: {subtopic or 'General'}
- Difficulty: {difficulty}
- Question Type: {question_type}
- Student's Recurring Mistakes: {mistake_summary}
- Specific Error Pattern to Target: {highlighted_mistake or 'None - generate a comprehensive problem'}

Generate a complete, original {difficulty} {question_type} question on {topic} that specifically targets the student's weakness."""
                llm_data = call_gemini_json(prompt)

                q_dict = {
                    "id": f"llm-gen-{topic.lower().replace(' ', '-')}-{difficulty.lower()}",
                    "topic": llm_data.get("topic", topic),
                    "subtopic": llm_data.get("subtopic", subtopic or "General"),
                    "title": llm_data.get("title", f"{topic} Problem Solving Practice"),
                    "difficulty": llm_data.get("difficulty", difficulty),
                    "question_type": llm_data.get("question_type", question_type),
                    "description": llm_data.get("description", f"Implement a clean solution for {topic}."),
                    "starter_code": llm_data.get("starter_code", {"python": f"def solution():\n    pass\n"}),
                    "test_cases": llm_data.get("test_cases", []),
                    "options": [],
                    "explanation": llm_data.get("explanation", "")
                }
                reasoning = {
                    "agent": "Question/Practice Agent",
                    "powered_by": "Gemini 1.5 Flash (generated)",
                    "observation": llm_data.get("observation", f"Generated question on {topic} targeting {highlighted_mistake or 'core concepts'}."),
                    "evidence": llm_data.get("evidence", [f"Topic: {topic}", f"Mistake target: {highlighted_mistake or 'None'}"]),
                    "decision": llm_data.get("decision", f"Evaluate {topic} implementation mastery."),
                    "action": "Dispatched AI-generated question payload to student workspace.",
                    "confidence": llm_data.get("confidence", 0.91)
                }
            except Exception as e:
                q_dict = self._fallback_question(topic, subtopic, difficulty, question_type)
                reasoning = self._build_reasoning(q_dict["title"], topic, difficulty, question_type, highlighted_mistake, [], err=str(e))
        else:
            q_dict = self._fallback_question(topic, subtopic, difficulty, question_type)
            reasoning = self._build_reasoning(q_dict["title"], topic, difficulty, question_type, highlighted_mistake, [])

        return {
            "question": q_dict,
            "reasoning": reasoning,
            "next_agent": "EvaluatorAgent"
        }

    def _fallback_question(self, topic, subtopic, difficulty, question_type) -> Dict:
        return {
            "id": f"fallback-{topic.lower().replace(' ', '-')}",
            "topic": topic,
            "subtopic": subtopic or "General",
            "title": f"{topic} Problem Solving Practice",
            "difficulty": difficulty,
            "question_type": question_type,
            "description": f"Implement a clean, efficient solution for the {topic} problem. Focus on edge cases and time complexity.",
            "starter_code": {"python": f"def solution():\n    # Write your solution here\n    pass\n"},
            "test_cases": [],
            "options": [],
            "explanation": f"Study the {topic} patterns carefully and handle all edge cases."
        }

    def _build_reasoning(self, title, topic, difficulty, question_type, highlighted_mistake, test_cases, use_llm=False, err="") -> Dict:
        return {
            "agent": "Question/Practice Agent",
            "powered_by": ("Rule-based" + (f" (LLM err: {err[:50]})" if err else "")) if not use_llm else "Gemini 1.5 Flash",
            "observation": f"Selected question '{title}' on topic '{topic}' ({difficulty}).",
            "evidence": [
                f"Question type: {question_type}",
                f"Historical mistake context: {highlighted_mistake or 'No recurring mistake recorded'}",
                f"Total test cases loaded: {len(test_cases)}"
            ],
            "decision": f"Present question calibrated to evaluate mastery and edge-case handling in {topic}.",
            "action": "Dispatched question payload to student workspace / execution sandbox.",
            "confidence": 0.93
        }
