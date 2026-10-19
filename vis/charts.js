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
  const data = rows.map(shorten);

  // task 6 iteration 1: stack sessions that have the same place + focus so none are hidden
  const seen = {};
  data.forEach((d) => {
    const key = d.location + "|" + d.focus;
    d.stack = seen[key] || 0;
    seen[key] = d.stack + 1;
    // 3 groups instead of a 0-50 color scale, one 50-distraction session was washing everything out
    d.distraction_group = d.distractions <= 3 ? "0-3" : d.distractions <= 12 ? "4-12" : "13+";
  });
  const maxStack = Math.max(...data.map((d) => d.stack));

  // task 6 iteration 2: 3 hour blocks for the median line on the time of day chart
  data.forEach((d) => (d.time_block = Math.floor(d.start_hour / 3) * 3 + 1.5));

  // fixed lists for the axes so rows don't jump around when you filter
  const taskTypes = [...new Set(data.map((d) => d.task_type))].sort();
  const placeCounts = {};
  data.forEach((d) => (placeCounts[d.location] = (placeCounts[d.location] || 0) + 1));
  const places = Object.keys(placeCounts).sort((a, b) => placeCounts[b] - placeCounts[a]);

  // all three charts are in one spec so they can talk to each other
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
    resolve: { scale: { color: "independent", yOffset: "independent" } },
    spacing: 40,
    vconcat: [
      // time of day vs how fast the first distraction came. drag across it to pick a time range
      // the line is the median for each 3 hour block
      {
        title: "How soon the first distraction came, by time of day (drag to select)",
        width: 700,
        height: 260,
        transform: [{ filter: "!datum.no_distraction" }],
        encoding: {
          x: {
            field: "start_hour",
            type: "quantitative",
            scale: { domain: [0, 24] },
            axis: { values: [0, 3, 6, 9, 12, 15, 18, 21, 24], title: "Session start time (hour, 24h clock)" },
          },
        },
        layer: [
          {
            // the drag selection lives here, the other charts read it
            params: [{ name: "timeBrush", select: { type: "interval", encodings: ["x"] } }],
            mark: { type: "circle", size: 70, opacity: 0.8 },
            encoding: {
              y: { field: "first_distraction", type: "quantitative", scale: { domain: [0, 50] }, title: "Minutes to first distraction" },
              color: { field: "focus", type: "quantitative", title: "Focus (1-10)", scale: { scheme: "blues", domain: [1, 10] } },
              tooltip: [
                { field: "session" },
                { field: "task_type" },
                { field: "start_time", title: "start" },
                { field: "first_distraction", title: "first distraction (min)" },
                { field: "focus" },
              ],
            },
          },
          {
            // only draw the median for blocks with at least 3 sessions, one session isn't a pattern
            transform: [
              { joinaggregate: [{ op: "count", as: "block_n" }], groupby: ["time_block"] },
              { filter: "datum.block_n >= 3" },
            ],
            mark: { type: "line", color: "#e45756", strokeWidth: 2, point: { color: "#e45756" } },
            encoding: {
              x: { field: "time_block", type: "quantitative" },
              y: { aggregate: "median", field: "first_distraction", type: "quantitative" },
              tooltip: [{ aggregate: "median", field: "first_distraction", title: "median (min)" }, { aggregate: "count", title: "sessions" }],
            },
          },
        ],
      },

      // one dot per session, grouped by location, same place + focus stack up instead of overlapping
      // sessions outside the selected time range fade out
      {
        title: "Focus by location (one dot per session)",
        width: 700,
        height: { step: 14 + maxStack * 8 },
        mark: { type: "circle", size: 60 },
        encoding: {
          y: { field: "location", type: "nominal", scale: { domain: places }, title: null },
          yOffset: { field: "stack", type: "quantitative", scale: { domain: [-1, maxStack + 1], reverse: true } },
          x: { field: "focus", type: "quantitative", scale: { domain: [0.5, 10.5] }, axis: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] }, title: "Focus rating (1-10)" },
          color: {
            field: "distraction_group",
            type: "ordinal",
            title: "Distractions",
            scale: { domain: ["0-3", "4-12", "13+"], range: ["#c6dbef", "#6baed6", "#08519c"] },
          },
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
