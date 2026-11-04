# Candidate: focus by location across the day (Amithi)

**Question (from A2):** Do focus and distractions at each place look different depending on what time of day it is?
This builds on the linked charts from A2 (the time of day chart plus the stacked location dots).

## The two versions

Both use `data/cleaned_data.csv` (all 80 sessions), and the dots, colors and axes are the same in both.

| | Static (`a3/static/`) | Interactive (`a3/interactive/`) |
|---|---|---|
| Top chart | Minutes to first distraction by start time | Same chart, but you can drag across it |
| Location chart | Split into 4 panels: Morning (5 AM-12 PM), Afternoon (12-5 PM), Evening (5-9 PM), Night (9 PM-5 AM) | One location chart that only shows the sessions in the time range you dragged. The dots re-stack so you can still count them |
| Interaction | None (no hover either) | **Drag across a time range** on the top chart. Double-click to clear it |

**Why the drag actually helps:** if a question asks about a time range that covers more than one panel, like "12 PM to 9 PM", then in the static version you have to find the right dots in two panels and add them up yourself. With the drag you just select that range once and the chart does the grouping for you.

## Evaluation design

**Evaluation question:** Does dragging to pick a time range help people compare locations during part of the day?

**Hypothesis:** For T2, where the time range covers two panels, we think the interactive version will be faster and more accurate, since the static version makes you add counts from two panels. For T1, which only compares two single time periods, we don't expect much of a difference. The static version might even be a little better there, because the two panels are already right next to each other, while the interactive version needs you to drag twice.

### Tasks (2 tasks × 2 variants)

"13+ distractions" is the darkest dot color. "Rated 8 or higher" means a focus rating of 8, 9 or 10.

| Task | Variant A | Variant B | Answer A | Answer B |
|---|---|---|---|---|
| **T1: compare two time periods** | Did **Home** have more sessions with 13+ distractions in the **morning (5 AM-12 PM)** or the **afternoon (12-5 PM)**? | Did **Other** have more sessions with 13+ distractions in the **morning (5 AM-12 PM)** or the **afternoon (12-5 PM)**? | **Afternoon** (5 vs 3) | **Morning** (4 vs 2) |
| **T2: find the most over a longer range** | Between **5 AM and 5 PM**, which location had the most sessions **rated 5 or lower**? | Between **12 PM and 9 PM**, which location had the most sessions **rated 8 or higher**? | **Home** (7, next is Other with 4) | **Other** (5, next is Library with 3) |

How we made the two variants match:
- T1-A and T1-B ask the same question about a different place. Both have a difference of 2, and the answers are opposite, so nobody can just say the same thing they said the first time.
- Both T2 variants cover two panels in the static version (morning + afternoon, and afternoon + evening). The differences are 3 and 2, so they're close but not exactly the same. We'll mention that in the report.
- T2-B has a little trap. Home has the most dots overall, but Other wins once you only count the sessions rated 8 or higher.
- A few sessions start exactly on a cutoff (one at 12:00 and six at 9:00 PM). We checked that the answers stay the same whether those get included or not, in case someone's drag is a little off.

You can recheck all the answers by running `python3 a3/study/check_time_of_day_location.py`. It's plain Python, so you don't need pandas.

### Order and procedure

We used the same setup as Angela's design so either version can be run the same way. Set 1 = T1-A + T2-A, and Set 2 = T1-B + T2-B. Participants take turns going into these 4 groups:

| Group | Starts with | Static gets | Interactive gets |
|---|---|---|---|
| G1 | Static | Set 1 | Set 2 |
| G2 | Static | Set 2 | Set 1 |
| G3 | Interactive | Set 1 | Set 2 |
| G4 | Interactive | Set 2 | Set 1 |

- Everyone uses the same laptop, browser and window size.
- Before each version there's one practice question that doesn't count ("How many Library sessions were in the evening?"). For the interactive version, this is when they learn to drag and double-click.
- The timer starts when we read the question and stops when they say their answer. They get 90 seconds max, and if they run out of time it counts as wrong with a time of 90.
- Results go in `a3/results/results.csv`.
