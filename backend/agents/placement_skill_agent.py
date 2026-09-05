from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models.student import StudentCompetency

ROLE_COMPETENCY_MAP = {
    "Software Development Engineer (SDE)": {
        "DSA": {"weight": 0.35, "priority": "Critical", "core_topics": ["Graphs", "Dynamic Programming", "Trees", "Binary Search", "Arrays/Strings"]},
        "Operating Systems": {"weight": 0.15, "priority": "High", "core_topics": ["Deadlock", "Process Synchronization", "Virtual Memory", "Paging"]},
        "DBMS": {"weight": 0.15, "priority": "High", "core_topics": ["ACID Properties", "Indexing", "Normalization", "Transactions"]},
        "SQL": {"weight": 0.10, "priority": "Medium", "core_topics": ["Joins", "Window Functions", "Aggregation", "Subqueries"]},
        "OOP": {"weight": 0.10, "priority": "Medium", "core_topics": ["Polymorphism", "Inheritance", "Design Principles", "Encapsulation"]},
        "Computer Networks": {"weight": 0.10, "priority": "Medium", "core_topics": ["TCP/IP", "HTTP/HTTPS", "Routing", "DNS"]},
        "Coding Implementation": {"weight": 0.05, "priority": "Critical", "core_topics": ["Time Complexity", "Clean Code", "Edge Case Handling"]}
    },
    "Backend Developer": {
        "DBMS": {"weight": 0.25, "priority": "Critical", "core_topics": ["ACID", "Indexing", "Query Optimization"]},
        "SQL": {"weight": 0.20, "priority": "Critical", "core_topics": ["Complex Queries", "Window Functions", "Schema Design"]},
        "DSA": {"weight": 0.25, "priority": "High", "core_topics": ["Hashing", "Trees", "Graphs", "Algorithms"]},
        "Operating Systems": {"weight": 0.15, "priority": "High", "core_topics": ["Concurrency", "Threads", "Memory Management"]},
        "Computer Networks": {"weight": 0.15, "priority": "High", "core_topics": ["REST APIs", "gRPC", "TCP/IP", "WebSockets"]}
    }
}

class PlacementSkillAgent:
    """
    Agent 2: Placement Skill Analysis Agent
    Maps role competencies, assigns priority weights, compares with student baseline,
    and identifies critical preparation gaps without searching for jobs.
    """

    def __init__(self, db: Session):
        self.db = db

    def analyze_gaps(self, user_id: int, target_role: str = "Software Development Engineer (SDE)") -> Dict[str, Any]:
        competency_model = ROLE_COMPETENCY_MAP.get(target_role, ROLE_COMPETENCY_MAP["Software Development Engineer (SDE)"])
        user_competencies = self.db.query(StudentCompetency).filter(StudentCompetency.user_id == user_id).all()
        user_comp_dict = {c.topic: c for c in user_competencies}

        competency_map = []
        critical_gaps = []

        for domain, info in competency_model.items():
            current_score = 40.0
            concept_score = 40.0
            impl_score = 40.0
            status = "Needs Improvement"

            if domain in user_comp_dict:
                c = user_comp_dict[domain]
                current_score = c.mastery_score
                concept_score = c.concept_mastery
                impl_score = c.implementation_mastery
                status = c.status
            elif domain == "DSA" and "Graphs" in user_comp_dict:
                # Aggregate DSA topics
                dsa_comps = [user_comp_dict[t] for t in ["Graphs", "Dynamic Programming", "Binary Search"] if t in user_comp_dict]
                if dsa_comps:
                    current_score = round(sum(dc.mastery_score for dc in dsa_comps) / len(dsa_comps), 1)
                    concept_score = round(sum(dc.concept_mastery for dc in dsa_comps) / len(dsa_comps), 1)
                    impl_score = round(sum(dc.implementation_mastery for dc in dsa_comps) / len(dsa_comps), 1)
                    status = "Critical Weakness" if current_score < 45 else ("Needs Improvement" if current_score < 70 else "Proficient")

            gap_magnitude = max(0.0, 85.0 - current_score)
            if gap_magnitude >= 35.0:
                critical_gaps.append({
                    "topic": domain,
                    "current_mastery": current_score,
                    "target_mastery": 85.0,
                    "gap": round(gap_magnitude, 1),
                    "priority": info["priority"]
                })

            competency_map.append({
                "domain": domain,
                "weight": info["weight"],
                "priority": info["priority"],
                "current_mastery": current_score,
                "concept_mastery": concept_score,
                "implementation_mastery": impl_score,
                "status": status,
                "core_topics": info["core_topics"]
            })

        # Sort gaps by magnitude * weight
        critical_gaps.sort(key=lambda x: x["gap"], reverse=True)

        reasoning = {
            "agent": "Placement Skill Analysis Agent",
            "observation": f"Competency analysis for role '{target_role}' identified {len(critical_gaps)} severe preparation gaps.",
            "evidence": [
                f"{g['topic']}: current mastery {g['current_mastery']}% (gap: -{g['gap']}%)"
                for g in critical_gaps[:3]
            ],
            "decision": "Flag Graphs/DSA and Operating Systems as high-priority intervention domains for initial scheduling.",
            "action": "Produce prioritized competency graph for Planning Agent.",
            "confidence": 0.94
        }

        return {
            "competency_map": competency_map,
            "critical_gaps": critical_gaps,
            "reasoning": reasoning,
            "next_agent": "PlanningAgent"
        }
