# FocusTrace
FocusTrace is a self-observed dataset built around everyday focus sessions — studying, working, reading, or any sustained-attention task. Participants record when the first distraction hits, how many distractions follow, and how that compares across task type, environment, sleep the night before, phone use earlier in the day, caffeine intake, and any focus strategy used during the session. Pairing a measurable attention proxy (time to first distraction) with these everyday factors lets us explore whether certain environments, strategies, or habits correlate with longer sustained focus.

## Assignment 2: How to run the visualization

The charts are a web page built with Vega-Lite. You only need Python 3 (to run a small local server) and a browser.

1. Open a terminal in this repo's folder.
2. Start a local server:

   ```bash
   python3 -m http.server 8424
   ```

3. Open http://localhost:8424/vis/index.html in your browser.

Opening `index.html` by double-clicking it won't work, because the browser blocks the page from loading the CSV file that way.

What's where:

- `data/form_responses.csv`: the original responses from our Google Form, not edited.
- `data/cleaned_data.csv`: the cleaned data from `notebooks/Task2_DataCleaning.ipynb`. The charts use this file.
- `vis/index.html` and `vis/charts.js`: the visualization code.
- `vis/screenshots/`: screenshots of the charts at different stages.
- [`Assignment2.md`](Assignment2.md): the Assignment 2 writeup, organized by Tasks 1-7.
