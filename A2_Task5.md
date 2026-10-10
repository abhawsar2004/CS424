## Task 5: Interaction and multiple views

After Task 4 we had three separate charts that each showed one thing. The problem was that our questions connect to each other. If you notice something on the timeline, like the late sessions, you want to know where those sessions happened and how focused people were, and with three separate charts you'd have to match up session numbers by hand. So we put all three charts on one page and linked them. We only added two interactions, and each one is there for a reason.

<img src="vis/screenshots/linked_all.png" width="700" alt="All three linked charts with nothing selected" />

**Selecting a time range (linked views).** You can drag across the timeline to pick a part of the day. The location chart fades out every session that isn't in that range, and the heatmap recounts using only the sessions you picked. This lets someone ask things like "what do evening sessions look like?" and see the answer in all three charts at once. In the screenshot below we selected about 3 PM to 10 PM. The location chart shows those sessions were mostly at home and the library, and the heatmap shows only the first distractions from those sessions. Double-clicking the timeline clears the selection.

<img src="vis/screenshots/linked_evening_selected.png" width="700" alt="Evening sessions selected on the timeline, other charts updated" />

We made the location chart fade instead of hiding the other sessions because you still want to see the selected ones compared to everything else. The heatmap is different. It shows counts, so fading doesn't make sense there, and it just recounts.

**Filtering by noise level.** There's a dropdown under the charts for Very Quiet, Quiet, or Moderate, and picking one filters all three charts to those sessions. We added this because noise was one of our original questions and none of the three charts shows noise on its own. This way we didn't need a fourth chart for it. Below is what it looks like with Moderate selected.

<img src="vis/screenshots/linked_noise_moderate.png" width="700" alt="Charts filtered to moderate noise sessions" />

**Hovering.** Every chart also shows the details of a session when you hover over it, like the task, start time, and focus rating. We kept this because the charts only use a few columns each, and sometimes you want to check the rest without leaving the chart.

**What we decided not to add.** We thought about a dropdown to change what the colors mean (focus, distractions, or effectiveness), but we couldn't think of a question it would help answer, so we left it out. We also didn't add zooming, because there are only 22 sessions and everything already fits on the screen.

**A problem we ran into.** The first time we added the noise filter, the rows in each chart disappeared when they had no sessions, so the charts kept changing size and the title of the top chart got cut off. We fixed it by keeping every session, location, and task type on the axes all the time, even when they're empty. It also turned out better this way, because now you can see which places and tasks have nothing at that noise level instead of them just vanishing.

One thing we're still not sure about is whether people will figure out that they can drag on the timeline. Right now there's just a line of text at the top telling them. That's something we want to check in Assignment 3.
