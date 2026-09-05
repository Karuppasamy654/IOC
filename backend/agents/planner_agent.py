from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.strategy import AdaptivePlanSchedule
from backend.memory.profile_memory import ProfileMemory
from backend.llm.gemini_client import call_gemini_json, is_available

_PLANNER_PROMPT = """You are the Planning Agent of PlacementEvolve AI — a placement preparation system for software engineering roles.
Your task is to create an initial structured daily study schedule for a student preparing for SDE placements.
The schedule should be practical, pedagogically sound, and targeted at the student's specific critical gaps.

Return ONLY valid JSON with this schema:
{{
  "observation": "<1 sentence summary of the planning decision>",
  "evidence": ["<fact 1>", "<fact 2>", "<fact 3>"],
  "decision": "<strategic planning decision>",
  "action": "<what the schedule does>",
  "confidence": <float 0.88-0.99>,
  "plan_title": "<title for the study plan>",
  "schedule_blocks": [
    {{
      "time": "<HH:MM - HH:MM>",
      "topic": "<topic name>",
      "activity": "<specific pedagogically sound activity>",
      "type": "<concept | practice | guided_coding | assessment | mock_oa | review | drill>",
      "priority": "<Critical | High | Medium | Low>"
    }}
  ]
}}
Generate exactly 6 schedule blocks covering 3 hours total. Times should be consecutive starting from 10:00.
Focus 50-60% of time on the primary critical gap, 25-30% on the secondary gap, 15-20% on review/assessment.
"""

