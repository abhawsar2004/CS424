# rechecks the expected answers for the time of day + location tasks
# plain python so it runs without pandas
import csv
import os

HERE = os.path.dirname(os.path.abspath(__file__))
DATA = os.path.join(HERE, "..", "..", "data", "cleaned_data.csv")

with open(DATA, encoding="utf-8") as f:
    rows = list(csv.DictReader(f))


def hour(text):
    h, m, _ = text.split(":")
    return int(h) + int(m) / 60


# same cutoffs as the static panels
def period(row):
    h = hour(row["Start_Time"])
    if 5 <= h < 12:
        return "morning"
    if 12 <= h < 17:
        return "afternoon"
    if 17 <= h < 21:
        return "evening"
    return "night"


def count(location, periods, test):
    return sum(1 for r in rows if r["Location"] == location and period(r) in periods and test(r))


many_distractions = lambda r: float(r["Num_Distractions"]) >= 13
low_focus = lambda r: float(r["Focus_Rating"]) <= 5
high_focus = lambda r: float(r["Focus_Rating"]) >= 8
places = ["Home", "Other", "Library", "Cafe"]

print("T1-A Home, 13+ distractions:", "morning", count("Home", ["morning"], many_distractions),
      "afternoon", count("Home", ["afternoon"], many_distractions))
print("T1-B Other, 13+ distractions:", "morning", count("Other", ["morning"], many_distractions),
      "afternoon", count("Other", ["afternoon"], many_distractions))
print("T2-A 5 AM-5 PM, focus <= 5:", {p: count(p, ["morning", "afternoon"], low_focus) for p in places})
print("T2-B 12 PM-9 PM, focus >= 8:", {p: count(p, ["afternoon", "evening"], high_focus) for p in places})
