import pandas as pd

CSV_PATH = "/Users/angelageorge/Desktop/CS424/data/cleaned_data.csv"  # change to your own path
TASKS = ["Studying", "Homework/Assignments", "Reading", "Writing", "Meeting"]

df = pd.read_csv(CSV_PATH)

# keep sessions that had a distraction, and the five main task types
df = df[(df["Num_Distractions"] > 0) & (df["Task_Type"].isin(TASKS))].copy()

df["minutes"] = df["Time_to_First_Distraction"].astype(float)
df["bin"] = (df["minutes"] // 5 * 5).astype(int)   # 5-minute bins

# place dots in a small grid inside each bin (4 per level)
df = df.sort_values("minutes", kind="stable")
i = df.groupby(["Task_Type", "bin"]).cumcount()
df["x"] = df["bin"] + 0.75 + (i % 4) * 1.15
df["level"] = i // 4

df["n"] = df.groupby("Task_Type")["Task_Type"].transform("size")
df["row"] = df["Task_Type"] + " (n=" + df["n"].astype(str) + ")"
df["task_order"] = df["Task_Type"].map({t: k for k, t in enumerate(TASKS)})

cols = ["Task_Type", "row", "task_order", "minutes", "bin", "x", "level", "n",
        "Focus_Rating", "Location", "Start_Time"]
return df[cols].reset_index(drop=True)