import sys
import os
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.api.benchmark import run_benchmark_experiment

def main():
    print("=" * 70)
    print("PLACEMENTEVOLVE AI: EMPIRICAL RESEARCH BENCHMARK")
    print("Mode A (Static Planner) vs. Mode B (PlacementEvolve Adaptive Multi-Agent)")
    print("=" * 70)

    results = run_benchmark_experiment(sample_size=100, days=30)
    summary = results["summary"]
    static = summary["static_planner"]
    adaptive = summary["adaptive_planner"]
    adv = summary["delta_advantage"]

    print("\n--- EXPERIMENT RESULTS (N = 100 Students, 30 Days Preparation) ---")
    print(f"{'Metric':<30} | {'Static Planner':<18} | {'Adaptive Planner':<18}")
    print("-" * 70)
    print(f"{'Initial Score':<30} | {static['initial_score']}%{'':<12} | {adaptive['initial_score']}%")
    print(f"{'Final Score':<30} | {static['final_score']}%{'':<12} | {adaptive['final_score']}%")
    print(f"{'Score Gain (Delta)':<30} | {static['improvement']:<18} | {adaptive['improvement']}")
    print(f"{'Avg Recurring Errors':<30} | {static['repeated_errors']:<18} | {adaptive['repeated_errors']}")
    print(f"{'Autonomous Plan Changes':<30} | {static['plan_adaptations']:<18} | {adaptive['plan_adaptations']}")
    print(f"{'Weakness Clearance Rate':<30} | {static['weakness_clearance_rate']:<18} | {adaptive['weakness_clearance_rate']}")
    print("-" * 70)
    print(f"\n[STATISTICAL ADVANTAGE]")
    print(f"  * Extra Score Gain:        {adv['extra_score_gain']}")
    print(f"  * Error Reduction:         {adv['error_reduction_pct']}")
    print(f"  * Statistical P-Value:     {adv['p_value']}")
    print("=" * 70)

if __name__ == "__main__":
    main()
