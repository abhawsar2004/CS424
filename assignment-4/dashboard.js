const DATA_URL = "../data/cleaned_data.csv";
const DAY = 24 * 60;
const LOCATIONS = ["Home", "Other", "Library", "Cafe"];
const NOISE_LEVELS = ["Very Quiet", "Quiet", "Moderate", "Noisy"];
const RATINGS = Array.from({ length: 10 }, (_, index) => index + 1);
const DEFAULT_RANGES = { a: [5 * 60, 12 * 60], b: [12 * 60, 17 * 60] };

const byId = (id) => document.getElementById(id);
const percent = (part, whole) => `${part / whole * 100}%`;
const rangeName = (key) => `Range ${key.toUpperCase()}`;
const sessionCount = (count) => `${count} session${count === 1 ? "" : "s"}`;

// Some form answers have commas inside quotes.
function parseCsv(text) {
  const records = text.replace(/^\uFEFF/, "").match(/(?:"(?:[^"]|"")*"|[^"\r\n])+/g) ?? [];
  const field = /,(?:"((?:[^"]|"")*)"|([^,]*))/g;
  const rows = records.map((record) => Array.from(`,${record}`.matchAll(field), (match) =>
    match[1] === undefined ? match[2] : match[1].replace(/""/g, '"')
  ));
  const [header, ...values] = rows;
  return values.map((row) => Object.fromEntries(header.map((name, index) => [name, row[index]])));
}

function toMinute(time) {
  const [hour, minute, second = 0] = time.split(":").map(Number);
  return hour * 60 + minute + second / 60;
}

