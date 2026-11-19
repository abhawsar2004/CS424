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

## Task 4 · Amithi's development notes

- **Handling midnight.** A range like 9 PM to 5 AM lands on both ends of the timeline. I split it at midnight and used the same two pieces to shade the chart and pick sessions. I also checked that a session starting at noon goes in the afternoon card when the morning card ends at noon.
- **Lining up the dots.** Some locations have a lot of sessions with the same rating. I use the tallest stack from either card to set the height of the rows in both. That way all the dots fit and the rows still line up.

Amithi built the timeline, the two location charts, the time controls, and the noise filter. [JavaScript](dashboard.js) · [HTML](index.html) · [CSS](styles.css)
