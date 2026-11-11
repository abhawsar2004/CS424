// same cleaned data as a2
const DATA_URL = "../../../data/cleaned_data.csv";

function toHour(text) {
  const [h, m] = text.split(":").map(Number);
  return h + m / 60;
}

function cleanRow(row) {
  const distractions = +row.Num_Distractions;
  return {
    start_hour: toHour(row.Start_Time),
    first_distraction: +row.Time_to_First_Distraction,
    distractions,
    no_distraction: distractions === 0,
    focus: +row.Focus_Rating,
    location: row.Location,
    distraction_group: distractions <= 3 ? "0-3" : distractions <= 12 ? "4-12" : "13+",
  };
}

vega.loader().load(DATA_URL).then((text) => {
  const data = vega.read(text, { type: "csv" }).map(cleanRow);

  vegaEmbed("#vis", {
    $schema: "https://vega.github.io/schema/vega-lite/v5.json",
    data: { values: data },
    resolve: { scale: { color: "independent" } },
    spacing: 40,
    vconcat: [
      // drag on this one to pick a time of day
      {
        title: "First distraction by time of day (drag to select)",
        width: 700,
        height: 220,
        transform: [{ filter: "!datum.no_distraction" }],
        params: [{ name: "timeBrush", select: { type: "interval", encodings: ["x"] } }],
        mark: { type: "circle", size: 70, opacity: 0.8 },
        encoding: {
          x: {
            field: "start_hour",
            type: "quantitative",
            scale: { domain: [0, 24] },
            axis: { values: [0, 3, 6, 9, 12, 15, 18, 21, 24] },
            title: "Session start time (24h clock)",
          },
          y: { field: "first_distraction", type: "quantitative", scale: { domain: [0, 50] }, title: "Minutes to first distraction" },
          color: { field: "focus", type: "quantitative", title: "Focus (1-10)", scale: { scheme: "blues", domain: [1, 10] } },
        },
      },

      // only shows what's selected, dots re-stack so you can still count them
      {
        title: "Focus by location (one dot per session)",
        width: 700,
        height: { step: 90 },
        transform: [
          { filter: { param: "timeBrush" } },
          { window: [{ op: "row_number", as: "stack" }], groupby: ["location", "focus"] },
        ],
        mark: { type: "circle", size: 60 },
        encoding: {
          y: { field: "location", type: "nominal", scale: { domain: ["Home", "Other", "Library", "Cafe"] }, title: null },
          yOffset: { field: "stack", type: "quantitative", scale: { domain: [0, 11], reverse: true } },
          x: {
            field: "focus",
            type: "quantitative",
            scale: { domain: [0.5, 10.5] },
            axis: { values: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
            title: "Focus rating (1-10)",
          },
          color: {
            field: "distraction_group",
            type: "ordinal",
            title: "Distractions",
            scale: { domain: ["0-3", "4-12", "13+"], range: ["#c6dbef", "#6baed6", "#08519c"] },
          },
        },
      },
    ],
  });
});
