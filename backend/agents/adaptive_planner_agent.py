from typing import Dict, Any, List
from datetime import datetime
from sqlalchemy.orm import Session
from backend.models.strategy import AdaptivePlanSchedule
from backend.models.student import StudentCompetency, StudentProfile
from backend.memory.strategy_memory import StrategyMemory
from backend.memory.episodic_memory import EpisodicMemory
from backend.llm.gemini_client import call_gemini_json, is_available

_PLANNER_PROMPT = """You are the Adaptive Planner Agent of PlacementEvolve AI — a placement preparation system.
You receive information about a student's performance, what strategy was applied, and whether it was effective.
Your job is to generate a NEW personalized daily study schedule (as JSON schedule blocks) and explain your reasoning.

Return ONLY valid JSON with this schema:
{{
  "observation": "<1 sentence describing what happened>",
  "evidence": ["<evidence 1>", "<evidence 2>", "<evidence 3>"],
  "decision": "<what you are changing in the schedule and why>",
  "action": "<specific schedule change being made>",
  "confidence": <float 0.88-0.99>,
  "adaptation_reason": "<clear explanation of why the schedule is being adapted>",
  "schedule_blocks": [
    {{
      "time": "<HH:MM - HH:MM>",
      "topic": "<topic name>",
      "activity": "<specific activity description>",
      "type": "<concept | practice | guided_coding | assessment | mock_oa | review | drill>",
      "priority": "<Critical | High | Medium | Low>"
    }}
  ]
}}
Generate exactly 5 schedule blocks covering 3 hours total.
"""

