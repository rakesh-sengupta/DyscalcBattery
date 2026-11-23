# DyscalcBattery

**An open browser-based psychophysical battery for dyscalculia screening and numerosity perception research.**

[![DOI](https://zenodo.org/badge/1239378402.svg)](https://doi.org/10.5281/zenodo.20195178)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![jsPsych](https://img.shields.io/badge/built%20with-jsPsych%207.3.4-blueviolet.svg)](https://www.jspsych.org/)

> Maintained by [Rakesh Sengupta](https://krea.edu.in/sias/dr-rakesh-sengupta/), Computational Cognition Laboratory, School of Interwoven Arts and Sciences, Krea University, Sri City, Andhra Pradesh, India.

---

## What this is

DyscalcBattery is a single-file, browser-based battery of seven psychophysical tasks for:

- **Screening** school-age children for developmental dyscalculia
- **Measuring** the cognitive substrates of numerosity perception (Weber fractions, subitizing slopes, distance effects)
- **Comparing** numerical and non-numerical quantity processing across formats (digits, dots, objects, shapes, colours)

It runs in a web browser, needs no installation and **no internet connection** (jsPsych is bundled inside the file), saves every trial to the laptop as it goes, and exports one CSV row per trial.

It is designed for **field deployment by data collectors who are not programmers**, in schools without reliable internet or power.

---

## Quick start (data collectors)

1. Copy [`dyscalculia_battery.html`](dyscalculia_battery.html) to the laptop (USB or download). One file, about 620 KB.
2. Double-click it. It opens in **Google Chrome** (recommended).
3. Check the green ticks under *Check this laptop*.
4. Type your initials, the school code, the child's number, class, age and sex. Tick the two consent boxes.
5. Press **Visit 1 — Screening** or **Visit 2 — Which side has more?**
6. Read the blue "Say to the child" box aloud at the start of each task.
7. At the end the CSV downloads automatically. Copy it to the USB drive and the shared folder the same day.

**Emergency stop:** hold **Shift** and press **Q**. Data is saved after every trial, so a crash, a closed tab or a flat battery never loses the trials already done: reopen the file and download the session from *Saved sessions on this laptop*.

See [`docs/field_guide.md`](docs/field_guide.md) for the one-page field guide.

---

## The seven tasks

| # | Task (label on screen) | Session | Duration | Key measures |
|---|------|------|----------|--------------|
| 1 | Simple reaction time ("Catch the dot") | Visit 1 | ~3 min | Median RT; anticipations |
| 2 | Dot enumeration ("How many dots") | Visit 1 | ~8 min | Subitizing slope (1–3), counting slope (5–9), accuracy |
| 3 | Number comparison, digits 1–9 ("Bigger number") | Visit 1 | ~5 min | Distance-effect slope, RT, accuracy |
| 4 | Dot numerosity comparison ("More dots") | Visit 2 | ~6 min | Weber fraction *w* |
| 5 | Object numerosity comparison ("More things") | Visit 2 | ~6 min | Weber fraction *w* |
| 6 | Shape numerosity comparison ("More shapes") | Visit 2 | ~6 min | Weber fraction *w* |
| 7 | Colour-diversity comparison ("More colours") | Visit 2 | ~6 min | Weber fraction *w* (categorical control) |

**Visit 2 order** is counterbalanced automatically from the participant number (1→A, 2→B, 3→C, 4→D, 5→A, …):

| Group | Order |
|---|---|
| A | Dots → Things → Shapes → Colours |
| B | Shapes → Colours → Dots → Things |
| C | Colours → Dots → Shapes → Things |
| D | Things → Shapes → Colours → Dots |

**Design details.** Tasks 4–6: reference 16 items vs. probe at nominal ratios 1.2, 1.4, 1.6, 1.8, 2.0 (20 trials per ratio, 100 main + 8 practice). Arrays show for 600 ms, then a 200 ms mask; the child may answer from array onset. Half the trials keep item size constant and half keep total area constant (column `size_control`), so neither item size nor cumulative area alone predicts the answer. Task 7: 12 circles per side, 3 v 5, 3 v 6, 4 v 6, 4 v 7, 5 v 8 distinct colours (100 main + 6 practice). Practice for tasks 1, 3–7 gives feedback and repeats once if accuracy is below 75%. A trial with no answer after 8 s is skipped and coded `timed_out = 1`, `correct = NA`.

**Dot enumeration timing.** By default the child presses SPACE as soon as they know how many dots there are, then says the number and the experimenter clicks it. To time from the experimenter's key press at voice onset instead (v1.0 behaviour), set `dotEnumTiming: 'experimenter'` in the `STUDY` block.

---

## Output

One CSV per session, named `<ID>_<session>_<YYYYMMDD-HHMM>.csv` (e.g. `WRG_023_visit1_20261124-1042.csv`; training-mode files start with `DEMO_`). **One row per trial**, practice and main. Missing values are `NA`.

| Column | Description |
|--------|-------------|
| `participant_id`, `participant_num` | e.g. `WRG_023`, `23` |
| `school_code`, `experimenter`, `class_grade`, `age`, `sex` | Entered on the setup screen |
| `session_type`, `order_group`, `task_position` | `visit1` / `visit2` / `all` / `single_<task>`; counterbalance group; position of task in session |
| `consent_on_file`, `assent_given` | 1 if ticked on the setup screen |
| `task`, `phase`, `block_attempt`, `trial_num` | `srt`, `dotenum`, `numcomp`, `dotnum`, `objnum`, `shapenum`, `colour`; `practice`/`main`; practice round 1 or 2 |
| `set_size`, `reported_number`, `timing_mode` | Dot enumeration |
| `left_digit`, `right_digit`, `distance` | Number comparison |
| `n_left`, `n_right`, `ratio_nominal`, `ratio_actual`, `size_control` | Tasks 4–6 (`ratio_actual` = larger/smaller as drawn) |
| `colours_left`, `colours_right` | Task 7 |
| `larger_side`, `response`, `response_side`, `correct`, `rt`, `timed_out` | Scoring. `rt` in ms from stimulus onset (Task 1: from dot onset) |
| `isi_ms`, `anticipation` | Task 1 |
| `answered_during_stimulus`, `items_drawn_ok`, `emoji_ok` | Quality checks |
| `battery_version`, `session_start`, `screen_w`, `screen_h`, `pixel_ratio`, `browser` | Session and device |

No names are recorded. Keep the key linking participant numbers to names in a separate, password-protected file.

---

## Analysis

[`analysis/fit_weber.R`](analysis/fit_weber.R) needs only base R (no packages):

```r
source("analysis/fit_weber.R")
res <- summarise_battery("data/")      # folder of session CSVs; DEMO_ files are skipped
write.csv(res, "participant_summary.csv", row.names = FALSE)
```

It returns one row per child: median simple RT, dot-enumeration accuracy and slopes, number-comparison accuracy, RT and distance slope, and a Weber fraction, accuracy and data-quality flag for each of tasks 4–7. The Weber fraction is the maximum-likelihood fit of

P(correct) = Φ( (n₁ − n₂) / (w · √(n₁² + n₂²)) ),  n₁ > n₂

(Halberda & Feigenson, 2008; Pica et al., 2004). The shorter form Φ((r − 1)/(w√2)) given in the v1.0 README is accurate only near r = 1 and should not be used.

---

## Requirements

| | |
|---|---|
| **Browser** | Google Chrome or Edge (recommended), Firefox. Recent versions. |
| **Internet** | Not needed |
| **Hardware** | Laptop with keyboard; screen at least 1024 × 600 |
| **Colour emoji** | Needed for Task 5; the setup screen checks this automatically |

---

## Customising

Open `dyscalculia_battery.html` in a text editor. The two blocks to change are at the top of the battery script:

- **`STUDY`**: study name, participant ID prefix (`WRG`), dot-enumeration timing, practice pass mark, response cap, counterbalance orders, trial counts.
- **`TEXT`**: every sentence shown or read aloud. Translate this block for another language.

Maintainers edit `src/app.js` and `src/shell.html`, then rebuild the single file:

```
npm install
python3 build.py dyscalculia_battery.html
python3 tests/smoke_test.py dyscalculia_battery.html all 0 demo out/   # headless check (needs Playwright + Chrome)
```

---

## Repository contents

```
DyscalcBattery/
├── dyscalculia_battery.html   # the complete battery: give this one file to data collectors
├── src/app.js                 # battery source (settings, text, tasks, setup screen)
├── src/shell.html             # page layout and styles
├── build.py, package.json     # bundle jsPsych + source into the single HTML file
├── analysis/fit_weber.R       # per-participant summary and Weber-fraction fitting (base R)
├── tests/smoke_test.py        # headless end-to-end run with simulated key presses
├── docs/field_guide.md        # one-page guide for data collectors
├── CHANGELOG.md
├── CITATION.cff
└── LICENSE                    # MIT
```

---

## Citation

If you use this software, please cite:

> Sengupta, R., & Padmini, U. (2026). *DyscalcBattery* (Version 1.1.0) [Computer software]. Zenodo. https://doi.org/10.5281/zenodo.20195178

A software paper describing the battery has been submitted to *SoftwareX*. `CITATION.cff` gives machine-readable citation metadata ("Cite this repository" on GitHub).

---

## License

MIT License; see [`LICENSE`](LICENSE). jsPsych, bundled inside the HTML file, is © Josh de Leeuw and contributors, also under the MIT License.

---

## Background

The battery operationalises paradigms motivated by the lateral-inhibition (on-centre off-surround) recurrent network account of numerosity perception:

- Sengupta, R., Surampudi, B. R., & Melcher, D. (2014). A visual sense of number emerges from the dynamics of a recurrent on-center off-surround neural network. *Brain Research*, 1582, 114–124.
- Sengupta, R., Bapiraju, S., & Melcher, D. (2017). Big and small numbers: Empirical support for a single, flexible mechanism for numerosity perception. *Attention, Perception, & Psychophysics*, 79(1), 253–266.
- Verma, B. K., & Sengupta, R. (2023). Emergence of behavioral phenomena and adaptation effects in human numerosity decoder using recurrent neural networks. *Scientific Reports*, 13, 19571.

Psychophysical background: Kaufman et al. (1949), Pica et al. (2004), Piazza et al. (2004), Halberda & Feigenson (2008), Halberda et al. (2008), Butterworth (2003, 2011).

---

## Contact

**Maintainer:** Dr. Rakesh Sengupta · rakesh.sengupta@krea.edu.in
School of Interwoven Arts and Sciences, Krea University, Sri City, Andhra Pradesh 517 646, India

Bug reports and feature requests: [GitHub issues](https://github.com/rakesh-sengupta/DyscalcBattery/issues).

---

## Roadmap

- [x] v1.0.0 — Initial release: seven tasks, English instructions
- [x] v1.1.0 — Offline bundle, autosave and recovery, automatic counterbalancing, simplified setup, one row per trial, analysis script (see `CHANGELOG.md`)
- [ ] v1.2.0 — Telugu instructions (translate the `TEXT` block)
- [ ] v1.3.0 — Recorded audio instructions in Telugu and English
- [ ] v1.4.0 — Touchscreen responses for tablets; convex-hull control for numerosity arrays
- [ ] v2.0.0 — Adaptive ratio selection (psi-method staircase) for faster Weber-fraction estimation
