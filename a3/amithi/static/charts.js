// same cleaned data as the interactive one
const DATA_URL = "../../../data/cleaned_data.csv";

function toHour(text) {
  const [h, m] = text.split(":").map(Number);
  return h + m / 60;
}

// night wraps around midnight
function getPeriod(hour) {
  if (hour >= 5 && hour < 12) return "Morning (5 AM-12 PM)";
  if (hour >= 12 && hour < 17) return "Afternoon (12-5 PM)";
  if (hour >= 17 && hour < 21) return "Evening (5-9 PM)";
  return "Night (9 PM-5 AM)";
}

function cleanRow(row) {
  const distractions = +row.Num_Distractions;
  const start_hour = toHour(row.Start_Time);
  return {
    start_hour,
    period: getPeriod(start_hour),
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

  // no tooltips or dragging here, everything has to be readable as is
  vegaEmbed(
    "#vis",
    {
      $schema: "https://vega.github.io/schema/vega-lite/v5.json",
      data: { values: data },
      resolve: { scale: { color: "independent" } },
      spacing: 40,
      vconcat: [
        {
          title: "First distraction by time of day",
          width: 700,
          height: 220,
          transform: [{ filter: "!datum.no_distraction" }],
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

        // one panel per time of day instead of dragging
        {
          title: "Focus by location, split by time of day (one dot per session)",
          transform: [{ window: [{ op: "row_number", as: "stack" }], groupby: ["period", "location", "focus"] }],
          facet: {
            field: "period",
            type: "nominal",
            title: null,
            sort: ["Morning (5 AM-12 PM)", "Afternoon (12-5 PM)", "Evening (5-9 PM)", "Night (9 PM-5 AM)"],
          },
          columns: 2,
          spec: {
            width: 340,
            height: { step: 60 },
            mark: { type: "circle", size: 50 },
            encoding: {
              y: { field: "location", type: "nominal", scale: { domain: ["Home", "Other", "Library", "Cafe"] }, title: null },
              yOffset: { field: "stack", type: "quantitative", scale: { domain: [0, 8], reverse: true } },
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
        },
      ],
    },
    { actions: false }
  );
});
