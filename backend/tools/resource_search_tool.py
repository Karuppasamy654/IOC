import json
import os
from typing import List, Dict, Any, Optional

class ResourceSearchTool:
    """
    Mandatory Tool 2: Learning Resource Search Tool
    Finds targeted, high-yield educational resources and visual guides
    based on a diagnosed weakness, student proficiency, and modality.
    """

    def __init__(self, resource_path: Optional[str] = None):
        if not resource_path:
            resource_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "resources", "curated_resources.json")
        self.resource_path = resource_path
        self.resources = self._load_resources()

    def _load_resources(self) -> List[Dict[str, Any]]:
        if os.path.exists(self.resource_path):
            try:
                with open(self.resource_path, "r", encoding="utf-8") as f:
                    return json.load(f)
            except Exception as e:
                print(f"Error loading resource library: {e}")
                return []
        return []

    def search(
        self,
        topic: str,
        weakness_type: str,
        subtopic: Optional[str] = None,
        level: str = "beginner",
        learning_preference: str = "visual + guided"
    ) -> List[Dict[str, Any]]:
        """
        Search resources scoring by topic, subtopic, weakness match, and keyword overlap.
        """
        results = []
        topic_lower = topic.lower()
        weakness_lower = weakness_type.lower()
        subtopic_lower = (subtopic or "").lower()

        for res in self.resources:
            score = 0.0
            r_topic = res.get("topic", "").lower()
            r_subtopic = res.get("subtopic", "").lower()
            r_target = res.get("weakness_target", "").lower()
            r_summary = res.get("summary", "").lower()

            # Exact or partial topic match
            if topic_lower in r_topic or r_topic in topic_lower:
                score += 40.0

            # Subtopic match
            if subtopic_lower and (subtopic_lower in r_subtopic or r_subtopic in subtopic_lower):
                score += 25.0

            # Weakness target alignment
            if any(w_word in r_target for w_word in weakness_lower.split("_")):
                score += 25.0

            # Learning preference keywords (visual, interactive, guided)
            if "visual" in learning_preference.lower() and ("visual" in res.get("resource_type", "") or "visual" in r_summary):
                score += 10.0
            if "guided" in learning_preference.lower() and ("guided" in res.get("resource_type", "") or "walkthrough" in r_summary):
                score += 10.0

            if score >= 30.0:
                results.append({
                    "resource_id": res.get("id"),
                    "title": res.get("title"),
                    "url": res.get("url"),
                    "resource_type": res.get("resource_type"),
                    "topic": res.get("topic"),
                    "subtopic": res.get("subtopic"),
                    "relevance_score": min(score, 100.0),
                    "difficulty": res.get("difficulty", "Intermediate"),
                    "summary": res.get("summary"),
                    "key_takeaways": res.get("key_takeaways", []),
                    "interactive_code_snippet": res.get("interactive_code_snippet")
                })

        # Sort descending by relevance score
        results.sort(key=lambda x: x["relevance_score"], reverse=True)

        # Fallback if specific search yielded no direct results
        if not results:
            results.append({
                "resource_id": f"fallback-{topic.lower().replace(' ', '-')}",
                "title": f"Mastering {topic}: Core Patterns & Common Pitfalls",
                "url": f"https://en.wikipedia.org/wiki/{topic.replace(' ', '_')}",
                "resource_type": "concept_guide",
                "topic": topic,
                "subtopic": subtopic or "General",
                "relevance_score": 70.0,
                "difficulty": "All Levels",
                "summary": f"Comprehensive review covering foundational concepts, algorithmic proofs, and implementation nuances in {topic}.",
                "key_takeaways": [
                    f"Review state transitions and invariant properties in {topic}.",
                    "Step through edge cases with pen and paper before coding.",
                    "Verify time and memory bounds."
                ],
                "interactive_code_snippet": None
            })

        return results[:3] # return top 3 curated results

if __name__ == "__main__":
    tool = ResourceSearchTool()

    print("=" * 70)
    print("MANDATORY TOOL 2: LEARNING RESOURCE SEARCH TOOL")
    print("=" * 70)

    results = tool.search(
        topic="Graphs",
        weakness_type="implementation_weakness_visited_array",
        learning_preference="visual + guided"
    )

    print(f"Retrieved {len(results)} Curated High-Yield Resources for Graphs Visited-Array Deficit:\n")
    for idx, r in enumerate(results):
        print(f"[{idx + 1}] {r['title']} ({r['relevance_score']}% Match)")
        print(f"    Type:       {r['resource_type']}")
        print(f"    URL:        {r['url']}")
        print(f"    Summary:    {r['summary']}")
        if r.get('key_takeaways'):
            print(f"    Takeaways:  {r['key_takeaways'][0]}")
        print("-" * 70)
    print("=" * 70)

