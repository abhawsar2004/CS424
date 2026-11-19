# FocusTrace · Assignment 4

## Run the dashboard

From the CS424 repo folder, run `python3 -m http.server 8424` and open [the dashboard](http://localhost:8424/assignment-4/). It uses HTML, CSS, JavaScript, and our [cleaned CSV](../data/cleaned_data.csv).

## Task 1 · Final interface

The top chart shows when each session started and how long it took to get distracted. Its color shows the focus rating. In the location charts, each dot is one session and color shows how many distractions it had. Sessions with zero distractions still count in the location charts.

- Pick **Set A** or **Set B** and drag on the timeline to set that range. You can also type exact times in either card.
- Use **Noise level** to filter all three charts. Each card shows the session count and average focus. The two cards can have different counts, so check those when comparing the averages.
- The new feature is comparing two custom time ranges side by side. Both charts use the same scale and row heights so it's easy to line them up.

Each range includes the start time and stops just before the end time. Use 9 PM to 5 AM for an overnight range or enter the same time twice for the full day. If the ranges overlap, a session can show up in both cards.

### Changes from A3 Study B

- For the morning vs. afternoon question, people got **7/10 right** with each version. The [static view](../a3/amithi/screenshots/static.png) showed several time periods together. The [interactive view](../a3/amithi/screenshots/interactive.png) let us pick one range at a time. We combined those ideas so you can keep both ranges on screen and change either one.
- For the question about a longer time range, people got **3/10 right** with the static view and **5/10 right** with the interactive view. We kept the option to drag and added time fields so you can set exact cutoffs, like 5 AM to 5 PM.

We counted correct answers by question and version for the 10 Study B participants in the Main Study Data sheet. [A3 study workbook](../a3/Mariam/CS424_Two_Studies_2_Pilots_10_Participants.xlsx)

## Task 2 · What we found

We used the dashboard to explore our 80 recorded sessions. To get the numbers below, run `python3 assignment-4/task2_analysis.py` from the repo folder. [Analysis script](task2_analysis.py)

### 1. Did focus at Home and Other look different in the morning and afternoon?

We used 5 AM to noon for Range A and noon to 5 PM for Range B, with **All noise levels** selected. In each location chart, we counted the dots at 8, 9, or 10 and divided by the total for that row.

| Location | Morning sessions rated 8+ | Afternoon sessions rated 8+ |
| --- | ---: | ---: |
| Home | 4 of 11 | 0 of 11 |
| Other | 4 of 9 | 5 of 8 |

The overall average was close across the two windows (7.0 in the morning and 6.8 in the afternoon). Looking by location showed a bigger change. High ratings went down at Home and up in Other. The groups are small and could include different people and tasks. Other also groups several places together.

### 2. How did noise level relate to focus and early distractions?

We set both times in Range A to 5 AM to show the whole day, then tried each **Noise level**. We used the location dots for focus ratings and counted the dots at 10 minutes or less in the top chart. For that second count, the total only includes sessions that had a distraction.

| Noise level | Sessions | Average focus out of 10 | First distraction by 10 min |
| --- | ---: | ---: | ---: |
| Very Quiet | 20 | 7.05 | 13 of 18 |
| Quiet | 36 | 7.03 | 21 of 35 |
| Moderate | 21 | 6.05 | 15 of 21 |
| Noisy | 3 | 4.33 | 3 of 3 |

Very Quiet and Quiet sessions both averaged about 7 for focus, about a point above Moderate. Quiet had the smallest share of early distractions at 60%, compared with about 72% for Very Quiet and 71% for Moderate. All three Noisy sessions came from Cafe or Other, so the low focus ratings there could reflect where the sessions happened or what people were doing.

### 3. Did sessions with fewer distractions have higher focus at each location?

We kept Range A on the full day and switched back to **All noise levels**. In each location row, we compared the focus ratings for the three dot colors. Each cell shows the average focus and how many sessions went into it.

| Location | 0–3 distractions | 4–12 distractions | 13+ distractions |
| --- | ---: | ---: | ---: |
| Home | 7.10 (10) | 6.10 (10) | 5.93 (14) |
| Other | 8.57 (7) | 6.14 (7) | 6.25 (8) |
| Library | 8.60 (5) | 7.60 (5) | 6.43 (7) |
| Cafe | 6.00 (1) | 5.67 (3) | 5.67 (3) |

At Home, Other, and Library, average focus was higher for sessions with 0–3 distractions than for sessions with 13 or more. At the Library the gap was about 2.2 points. Cafe had only one session in the 0–3 group, so we have less to go on there. These are total distractions per session, so longer sessions had more time for distractions to happen.

### One question we couldn't answer

Would the same person focus better after getting more sleep? The CSV has one row per session with no participant ID to match the same person's sessions. Also, 17 of 80 sleep values were filled in during cleaning. We'd need recorded sleep and a way to connect sessions from the same person to answer this.

## Task 4 · Amithi's development notes

- **Handling midnight.** A range like 9 PM to 5 AM lands on both ends of the timeline. I split it at midnight and used the same two pieces to shade the chart and pick sessions. I also checked that a session starting at noon goes in the afternoon card when the morning card ends at noon.
- **Lining up the dots.** Some locations have a lot of sessions with the same rating. I use the tallest stack from either card to set the height of the rows in both. That way all the dots fit and the rows still line up.

Amithi built the timeline, the two location charts, the time controls, and the noise filter. [JavaScript](dashboard.js) · [HTML](index.html) · [CSS](styles.css)
