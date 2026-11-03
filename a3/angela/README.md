# Candidate: first distraction by task type (Angela)

**Question (from A1/A2):** Do people get distracted sooner on some kinds of tasks than others?
This builds on A2 chart 2 (the task type × 10-minute heatmap). A2 found that most sessions break focus early,
but the heatmap only showed raw counts. Comparing task types with very different group sizes
(Studying n=33 vs Meeting n=8) means converting counts into shares, which is what this design is built around.

## The two versions

Both versions load `data/cleaned_data.csv` through the same `shared.js`, so the data, dot layout, colors, and
labels are identical. We kept the 74 sessions that had a distraction and were one of the five main task types.
The 3 sessions with no distraction have no time, and "Other" had only 3 sessions, so both were left out.

| | Static (`static/`) | Interactive (`interactive/`) |
|---|---|---|
| Main view | Dot strip: one row per task type, one dot per session, 5-minute bins, count above each stack, n per task | Same dot strip |
| Interaction | None (no tooltips either) | **Brush a time window** on the strip. Whole bins are selected so they're never split, and the window is printed ("Window: 10-29 minutes") |
| Derived view | — (reader counts dots and divides by n) | **Linked bar chart** recomputes, for each task, the % of its sessions in the window (`40% (4 of 10)`) |

![static](screenshots/static.png)
![interactive with window 10-29](screenshots/interactive_window.png)

**Why this interaction is analytical, not decorative:** it's *dynamic aggregation*. Any question of the form
"which task loses focus more often between X and Y minutes?" needs (sessions in window) ÷ (task total)
for several tasks. The static chart gives all the inputs (counts per bin, n per task), so every question is
answerable, but the reader does the adding and dividing. The interactive version does it for any window.

**Built-in trap that makes the tasks non-trivial:** Studying has by far the most dots, so it usually *looks*
biggest, but once you divide by n it's often not. The tasks below are chosen so the raw count and the share point to
different answers.

## Evaluation design

**Evaluation question:** Does brushing a window with a linked share chart help people compare how often different
task types get distracted within a time window?

**Hypothesis:** With the interactive version, participants answer faster on both tasks. Accuracy is higher on T2,
which compares five groups and needs five divisions in the static version. We expect little or no accuracy
difference on T1, which compares only two.

### Tasks (2 tasks × 2 variants, multiple choice)

| Task | Variant A | Variant B | Answer A | Answer B |
|---|---|---|---|---|
| **T1: compare two categories** | Of each task's sessions, which had a larger share first distracted between **15 and 29 min**: Reading or Studying? | ...between **0 and 4 min**: Writing or Studying? | **Reading** (3/10 = 30% vs 3/33 = 9%) | **Writing** (4/10 = 40% vs 6/33 = 18%) |
| **T2: find the maximum across categories** | Which task type had the highest share of its sessions first distracted between **10 and 14 min**? | ...between **5 and 19 min**? | **Homework/Assignments** (3/13 = 23%; next Meeting 12%) | **Meeting** (6/8 = 75%; next Studying 64%) |

The variants are matched on purpose. In each pair, Studying has the same or a higher raw count but loses on share,
and the gap to the runner-up is similar (T1: 21 vs 22 points; T2: 11 vs 11 points). Every answer can be
recomputed with `python a3/angela/check_answers.py`.

### Counterbalancing (within-subject)

Set 1 = T1-A + T2-A, Set 2 = T1-B + T2-B. Assign participants to groups in rotation (P01 → G1, P02 → G2, ...):

| Group | First condition | Static gets | Interactive gets |
|---|---|---|---|
| G1 | Static | Set 1 | Set 2 |
| G2 | Static | Set 2 | Set 1 |
| G3 | Interactive | Set 1 | Set 2 |
| G4 | Interactive | Set 2 | Set 1 |

With 12 participants that's 3 per group. With 10, it's as even as possible (3/3/2/2), and we'll say so in the report.

### Procedure and scoring

- **Same setup for everyone:** same laptop, browser, and full-screen window; one participant at a time.
- **Practice:** before each condition, a 1-minute walkthrough on a practice question that isn't scored
  ("How many Writing sessions were first distracted in 5-9 min?"). For the interactive version, this is where the
  participant learns to brush.
- **Timing:** starts when the question is read aloud and stops when the participant states the answer.
- **Time limit:** 90 seconds per question. A timeout is scored incorrect with time = 90 s and `notes = timeout`.
- **Recording:** results go into `a3/results/results.csv` (same columns already in the repo). Optionally ask for
  confidence on a 1-5 scale after each answer.

## Curio (extra credit)

The same dataflow, run on a local clone of Curio:

1. CSV loader node for `cleaned_data.csv`.
2. Python node that does the filter and bin columns from `shared.js`.
3. Vega-Lite node for the dot strip with the interval brush.
4. Curio interaction node that passes the selection to a second Python node, which recomputes the share per task.
5. Bar chart node for the shares.

Screenshots and a short screen recording of the brush go in `a3/angela/curio/`.