class PlanningAgent:
    """
    Agent 3: Planning Agent
    Synthesizes the initial structured study plan, allocating available daily hours
    across high-yield weakness areas, core revisions, and scheduled mock assessments.
    Uses Gemini LLM for intelligent, gap-aware schedule generation.
    """

    def __init__(self, db: Session):
        self.db = db
        self.profile_memory = ProfileMemory(db)
        self._use_llm = is_available()

    def create_initial_plan(self, user_id: int, critical_gaps: List[Dict[str, Any]]) -> Dict[str, Any]:
        profile = self.profile_memory.get_profile(user_id) or {
            "available_hours_per_day": 3.0,
            "preparation_deadline_days": 30,
            "target_role": "Software Development Engineer (SDE)"
        }

        hours_per_day = profile.get("available_hours_per_day", 3.0)
        deadline_days = profile.get("preparation_deadline_days", 30)
        total_minutes = int(hours_per_day * 60)
        target_role = profile.get("target_role", "SDE")

        primary_weakness = critical_gaps[0]["topic"] if critical_gaps else "Graphs"
        secondary_weakness = critical_gaps[1]["topic"] if len(critical_gaps) > 1 else "Operating Systems"

        # --- Gemini-powered plan generation ---
        if self._use_llm:
            try:
                gaps_str = "\n".join([
                    f"  - {g['topic']}: current mastery {g['current_mastery']}%, gap {g['gap']}%, priority: {g['priority']}"
                    for g in critical_gaps[:5]
                ]) if critical_gaps else "  - No specific gaps identified, use standard SDE preparation"

                prompt = f"""{_PLANNER_PROMPT}

Student Context:
- Target Role: {target_role}
- Available Study Time: {hours_per_day} hours/day ({total_minutes} minutes)
- Preparation Deadline: {deadline_days} days
- Primary Critical Gap: {primary_weakness}
- Secondary Gap: {secondary_weakness}

All Identified Critical Gaps (sorted by priority):
{gaps_str}

Create the initial placement preparation schedule and return the JSON."""
                llm_data = call_gemini_json(prompt)

                schedule_blocks = llm_data.get("schedule_blocks", self._fallback_blocks(primary_weakness, secondary_weakness))
                plan_title = llm_data.get("plan_title", f"{target_role} Initial Adaptive Preparation Schedule")
                adaptation_reason = f"Initial Plan Synthesis: {llm_data.get('decision', f'Focused on primary gap in {primary_weakness} and secondary gap in {secondary_weakness}.')}"

                reasoning = {
                    "agent": "Planning Agent",
                    "powered_by": "Gemini 1.5 Flash",
                    "observation": llm_data.get("observation", f"Initial plan generated for {target_role}."),
                    "evidence": llm_data.get("evidence", [
                        f"Primary focus topic: {primary_weakness}",
                        f"Secondary focus topic: {secondary_weakness}",
                        f"Study budget: {hours_per_day}h/day × {deadline_days} days"
                    ]),
                    "decision": llm_data.get("decision", "Initialize Phase 1 preparation schedule."),
                    "action": llm_data.get("action", "Generated Plan v1 and dispatched to Question Agent."),
                    "confidence": llm_data.get("confidence", 0.92)
                }
            except Exception as e:
                schedule_blocks, plan_title, adaptation_reason, reasoning = self._fallback_plan(
                    primary_weakness, secondary_weakness, target_role, hours_per_day, deadline_days, total_minutes, str(e)
                )
        else:
            schedule_blocks, plan_title, adaptation_reason, reasoning = self._fallback_plan(
                primary_weakness, secondary_weakness, target_role, hours_per_day, deadline_days, total_minutes
            )

        # Deactivate previous active plans
        prev_plans = self.db.query(AdaptivePlanSchedule).filter(
            AdaptivePlanSchedule.user_id == user_id,
            AdaptivePlanSchedule.is_active == True
        ).all()
        for p in prev_plans:
            p.is_active = False

        plan_record = AdaptivePlanSchedule(
            user_id=user_id,
            version=1,
            plan_title=plan_title,
            adaptation_reason=adaptation_reason,
            schedule_blocks=schedule_blocks,
            total_study_minutes_per_day=total_minutes,
            target_deadline_days=deadline_days,
            is_active=True
        )
        self.db.add(plan_record)
        self.db.commit()
        self.db.refresh(plan_record)

        return {
            "plan_id": plan_record.id,
            "version": plan_record.version,
            "schedule_blocks": schedule_blocks,
            "reasoning": reasoning,
            "next_agent": "QuestionAgent"
        }

    def _fallback_blocks(self, primary_weakness: str, secondary_weakness: str) -> List[Dict]:
        return [
            {"time": "10:00 - 10:30", "topic": primary_weakness, "activity": f"{primary_weakness} Foundational Concepts & Pattern Walkthrough", "type": "concept", "priority": "High"},
            {"time": "10:30 - 11:15", "topic": primary_weakness, "activity": f"Guided Coding Drill: {primary_weakness} Traversal & Visited Array Handling", "type": "guided_coding", "priority": "Critical"},
            {"time": "11:15 - 11:45", "topic": primary_weakness, "activity": f"Targeted Independent Practice: {primary_weakness} Medium Problem", "type": "practice", "priority": "High"},
            {"time": "11:45 - 12:15", "topic": secondary_weakness, "activity": f"{secondary_weakness} High-Yield Concept & MCQ Review", "type": "concept", "priority": "Medium"},
            {"time": "12:15 - 12:45", "topic": "SQL / DBMS", "activity": "Database Window Functions & Transaction Isolation Assessment", "type": "drill", "priority": "Low"},
            {"time": "12:45 - 01:00", "topic": "Diagnostic OA", "activity": "Timed Mini-Mock Assessment & Error Logging", "type": "mock_oa", "priority": "High"}
        ]

    def _fallback_plan(self, primary_weakness, secondary_weakness, target_role, hours_per_day, deadline_days, total_minutes, err=""):
        schedule_blocks = self._fallback_blocks(primary_weakness, secondary_weakness)
        plan_title = f"{target_role} Initial Adaptive Preparation Schedule"
        adaptation_reason = f"Initial Plan Synthesis: Focused on primary gap in {primary_weakness} and secondary gap in {secondary_weakness}."
        reasoning = {
            "agent": "Planning Agent",
            "powered_by": "Rule-based fallback" + (f" (LLM error: {err[:60]})" if err else ""),
            "observation": f"Study time allocated: {hours_per_day}h/day ({total_minutes} mins) over {deadline_days} days.",
            "evidence": [
                f"Primary focus topic: {primary_weakness}",
                f"Secondary focus topic: {secondary_weakness}",
                "Structured into 6 progressive blocks: Concept -> Guided -> Practice -> Core CS -> Assessment"
            ],
            "decision": "Initialize Phase 1 preparation schedule with 50% time weighting to critical DSA weaknesses.",
            "action": "Generated Plan v1 and dispatched task queue to Question/Practice Agent.",
            "confidence": 0.90
        }
        return schedule_blocks, plan_title, adaptation_reason, reasoning
