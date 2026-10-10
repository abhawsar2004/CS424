## Task 4: Implement visualization alternatives

We made three different charts in Vega-Lite (`vis/index.html` and `vis/charts.js`). Each one is for a different question, and we made them look different on purpose so we weren't just making the same chart three times.

### 1. Focus by location (dot plot)

<img src="vis/screenshots/chart1_location.png" width="700" alt="Focus by location dot plot" />

This one comes from our location sketch in Assignment 1. It's for the question of how focus and distractions change depending on where you work. It uses `location`, `focus`, and `distractions`. Every session is a circle. The row shows the location, how far right it is shows the focus rating, and a darker circle means more distractions. We wanted to see every single session instead of an average, because most places only have one or two sessions.

The good part is you can tell right away how uneven our data is. Home and the library have a bunch of sessions and every other place has one. The bad part is that if two sessions at the same place have the same focus rating, the circles sit right on top of each other. Home has 12 sessions but it looks like 5 circles. Our hand sketch didn't have this problem because we drew the circles next to each other. The colors are also off because one person put "20+" distractions, so every other circle looks almost the same light blue. We're keeping this chart but it needs fixing. The circles need to be spread out so you can see all of them, and the colors need to be redone.

### 2. First distraction by task type (heatmap)

<img src="vis/screenshots/chart2_heatmap.png" width="600" alt="Heatmap of first distraction time by task type" />

This is based on our heatmap sketch, but we put task type on the rows instead of difficulty. It's for the question of whether people get distracted sooner on some kinds of tasks. It uses `task_type` and `first_distraction` (in minutes). Each box is a 10-minute chunk for one task type, and a darker box means more sessions landed there. We also put the number in each box because it was hard to tell the exact count from the color.

We tried this because it shows the whole spread for a task type in one row, and an average can't do that. It works for studying, since there are enough sessions to see they go anywhere from under 10 minutes to over 40. It doesn't really work for the other task types. They only have one to four sessions each, so the rows are mostly empty, and a box with a "1" in it looks like it means more than it does. The one session with no distractions isn't on here at all because it doesn't have a time. We'd keep this for studying sessions, but with this much data it's not great for comparing task types.

### 3. Sessions over the day (timeline)

<img src="vis/screenshots/chart3_timeline.png" width="700" alt="Timeline of sessions across the day" />

This one came from our time-of-day timeline sketch. It's for a question we didn't really look at in Assignment 1, which is whether the time of day changes how long someone stays focused. It uses `start_time`, `planned` duration, `first_distraction`, and `focus`. Each session is a bar placed at the time of day it started. The grey bar is how long they planned to work, the blue part is how long until the first distraction, and darker blue means they rated their focus higher.

We tried this because the other two charts don't show time at all. It also lets you compare the first distraction to the planned length for every session at once, and that part worked well. For most sessions the first distraction happens in the first third to half of the planned time. You can also see when people actually work. Most sessions start between 7 AM and 5 PM, and there's nothing between about 1 AM and 5 AM. The problem is that short sessions are tiny when the axis is 24 hours long, so a 20-minute session is almost impossible to see. The session with no distractions is just a grey bar, which could look like the data is missing. We're keeping this one and we think it's the best of the three, but we need to change the scale so the short sessions are easier to read.