function toInputTime(minute) {
  const hour = Math.floor(minute / 60) % 24;
  return `${String(hour).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

function formatTime(minute) {
  const hour = Math.floor(minute / 60) % 24;
  const minutes = String(Math.floor(minute % 60)).padStart(2, "0");
  return `${hour % 12 || 12}:${minutes} ${hour < 12 ? "AM" : "PM"}`;
}

function cleanRow(row) {
  return {
    start: toMinute(row.Start_Time),
    firstDistraction: Number(row.Time_to_First_Distraction),
    distractions: Number(row.Num_Distractions),
    focus: Number(row.Focus_Rating),
    location: row.Location,
    noise: row.Noise_Level,
  };
}

// Split overnight ranges so the shading and filter match.
function rangeSegments([start, end]) {
  if (start === end) return [[0, DAY]];
  return start < end ? [[start, end]] : [[start, DAY], [0, end]];
}

function inRange(session, range) {
  return rangeSegments(range).some(([start, end]) => session.start >= start && session.start < end);
}

function cell(className, text = "") {
  const element = document.createElement("span");
  element.className = className;
  element.textContent = text;
  return element;
}

function setupDashboard(sessions) {
  const ranges = { ...DEFAULT_RANGES };
  const locations = [...new Set([...LOCATIONS, ...sessions.map((session) => session.location)])];
  const cards = {};
  const plot = byId("timeline-plot");
  const noise = byId("noise");
  const brushRadios = [...document.querySelectorAll('input[name="brush-range"]')];
  let filtered = sessions;
  let drag = null;

  for (const level of new Set([...NOISE_LEVELS, ...sessions.map((session) => session.noise)])) {
    if (sessions.some((session) => session.noise === level)) noise.add(new Option(level, level));
  }

  for (const key of Object.keys(ranges)) {
    const card = byId("range-template").content.firstElementChild.cloneNode(true);
    card.dataset.range = key;
    card.querySelector(".range-letter").textContent = key.toUpperCase();
    const title = card.querySelector("h3");
    title.id = `range-${key}-title`;
    title.textContent = rangeName(key);
    card.setAttribute("aria-labelledby", title.id);

    const startInput = card.querySelector(".range-start");
    const endInput = card.querySelector(".range-end");
    startInput.setAttribute("aria-label", `${rangeName(key)} start time`);
    endInput.setAttribute("aria-label", `${rangeName(key)} end time`);
    for (const input of [startInput, endInput]) {
      input.addEventListener("change", () => {
        if (startInput.value && endInput.value) {
          ranges[key] = [toMinute(startInput.value), toMinute(endInput.value)];
          renderComparison();
        } else {
          syncInputs(key);
        }
      });
    }
    cards[key] = { card, startInput, endInput };
    byId("range-cards").append(card);
    syncInputs(key);
  }

  function syncInputs(key) {
    const [start, end] = ranges[key];
    cards[key].startInput.value = toInputTime(start);
    cards[key].endInput.value = toInputTime(end);
  }

  // Use the tallest dot stack to set the row height in both cards.
  function renderComparison() {
    const selected = Object.entries(ranges).map(([key, range]) => {
      const matching = filtered.filter((session) => inRange(session, range));
      const groups = new Map(locations.map((location) => [location, RATINGS.map(() => [])]));
      for (const session of matching) groups.get(session.location)[session.focus - 1].push(session);
      return { key, range, matching, groups };
    });
    const maxStack = Math.max(0, ...selected.flatMap(({ groups }) =>
      [...groups.values()].flatMap((ratingGroups) => ratingGroups.map((stack) => stack.length))
    ));
    const rowHeight = `${Math.max(27, maxStack * 7 + 5)}px`;

    for (const { key, range, matching, groups } of selected) {
      const { card } = cards[key];
      const mean = matching.length && (matching.reduce((sum, session) => sum + session.focus, 0) / matching.length).toFixed(1);
      const countLabel = card.querySelector(".range-count");
      countLabel.textContent = sessionCount(matching.length);
      if (range[0] === range[1]) countLabel.append(" · All day");
      const meanLabel = card.querySelector(".range-mean");
      meanLabel.textContent = matching.length ? `Average focus ${mean}/10` : "Average focus —";
      card.querySelector(".range-empty").hidden = matching.length > 0;
      card.style.setProperty("--row-height", rowHeight);

      const rows = [...groups].map(([location, ratingGroups]) => {
        const row = document.createElement("div");
        row.className = "location-row";
        const label = cell("location-label", location);
        const count = document.createElement("b");
        const locationCount = ratingGroups.reduce((total, stack) => total + stack.length, 0);
        count.textContent = locationCount;
        count.setAttribute("aria-label", sessionCount(locationCount));
        label.append(count);

        const cells = cell("rating-cells");
        cells.setAttribute("role", "img");
        const counts = ratingGroups.flatMap((stack, index) => stack.length ? [`${index + 1} out of 10: ${sessionCount(stack.length)}`] : []);
        cells.setAttribute("aria-label", counts.length ? counts.join(", ") : "No ratings");
        for (const stack of ratingGroups) {
          const ratingCell = cell("rating-cell");
          for (const session of stack) {
            const bucket = session.distractions <= 3 ? "low" : session.distractions <= 12 ? "middle" : "high";
            const dot = cell(`location-dot ${bucket}`);
            dot.title = `${session.location} · ${formatTime(session.start)} · Focus ${session.focus}/10 · ${session.distractions} distractions`;
            ratingCell.append(dot);
          }
          cells.append(ratingCell);
        }
        row.append(label, cells);
        return row;
      });
      card.querySelector(".location-rows").replaceChildren(...rows);
    }
    byId("comparison-status").textContent = selected.map(({ key, matching }) =>
      `${rangeName(key)} has ${sessionCount(matching.length)}.`
    ).join(" ");
    renderWindows();
  }

  const maxDistraction = Math.max(10, Math.ceil(Math.max(...sessions.map((session) => session.firstDistraction)) / 10) * 10);
  for (let value = 0; value <= maxDistraction; value += maxDistraction / 5) {
    const label = cell("", value);
    const line = cell("timeline-gridline");
    for (const element of [label, line]) element.style.setProperty("--top", percent(maxDistraction - value, maxDistraction));
    byId("timeline-y").append(label);
    byId("timeline-grid").append(line);
  }

  function renderTimeline() {
    const distracted = filtered.filter((session) => session.distractions > 0);
    const dots = distracted.map((session) => {
      const dot = cell("timeline-dot");
      dot.style.setProperty("--left", percent(session.start, DAY));
      dot.style.setProperty("--top", percent(maxDistraction - session.firstDistraction, maxDistraction));
      dot.style.setProperty("--color", `color-mix(in srgb, #4c2d96 ${percent(session.focus - 1, 9)}, #e3d9f9)`);
      dot.title = `${formatTime(session.start)} · ${session.firstDistraction} min to first distraction · Focus ${session.focus}/10`;
      return dot;
    });
    byId("timeline-points").replaceChildren(...dots);
    byId("timeline-empty").hidden = distracted.length > 0;
    byId("timeline-count").textContent = `${distracted.length} of ${sessionCount(filtered.length)} had a distraction`;
  }

  function renderWindows() {
    const windows = Object.entries(ranges).flatMap(([key, range]) => {
      const chosen = drag?.key === key ? drag.range : range;
      return rangeSegments(chosen).filter(([start, end]) => end > start).map(([start, end]) => {
        const window = cell("timeline-window");
        window.dataset.range = key;
        window.style.setProperty("--left", percent(start, DAY));
        window.style.setProperty("--width", percent(end - start, DAY));
        return window;
      });
    });
    byId("timeline-windows").replaceChildren(...windows);
  }

  function pointerMinute(event) {
    const { left, width } = plot.getBoundingClientRect();
    const minute = (event.clientX - left) / width * DAY;
    return Math.min(DAY, Math.max(0, Math.round(minute / 15) * 15));
  }

  plot.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0) return;
    const start = pointerMinute(event);
    const key = brushRadios.find((radio) => radio.checked).value;
    drag = { key, start, range: ranges[key] };
    plot.setPointerCapture(event.pointerId);
  });

  function updateDrag(event) {
    const end = pointerMinute(event);
    return [Math.min(drag.start, end), Math.max(drag.start, end)];
  }

  plot.addEventListener("pointermove", (event) => {
    if (!drag || !event.isPrimary) return;
    const [start, end] = updateDrag(event);
    drag.range = start === end ? ranges[drag.key] : [start, end];
    renderWindows();
  });

  plot.addEventListener("pointerup", (event) => {
    if (!drag || !event.isPrimary) return;
    const { key } = drag;
    const [start, end] = updateDrag(event);
    drag = null;
    if (start === end) {
      renderWindows();
      return;
    }
    ranges[key] = [start, end % DAY];
    syncInputs(key);
    renderComparison();
  });

  plot.addEventListener("lostpointercapture", () => {
    if (!drag) return;
    drag = null;
    renderWindows();
  });

  function applyNoise() {
    filtered = noise.value ? sessions.filter((session) => session.noise === noise.value) : sessions;
    renderTimeline();
    renderComparison();
  }

  noise.addEventListener("change", applyNoise);
  byId("reset").addEventListener("click", () => {
    for (const key of Object.keys(ranges)) {
      ranges[key] = DEFAULT_RANGES[key];
      syncInputs(key);
    }
    brushRadios[0].checked = true;
    noise.value = "";
    applyNoise();
  });

  byId("dataset-size").textContent = `${sessionCount(sessions.length)} recorded`;
  noise.disabled = false;
  applyNoise();
  byId("load-status").hidden = true;
  byId("dashboard").hidden = false;
}

async function loadDashboard() {
  try {
    const response = await fetch(DATA_URL);
    if (!response.ok) throw new Error(`Data request returned ${response.status}`);
    const sessions = parseCsv(await response.text()).map(cleanRow);
    if (!sessions.length) throw new Error("No sessions in the CSV");
    setupDashboard(sessions);
  } catch (error) {
    console.error(error);
    byId("load-status").textContent = "Couldn't load the session data. Start the local server from the repository root and reload.";
  }
}

loadDashboard();
