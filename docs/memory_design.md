# Multi-Tier Persistent Memory Engine

PlacementEvolve AI uses a 5-tier persistent vector memory architecture to support continuous learning from student outcomes.

---

## 1. Memory Tiers

```
+--------------------------------------------------------------------------+
|                     Persistent Multi-Tier Memory Engine                  |
+--------------------------------------------------------------------------+
  |-- [Tier A] Profile Memory     : Stable constraints, target roles, goals
  |-- [Tier B] Episodic Memory    : Learning logs, pre/post scores, deltas
  |-- [Tier C] Strategy Memory    : Empirical intervention yield & win rates
  |-- [Tier D] Mistake Memory     : Recurring code/concept error taxonomy
  \-- [Tier E] Semantic Retriever : Vector / Cosine similarity search engine
```

---

## 2. Strategy Memory Schema

Strategy Memory stores empirical yields:

$$\Delta = \text{Score}_{\text{post}} - \text{Score}_{\text{pre}}$$

$$\text{Success Rate} = \frac{\sum \text{Successful Applications}}{\text{Total Sample Count}}$$

When a new weakness is diagnosed, the Memory Retriever performs cosine similarity over strategy embeddings combined with empirical success weights:

$$\text{Rank Score} = 0.6 \cdot \text{CosineSimilarity} + 0.4 \cdot \left(\frac{\Delta_{\text{avg}}}{50} \cdot \text{SuccessRate}\right)$$
