// using the raw csv for now, switch to the cleaned one when task 2 is done
const DATA_URL = "../data/raw/form_responses.csv";

// the form questions are super long so give them short names
const SHORT_NAMES = {
  "What time did the session start?": "start_time",
  "What type of task were you doing?": "task_type",
  "How interesting was the task?": "interest",
  "How difficult was the task?": "difficulty",
  "How long did you plan to work/study? Enter the number of minutes. Example: 120": "planned",
  "How many minutes after starting the session did you experience your first distraction? Enter a whole number. If no distraction occurred enter 0": "first_distraction",
  "How many distractions occurred? (Whole Number)": "distractions",
  "How focused were you during the session?": "focus",
  "Where did you study/work?": "location",
  "How would you describe the noise level during this session?": "noise",
  "How many other people were around you during this session?": "people",
};

// people typed stuff like "90min", "3 hours", "Around 30" so pull the number out
function toMinutes(text) {
  const match = String(text).match(/[\d.]+/);
  if (!match) return null;
  const num = parseFloat(match[0]);
  return /hour/i.test(text) ? num * 60 : num;
}

// "5:30:00 AM" -> 5.5
function toHourOfDay(text) {
  const match = String(text).match(/(\d+):(\d+):\d+\s*(AM|PM)/i);
  if (!match) return null;
  let hour = parseInt(match[1]) % 12;
  if (match[3].toUpperCase() === "PM") hour += 12;
  return hour + parseInt(match[2]) / 60;
}

function shorten(row, i) {
  const out = { session: "R" + (i + 1) };
  for (const key in row) {
    const name = SHORT_NAMES[key.trim()];
    if (name) out[name] = row[key].trim();
  }
  // "20+" isn't a number so just take the 20 for now
  out.distractions = parseInt(out.distractions);
  out.focus = +out.focus;
  out.planned = toMinutes(out.planned);
  out.first_distraction = toMinutes(out.first_distraction);
  // 0 distractions means they never got distracted, not distracted at minute 0
  out.no_distraction = out.distractions === 0;
  out.start_hour = toHourOfDay(out.start_time);
  // someone wrote "Meetings" instead of "Meeting"
  if (out.task_type === "Meetings") out.task_type = "Meeting";
  return out;
}

loadCsv().then((rows) => {
  const data = rows.map(shorten).map((d) => ({
    ...d,
    plan_end: Math.min(d.start_hour + d.planned / 60, 24),
    distraction_at: d.no_distraction ? null : d.start_hour + d.first_distraction / 60,
  }));

  // fixed lists for the axes so rows don't jump around when you filter
  const taskTypes = [...new Set(data.map((d) => d.task_type))].sort();
  const sessionOrder = [...data].sort((a, b) => a.start_hour - b.start_hour).map((d) => d.session);
  const placeCounts = {};
  data.forEach((d) => (placeCounts[d.location] = (placeCounts[d.location] || 0) + 1));
  const places = Object.keys(placeCounts).sort((a, b) => placeCounts[a] - placeCounts[b]);

  // all three charts are in one spec now so they can talk to each other
  vegaEmbed("#vis", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    // dropdown that filters every chart by noise level
    params: [
      {
        name: "noisePick",
        value: "All",
        bind: { input: "select", options: ["All", "Very Quiet", "Quiet", "Moderate"], name: "Noise level: " },
      },
    ],
    transform: [{ filter: "noisePick == 'All' || datum.noise == noisePick" }],
    resolve: { scale: { color: "independent" } },
    spacing: 40,
    vconcat: [
      // timeline over the day. drag across it to pick a time range
      // grey bar = how long they planned to work, colored part = time until first distraction
      {
        title: "Sessions over the day (drag to select a time range)",
        width: 700,
        height: { step: 18 },
        encoding: {
          y: { field: "session", type: "nominal", scale: { domain: sessionOrder }, title: "Session (sorted by start time)" },
          x: {
            field: "start_hour",
            type: "quantitative",
            scale: { domain: [0, 24] },
            axis: { values: [0, 3, 6, 9, 12, 15, 18, 21, 24], title: "Time of day (hour, 24h clock)" },
          },
          tooltip: [
            { field: "session" },
            { field: "task_type" },
            { field: "start_time", title: "start" },
            { field: "planned", title: "planned (min)" },
            { field: "first_distraction", title: "first distraction (min)" },
            { field: "focus" },
          ],
        },
        layer: [
          {
            // the drag selection lives here, the other charts read it
            params: [{ name: "timeBrush", select: { type: "interval", encodings: ["x"] } }],
            mark: { type: "rule", strokeWidth: 8, color: "#ddd" },
            encoding: { x2: { field: "plan_end" } },
          },
          {
            mark: { type: "rule", strokeWidth: 8 },
            encoding: {
              x2: { field: "distraction_at" },
              color: { field: "focus", type: "quantitative", title: "Focus (1-10)", scale: { scheme: "blues" } },
            },
          },
        ],
      },

      // one circle per session, grouped by location
      // sessions outside the selected time range fade out
      {
        title: "Focus by location",
        width: 700,
        mark: { type: "circle", size: 150 },
        encoding: {
          y: { field: "location", type: "nominal", scale: { domain: places }, title: null },
          x: { field: "focus", type: "quantitative", scale: { domain: [0, 10] }, title: "Focus rating (1-10)" },
          color: { field: "distractions", type: "quantitative", title: "Distractions" },
          opacity: { condition: { param: "timeBrush", value: 1 }, value: 0.12 },
          tooltip: [{ field: "session" }, { field: "location" }, { field: "focus" }, { field: "distractions" }, { field: "noise" }],
        },
      },

      // heatmap, how soon the first distraction hits for each task type
      // only counts the sessions in the selected time range
      {
        title: "First distraction by task type",
        width: 700,
        height: { step: 40 },
        // sessions with no distraction are left out since they don't have a time
        transform: [{ filter: "!datum.no_distraction" }, { filter: { param: "timeBrush" } }],
        encoding: {
          x: {
            field: "first_distraction",
            type: "quantitative",
            bin: { step: 10 },
            scale: { domain: [0, 50] },
            title: "Minutes to first distraction",
          },
          y: { field: "task_type", type: "nominal", title: null, scale: { domain: taskTypes } },
        },
        layer: [
          {
            mark: "rect",
            encoding: {
              color: { aggregate: "count", type: "quantitative", title: "Sessions", scale: { scheme: "oranges" } },
              tooltip: [{ field: "task_type" }, { aggregate: "count", title: "Sessions" }],
            },
          },
          {
            // write the count on each cell so you don't have to guess from the color
            mark: { type: "text", fontSize: 13 },
            encoding: { text: { aggregate: "count", type: "quantitative" } },
          },
        ],
      },
    ],
  });
});

// vega has its own csv loader so we don't need another library
function loadCsv() {
  return vega.loader().load(DATA_URL).then((text) => vega.read(text, { type: "csv" }));
}
