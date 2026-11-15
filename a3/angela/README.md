# First Distraction by Task Type

## Question

**Do people get distracted sooner on some kinds of tasks than others?**

Each dot is one study session, placed by how many minutes passed before the first distraction (in 5-minute bins),
with one row per task type. We use the 74 sessions that had a distraction, across the five main task types.

- **Static version:** the dot chart, with the number of sessions above each stack and the total (n) next to each task.
- **Interactive version:** the same dot chart. Drag across it to pick a time window, and a bar chart shows what %
  of each task's sessions were first distracted inside that window.

![static](screenshots/static.png)
![interactive](screenshots/interactive.png)\

## How to run on your computer

1. Clone the repo:
   ```
   git clone https://github.com/abhawsar2004/CS424.git
   cd CS424
   ```
2. Start a local server from the `CS424` folder:
   ```
   python -m http.server 8000
   ```
3. Open in your browser:
   - Static: http://localhost:8000/a3/angela/static/
   - Interactive: http://localhost:8000/a3/angela/interactive/

Don't open the HTML files by double-clicking them. They need the local server to load the data.

## Hypothesis

People will answer **faster and more accurately with the interactive version**, because it calculates the
percentages for them. With the static version they have to count dots and divide by n themselves.

## Tasks and expected answers

Each participant answers 4 multiple-choice questions: two tasks, each in two versions (A and B).

| Task | Variant | Question | Expected answer |
|---|---|---|---|
| **T1: Compare two task types** | A | Which had a larger share of its sessions first distracted between **15 and 29 minutes**: Reading or Studying? | **Reading** (30% vs 9%) |
| | B | Which had a larger share of its sessions first distracted between **0 and 4 minutes**: Writing or Studying? | **Writing** (40% vs 18%) |
| **T2: Find the highest** | A | Which task type had the highest share of its sessions first distracted between **10 and 14 minutes**? | **Homework/Assignments** (23%) |
| | B | Which task type had the highest share of its sessions first distracted between **5 and 19 minutes**? | **Meeting** (75%) |

`check_answers.py` recalculates these answers from the data.

## Procedure

Every participant uses **both** versions: one set of questions on each.

- **Set 1** = T1-A and T2-A
- **Set 2** = T1-B and T2-B

| Participant | Uses first | Static version gets | Interactive version gets |
|---|---|---|---|
| P01, P05, P09 | Static | Set 1 | Set 2 |
| P02, P06, P10 | Static | Set 2 | Set 1 |
| P03, P07, P11 | Interactive | Set 1 | Set 2 |
| P04, P08, P12 | Interactive | Set 2 | Set 1 |

Each session takes about 10 minutes:

1. Read the instructions below to the participant.
2. First version: one practice question (not scored), then the two timed questions.
3. Second version: one practice question (not scored), then the two timed questions.

Practice question: "How many Writing sessions were first distracted in 5–9 minutes?"

We run 1–2 pilot participants first and fix anything confusing before the real study.

## Participant instructions

Read this out loud to every participant:

> "You'll answer four multiple-choice questions about study sessions using two versions of a chart. Each dot is
> one session. Answer as quickly and accurately as you can, and say your answer out loud. There's a 90-second limit
> per question. This is testing the chart, not you."

Before the interactive version, add:

> "You can drag across the chart to select a time window. The bars on the right update. Double-click to clear."

## Measurements

For every question we record:

- **Accuracy:** correct (1) or incorrect (0).
- **Time:** seconds from when we finish reading the question until the participant says an answer.
- **Timeout:** answers longer than 90 seconds count as incorrect, with time recorded as 90.

## Recording results

All results go in `a3/results/results.csv`, one row per question (4 rows per participant):

```
participant_id,order,condition,task,variant,answer,correct,time_seconds,notes
P01,static_first,static,T1,A,Reading,1,24.3,
P01,static_first,static,T2,A,Studying,0,61.0,picked the row with most dots
P01,static_first,interactive,T1,B,Writing,1,9.8,
P01,static_first,interactive,T2,B,Meeting,1,14.2,
```

One teammate reads the questions and times with a stopwatch; another fills in the sheet and writes down anything
noticeable in `notes` (confusion, trouble dragging, doing math out loud).  participant learns to brush.
- **Timing:** starts when the question is read aloud and stops when the participant states the answer.
- **Time limit:** 90 seconds per question. A timeout is scored incorrect with time = 90 s and `notes = timeout`.
- **Recording:** results go into `a3/results/results.csv` (same columns already in the repo). Optionally ask for
  confidence on a 1-5 scale after each answer.

## Curio Prototype

Curio was cloned from https://github.com/urban-toolkit/curio and run locally (installation from git).

## Analytical question

Do people get distracted sooner on some kinds of tasks than others? Specifically: within a chosen time window,
which task type has the largest share of its sessions first distracted, and were those sessions rated lower on focus?

## Dataflow

Data Loading → Distraction Window Explorer (Vega-Lite)
             → Focus Rating of Selected Sessions (Vega-Lite)
The two charts are connected by an interaction edge.

## Data Transformations (Data Loading Node)

1. Load `data/cleaned_data.csv`.
2. Keep the 74 sessions that had a distraction and belong to the five main task types (Studying, Homework/Assignments,
   Reading, Writing, Meeting).
3. Put each session's time to first distraction into 5-minute bins (0–4, 5–9, ...).
4. Compute each task type's total number of sessions (n), used to turn counts into percentages.
5. Give each session a position inside its bin so every dot is visible and countable.

## How the interaction works

- **Distraction Window Explorer:** Drag across the dot chart to choose a time window (for example 10–29 minutes).
  The bar chart next to it recalculates, for each task type, the % of its sessions first distracted in that window,
  for example "Reading: 40% (4 of 10)". Double-click to clear.
- **Focus Rating of Selected Sessions:** The interaction edge sends the selection to this chart, and the same sessions
  turn dark on a focus-rating scale. This shows whether sessions distracted in that window were rated lower on focus.

This supports the analytical task directly: comparing task types fairly even though they have very different numbers of
sessions (Studying has 33, Meeting has 8).

## How to reproduce

1. Clone Curio from GitHub and start it with `python curio.py start`.
2. Open http://localhost:8080, create a new dataflow, and use **File → Load dataflow** to open
   `focustrace_task_type.json`.
3. In the Data Loading node, set `CSV_PATH` to the location of `data/cleaned_data.csv`.
4. Click **Run All**, then drag across the dot chart.


![curio](screenshots/curio.png)

