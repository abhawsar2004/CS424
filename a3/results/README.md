# Study results

`results.csv` has one row per participant per question. Each participant does both studies, so they'll have 8 rows (4 for each study). Participants are only identified by an ID like P01, no names.

| Column | What it means |
|---|---|
| `participant_id` | Anonymous ID, like P01. Pilot participants use PILOT1, PILOT2 and aren't counted. |
| `study` | `angela` (first distraction by task type) or `amithi` (focus by location across the day) |
| `order` | `static_first` or `interactive_first` |
| `condition` | `static` or `interactive`, the version used for this question |
| `task` | Which analytical task (T1, T2, ...) |
| `variant` | Which version of the task (A or B) |
| `answer` | What the participant answered |
| `correct` | 1 if correct, 0 if wrong, timed out, or skipped |
| `time_seconds` | Seconds from reading the question to giving the answer |
| `notes` | Anything we noticed, like confusion with a control |