class AdaptivePlannerAgent:
    """
    Agent 8: Adaptive Planner Agent (MAIN AGENTIC COMPONENT)
    Observes evaluation results, compares against prior benchmarks, evaluates strategy effectiveness,
    modifies dynamic schedule allocations, triggers reassessments, and logs findings to Strategy Memory.
    Uses Gemini LLM for intelligent, context-aware schedule adaptation.
    """

    def __init__(self, db: Session):
        self.db = db
        self.strategy_memory = StrategyMemory(db)
        self.episodic_memory = EpisodicMemory(db)
        self._use_llm = is_available()

    def adapt_plan(
        self,
        user_id: int,
        topic: str,
        score_before: float,
        score_after: float,
        applied_intervention: Dict[str, Any],
        strategy_id: str = None
    ) -> Dict[str, Any]:
        improvement_delta = round(score_after - score_before, 1)
        is_effective = (improvement_delta >= 15.0)

        # 1. Update Strategy Memory with empirical measured outcome
        strat_id = strategy_id or applied_intervention.get("strategy_id", "strat-guided-coding-graphs")
        strat_name = applied_intervention.get("strategy_name", "Guided Coding & Visited Invariant Drill")

        strategy_record = self.strategy_memory.record_or_update_strategy(
            strategy_id=strat_id,
            strategy_name=strat_name,
            topic=topic,
            weakness_type=applied_intervention.get("weakness_type", "implementation_weakness"),
            context_description=f"Adaptive remediation for {topic} with pre-score {score_before}% and post-score {score_after}%.",
            intervention_sequence=applied_intervention.get("intervention_sequence", []),
            before_score=score_before,
            after_score=score_after
        )

        # 2. Record in Episodic Memory
        self.episodic_memory.record_episode(
            user_id=user_id,
            topic=topic,
            activity_type="adaptive_intervention",
            score_before=score_before,
            score_after=score_after,
            mistake_summary=applied_intervention.get("weakness_type", "implementation_weakness"),
            intervention_applied=strat_name,
            metadata={"strategy_id": strat_id, "delta": improvement_delta}
        )

        # 3. Update Student Competency
        comp = self.db.query(StudentCompetency).filter(
            StudentCompetency.user_id == user_id,
            StudentCompetency.topic == topic
        ).first()

        if comp:
            comp.implementation_mastery = score_after
            comp.mastery_score = round((comp.concept_mastery * 0.4) + (score_after * 0.6), 1)
            if comp.mastery_score >= 70:
                comp.status = "Proficient"
            elif comp.mastery_score >= 50:
                comp.status = "Needs Improvement"
            else:
                comp.status = "Critical Weakness"
            self.db.commit()

        # 4. Query latest plan version
        latest_plan = self.db.query(AdaptivePlanSchedule).filter(
            AdaptivePlanSchedule.user_id == user_id,
            AdaptivePlanSchedule.is_active == True
        ).order_by(AdaptivePlanSchedule.version.desc()).first()
        new_version = (latest_plan.version + 1) if latest_plan else 2

        # 5. Get all competencies for context
        all_comps = self.db.query(StudentCompetency).filter(
            StudentCompetency.user_id == user_id
        ).all()
        weak_topics = [c.topic for c in all_comps if c.status in ("Critical Weakness", "Needs Improvement")]
        proficient_topics = [c.topic for c in all_comps if c.status == "Proficient"]

        # 6. Gemini-powered adaptive schedule generation
        if self._use_llm:
            try:
                sign = "+" if improvement_delta >= 0 else ""
                prompt = f"""{_PLANNER_PROMPT}

Context for Schedule Adaptation:
- Student Topic: {topic}
- Score Before Intervention: {score_before}%
- Score After Intervention: {score_after}%
- Score Change: {sign}{improvement_delta}%
- Strategy Applied: "{strat_name}"
- Strategy Effective: {"YES (improvement >= 15%)" if is_effective else "NO (insufficient improvement)"}
- Current Weak Topics: {', '.join(weak_topics[:4]) if weak_topics else 'None'}
- Proficient Topics: {', '.join(proficient_topics[:3]) if proficient_topics else 'None'}
- Plan Version: {new_version} (replacing v{new_version - 1})

Generate an adaptive study schedule and complete reasoning JSON."""
                llm_data = call_gemini_json(prompt)

                adaptation_reason = llm_data.get(
                    "adaptation_reason",
                    f"Strategy '{strat_name}' yielded {sign}{improvement_delta}% on {topic}."
                )
                new_blocks = llm_data.get("schedule_blocks", self._fallback_blocks(topic, is_effective, strat_name, improvement_delta))
                reasoning = {
                    "agent": "Adaptive Planner Agent",
                    "powered_by": "Gemini 1.5 Flash",
                    "observation": llm_data.get("observation", f"Adaptation triggered after {sign}{improvement_delta}% change on {topic}."),
                    "evidence": llm_data.get("evidence", []),
                    "decision": llm_data.get("decision", adaptation_reason),
                    "action": llm_data.get("action", f"Generated Plan v{new_version}."),
                    "confidence": llm_data.get("confidence", 0.96)
                }
            except Exception as e:
                adaptation_reason, new_blocks, reasoning = self._fallback_adapt(
                    topic, is_effective, strat_name, improvement_delta, score_before, score_after, new_version, str(e)
                )
        else:
            adaptation_reason, new_blocks, reasoning = self._fallback_adapt(
                topic, is_effective, strat_name, improvement_delta, score_before, score_after, new_version
            )

        # 7. Deactivate old plans and save new active plan
        old_plans = self.db.query(AdaptivePlanSchedule).filter(AdaptivePlanSchedule.user_id == user_id).all()
        for p in old_plans:
            p.is_active = False

        new_plan = AdaptivePlanSchedule(
            user_id=user_id,
            version=new_version,
            plan_title=f"Adaptive Placement Preparation Plan (v{new_version})",
            adaptation_reason=adaptation_reason,
            schedule_blocks=new_blocks,
            total_study_minutes_per_day=180,
            target_deadline_days=30,
            is_active=True
        )
        self.db.add(new_plan)

        # 8. Update student overall readiness score
        profile = self.db.query(StudentProfile).filter(StudentProfile.user_id == user_id).first()
        if profile and all_comps:
            new_readiness = round(sum(c.mastery_score for c in all_comps) / len(all_comps), 1)
            profile.readiness_score = new_readiness

        self.db.commit()
        self.db.refresh(new_plan)

        return {
            "plan_id": new_plan.id,
            "version": new_plan.version,
            "adaptation_reason": adaptation_reason,
            "schedule_blocks": new_blocks,
            "is_effective": is_effective,
            "improvement_delta": improvement_delta,
            "strategy_memory_update": strategy_record,
            "reasoning": reasoning
        }

    def _fallback_blocks(self, topic: str, is_effective: bool, strat_name: str, delta: float) -> List[Dict]:
        sign = "+" if delta >= 0 else ""
        if is_effective:
            return [
                {"time": "10:00 - 10:30", "topic": topic, "activity": f"{topic} Rapid Speed Drill & Complexity Polish", "type": "practice", "priority": "Medium"},
                {"time": "10:30 - 11:15", "topic": "Operating Systems", "activity": "OS Deadlock & Process Synchronization Deep Dive", "type": "concept", "priority": "High"},
                {"time": "11:15 - 12:00", "topic": "Operating Systems", "activity": "Paging & Memory Management Scenario Practice", "type": "practice", "priority": "Critical"},
                {"time": "12:00 - 12:30", "topic": "Dynamic Programming", "activity": "0/1 Knapsack & Coin Change Pattern Visualization", "type": "guided_coding", "priority": "High"},
                {"time": "12:30 - 01:00", "topic": "Placement Mock OA", "activity": "Multi-Topic Timed Assessment (DSA + Core CS)", "type": "mock_oa", "priority": "High"}
            ]
        else:
            return [
                {"time": "10:00 - 10:40", "topic": topic, "activity": f"Visual {topic} Interactive Trace & State Invariant Proof", "type": "concept", "priority": "Critical"},
                {"time": "10:40 - 11:20", "topic": topic, "activity": "Line-by-Line Guided Coding with Pre-Condition Asserts", "type": "guided_coding", "priority": "Critical"},
                {"time": "11:20 - 12:00", "topic": topic, "activity": f"Targeted Reassessment: 3 Graded {topic} Variations", "type": "assessment", "priority": "High"},
                {"time": "12:00 - 12:40", "topic": "Operating Systems", "activity": "OS Core Concept Revision", "type": "concept", "priority": "Medium"},
                {"time": "12:40 - 01:00", "topic": "Review", "activity": "Error Log Analysis & Spaced Recall", "type": "review", "priority": "Medium"}
            ]

    def _fallback_adapt(self, topic, is_effective, strat_name, improvement_delta, score_before, score_after, new_version, err=""):
        sign = "+" if improvement_delta >= 0 else ""
        if is_effective:
            adaptation_reason = f"Strategy '{strat_name}' succeeded ({sign}{improvement_delta}%: {score_before}% -> {score_after}%). Topic '{topic}' promoted to Proficient; reducing {topic} allocation and pivoting focus to secondary weakness."
        else:
            adaptation_reason = f"Prior strategy yielded insufficient improvement ({sign}{improvement_delta}%: {score_before}% -> {score_after}%). Escalating to high-scaffolding multi-stage intervention pipeline."
        new_blocks = self._fallback_blocks(topic, is_effective, strat_name, improvement_delta)
        reasoning = {
            "agent": "Adaptive Planner Agent",
            "powered_by": "Rule-based fallback" + (f" (LLM error: {err[:60]})" if err else ""),
            "observation": f"Measured performance outcome on {topic}: {score_before}% -> {score_after}% (delta: {sign}{improvement_delta}%).",
            "evidence": [
                f"Evaluation outcome: {'STRATEGY SUCCESSFUL' if is_effective else 'STRATEGY INEFFECTIVE'}",
                f"Strategy recorded in persistent memory: {strat_name}",
                f"Adaptation committed: Plan v{new_version}"
            ],
            "decision": f"Re-architect study schedule (Plan v{new_version}). {adaptation_reason}",
            "action": f"Deactivated Plan v{new_version - 1}, committed Plan v{new_version}.",
            "confidence": 0.93
        }
        return adaptation_reason, new_blocks, reasoning
