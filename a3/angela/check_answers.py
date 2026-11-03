"""Recomputes the expected answers for the study tasks from data/cleaned_data.csv.
Run from the repo root:  python a3/angela/check_answers.py
"""
import pandas as pd

TASKS = ["Studying", "Homework/Assignments", "Reading", "Writing", "Meeting"]

d = pd.read_csv("data/cleaned_data.csv")
d = d[(d.Num_Distractions > 0) & d.Task_Type.isin(TASKS)]  # same filter as the charts
d["bin"] = d.Time_to_First_Distraction // 5 * 5
totals = d.groupby("Task_Type").size()


def share(lo, hi):
    """% of each task's sessions whose first distraction is in [lo, hi] minutes (whole 5-min bins)."""
    k = d[(d.bin >= lo) & (d.bin <= hi - 4)].groupby("Task_Type").size().reindex(TASKS, fill_value=0)
    return pd.DataFrame({"in_window": k, "n": totals[TASKS], "pct": (100 * k / totals[TASKS]).round(0)})


questions = {
    "T1-A  15-29 min: Reading vs Studying": (15, 29),
    "T1-B  0-4 min:  Writing vs Studying": (0, 4),
    "T2-A  10-14 min: highest share": (10, 14),
    "T2-B  5-19 min:  highest share": (5, 19),
}
for q, (lo, hi) in questions.items():
    print(q)
    print(share(lo, hi).to_string(), "\n")
