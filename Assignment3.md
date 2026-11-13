# Assignment 3: Interaction and Evaluation

## Task 1: Implementing interaction

We each built a static and an interactive version of a different chart from Assignment 2, and we're testing both. Both use `data/cleaned_data.csv` and are built with Vega-Lite. The steps to run them are in each folder's README (`a3/angela/` and `a3/amithi/`).

### Study A (Angela): First distraction by task type

This comes from our A2 heatmap of task type vs. minutes until the first distraction. The problem with that chart was that it only showed raw counts, and our task types have really different sizes (Studying has 33 sessions, Meeting only 8). So a task type with more sessions always looks worse even if it isn't. We changed it into a dot strip with one row per task type and one dot per session, placed in 5-minute bins. We used the 74 sessions that had a distraction and were one of the five main task types.

- **Static:** The dot strip, with the number of sessions above each stack and the total (n) next to each task type. No hover or anything else.
- **Interactive:** The same dot strip, but you can drag across it to pick a time window. Whole bins get selected so a bin never gets split, and the window is printed above the chart (like "Window: 10-29 minutes"). A linked bar chart then shows what % of each task type's sessions were first distracted in that window.

We expect this to help because questions like "which task type gets distracted more often between X and Y minutes?" need a percentage for every task type. In the static version you can get there (count the dots in the window and divide by n), but you have to do the math yourself. The interactive version does it for any window you pick.

### Study B (Amithi): Focus by location across the day

This comes from our A2 linked view. The top chart shows each session by when it started and how many minutes until the first distraction. The bottom chart shows every session as a dot by location and focus rating, stacked so you can count them, and colored by number of distractions (0-3, 4-12, 13+). We used all 80 sessions.

- **Static:** The same top chart, and the location chart split into 4 panels by start time: Morning (5 AM-12 PM), Afternoon (12-5 PM), Evening (5-9 PM) and Night (9 PM-5 AM).
- **Interactive:** One location chart. Dragging across the top chart picks a time range, and the location chart only shows sessions from that range, with the dots re-stacked so they can still be counted. Double-click clears it. We took out hover, the heatmap and the noise filter from our A2 version so the drag is the only real difference.

We expect this to help when a question covers more than one panel, like "between 12 PM and 9 PM". In the static version you have to find the right dots in two panels and add them up, while the drag groups them in one step. For questions about a single period, we don't think it'll help much, since the panels are already there.

### Keeping it fair

In both studies the static version isn't a weaker copy. It shows all the information needed to answer every question, using the same data, colors and dot layout. The only thing the interactive version adds is the drag (plus Angela's share bars, which are the result of the drag).

## Task 2: Evaluation design

### Questions and Hypotheses

- **Study A:** Does dragging a time window, with a linked chart of percentages, help people compare how often different task types get distracted in that window?  
  **Hypothesis:** People will be faster and more accurate with the interactive version because it does the dividing for them.


- **Study B:** Does dragging to pick a time range help people compare locations during part of the day?<br>
  **Hypothesis:** For T2, where the range covers two panels, people will be faster and more accurate with the interactive version. For T1, which compares two single periods, we don't expect much difference, and the static version might even be a bit faster because the two panels are right next to each other.
  

### Tasks

Each study has 2 tasks with 2 versions each (A and B), so 4 multiple-choice questions per study. The two versions of a task test the same thing on a different part of the data, so people can't just remember their first answer. At least one task in each study needs comparing several categories, not just reading off one value.

**Study A:**

| Task | Variant | Question | Answer |
|---|---|---|---|
| T1: Compare two task types | A | Which had a larger share of its sessions first distracted between 15 and 29 minutes: Reading or Studying? | Reading (30% vs 9%) |
| | B | Which had a larger share of its sessions first distracted between 0 and 4 minutes: Writing or Studying? | Writing (40% vs 18%) |
| T2: Find the highest | A | Which task type had the highest share of its sessions first distracted between 10 and 14 minutes? | Homework/Assignments (23%) |
| | B | Which task type had the highest share of its sessions first distracted between 5 and 19 minutes? | Meeting (75%) |

In each pair, Studying has the same or more dots but loses once you divide by n, so just picking the row with the most dots gives the wrong answer.

**Study B:**

| Task | Variant | Question | Answer |
|---|---|---|---|
| T1: Compare two time periods | A | Did Home have more sessions with 13+ distractions in the morning (5 AM-12 PM) or the afternoon (12-5 PM)? | Afternoon (5 vs 3) |
| | B | Did Other have more sessions with 13+ distractions in the morning or the afternoon? | Morning (4 vs 2) |
| T2: Find the most over a longer range | A | Between 5 AM and 5 PM, which location had the most sessions rated 5 or lower? | Home (7, next is Other with 4) |
| | B | Between 12 PM and 9 PM, which location had the most sessions rated 8 or higher? | Other (5, next is Library with 3) |

The T1 variants have the same gap (2) with opposite answers. The T2 variants both cover two panels in the static version, with gaps of 3 and 2. We also checked that the few sessions starting exactly on a cutoff (12:00 and 9:00 PM) don't change any answer if someone's drag is a little off.

All 8 answers can be recalculated from the data with `a3/angela/check_answers.py` and `a3/amithi/check_answers.py`.

### Counterbalancing

Every participant uses both versions in each study (within-subject). In each study, Set 1 is T1-A + T2-A and Set 2 is T1-B + T2-B. People are assigned to groups in order:

| Participant | Uses first | Static gets | Interactive gets |
|---|---|---|---|
| P01, P05, P09 | Static | Set 1 | Set 2 |
| P02, P06, P10 | Static | Set 2 | Set 1 |
| P03, P07, P11 | Interactive | Set 1 | Set 2 |
| P04, P08, P12 | Interactive | Set 2 | Set 1 |

This way about half start with each version, and each set of questions gets used with each version about equally, so the easier set isn't always on the same version. With 10 people the groups come out 3/3/2/2, which is as even as we can get.

Each participant does both studies in one sitting (8 questions, about 20 minutes), and we switch which study goes first from one person to the next.

### Procedure

- Everyone uses the same laptop, browser and window size, one person at a time.
- We read the same instructions out loud to everyone: they'll answer multiple-choice questions about study sessions using two versions of a chart, each dot is one session, they should answer as fast and as accurately as they can and say the answer out loud, there's a 90-second limit, and it's testing the chart, not them. Before an interactive version we also explain how to drag and double-click.
- Before each version there's one practice question that doesn't count. That's also when people try the drag for the first time.
- One of us reads the questions and times with a stopwatch, and the other writes down the answers and anything we notice.

### Measurements and scoring

- **Accuracy:** 1 if correct, 0 if wrong.
- **Time:** seconds from when we finish reading the question until they say an answer.
- **Timeouts:** anything over 90 seconds counts as wrong, with time recorded as 90 and "timeout" in the notes. We decided this before starting so every case is handled the same way.

Everything goes in `a3/results/results.csv`, one row per question. The columns are participant ID (P01, P02, ...; no names), which study, which version they started with, condition, task, variant, answer, correct, time in seconds, and notes. Pilot participants are marked PILOT1, PILOT2 and aren't counted in the analysis.

## Task 3: Conducting the evaluation

_To be added._

## Task 4: Quantitative analysis

_To be added._

## Task 5: Reflection and Recommendations

_To be added._
