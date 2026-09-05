# PlacementEvolve AI — System Architecture

**PlacementEvolve AI** is a self-adaptive multi-agent system engineered specifically for software engineering placement preparation. Rather than acting as a static chatbot or rigid study planner, PlacementEvolve AI implements a closed-loop feedback engine:

$$\text{Observe} \longrightarrow \text{Reason} \longrightarrow \text{Plan} \longrightarrow \text{Act} \longrightarrow \text{Observe} \longrightarrow \text{Evaluate} \longrightarrow \text{Learn} \longrightarrow \text{Adapt} \longrightarrow \text{Replan}$$

---

## 1. High-Level Orchestration Pipeline

```
+-----------------------------------------------------------------------------------+
|                            PlacementEvolve Multi-Agent Graph                      |
+-----------------------------------------------------------------------------------+
                                        |
                 [1] Profile Agent ---> [2] Placement Skill Agent
                                                |
                                                v
                 [4] Question Agent <--- [3] Planning Agent (v1)
                         |
                         v
          [Tool 1: Coding Execution Sandbox]
                         |
                         v
                 [5] Evaluator Agent (Structured Telemetry)
                         |
                         v
                 [6] Weakness Diagnosis Agent (Concept vs. Implementation)
                         |
                         v
                 [7] Resource/Intervention Agent <---> [Memory Retrieval Engine]
                         |                              [Tool 2: Resource Search]
                         v
                 [8] Adaptive Planner Agent (Replanning & Strategy Memory Update)
                         |
                         +---> Deploys Plan (v2) & Re-allocates Topic Time
```

---

## 2. Multi-Agent Hierarchy

1. **Agent 1: Student Profile Agent**
   - Synthesizes structured profile (Branch, CGPA, Target Role, Daily Hours, Days Remaining).
2. **Agent 2: Placement Skill Analysis Agent**
   - Maps role-specific competencies (DSA, DBMS, OS, OOP, SQL, Networks) and identifies knowledge gaps.
3. **Agent 3: Planning Agent**
   - Synthesizes initial baseline schedule allocating daily study hours.
4. **Agent 4: Question/Practice Agent**
   - Queries Mistake Memory to avoid blind repetition and generates targeted problem items.
5. **Agent 5: Evaluation Agent**
   - Evaluates code execution, test pass rates, execution runtime, and repeated errors into structured evidence.
6. **Agent 6: Weakness Diagnosis Agent**
   - Pinpoints root causes (e.g. Concept Knowledge: Good vs. Implementation Mastery: Weak).
7. **Agent 7: Resource / Intervention Agent**
   - Retrieves empirically proven strategies from persistent memory and invokes the Resource Search Tool for visual scaffolding.
8. **Agent 8: Adaptive Planner Agent**
   - Observes intervention outcomes, updates Strategy Memory with measured delta, and restructures study plan versions.

---

## 3. Real Tools Integration

- **Tool 1: Coding Execution Tool**: Multi-test sandboxed runner measuring pass rates, runtime (ms), syntax/runtime errors, and static flaw heuristics.
- **Tool 2: Learning Resource Search Tool**: Semantic lookup indexing visual guides, cheat sheets, and invariant proofs.
- **Tool 3: Mock Placement Assessment Tool**: Multi-topic timed placement OA generator and deterministic evaluator.
