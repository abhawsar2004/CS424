"""Print the counts and averages used in the Task 2 writeup."""

import csv
from pathlib import Path
from statistics import mean


DATA = Path(__file__).resolve().parents[1] / "data" / "cleaned_data.csv"


def start_minute(time):
    hour, minute, second = map(int, time.split(":"))
    return hour * 60 + minute + second / 60


def average_focus(sessions):
    return "{:.2f}".format(mean(row["focus"] for row in sessions)) if sessions else "—"


def main():
    with DATA.open(encoding="utf-8", newline="") as csv_file:
        sessions = [
            {
                "start": start_minute(row["Start_Time"]),
                "location": row["Location"],
                "noise": row["Noise_Level"],
                "focus": int(row["Focus_Rating"]),
                "distractions": int(row["Num_Distractions"]),
                "first": float(row["Time_to_First_Distraction"]),
                "sleep_filled": row["Sleep_Hours_imputed"].lower() == "true",
            }
            for row in csv.DictReader(csv_file)
        ]

    print("1. Focus by location and time of day")
    for label, start, end in [("Morning", 5 * 60, 12 * 60), ("Afternoon", 12 * 60, 17 * 60)]:
        period = [row for row in sessions if start <= row["start"] < end]
        print(f"  {label}: {len(period)} sessions, average focus {average_focus(period)}")
        for location in ("Home", "Other"):
            matches = [row for row in period if row["location"] == location]
            high_focus = sum(row["focus"] >= 8 for row in matches)
            print(f"    {location}: {high_focus} of {len(matches)} rated 8+")

    print("\n2. Focus and early distractions by noise level")
    for noise in ("Very Quiet", "Quiet", "Moderate", "Noisy"):
        matches = [row for row in sessions if row["noise"] == noise]
        distracted = [row for row in matches if row["distractions"] > 0]
        early = sum(row["first"] <= 10 for row in distracted)
        print(f"  {noise}: {len(matches)} sessions, average focus {average_focus(matches)}, "
              f"{early} of {len(distracted)} distracted by 10 min")
        if noise == "Noisy":
            print("    Locations: " + ", ".join(sorted({row["location"] for row in matches})))

    print("\n3. Average focus by location and number of distractions")
    print("  Location | 0–3 | 4–12 | 13+")
    for location in ("Home", "Other", "Library", "Cafe"):
        matches = [row for row in sessions if row["location"] == location]
        groups = [
            [row for row in matches if row["distractions"] <= 3],
            [row for row in matches if 4 <= row["distractions"] <= 12],
            [row for row in matches if row["distractions"] >= 13],
        ]
        values = [f"{average_focus(group)} ({len(group)})" for group in groups]
        print("  " + " | ".join([location] + values))

    filled = sum(row["sleep_filled"] for row in sessions)
    print(f"\n4. Sleep values filled during cleaning: {filled} of {len(sessions)}")


if __name__ == "__main__":
    main()
