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
  const data = rows.map(shorten);

  // chart 1: one circle per session, grouped by location
  vegaEmbed("#vis1", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    width: 600,
    mark: { type: "circle", size: 150 },
    encoding: {
      y: { field: "location", type: "nominal", sort: "-x", title: null },
      x: { field: "focus", type: "quantitative", scale: { domain: [0, 10] }, title: "Focus rating (1-10)" },
      color: { field: "distractions", type: "quantitative", title: "Distractions" },
      tooltip: [{ field: "location" }, { field: "focus" }, { field: "distractions" }, { field: "noise" }],
    },
  });

  // chart 2: heatmap, how soon the first distraction hits for each task type
  // sessions with no distraction are left out since they don't have a time
  const distracted = data.filter((d) => !d.no_distraction);
  vegaEmbed("#vis2", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: distracted },
    width: 500,
    height: { step: 40 },
    encoding: {
      x: { field: "first_distraction", type: "quantitative", bin: { step: 10 }, title: "Minutes to first distraction" },
      y: { field: "task_type", type: "nominal", title: null },
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
  });

  // chart 3: timeline over the day
  // grey bar = how long they planned to work, colored part = time until first distraction
  const timeline = data.map((d) => ({
    ...d,
    plan_end: Math.min(d.start_hour + d.planned / 60, 24),
    distraction_at: d.no_distraction ? null : d.start_hour + d.first_distraction / 60,
  }));
  vegaEmbed("#vis3", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: timeline },
    width: 700,
    height: { step: 18 },
    encoding: {
      y: { field: "session", type: "nominal", sort: { field: "start_hour" }, title: "Session (sorted by start time)" },
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
      { mark: { type: "rule", strokeWidth: 8, color: "#ddd" }, encoding: { x2: { field: "plan_end" } } },
      {
        mark: { type: "rule", strokeWidth: 8 },
        encoding: {
          x2: { field: "distraction_at" },
          color: { field: "focus", type: "quantitative", title: "Focus (1-10)", scale: { scheme: "blues" } },
        },
      },
    ],
  });
});

// vega has its own csv loader so we don't need another library
function loadCsv() {
  return vega.loader().load(DATA_URL).then((text) => vega.read(text, { type: "csv" }));
}
