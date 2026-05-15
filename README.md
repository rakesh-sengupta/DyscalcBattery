# DyscalcBattery

**An open browser-based psychophysical battery for dyscalculia screening and numerosity perception research.**

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.XXXXXXX.svg)](https://doi.org/10.5281/zenodo.XXXXXXX)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![jsPsych](https://img.shields.io/badge/built%20with-jsPsych%207.3.4-blueviolet.svg)](https://www.jspsych.org/)

> *Maintained by the [Computational Cognition Laboratory](https://krea.edu.in), School of Interwoven Arts and Sciences, Krea University, Sri City, Andhra Pradesh, India.*

---

## What this is

DyscalcBattery is a single-file, browser-based battery of seven psychophysical tasks for:

- **Screening** school-age children for developmental dyscalculia
- **Measuring** the cognitive substrates of numerosity perception (Weber fractions, subitizing slopes, distance effects)
- **Comparing** numerical and non-numerical quantity processing across formats (digits, dots, objects, shapes, colours)

It runs entirely in a web browser, requires no installation, works offline after first load, and exports trial-level data as CSV for downstream analysis.

The battery is designed for **field deployment in low-resource and multilingual settings** — schools without reliable internet, laptops without admin privileges, researchers without licensing budgets.

---

## Quick start

1. Download [`dyscalcbattery.html`](dyscalcbattery.html) (single file, ~50 KB).
2. Open it in **Google Chrome** (recommended), Firefox, Safari, or Edge.
3. On first load, allow ~10 seconds for the jsPsych library to cache from CDN.
4. Fill in the participant info form.
5. Pick a task or task-set from the menu.
6. Run the session.
7. The data CSV downloads automatically when the session ends.

That's it. No installation, no command line, no server.

---

## The seven tasks

| # | Task | Type | Duration | Key measures |
|---|------|------|----------|--------------|
| 1 | Simple Reaction Time | Control | ~3 min | Median RT (motor/processing baseline) |
| 2 | Dot Enumeration | Screening | ~10 min | Subitizing slope, counting slope, accuracy at each set size |
| 3 | Number Comparison (digits) | Screening | ~6 min | Distance-effect slope, mean RT, accuracy |
| 4 | Dot Numerosity Comparison | Deep battery | ~6 min | Weber fraction *w* |
| 5 | Object Numerosity Comparison | Deep battery | ~6 min | Weber fraction *w* |
| 6 | Shape Numerosity Comparison | Deep battery | ~6 min | Weber fraction *w* |
| 7 | Colour-Diversity Comparison | Non-numerical control | ~6 min | Weber fraction *w* (categorical) |

Tasks 1–3 form the **screening protocol**, modelled after Butterworth-style paradigms. Tasks 4–7 form the **deep psychophysical battery**, with non-symbolic numerosity comparison across three formats plus a non-numerical colour-diversity control.

You can run the full battery (~45 min), the screening only (~20 min), the deep battery only (~25 min), or any single task.

---

## What you get

At the end of each session, one CSV file downloads automatically:

```
WRG_<participant_id>_<YYYY-MM-DD>.csv
```

Each row is one trial. Columns include:

| Column | Description |
|--------|-------------|
| `participant_id` | The ID you entered at session start |
| `school_code` | School identifier (free text) |
| `class_grade`, `age`, `sex` | Demographics |
| `session_date` | ISO date |
| `task` | Which task this trial belongs to |
| `phase` | `practice` or `main` |
| Task-specific columns | e.g., `set_size`, `left_n`, `right_n`, `ratio`, `distance` |
| `response` | The key pressed |
| `correct` | 1 / 0 |
| `rt` | Reaction time, ms |

No identifying information is recorded — your master key file linking IDs to names should live elsewhere.

---

## Requirements

| | |
|---|---|
| **Browser** | Chrome ≥90, Firefox ≥88, Safari ≥14, Edge ≥90 |
| **OS** | Anything — Windows, macOS, Linux, Android, iPadOS |
| **Network** | Required on first run only (loads jsPsych from CDN); offline thereafter |
| **Hardware** | Any laptop or tablet with a keyboard |
| **Display** | Minimum 1024×768; recommended 1280×800 or larger |

No installation, no admin rights, no package manager, no Python, no R required to *run* the battery. R (optional, ≥4.0) is needed only for the included post-hoc Weber-fraction fitting script.

---

## Repository contents

```
DyscalcBattery/
├── dyscalcbattery.html      # The complete battery — single file
├── README.md                # This file
├── LICENSE                  # MIT License
├── docs/
│   ├── task_descriptions.md # Detailed protocol for each task
│   ├── instructions/        # Telugu and English instruction scripts
│   └── deployment.md        # Field deployment notes
├── analysis/
│   ├── fit_weber.R          # Maximum-likelihood Weber-fraction fitting
│   ├── group_compare.R      # DD vs TD group comparisons
│   └── example_data/        # Sample CSV outputs for testing
└── CITATION.cff             # Machine-readable citation
```

---

## Usage examples

### Run the full screening battery

```
1. Open dyscalcbattery.html in Chrome
2. Fill in participant info (ID, class, age, sex)
3. Click "Full SCREENING (Tasks 1–3)"
4. Read each task's instruction screen aloud
5. ~20 minutes later: CSV downloads
```

### Fit Weber fractions from the deep battery

```r
source("analysis/fit_weber.R")
results <- fit_all_participants("data/")
# returns a data frame: participant_id × task × w_hat
```

### Modify stimulus presentation duration

The battery is one HTML file. Open it in any text editor, search for `trial_duration: 600`, change the value, save, reload in the browser. No build step.

---

## Customisation

The single-file architecture makes per-lab customisation trivial. Common modifications:

- **Change response keys.** Search for `['f', 'j']` and replace with your preferred keys.
- **Translate instructions.** Each task's instruction screen is a clearly-marked HTML string near the top of its `build...()` function. Replace the English text in-place.
- **Adjust ratios.** Search `RATIOS = [1.2, 1.4, 1.6, 1.8, 2.0]` to change the numerosity-comparison ratios.
- **Add a task.** Each task is a self-contained `build...()` function returning a jsPsych timeline. Copy any existing one as a template.

If your modification is useful to others, please consider opening a pull request.

---

## Citation

If you use this software in your research, please cite both:

**The software:**

> Sengupta, R., Padmini, U., et al. (2026). DyscalcBattery (Version 1.0.0) [Software]. Zenodo. https://doi.org/10.5281/zenodo.XXXXXXX

**The software paper:**

> Sengupta, R., Padmini, U., et al. (2026). DyscalcBattery: An open browser-based psychophysical battery for dyscalculia screening and numerosity perception research. *SoftwareX*. [In press]

A BibTeX-formatted citation is included in [`CITATION.cff`](CITATION.cff).

---

## License

Released under the MIT License. You are free to use, modify, distribute, and integrate this software in your own work, including in commercial settings, provided the copyright notice and license are retained. See [`LICENSE`](LICENSE) for the full text.

---

## Background

The battery operationalises seven psychophysical paradigms whose theoretical motivation is grounded in the lateral-inhibition recurrent-neural-network framework of numerosity perception developed in the Sengupta Lab:

- Sengupta, R., Surampudi, B. R., & Melcher, D. (2014). A visual sense of number emerges from the dynamics of a recurrent on-center off-surround neural network. *Brain Research*, 1582, 114–124.
- Sengupta, R., Bapiraju, S., & Melcher, D. (2017). Big and small numbers: Empirical support for a single, flexible mechanism for numerosity perception. *Attention, Perception, & Psychophysics*, 79(1), 253–266.
- Verma, B. K., & Sengupta, R. (2023). Emergence of behavioral phenomena and adaptation effects in human numerosity decoder using recurrent neural networks. *Scientific Reports*, 13, 19571.

The behavioural paradigms themselves are drawn from a long psychophysical tradition; see particularly Kaufman et al. (1949), Piazza et al. (2004), Butterworth (2003, 2011), and Halberda et al. (2008) — all listed in the SoftwareX paper.

---

## Acknowledgements

Built on [jsPsych](https://www.jspsych.org/) by Josh de Leeuw and contributors.

Object icons (Task 5) are Unicode emoji rendered by the user's system font; no external asset files are required.

Field deployment in Warangal, Telangana, is conducted with the cooperation of the District Educational Officer and participating government school headmasters. We thank the children and families who have made this research possible.

---

## Contact

**Maintainer:** Dr. Rakesh Sengupta
**Email:** rakesh.sengupta@krea.edu.in
**Institution:** School of Interwoven Arts and Sciences, Krea University, Sri City, Andhra Pradesh 517 646, India

For bug reports and feature requests, please open an [issue](https://github.com/[PLACEHOLDER-username]/DyscalcBattery/issues).

For research collaboration enquiries, please contact the maintainer directly.

---

## Roadmap

- [x] v1.0.0 — Initial release: seven tasks, English instructions
- [ ] v1.1.0 — Telugu instruction translations (in preparation)
- [ ] v1.2.0 — Audio instructions (recorded in Telugu and English)
- [ ] v1.3.0 — Optional touchscreen-friendly response interface for tablet use
- [ ] v2.0.0 — Adaptive ratio selection (psi-method staircase) for faster Weber-fraction estimation
