# analysis for the a3 user study
# reads ../results/results.csv, prints the stats and saves the charts in figures/
# run from the repo folder: python3 a3/analysis/analyze.py
import os

import matplotlib

matplotlib.use("Agg")  # just save pngs, don't open windows
import matplotlib.pyplot as plt
import pandas as pd

HERE = os.path.dirname(os.path.abspath(__file__))
RESULTS = os.path.join(HERE, "..", "results", "results.csv")
FIGURES = os.path.join(HERE, "figures")
os.makedirs(FIGURES, exist_ok=True)

STUDY_NAMES = {"angela": "First distraction by task type", "amithi": "Focus by location across the day"}
CONDITIONS = ["static", "interactive"]
COLORS = {"static": "#9ecae1", "interactive": "#3182bd"}

df = pd.read_csv(RESULTS)
if df.empty:
    print("results.csv is empty, nothing to analyze yet")
    raise SystemExit

# pilot people aren't part of the real study
df = df[~df["participant_id"].astype(str).str.upper().str.startswith("PILOT")]
df["correct"] = df["correct"].astype(int)
df["time_seconds"] = df["time_seconds"].astype(float)
studies = [s for s in STUDY_NAMES if s in df["study"].unique()]

print("participants:", df["participant_id"].nunique())
print("rows:", len(df))
print("timeouts:", df["notes"].fillna("").str.contains("timeout").sum())
print()

# summary per study and condition
summary = (
    df.groupby(["study", "condition"])
    .agg(
        answers=("correct", "size"),
        accuracy=("correct", "mean"),
        time_mean=("time_seconds", "mean"),
        time_median=("time_seconds", "median"),
        time_sd=("time_seconds", "std"),
        time_min=("time_seconds", "min"),
        time_max=("time_seconds", "max"),
    )
    .reset_index()
)
summary["accuracy"] = (summary["accuracy"] * 100).round(0)
print("== by study and condition (accuracy in %, time in seconds) ==")
print(summary.round(1).to_string(index=False))
print()

# same thing split by task too, so we can see if one task is doing all the work
by_task = (
    df.groupby(["study", "task", "condition"])
    .agg(answers=("correct", "size"), accuracy=("correct", "mean"), time_median=("time_seconds", "median"))
    .reset_index()
)
by_task["accuracy"] = (by_task["accuracy"] * 100).round(0)
print("== by task ==")
print(by_task.round(1).to_string(index=False))
print()

# per person: how much faster (or slower) interactive was for them
per_person = df.groupby(["study", "participant_id", "condition"])["time_seconds"].mean().unstack("condition")
per_person["static_minus_interactive"] = per_person["static"] - per_person["interactive"]
print("== per person, average seconds (positive = faster with interactive) ==")
print(per_person.round(1).to_string())
print()
for study in studies:
    diff = per_person.loc[study, "static_minus_interactive"].dropna()
    print(f"{study}: {int((diff > 0).sum())} of {len(diff)} people were faster with interactive")
print()

# turns a table into markdown so we can paste it into the report
def to_md(table):
    lines = ["| " + " | ".join(table.columns) + " |", "|" + "---|" * len(table.columns)]
    for _, row in table.iterrows():
        lines.append("| " + " | ".join(str(v) for v in row.values) + " |")
    return "\n".join(lines)


with open(os.path.join(HERE, "summary.md"), "w") as f:
    f.write("## By study and condition\n\n" + to_md(summary.round(1)) + "\n\n")
    f.write("## By task\n\n" + to_md(by_task.round(1)) + "\n")


# chart 1: accuracy for each task, static vs interactive, side by side for each study
fig, axes = plt.subplots(1, len(studies), figsize=(5 * len(studies), 4), sharey=True, squeeze=False)
for ax, study in zip(axes[0], studies):
    part = by_task[by_task["study"] == study]
    tasks = sorted(part["task"].unique())
    width = 0.38
    for i, cond in enumerate(CONDITIONS):
        vals = [part[(part["task"] == t) & (part["condition"] == cond)]["accuracy"].sum() for t in tasks]
        xs = [k + (i - 0.5) * width for k in range(len(tasks))]
        bars = ax.bar(xs, vals, width, label=cond, color=COLORS[cond])
        for b, v in zip(bars, vals):
            ax.text(b.get_x() + b.get_width() / 2, v + 1, f"{v:.0f}%", ha="center", fontsize=9)
    ax.set_xticks(range(len(tasks)))
    ax.set_xticklabels(tasks)
    ax.set_ylim(0, 110)
    ax.set_title(STUDY_NAMES[study], fontsize=10)
    ax.set_xlabel("Task")
axes[0][0].set_ylabel("% answered correctly")
axes[0][0].legend()
fig.suptitle("Accuracy: static vs interactive")
fig.tight_layout()
fig.savefig(os.path.join(FIGURES, "accuracy.png"), dpi=150)
plt.close(fig)


# chart 2: time for every answer as a dot, with a line for the median
# showing every dot instead of just an average so you can see how spread out people were
fig, axes = plt.subplots(1, len(studies), figsize=(5 * len(studies), 4), sharey=True, squeeze=False)
for ax, study in zip(axes[0], studies):
    part = df[df["study"] == study]
    tasks = sorted(part["task"].unique())
    pos = 0
    ticks, labels = [], []
    for t in tasks:
        for cond in CONDITIONS:
            times = part[(part["task"] == t) & (part["condition"] == cond)]["time_seconds"]
            # small spread left/right so dots don't hide each other
            xs = [pos + ((j % 5) - 2) * 0.05 for j in range(len(times))]
            ax.scatter(xs, times, color=COLORS[cond], edgecolor="#333", linewidth=0.4, s=30, zorder=3)
            if len(times):
                ax.hlines(times.median(), pos - 0.25, pos + 0.25, color="#e45756", linewidth=2, zorder=4)
            ticks.append(pos)
            labels.append(f"{t}\n{cond}")
            pos += 1
        pos += 0.5
    ax.set_xticks(ticks)
    ax.set_xticklabels(labels, fontsize=8)
    ax.set_title(STUDY_NAMES[study], fontsize=10)
axes[0][0].set_ylabel("Seconds to answer (90 = timeout)")
fig.suptitle("Completion time: static vs interactive (red line = median)")
fig.tight_layout()
fig.savefig(os.path.join(FIGURES, "time.png"), dpi=150)
plt.close(fig)


# chart 3: each person's average time in both versions, connected by a line
# helps show if most people got faster or if a couple of people are pulling the average
fig, axes = plt.subplots(1, len(studies), figsize=(5 * len(studies), 4), sharey=True, squeeze=False)
for ax, study in zip(axes[0], studies):
    part = per_person.loc[study].dropna(subset=["static", "interactive"])
    for _, row in part.iterrows():
        faster = row["interactive"] < row["static"]
        ax.plot([0, 1], [row["static"], row["interactive"]], color="#3182bd" if faster else "#bbbbbb", marker="o")
    ax.set_xticks([0, 1])
    ax.set_xticklabels(CONDITIONS)
    ax.set_xlim(-0.3, 1.3)
    ax.set_title(STUDY_NAMES[study], fontsize=10)
axes[0][0].set_ylabel("Average seconds per question")
fig.suptitle("Each participant (blue = faster with interactive)")
fig.tight_layout()
fig.savefig(os.path.join(FIGURES, "per_participant.png"), dpi=150)
plt.close(fig)

print("saved summary.md and figures/accuracy.png, figures/time.png, figures/per_participant.png")
