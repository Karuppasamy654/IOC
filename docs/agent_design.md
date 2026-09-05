# Agent Design & Reasoning Architecture

## Structured Decision Schema

To ensure full observability without exposing raw chain-of-thought, every agent in PlacementEvolve AI produces a structured `ReasoningRecord`:

```json
{
  "agent_name": "Weakness Diagnosis Agent",
  "observation": "Graph BFS test pass rate 40% with repeated cycle detection failure.",
  "evidence": [
    "Concept score: 72% (GOOD)",
    "Live coding accuracy: 39% (WEAK)",
    "Repeated mistake signature: visited_array_omission"
  ],
  "decision": "Classify as Implementation Weakness rather than Conceptual Deficit.",
  "action": "Request guided coding scaffolding with explicit visited state validation.",
  "confidence": 0.95,
  "next_agent": "ResourceInterventionAgent"
}
```

---

## 8 Specialized Agent Specifications

### 1. Profile Agent (`backend/agents/profile_agent.py`)
- **Responsibility**: Profile structuring, academic metrics normalization, time allocation synthesis.
- **Inputs**: Branch, CGPA, graduation year, available hours/day, deadline days, target placement role.
- **Outputs**: Normalized student profile and initial baseline state.

### 2. Placement Skill Analysis Agent (`backend/agents/placement_skill_agent.py`)
- **Responsibility**: Role competency mapping without job searching. Assigns priority weights to SDE pillars (DSA 35%, OS 15%, DBMS 15%, SQL 10%, OOP 10%, Networks 10%).
- **Outputs**: Prioritized gap graph.

### 3. Planning Agent (`backend/agents/planner_agent.py`)
- **Responsibility**: Baseline preparation schedule synthesis (6 progressive blocks: Concept -> Guided Coding -> Practice -> Core CS -> Assessment).
- **Outputs**: Dynamic Plan v1.

### 4. Question / Practice Agent (`backend/agents/question_agent.py`)
- **Responsibility**: Memory-informed question selection targeting active recurring mistakes.
- **Outputs**: Question payload with hidden/visible test cases and flaw triggers.

### 5. Evaluation Agent (`backend/agents/evaluator_agent.py`)
- **Responsibility**: Objective telemetry synthesis (pass percentage, runtime, repeated error taxonomy).
- **Outputs**: Structured diagnostic evidence record.

### 6. Weakness Diagnosis Agent (`backend/agents/weakness_agent.py`)
- **Responsibility**: Crucial distinction between Conceptual vs Implementation vs Time-Management vs Pattern-Recognition weaknesses.
- **Outputs**: Root-cause diagnostic report.

### 7. Resource / Intervention Agent (`backend/agents/intervention_agent.py`)
- **Responsibility**: Memory-guided intervention selection; invokes Learning Resource Search Tool when scaffolding is required.
- **Outputs**: Targeted intervention pipeline.

### 8. Adaptive Planner Agent (`backend/agents/adaptive_planner_agent.py`)
- **Responsibility**: Closed-loop replanning! Evaluates whether intervention produced measurable gain, records yield in Strategy Memory, and promotes/demotes topics in the schedule.
- **Outputs**: Deployed Adaptive Plan v2+.
