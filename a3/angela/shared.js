// Shared by the static and interactive versions so both use the exact same data and dot layout.
// Question: does the kind of task change how long people stay focused before the first distraction?

const DATA_URL = "../../../data/cleaned_data.csv";

// Rows, largest group first. "Other" (3 sessions) is left out: too small to compare.
const TASKS = ["Studying", "Homework/Assignments", "Reading", "Writing", "Meeting"];
const BIN = 5;          // 5-minute bins: 0-4, 5-9, 10-14, ...
const PER_ROW = 4;      // dots per level inside a bin
const MAX_MIN = 50;

const IN_WINDOW = "isValid(win) && isValid(win.x) && datum.bin + 2.5 >= win.x[0] && datum.bin + 2.5 <= win.x[1]";
const WINDOW_TEXT =
  "isValid(win) && isValid(win.x) && floor((win.x[1] - 2.5) / 5) >= ceil((win.x[0] - 2.5) / 5)" +
  " ? 'Window: ' + ceil((win.x[0] - 2.5) / 5) * 5 + '-' + (floor((win.x[1] - 2.5) / 5) * 5 + 4) + ' minutes'" +
  " : 'No window selected yet'";

const ROW_STEP = 76;    // px per task row (same in both views so rows line up)
const STRIP_WIDTH = 720;

function prepare(rows) {
  // Keep only sessions that actually had a distraction (3 sessions had none, so no time exists)
  const sessions = rows
    .filter((r) => +r.Num_Distractions > 0 && TASKS.includes(r.Task_Type))
    .map((r) => ({
      task: r.Task_Type,
      minutes: +r.Time_to_First_Distraction,
      bin: Math.floor(+r.Time_to_First_Distraction / BIN) * BIN,
      focus: +r.Focus_Rating,
      location: r.Location,
      start: r.Start_Time,
    }));

  const totals = {};
  TASKS.forEach((t) => (totals[t] = sessions.filter((s) => s.task === t).length));

  // Lay dots out in a small grid inside each 5-minute bin so every session is visible and countable
  const groups = {};
  sessions
    .sort((a, b) => a.minutes - b.minutes)
    .forEach((s) => {
      const key = s.task + "|" + s.bin;
      const i = (groups[key] = (groups[key] || 0) + 1) - 1;
      s.x = s.bin + 0.75 + (i % PER_ROW) * 1.15;
      s.level = Math.floor(i / PER_ROW);
      s.n = totals[s.task];
      s.row = `${s.task} (n=${s.n})`;
      s.bin_label = `${s.bin}-${s.bin + BIN - 1} min`;
    });

  // One label per bin: how many sessions are in it, placed just above the stack
  const labels = Object.entries(groups).map(([key, k]) => {
    const [task, bin] = key.split("|");
    return {
      task,
      row: `${task} (n=${totals[task]})`,
      x: +bin + 2.5,
      level: Math.ceil(k / PER_ROW),
      count: k,
    };
  });

  const rowOrder = TASKS.map((t) => `${t} (n=${totals[t]})`);
  return { sessions, labels, totals, rowOrder };
}

// The dot strip. `brush` = true adds the drag-to-select window (interactive version only).
function stripSpec({ sessions, labels, rowOrder }, brush) {
  const y = { field: "row", type: "nominal", sort: rowOrder, title: null, axis: { labelFontSize: 12, labelFontWeight: "bold", labelPadding: 8 } };
  const yOffset = { field: "level", type: "quantitative", scale: { domain: [-1.6, 4.6], reverse: true } };
  const x = {
    field: "x",
    type: "quantitative",
    scale: { domain: [0, MAX_MIN], nice: false },
    axis: { values: d3range(0, MAX_MIN + 1, BIN), grid: true, gridColor: "#d0d0d0", title: "Minutes until first distraction (5-minute bins)" },
  };

  const dots = {
    data: { values: sessions },
    mark: { type: "circle", size: 85, opacity: 1, stroke: "white", strokeWidth: 0.8 },
    encoding: {
      x, y, yOffset,
      tooltip: [
        { field: "task", title: "Task" },
        { field: "minutes", title: "First distraction (min)" },
        { field: "focus", title: "Focus (1-10)" },
        { field: "location", title: "Location" },
        { field: "start", title: "Start time" },
      ],
    },
  };

  if (!brush) delete dots.encoding.tooltip; // static = no interaction at all

  if (brush) {
    dots.params = [{ name: "win", select: { type: "interval", encodings: ["x"], clear: "dblclick" } }];
    // a whole bin is in the window when its centre is inside the brush, so bins are never split
    dots.encoding.color = { condition: { test: IN_WINDOW, value: "#1f5fa8" }, value: "#c3ccd8" };
  } else {
    dots.encoding.color = { value: "#1f5fa8" };
  }

  const counts = {
    data: { values: labels },
    mark: { type: "text", fontSize: 10, color: "#555", dy: 2 },
    encoding: { x: { field: "x", type: "quantitative" }, y, yOffset, text: { field: "count" } },
  };

  return {
    width: STRIP_WIDTH,
    height: { step: ROW_STEP },
    title: {
      text: "When does the first distraction happen, by task type?",
      subtitle: brush
        ? "One dot per session. Drag across the chart to pick a time window; double-click to clear."
        : "One dot per session. The number above each stack is how many sessions fall in that 5-minute bin.",
      anchor: "start",
    },
    layer: [dots, counts],
  };
}

function d3range(a, b, s) {
  const out = [];
  for (let v = a; v < b; v += s) out.push(v);
  return out;
}

function loadData() {
  return vega.loader().load(DATA_URL).then((text) => prepare(vega.read(text, { type: "csv" })));
}
