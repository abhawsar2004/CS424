# Analysis

`analyze.py` reads `a3/results/results.csv` and does everything for Task 4:

- Prints accuracy (% correct) and time (mean, median, spread) for static vs interactive, for each study.
- Breaks it down by task, so we can see if one task is doing all the work.
- Shows each person's average time in both versions and counts how many were faster with interactive.
- Saves the tables to `summary.md` so we can copy them into the report.
- Saves 3 charts in `figures/`:
  - `accuracy.png`: % correct for each task, static vs interactive
  - `time.png`: every answer's time as a dot, with a red line for the median
  - `per_participant.png`: each person's average time in both versions, connected with a line

Pilot participants (IDs starting with PILOT) are left out automatically.

## How to run

You need pandas and matplotlib:

```
pip install pandas matplotlib
```

Then from the `CS424` folder:

```
python3 a3/analysis/analyze.py
```

If you don't want to install anything, you can also upload `analyze.py` and `results.csv` to Google Colab, which already has both libraries. Just put `results.csv` where the script expects it (`../results/results.csv` from the script's folder) or change the `RESULTS` line at the top.
