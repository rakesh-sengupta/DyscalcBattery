# Changelog

## v1.1.0 — 2026-11-23

Field-usability and correctness release after an audit of v1.0.0.

### Fixed
- **Counterbalancing was not applied.** v1.0 recorded the order group but always ran Visit 2 in the order Dots → Objects → Shapes → Colours. The order is now applied, and assigned automatically from the participant number (1→A, 2→B, 3→C, 4→D, …).
- **All data were lost if a session did not finish.** v1.0 saved only at the very end. Every trial is now written to the laptop's browser storage as it happens; unfinished sessions can be downloaded from the setup screen.
- **Double prefix in file names.** Entering `WRG_001` as the ID produced `WRG_WRG_001_<date>.csv`. The collector now types only the number; the ID and file name are built automatically.
- **Timeouts and "skip" were scored as errors.** No-response trials (Tasks 3–7) and "Not sure" in dot enumeration are now `correct = NA`, `timed_out = 1`, instead of `correct = 0`, which biased accuracy and Weber fractions.
- **Early answers were ignored.** In Tasks 4–7, key presses during the array and mask were discarded and the child had to press again. Answers are now accepted from array onset (RT from onset).
- **Recorded ratio differed from the ratio shown.** Rounding makes the nominal "1.4" trials 22/16 = 1.375 and 16/11 = 1.455. The CSV now has `ratio_actual` (and `n_left`, `n_right`) alongside `ratio_nominal`.
- **README listed files that did not exist** (`docs/`, `analysis/fit_weber.R`, `group_compare.R`, `example_data/`) and gave a Weber equation that is accurate only near ratio 1. The analysis script now exists and uses the standard model.
- **CITATION.cff was invalid** (`date-released: 2026-XX-XX`, placeholder DOIs), which breaks GitHub's "Cite this repository".
- Practice-round repetition described in the field handbook (below 75% → repeat) is now implemented.

### Changed (simpler for data collectors)
- **No internet needed.** jsPsych 7.3.4 is bundled into the HTML file instead of loaded from unpkg.com.
- **Plain setup screen** replaces the jsPsych form and 10-button menu: two big buttons (Visit 1, Visit 2); single tasks, all-in-one and order override are under "Advanced". Initials and school code are remembered between children.
- **Error prevention:** required fields are checked with plain-language messages; consent-on-file and child-assent boxes must be ticked; a warning appears if the same participant number was already run on that laptop; a device check reports screen size, colour-emoji support and autosave.
- **Emergency stop** (Shift + Q) saves and ends the session; closing the tab mid-session asks for confirmation.
- **Experimenter scripts:** every task opens with a "Say to the child" box and a note on who presses what. All text is in one `TEXT` block for translation.
- **Training mode** runs short versions for practising, with files named `DEMO_…`; the analysis script skips them.
- **One row per trial** in the CSV with a fixed column set (fixation, instruction and mask screens are no longer rows).
- **Dot enumeration timing:** by default the child presses SPACE when they know the number (removes the experimenter's own reaction time from the RT). Set `dotEnumTiming: 'experimenter'` to restore v1.0 behaviour.
- Arrow keys work as well as F/J; on-screen key guides show which key is which side.
- Response cap of 8 s per trial so a disengaged child cannot stall a session.

### Changed (stimuli)
- **Size/area control** in Tasks 4–6: half the trials keep item size constant, half keep total area constant (`size_control` column). In v1.0 dot size was constant, so total area grew with number and children could answer from area alone.
- Shapes now have equal area across shape types (v1.0 triangles had about one third the area of squares).
- **Colour palette** for Task 7 replaced with 10 maximally distinct colours; v1.0 included near-duplicates (red / deep orange / pink, blue / indigo, green / light green), which made "how many colours" partly a colour-discrimination test.
- Item placement retries until every item fits, and records `items_drawn_ok`.
- Simple RT: anticipatory presses (before or <100 ms after the dot) are now recorded (`anticipation`) instead of silently ignored.

### Added
- `analysis/fit_weber.R` (base R), `docs/field_guide.md`, `tests/smoke_test.py`, `src/` + `build.py` for maintainers.
