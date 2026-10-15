// cleaned data from the task 2 notebook
const DATA_URL = "../data/cleaned_data.csv";

// "08:30:00" -> 8.5
function toHourOfDay(text) {
  const [h, m] = String(text).split(":").map(Number);
  return h + m / 60;
}

// rename the cleaned columns to the short names the charts already use
function shorten(row, i) {
  const out = {
    session: "S" + (i + 1),
    start_time: row.Start_Time.slice(0, 5),
    task_type: row.Task_Type,
    planned: +row.Planned_Duration,
    planned_imputed: row.Planned_Duration_imputed === "True",
    first_distraction: +row.Time_to_First_Distraction,
    distractions: +row.Num_Distractions,
    focus: +row.Focus_Rating,
    location: row.Location,
    noise: row.Noise_Level,
    people: row.People_Present,
  };
  // 0 distractions means they never got distracted, not distracted at minute 0
  out.no_distraction = out.distractions === 0;
  out.start_hour = toHourOfDay(row.Start_Time);
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
        bind: { input: "select", options: ["All", "Very Quiet", "Quiet", "Moderate", "Noisy"], name: "Noise level: " },
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
        // 80 sessions now so the rows have to be thinner
        height: { step: 8 },
        encoding: {
          y: { field: "session", type: "nominal", scale: { domain: sessionOrder }, axis: { labels: false, ticks: false }, title: "Sessions (sorted by start time)" },
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
            mark: { type: "rule", strokeWidth: 5, color: "#ddd" },
            encoding: { x2: { field: "plan_end" } },
          },
          {
            mark: { type: "rule", strokeWidth: 5 },
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
