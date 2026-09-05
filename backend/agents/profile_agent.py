from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models.student import User, StudentProfile
from backend.memory.profile_memory import ProfileMemory
from backend.llm.gemini_client import call_gemini_json, is_available

_PROFILE_SYSTEM = """You are the Profile Agent of PlacementEvolve AI — a placement preparation system for software engineering roles.
Your task is to analyze a student's raw profile input and return a structured JSON reasoning record.
Return ONLY valid JSON with this exact schema:
{{
  "observation": "<1 sentence describing the student situation>",
  "evidence": ["<fact 1>", "<fact 2>", "<fact 3>"],
  "decision": "<what preparation strategy to initialize>",
  "action": "<what data is being persisted and forwarded>",
  "confidence": <float between 0.85 and 0.99>,
  "readiness_baseline": <float 30-55>,
  "priority_tracks": ["<track1>", "<track2>", "<track3>"]
}}
"""

class ProfileAgent:
    """
    Agent 1: Student Profile Agent
    Analyzes student inputs, synthesizes structured academic and preparation profiles,
    establishes baseline goals, and maintains profile state.
    Uses Gemini LLM for intelligent reasoning and profile analysis.
    """

    def __init__(self, db: Session):
        self.db = db
        self.profile_memory = ProfileMemory(db)
        self._use_llm = is_available()

    def process(self, user_id: int, raw_input: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesize structured student profile and log structured reasoning.
        """
        branch = raw_input.get("branch", "Computer Science")
        grad_year = int(raw_input.get("graduation_year", 2026))
        cgpa = float(raw_input.get("cgpa", 8.0))
        target_role = raw_input.get("target_role", "Software Development Engineer (SDE)")
        hours_per_day = float(raw_input.get("available_hours_per_day", 3.0))
        deadline_days = int(raw_input.get("preparation_deadline_days", 30))
        skills = raw_input.get("skills", ["Python", "DSA"])
        preferred_subjects = raw_input.get("preferred_subjects", ["DSA", "DBMS"])
        target_company = raw_input.get("target_company", "")
        weaknesses = raw_input.get("weaknesses", [])
        strengths = raw_input.get("strengths", [])

        profile_data = {
            "branch": branch,
            "graduation_year": grad_year,
            "cgpa": cgpa,
            "target_role": target_role,
            "available_hours_per_day": hours_per_day,
            "preparation_deadline_days": deadline_days,
            "skills": skills,
            "preferred_subjects": preferred_subjects,
            "readiness_score": 45.0
        }

        updated_profile = self.profile_memory.update_profile(user_id, profile_data)

        # --- Gemini-powered reasoning ---
        if self._use_llm:
            try:
                prompt = f"""{_PROFILE_SYSTEM}

Student Profile Input:
- Branch: {branch}
- Graduation Year: {grad_year}
- CGPA: {cgpa}/10
- Target Role: {target_role}
- Target Company: {target_company or 'Not specified'}
- Preparation Days Available: {deadline_days}
- Hours Per Day: {hours_per_day}
- Current Skills: {', '.join(skills)}
- Preferred Subjects: {', '.join(preferred_subjects)}
- Known Strengths: {', '.join(strengths) if strengths else 'Not specified'}
- Known Weaknesses: {', '.join(weaknesses) if weaknesses else 'Not specified'}

Analyze this profile and return a JSON reasoning record."""
                llm_data = call_gemini_json(prompt)
                reasoning = {
                    "agent": "Profile Agent",
                    "powered_by": "Gemini 1.5 Flash",
                    "observation": llm_data.get("observation", f"Student registered for '{target_role}'."),
                    "evidence": llm_data.get("evidence", []),
                    "decision": llm_data.get("decision", "Initialize preparation baseline."),
                    "action": llm_data.get("action", "Persist profile and forward to Skill Agent."),
                    "confidence": llm_data.get("confidence", 0.92),
                    "priority_tracks": llm_data.get("priority_tracks", ["DSA", "Core CS", "Mock OA"]),
                    "readiness_baseline": llm_data.get("readiness_baseline", 45.0)
                }
            except Exception as e:
                reasoning = self._fallback_reasoning(target_role, branch, cgpa, skills, hours_per_day, deadline_days, str(e))
        else:
            reasoning = self._fallback_reasoning(target_role, branch, cgpa, skills, hours_per_day, deadline_days)

        return {
            "profile": updated_profile,
            "reasoning": reasoning,
            "next_agent": "PlacementSkillAgent"
        }

    def _fallback_reasoning(self, target_role, branch, cgpa, skills, hours_per_day, deadline_days, err=""):
        return {
            "agent": "Profile Agent",
            "powered_by": "Rule-based fallback" + (f" (LLM error: {err[:60]})" if err else ""),
            "observation": f"Student registered for target role '{target_role}' with {deadline_days} days remaining ({hours_per_day} hrs/day).",
            "evidence": [
                f"Academic background: {branch}, CGPA: {cgpa}",
                f"Existing skill baseline: {', '.join(skills)}",
                f"Total preparation budget: {hours_per_day * deadline_days} total study hours"
            ],
            "decision": "Initialize structured competency baseline and prioritize core SDE preparation tracks.",
            "action": "Persist profile state and forward parameters to Placement Skill Analysis Agent.",
            "confidence": 0.90,
            "priority_tracks": ["DSA", "Core CS", "Mock OA"],
            "readiness_baseline": 45.0
        }
