/* ============================================================================
   DyscalcBattery v1.1.0
   Open browser-based psychophysical battery for dyscalculia screening.
   Computational Cognition Laboratory, SIAS, Krea University.  MIT License.
   https://github.com/rakesh-sengupta/DyscalcBattery
   ----------------------------------------------------------------------------
   HOW THIS FILE IS ORGANISED (edit only the first two blocks for a new study)
     1. STUDY     - study name, ID prefix, trial counts
     2. TEXT      - every sentence shown or read aloud (translate here)
     3. Helpers   - storage, CSV, drawing
     4. Tasks     - one build function per task
     5. Setup     - the start screen (plain HTML, before jsPsych starts)
   ============================================================================ */

/* ---------- 1. STUDY SETTINGS -------------------------------------------- */
const STUDY = {
  version: '1.1.0',
  name: 'Warangal dyscalculia prevalence study',
  idPrefix: 'WRG',                 // participant 23 -> WRG_023
  // 'child'  = child presses SPACE when they know how many dots (default)
  // 'experimenter' = experimenter presses SPACE when the child starts speaking
  dotEnumTiming: 'child',
  practicePassMark: 0.75,          // practice repeats once if below this
  responseCapMs: 8000,             // a trial with no answer after 8 s is skipped (NA)
  canvas: { w: 900, h: 450 },
  orders: {                        // deep-battery task order by counterbalance group
    A: ['dotnum', 'objnum', 'shapenum', 'colour'],
    B: ['shapenum', 'colour', 'dotnum', 'objnum'],
    C: ['colour', 'dotnum', 'shapenum', 'objnum'],
    D: ['objnum', 'shapenum', 'colour', 'dotnum']
  },
  // full = real session; demo = short version for training data collectors
  trials: {
    full: { srt: [5, 35], dotenum: [5, 6], numcomp: [8, 72], numerosity: [8, 100], colour: [6, 100] },
    demo: { srt: [2, 4],  dotenum: [2, 0], numcomp: [3, 6],  numerosity: [3, 6],   colour: [3, 6] }
  }
};

/* ---------- 2. TEXT (translate this block for Telugu) --------------------- */
const TEXT = {
  keysLeftRight:
    '<div class="keyguide"><span class="key kleft">F</span> or <span class="key kleft">&larr;</span> = LEFT' +
    '&nbsp;&nbsp;&nbsp;&nbsp;<span class="key kright">J</span> or <span class="key kright">&rarr;</span> = RIGHT</div>',
  spaceToStart: '<p class="go">Experimenter: press <span class="key">SPACE</span> to start.</p>',
  correct: '<div class="fb good">&#10003; Correct!</div>',
  wrong: '<div class="fb bad">Not this time &mdash; look carefully.</div>',
  tooSlow: '<div class="fb bad">Try to answer a little faster.</div>',
  tooEarly: '<div class="fb bad">Too early! Wait for the dot.</div>',
  practiceAgain:
    '<div class="instr"><h2>Let us practise once more</h2>' +
    '<p class="say">Say: &ldquo;Let us try a few more for practice.&rdquo; Re-explain which key is which side.</p>' +
    '<p class="go">Press <span class="key">SPACE</span> to continue.</p></div>',
  practiceDone:
    '<div class="instr"><h2>Practice finished</h2>' +
    '<p class="say">Say: &ldquo;Well done. Now the real game. No more ticks or crosses &mdash; just do your best.&rdquo;</p>' +
    '<p class="go">Press <span class="key">SPACE</span> when the child is ready.</p></div>',
  breakScreen: (done, total) =>
    `<div class="instr"><h2>Task ${done} of ${total} finished</h2>` +
    '<p>Let the child rest for a minute. Praise effort, not accuracy.</p>' +
    '<p class="go">Press <span class="key">SPACE</span> when the child is ready.</p></div>',
  tasks: {
    srt: {
      title: 'Task: Catch the dot',
      say: '&ldquo;Look at the cross in the middle. When a big black dot appears, press the SPACE bar as fast as you can. Do not press before the dot comes.&rdquo;',
      note: 'Child presses SPACE. You only watch.'
    },
    dotenum_child: {
      title: 'Task: How many dots?',
      say: '&ldquo;Some dots will appear. As soon as you know how many there are, press SPACE, then tell me the number.&rdquo;',
      note: 'Child presses SPACE. Then YOU click the number the child said. Click &ldquo;Not sure&rdquo; if you could not hear.'
    },
    dotenum_experimenter: {
      title: 'Task: How many dots?',
      say: '&ldquo;Some dots will appear. Tell me how many there are, as fast as you can.&rdquo;',
      note: 'YOU press SPACE the moment the child starts speaking. Then click the number the child said.'
    },
    numcomp: {
      title: 'Task: Which number is bigger?',
      say: '&ldquo;Two numbers will appear. If the bigger number is on this side (point left), press F. If it is on this side (point right), press J.&rdquo;',
      note: 'Child presses F/J (arrow keys also work).'
    },
    dotnum: {
      title: 'Task: Which side has more dots?',
      say: '&ldquo;Two groups of dots will flash quickly. There is no time to count. Press F if the left side had more, J if the right side had more.&rdquo;',
      note: 'Child presses F/J. The child may answer while the dots are still on screen.',
      noun: 'dots'
    },
    objnum: {
      title: 'Task: Which side has more things?',
      say: '&ldquo;Two groups of small pictures will flash quickly. Do not count. Press F if the left side had more pictures, J if the right side had more.&rdquo;',
      note: 'Child presses F/J.',
      noun: 'things'
    },
    shapenum: {
      title: 'Task: Which side has more shapes?',
      say: '&ldquo;Two groups of shapes will flash quickly. Do not count. Press F if the left side had more shapes, J if the right side had more.&rdquo;',
      note: 'Child presses F/J.',
      noun: 'shapes'
    },
    colour: {
      title: 'Task: Which side has more colours?',
      say: '&ldquo;Both sides have the same number of circles, but one side has more DIFFERENT COLOURS. Press F if the left side had more colours, J if the right side had more colours.&rdquo;',
      note: 'Child presses F/J. Children with colour-vision problems may find this task hard; note it on the log sheet.',
      noun: 'colours'
    }
  }
};

/* ---------- 3. HELPERS ------------------------------------------------------ */
const TASK_LABEL = {
  srt: 'Simple reaction time', dotenum: 'Dot enumeration', numcomp: 'Number comparison',
  dotnum: 'Dot numerosity', objnum: 'Object numerosity', shapenum: 'Shape numerosity', colour: 'Colour diversity'
};
const SESSION = { meta: null, rows: [], storeKey: null, running: false, jsPsych: null };
const timers = [];
function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
function clearTimers() { while (timers.length) clearTimeout(timers.pop()); }

function shuffle(a) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function pad(n, w) { return String(n).padStart(w, '0'); }
function localStamp(d) { return `${d.getFullYear()}-${pad(d.getMonth() + 1, 2)}-${pad(d.getDate(), 2)} ${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`; }
function fileStamp(d) { return `${d.getFullYear()}${pad(d.getMonth() + 1, 2)}${pad(d.getDate(), 2)}-${pad(d.getHours(), 2)}${pad(d.getMinutes(), 2)}`; }
function sideOfKey(k) { if (!k) return null; k = String(k).toLowerCase(); return (k === 'f' || k === 'arrowleft') ? 'left' : (k === 'j' || k === 'arrowright') ? 'right' : null; }
const LR_KEYS = ['f', 'j', 'ArrowLeft', 'ArrowRight'];

/* Storage: every completed trial is written to the browser's local storage,
   so a crash or a closed tab never loses a session. */
const store = {
  ok: (() => { try { localStorage.setItem('_t', '1'); localStorage.removeItem('_t'); return true; } catch (e) { return false; } })(),
  index() { try { return JSON.parse(localStorage.getItem('dyscalc_index') || '[]'); } catch (e) { return []; } },
  saveIndex(ix) { try { localStorage.setItem('dyscalc_index', JSON.stringify(ix)); } catch (e) {} },
  put(key, entry, csv) {
    if (!this.ok) return;
    try {
      localStorage.setItem(key, csv);
      const ix = this.index().filter(e => e.key !== key); ix.unshift(entry);
      while (ix.length > 25) { const old = ix.pop(); localStorage.removeItem(old.key); }
      this.saveIndex(ix);
    } catch (e) { console.warn('autosave failed', e); }
  },
  get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } },
  remove(key) { try { localStorage.removeItem(key); this.saveIndex(this.index().filter(e => e.key !== key)); } catch (e) {} },
  pref(k, v) { try { if (v === undefined) return localStorage.getItem('dyscalc_pref_' + k) || ''; localStorage.setItem('dyscalc_pref_' + k, v); } catch (e) { return ''; } }
};

const COLUMNS = ['battery_version', 'study', 'participant_id', 'participant_num', 'school_code', 'experimenter',
  'class_grade', 'age', 'sex', 'session_type', 'order_group', 'demo_mode', 'session_start', 'consent_on_file',
  'assent_given', 'task', 'task_position', 'phase', 'block_attempt', 'trial_num', 'set_size', 'n_left', 'n_right',
  'larger_side', 'ratio_nominal', 'ratio_actual', 'size_control', 'colours_left', 'colours_right', 'left_digit',
  'right_digit', 'distance', 'isi_ms', 'anticipation', 'timing_mode', 'response', 'response_side',
  'reported_number', 'correct', 'rt', 'timed_out', 'answered_during_stimulus', 'items_drawn_ok', 'emoji_ok',
  'screen_w', 'screen_h', 'pixel_ratio', 'browser'];

function csvCell(v) { if (v === null || v === undefined) return 'NA'; const s = String(v); return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }
function toCSV(rows) { return [COLUMNS.join(',')].concat(rows.map(r => COLUMNS.map(c => csvCell(r[c])).join(','))).join('\n'); }

function fileName(meta) {
  const id = meta.demo_mode ? 'DEMO' : meta.participant_id;
  return `${id}_${meta.session_type}_${fileStamp(new Date(meta.start_ms))}.csv`;
}
function downloadText(name, text) {
  const blob = new Blob([text], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
}
function autosave(status) {
  if (!SESSION.meta) return;
  SESSION.meta.status = status || SESSION.meta.status;
  const m = SESSION.meta;
  store.put(SESSION.storeKey, {
    key: SESSION.storeKey, file: fileName(m), id: m.participant_id, session: m.session_type,
    when: localStamp(new Date(m.start_ms)), status: m.status, rows: SESSION.rows.length, demo: m.demo_mode
  }, toCSV(SESSION.rows));
}
/* Called by every recorded trial: merges the trial's own fields with session metadata. */
function record(data, extra) {
  const row = Object.assign({}, SESSION.meta.rowMeta, extra);
  row.rt = (row.rt === undefined) ? (data.rt === null ? null : Math.round(data.rt)) : row.rt;
  SESSION.rows.push(row);
  autosave('in_progress');
}

/* Canvas drawing ------------------------------------------------------------ */
const W = STUDY.canvas.w, H = STUDY.canvas.h;
const LEFT = { xMin: 60, xMax: W / 2 - 30, yMin: 40, yMax: H - 40 };
const RIGHT = { xMin: W / 2 + 30, xMax: W - 60, yMin: 40, yMax: H - 40 };
function bg(ctx) { ctx.fillStyle = '#bbbbbb'; ctx.fillRect(0, 0, W, H); }
function fixation(ctx) { ctx.fillStyle = '#000'; ctx.fillRect(W / 2 - 10, H / 2 - 2, 20, 4); ctx.fillRect(W / 2 - 2, H / 2 - 10, 4, 20); }
function divider(ctx) { ctx.strokeStyle = '#666'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2, 30); ctx.lineTo(W / 2, H - 30); ctx.stroke(); }
function mask(ctx) { bg(ctx); for (let i = 0; i < 5000; i++) { const v = Math.floor(Math.random() * 255); ctx.fillStyle = `rgb(${v},${v},${v})`; ctx.fillRect(Math.random() * W, Math.random() * H, 3, 3); } }
function promptOnCanvas(ctx, question) {
  bg(ctx); ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 30px sans-serif'; ctx.fillText(question, W / 2, H / 2 - 40);
  ctx.font = 'bold 34px sans-serif'; ctx.fillStyle = '#1b5e20'; ctx.fillText('← F   LEFT', W / 4, H / 2 + 50);
  ctx.fillStyle = '#0d47a1'; ctx.fillText('RIGHT   J →', 3 * W / 4, H / 2 + 50);
}
/* Random non-overlapping positions. Returns null if n items cannot be placed,
   so the caller can retry rather than silently drawing fewer items. */
function placeItems(n, region, minDist) {
  for (let attempt = 0; attempt < 20; attempt++) {
    const pts = []; let tries = 0;
    while (pts.length < n && tries < 20000) {
      const x = region.xMin + Math.random() * (region.xMax - region.xMin);
      const y = region.yMin + Math.random() * (region.yMax - region.yMin);
      if (pts.every(p => Math.hypot(x - p.x, y - p.y) >= minDist)) pts.push({ x, y });
      tries++;
    }
    if (pts.length === n) return pts;
  }
  return null;
}
const OBJECT_EMOJI = ['\u{1F34E}', '\u{1F34C}', '⭐', '\u{1F431}', '\u{1F697}', '⚽', '\u{1F4DA}', '\u{1F338}', '\u{1F41F}', '\u{1F347}', '\u{1F388}', '\u{1F511}', '\u{1F41D}', '\u{1F333}', '\u{1F34A}'];
const SHAPES = ['circle', 'square', 'triangle', 'pentagon', 'hexagon'];
function poly(ctx, cx, cy, r, k, rot) { for (let i = 0; i < k; i++) { const a = rot + i * 2 * Math.PI / k; const x = cx + r * Math.cos(a), y = cy + r * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.closePath(); }
function shape(ctx, x, y, kind, r) {
  ctx.beginPath();
  if (kind === 'circle') ctx.arc(x, y, r, 0, 2 * Math.PI);
  else if (kind === 'square') ctx.rect(x - r * 0.886, y - r * 0.886, r * 1.772, r * 1.772); // same area as circle
  else if (kind === 'triangle') poly(ctx, x, y, r * 1.555, 3, -Math.PI / 2);                 // same area as circle
  else if (kind === 'pentagon') poly(ctx, x, y, r * 1.149, 5, -Math.PI / 2);
  else poly(ctx, x, y, r * 1.1, 6, 0);
  ctx.fill();
}
/* size_control 'size': every item the same size (total area grows with number)
   size_control 'area': items shrink as number grows (total area constant)   */
function itemSize(base, n, control) { return control === 'area' ? base * Math.sqrt(16 / n) : base; }
function drawArray(ctx, kind, n, region, control) {
  let size, minDist;
  if (kind === 'dotnum') { size = itemSize(8, n, control); minDist = Math.max(24, 2 * size + 8); }
  else if (kind === 'shapenum') { size = itemSize(11, n, control); minDist = Math.max(32, 2.8 * size + 6); }
  else { size = itemSize(30, n, control); minDist = Math.max(40, size * 1.45); } // emoji font px
  const pts = placeItems(n, region, minDist);
  if (!pts) return false;
  if (kind === 'dotnum') { ctx.fillStyle = '#000'; pts.forEach(p => { ctx.beginPath(); ctx.arc(p.x, p.y, size, 0, 2 * Math.PI); ctx.fill(); }); }
  else if (kind === 'shapenum') { ctx.fillStyle = '#1F3A68'; pts.forEach(p => shape(ctx, p.x, p.y, SHAPES[Math.floor(Math.random() * SHAPES.length)], size)); }
  else {
    ctx.font = `${Math.round(size)}px "Noto Color Emoji","Segoe UI Emoji","Apple Color Emoji",sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const pool = shuffle(OBJECT_EMOJI); pts.forEach((p, i) => ctx.fillText(pool[i % pool.length], p.x, p.y));
  }
  return true;
}
/* Kelly-style maximally distinct colours (pool of 10; at most 8 used per side) */
const COLOURS = ['#E6194B', '#3CB44B', '#FFE119', '#4363D8', '#F58231', '#911EB4', '#000000', '#FFFFFF', '#9A6324', '#F032E6'];
function drawColourArray(ctx, nColours, region) {
  const pts = placeItems(12, region, 40); if (!pts) return false;
  const pal = shuffle(COLOURS).slice(0, nColours);
  const cols = shuffle(pts.map((_, i) => pal[i % nColours]));
  pts.forEach((p, i) => { ctx.fillStyle = cols[i]; ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, 2 * Math.PI); ctx.fill(); ctx.strokeStyle = '#555'; ctx.lineWidth = 1; ctx.stroke(); });
  return true;
}
/* Detects whether colour emoji actually render (old Windows / Linux may show empty boxes). */
function emojiRenders() {
  try {
    const c = document.createElement('canvas'); c.width = 40; c.height = 40; const x = c.getContext('2d');
    x.font = '30px "Noto Color Emoji","Segoe UI Emoji","Apple Color Emoji",sans-serif'; x.textBaseline = 'top';
    x.fillText('\u{1F34E}', 2, 2);
    const d = x.getImageData(0, 0, 40, 40).data; let coloured = 0;
    for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && (Math.abs(d[i] - d[i + 1]) > 40 || Math.abs(d[i] - d[i + 2]) > 40)) coloured++;
    return coloured > 20;
  } catch (e) { return false; }
}

/* ---------- 4. TASKS ---------------------------------------------------------- */
function feedbackTrial(getHtml) { return { type: jsPsychHtmlKeyboardResponse, stimulus: getHtml, choices: 'NO_KEYS', trial_duration: 900 }; }
function introTrial(key, pos, total) {
  const t = TEXT.tasks[key];
  const lr = ['numcomp', 'dotnum', 'objnum', 'shapenum', 'colour'].includes(key.split('_')[0]);
  return {
    type: jsPsychHtmlKeyboardResponse, choices: [' '],
    stimulus: `<div class="instr"><p class="small">Task ${pos} of ${total}</p><h2>${t.title}</h2>` +
      `<p class="saylabel">Say to the child:</p><p class="say">${t.say}</p>` +
      (lr ? TEXT.keysLeftRight : '') + `<p class="note">${t.note}</p>${TEXT.spaceToStart}</div>`
  };
}
/* Practice block that repeats once if the child scores below the pass mark. */
function practiceBlock(trialsForAttempt) {
  let attempt = 0;
  return {
    timeline: [
      { timeline: [{ type: jsPsychHtmlKeyboardResponse, stimulus: TEXT.practiceAgain, choices: [' '] }], conditional_function: () => attempt > 0 },
      { timeline: trialsForAttempt(() => attempt + 1) }
    ],
    loop_function: () => {
      const recent = SESSION.rows.filter(r => r.phase === 'practice' && r.task === SESSION.currentTask && r.block_attempt === attempt + 1);
      const scored = recent.filter(r => r.correct === 0 || r.correct === 1);
      const acc = scored.length ? scored.reduce((s, r) => s + r.correct, 0) / scored.length : 0;
      attempt++;
      return acc < STUDY.practicePassMark && attempt < 2;
    }
  };
}
function practiceDoneTrial() { return { type: jsPsychHtmlKeyboardResponse, stimulus: TEXT.practiceDone, choices: [' '] }; }
function lastRowFeedback() { const r = SESSION.rows[SESSION.rows.length - 1]; return r.timed_out ? TEXT.tooSlow : (r.correct ? TEXT.correct : TEXT.wrong); }

/* Task 1: simple reaction time. One trial = fixation, then a dot after a random wait. */
function buildSRT(nPrac, nMain) {
  function trial(phase, num, attemptFn) {
    const isi = Math.round(1500 + Math.random() * 2000); let tStart = 0, tDot = null;
    return {
      type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: [' '], trial_duration: isi + 2000,
      stimulus: (c) => {
        const ctx = c.getContext('2d'); bg(ctx); fixation(ctx); tStart = performance.now();
        later(() => requestAnimationFrame(() => { bg(ctx); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(W / 2, H / 2, 45, 0, 2 * Math.PI); ctx.fill(); tDot = performance.now(); }), isi);
      },
      on_finish: (d) => {
        clearTimers();
        const shown = tDot !== null; const actualIsi = shown ? Math.round(tDot - tStart) : isi;
        const rtDot = d.rt === null ? null : Math.round(d.rt - actualIsi);
        record(d, {
          task: 'srt', phase, trial_num: num, block_attempt: attemptFn ? attemptFn() : 1, isi_ms: actualIsi,
          response: d.response, rt: rtDot, anticipation: rtDot !== null && rtDot < 100 ? 1 : 0,
          timed_out: d.response === null ? 1 : 0, correct: (rtDot !== null && rtDot >= 100) ? 1 : 0
        });
      }
    };
  }
  const prac = (attemptFn) => { const t = []; for (let i = 1; i <= nPrac; i++) { t.push(trial('practice', i, attemptFn)); t.push(feedbackTrial(() => { const r = SESSION.rows[SESSION.rows.length - 1]; return r.timed_out ? TEXT.tooSlow : r.anticipation ? TEXT.tooEarly : TEXT.correct; })); } return t; };
  const main = []; for (let i = 1; i <= nMain; i++) main.push(trial('main', i));
  return [practiceBlock(prac), practiceDoneTrial(), ...main];
}

/* Task 2: dot enumeration. Dots stay until SPACE; then the experimenter clicks the number said. */
function buildDotEnum(nPrac, reps) {
  const mode = STUDY.dotEnumTiming;
  function trial(setSize, phase, num, attemptFn) {
    let shown = { rt: null, ok: true };
    const region = { xMin: 260, xMax: 640, yMin: 70, yMax: 380 };
    return [
      { type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: 'NO_KEYS', trial_duration: 500, stimulus: (c) => { const x = c.getContext('2d'); bg(x); fixation(x); } },
      {
        type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: [' '], trial_duration: 10000,
        stimulus: (c) => { const x = c.getContext('2d'); bg(x); const p = placeItems(setSize, region, 30); shown.ok = !!p; (p || []).forEach(q => { x.fillStyle = '#000'; x.beginPath(); x.arc(q.x, q.y, 10, 0, 2 * Math.PI); x.fill(); }); },
        on_finish: (d) => { shown.rt = d.rt === null ? null : Math.round(d.rt); }
      },
      {
        type: jsPsychHtmlButtonResponse,
        stimulus: '<div class="instr"><p class="saylabel">Experimenter: which number did the child say?</p></div>',
        choices: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'More than 10', 'Not sure'],
        button_html: '<button class="jspsych-btn numbtn">%choice%</button>',
        on_finish: (d) => {
          const lab = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11+', 'NA'][d.response];
          const n = lab === 'NA' ? null : (lab === '11+' ? 11 : parseInt(lab, 10));
          record(d, {
            task: 'dotenum', phase, trial_num: num, block_attempt: attemptFn ? attemptFn() : 1, set_size: setSize,
            timing_mode: mode, reported_number: lab, rt: shown.rt, timed_out: shown.rt === null ? 1 : 0,
            correct: n === null ? null : (n === setSize ? 1 : 0), items_drawn_ok: shown.ok ? 1 : 0, response: lab
          });
        }
      }
    ];
  }
  const pracSizes = [2, 5, 3, 7, 4].slice(0, nPrac);
  const prac = (attemptFn) => pracSizes.flatMap((s, i) => trial(s, 'practice', i + 1, attemptFn));
  let mainSizes = []; for (let s = 1; s <= 10; s++) for (let r = 0; r < reps; r++) mainSizes.push(s);
  if (reps === 0) mainSizes = [1, 3, 6, 9];                     // demo mode
  mainSizes = shuffle(mainSizes);
  const main = mainSizes.flatMap((s, i) => trial(s, 'main', i + 1));
  // practice block never repeats for enumeration (no right/wrong feedback needed)
  return [{ timeline: prac(() => 1) }, practiceDoneTrial(), ...main];
}

/* Task 3: symbolic number comparison (1-9). */
function buildNumComp(nPrac, nMain) {
  function trial(l, r, phase, num, attemptFn) {
    return {
      type: jsPsychHtmlKeyboardResponse, choices: LR_KEYS, trial_duration: STUDY.responseCapMs,
      stimulus: `<div class="digits"><span>${l}</span><span>${r}</span></div>${TEXT.keysLeftRight}`,
      on_finish: (d) => {
        const side = sideOfKey(d.response);
        record(d, {
          task: 'numcomp', phase, trial_num: num, block_attempt: attemptFn ? attemptFn() : 1,
          left_digit: l, right_digit: r, distance: Math.abs(l - r), larger_side: l > r ? 'left' : 'right',
          ratio_actual: +(Math.max(l, r) / Math.min(l, r)).toFixed(3),
          response: d.response, response_side: side, timed_out: side ? 0 : 1,
          correct: side ? (side === (l > r ? 'left' : 'right') ? 1 : 0) : null
        });
      }
    };
  }
  const iti = { type: jsPsychHtmlKeyboardResponse, stimulus: '<div class="fix">+</div>', choices: 'NO_KEYS', trial_duration: 500 };
  const pracPairs = [[3, 7], [8, 2], [1, 9], [6, 4], [4, 8], [7, 3], [2, 5], [9, 1]].slice(0, nPrac);
  const prac = (attemptFn) => pracPairs.flatMap(([l, r], i) => [iti, trial(l, r, 'practice', i + 1, attemptFn), feedbackTrial(lastRowFeedback)]);
  let pairs = []; for (let i = 1; i <= 9; i++) for (let j = 1; j <= 9; j++) if (i !== j) pairs.push([i, j]);
  pairs = shuffle(pairs).slice(0, nMain);
  const main = pairs.flatMap(([l, r], i) => [iti, trial(l, r, 'main', i + 1)]);
  return [practiceBlock(prac), practiceDoneTrial(), ...main];
}

/* Tasks 4-6: non-symbolic comparison. One canvas trial: arrays 600 ms -> mask 200 ms -> question.
   The child may answer at any moment from array onset; RT is from array onset. */
function buildNumerosity(kind, nPrac, nMain) {
  const noun = TEXT.tasks[kind].noun;
  function trial(nl, nr, ratioNom, control, phase, num, attemptFn) {
    let ok = true;
    return {
      type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: LR_KEYS, trial_duration: STUDY.responseCapMs,
      stimulus: (c) => {
        const ctx = c.getContext('2d'); bg(ctx); divider(ctx);
        ok = drawArray(ctx, kind, nl, LEFT, control) && drawArray(ctx, kind, nr, RIGHT, control);
        later(() => mask(ctx), 600);
        later(() => promptOnCanvas(ctx, `Which side had more ${noun}?`), 800);
      },
      on_finish: (d) => {
        clearTimers();
        const side = sideOfKey(d.response); const larger = nl > nr ? 'left' : 'right';
        record(d, {
          task: kind, phase, trial_num: num, block_attempt: attemptFn ? attemptFn() : 1,
          n_left: nl, n_right: nr, larger_side: larger, ratio_nominal: ratioNom,
          ratio_actual: +(Math.max(nl, nr) / Math.min(nl, nr)).toFixed(3), size_control: control,
          response: d.response, response_side: side, timed_out: side ? 0 : 1,
          correct: side ? (side === larger ? 1 : 0) : null,
          answered_during_stimulus: d.rt !== null && d.rt < 800 ? 1 : 0, items_drawn_ok: ok ? 1 : 0
        });
      }
    };
  }
  const fix = { type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: 'NO_KEYS', trial_duration: 500, stimulus: (c) => { const x = c.getContext('2d'); bg(x); divider(x); fixation(x); } };
  const pracItems = [[12, 20], [18, 10], [8, 16], [22, 11], [14, 24], [20, 12], [10, 18], [16, 8]].slice(0, nPrac);
  const prac = (attemptFn) => pracItems.flatMap(([l, r], i) => [fix, trial(l, r, null, i % 2 ? 'area' : 'size', 'practice', i + 1, attemptFn), feedbackTrial(lastRowFeedback)]);
  // Main: 5 ratios x 20 trials. Within each ratio: probe larger/smaller x reference left/right x 5,
  // with equal numbers of size-controlled and area-controlled arrays.
  const ratios = [1.2, 1.4, 1.6, 1.8, 2.0]; let list = [];
  ratios.forEach(r => {
    const hi = Math.round(16 * r), lo = Math.round(16 / r); const cells = [];
    for (let k = 0; k < 5; k++) { cells.push([16, hi], [hi, 16], [16, lo], [lo, 16]); }
    const controls = shuffle(Array(10).fill('size').concat(Array(10).fill('area')));
    cells.forEach((c, i) => list.push({ l: c[0], r: c[1], ratio: r, control: controls[i] }));
  });
  list = shuffle(list).slice(0, nMain);
  const main = list.flatMap((t, i) => [fix, trial(t.l, t.r, t.ratio, t.control, 'main', i + 1)]);
  return [practiceBlock(prac), practiceDoneTrial(), ...main];
}

/* Task 7: colour diversity. 12 circles per side; sides differ in number of distinct colours. */
function buildColour(nPrac, nMain) {
  function trial(cl, cr, phase, num, attemptFn) {
    let ok = true;
    return {
      type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: LR_KEYS, trial_duration: STUDY.responseCapMs,
      stimulus: (c) => {
        const ctx = c.getContext('2d'); bg(ctx); divider(ctx);
        ok = drawColourArray(ctx, cl, LEFT) && drawColourArray(ctx, cr, RIGHT);
        later(() => mask(ctx), 800);
        later(() => promptOnCanvas(ctx, 'Which side had more colours?'), 1000);
      },
      on_finish: (d) => {
        clearTimers();
        const side = sideOfKey(d.response); const larger = cl > cr ? 'left' : 'right';
        record(d, {
          task: 'colour', phase, trial_num: num, block_attempt: attemptFn ? attemptFn() : 1,
          colours_left: cl, colours_right: cr, larger_side: larger, ratio_actual: +(Math.max(cl, cr) / Math.min(cl, cr)).toFixed(3),
          response: d.response, response_side: side, timed_out: side ? 0 : 1, correct: side ? (side === larger ? 1 : 0) : null,
          answered_during_stimulus: d.rt !== null && d.rt < 1000 ? 1 : 0, items_drawn_ok: ok ? 1 : 0
        });
      }
    };
  }
  const fix = { type: jsPsychCanvasKeyboardResponse, canvas_size: [H, W], choices: 'NO_KEYS', trial_duration: 500, stimulus: (c) => { const x = c.getContext('2d'); bg(x); divider(x); fixation(x); } };
  const pracItems = [[2, 8], [7, 2], [3, 8], [8, 3], [2, 7], [6, 2]].slice(0, nPrac);
  const prac = (attemptFn) => pracItems.flatMap(([l, r], i) => [fix, trial(l, r, 'practice', i + 1, attemptFn), feedbackTrial(lastRowFeedback)]);
  const pairs = [[3, 5], [3, 6], [4, 6], [4, 7], [5, 8]]; let list = [];
  pairs.forEach(([a, b]) => { for (let k = 0; k < 10; k++) list.push([b, a], [a, b]); });
  list = shuffle(list).slice(0, nMain);
  const main = list.flatMap(([l, r], i) => [fix, trial(l, r, 'main', i + 1)]);
  return [practiceBlock(prac), practiceDoneTrial(), ...main];
}

function buildTask(key, n) {
  if (key === 'srt') return buildSRT(...n.srt);
  if (key === 'dotenum') return buildDotEnum(...n.dotenum);
  if (key === 'numcomp') return buildNumComp(...n.numcomp);
  if (key === 'colour') return buildColour(...n.colour);
  return buildNumerosity(key, ...n.numerosity);
}

/* ---------- 5. SETUP SCREEN AND SESSION -------------------------------------- */
const SESSION_TASKS = {
  visit1: () => ['srt', 'dotenum', 'numcomp'],
  visit2: (g) => STUDY.orders[g].slice(),
  all: (g) => ['srt', 'dotenum', 'numcomp'].concat(STUDY.orders[g])
};
function orderFor(num) { return ['A', 'B', 'C', 'D'][(num - 1) % 4]; }
const $ = (id) => document.getElementById(id);

function readSetup() {
  const errs = []; const demo = $('demo').checked;
  const num = parseInt($('pnum').value, 10);
  const v = {
    experimenter: $('exp').value.trim().toUpperCase(), school: $('school').value.trim().toUpperCase(),
    cls: $('cls').value, age: $('age').value, sex: $('sex').value,
    consent: $('consent').checked, assent: $('assent').checked, demo, num
  };
  if (!v.experimenter) errs.push('Write your initials.');
  if (!demo) {
    if (!(num >= 1 && num <= 999)) errs.push('Participant number must be a number from 1 to 999.');
    if (!v.school) errs.push('Write the school code.');
    if (!v.cls) errs.push('Choose the class.');
    if (!(+v.age >= 6 && +v.age <= 16)) errs.push('Age must be between 6 and 16.');
    if (!v.sex) errs.push('Choose sex.');
    if (!v.consent) errs.push('Tick the box: signed parent consent form is on file.');
    if (!v.assent) errs.push('Tick the box: the child said yes.');
  }
  return { v, errs };
}
function refreshIdPreview() {
  const num = parseInt($('pnum').value, 10); const demo = $('demo').checked;
  if (demo) { $('idpreview').innerHTML = 'Training mode: short tasks, file named <b>DEMO_...</b>. Not for real children.'; return; }
  if (num >= 1 && num <= 999) {
    const id = `${STUDY.idPrefix}_${pad(num, 3)}`; const g = $('ordersel').value || orderFor(num);
    const done = store.index().filter(e => e.id === id && !e.demo);
    $('idpreview').innerHTML = `Participant ID: <b>${id}</b> &nbsp;&middot;&nbsp; Deep-battery order: <b>${g}</b> (${STUDY.orders[g].map(k => TASK_LABEL[k]).join(' &rarr; ')})` +
      (done.length ? `<div class="warn">Already run on this laptop: ${done.map(e => `${e.session} on ${e.when} (${statusLabel(e.status)})`).join('; ')}. Check the number is right.</div>` : '');
  } else $('idpreview').textContent = '';
}
/* A session still marked in_progress when the setup screen loads was cut off (crash, tab closed). */
function statusLabel(s) { return s === 'in_progress' ? 'interrupted' : s.replace('_', ' '); }
function renderHistory() {
  const ix = store.index(); const box = $('history');
  if (!store.ok) { box.innerHTML = '<div class="warn">This browser cannot autosave. Please use Google Chrome.</div>'; return; }
  if (!ix.length) { box.innerHTML = '<p class="small">No sessions saved on this laptop yet.</p>'; return; }
  const unfinished = ix.filter(e => e.status !== 'completed');
  box.innerHTML = (unfinished.length ? `<div class="warn">${unfinished.length} session(s) did not finish normally. Their data up to the stop is safe: download below.</div>` : '') +
    '<table><tr><th>File</th><th>When</th><th>Status</th><th>Trials</th><th></th></tr>' +
    ix.map(e => `<tr><td>${e.file}</td><td>${e.when}</td><td>${statusLabel(e.status)}</td><td>${e.rows}</td>` +
      `<td><button class="small-btn" data-dl="${e.key}">Download</button></td></tr>`).join('') + '</table>';
  box.querySelectorAll('[data-dl]').forEach(b => b.onclick = () => { const e = ix.find(x => x.key === b.dataset.dl); downloadText(e.file, store.get(e.key) || ''); });
}

function startSession(sessionType, singleTask) {
  const { v, errs } = readSetup();
  if (errs.length) { $('errors').innerHTML = errs.map(e => `<div>&bull; ${e}</div>`).join(''); $('errors').scrollIntoView(); return; }
  const id = v.demo ? 'DEMO' : `${STUDY.idPrefix}_${pad(v.num, 3)}`;
  const group = v.demo ? 'A' : ($('ordersel').value || orderFor(v.num));
  const label = singleTask ? `single_${singleTask}` : sessionType;
  if (!v.demo && store.index().some(e => e.id === id && e.session === label && e.status === 'completed') &&
      !confirm(`${id} has already completed "${label}" on this laptop. Run it again?`)) return;
  store.pref('exp', v.experimenter); if (v.school) store.pref('school', v.school);
  const tasks = singleTask ? [singleTask] : SESSION_TASKS[sessionType](group);
  const now = new Date();
  const emojiOk = emojiRenders();
  SESSION.meta = {
    participant_id: id, session_type: singleTask ? `single_${singleTask}` : sessionType, demo_mode: v.demo,
    start_ms: now.getTime(), status: 'in_progress',
    rowMeta: {
      battery_version: STUDY.version, study: STUDY.name, participant_id: id, participant_num: v.demo ? null : v.num,
      school_code: v.school || null, experimenter: v.experimenter, class_grade: v.cls || null, age: v.age || null,
      sex: v.sex || null, session_type: singleTask ? `single_${singleTask}` : sessionType, order_group: group,
      demo_mode: v.demo ? 1 : 0, session_start: localStamp(now), consent_on_file: v.consent ? 1 : 0, assent_given: v.assent ? 1 : 0,
      emoji_ok: emojiOk ? 1 : 0, screen_w: screen.width, screen_h: screen.height, pixel_ratio: window.devicePixelRatio, browser: navigator.userAgent
    }
  };
  SESSION.storeKey = `dyscalc_${id}_${now.getTime()}`; SESSION.rows = [];
  autosave('in_progress');
  runSession(tasks, v.demo ? STUDY.trials.demo : STUDY.trials.full);
}

function runSession(tasks, n) {
  $('setup').style.display = 'none'; $('jspsych-target').style.display = 'block';
  SESSION.running = true;
  const jsPsych = initJsPsych({
    display_element: 'jspsych-target', show_progress_bar: true, message_progress_bar: 'Progress',
    on_finish: () => finishSession('completed')
  });
  SESSION.jsPsych = jsPsych;
  const timeline = [{ type: jsPsychFullscreen, fullscreen_mode: true, message: '<div class="instr"><h2>Ready</h2><p>The screen will go full-screen. Sit the child comfortably in front of the laptop.</p><p class="small">Emergency stop at any time: hold <b>Shift</b> and press <b>Q</b>. Data is saved after every trial.</p></div>', button_label: 'Start' }];
  tasks.forEach((key, i) => {
    const introKey = key === 'dotenum' ? `dotenum_${STUDY.dotEnumTiming}` : key;
    timeline.push({ timeline: [introTrial(introKey, i + 1, tasks.length)], on_timeline_start: () => { SESSION.currentTask = key; } });
    const block = buildTask(key, n);
    timeline.push({
      timeline: block,
      on_timeline_start: () => { SESSION.currentTask = key; SESSION.meta.rowMeta.task_position = i + 1; }
    });
    if (i < tasks.length - 1) timeline.push({ type: jsPsychHtmlKeyboardResponse, stimulus: TEXT.breakScreen(i + 1, tasks.length), choices: [' '] });
  });
  timeline.push({ type: jsPsychFullscreen, fullscreen_mode: false });
  jsPsych.run(timeline);
}

function finishSession(status) {
  if (!SESSION.running) return;
  SESSION.running = false; clearTimers();
  autosave(status);
  const name = fileName(SESSION.meta); const csv = toCSV(SESSION.rows);
  downloadText(name, csv);
  try { if (document.fullscreenElement) document.exitFullscreen(); } catch (e) {}
  $('jspsych-target').style.display = 'none';
  const done = $('done'); done.style.display = 'block';
  $('donemsg').innerHTML = (status === 'completed' ? '<h1 class="ok">&#10003; Session finished and saved</h1>' : '<h1 class="warnh">Session stopped early &mdash; data saved</h1>') +
    `<p>File: <b>${name}</b> (${SESSION.rows.length} trials) is in your Downloads folder.</p>` +
    '<p>If you cannot find it, press <b>Download again</b>. The data also stays on this laptop.</p>' +
    '<p>Today, copy the file to the USB drive and the shared Google Drive folder.</p>';
  $('again').onclick = () => downloadText(name, csv);
}

/* Emergency stop: Shift+Q. Warn before closing the tab mid-session. */
document.addEventListener('keydown', (e) => {
  if (SESSION.running && e.shiftKey && (e.key === 'Q' || e.key === 'q')) {
    if (confirm('Stop this session now? The data collected so far will be saved.')) {
      finishSession('stopped_early'); try { SESSION.jsPsych.endExperiment(''); } catch (err) {}
    }
  }
});
window.addEventListener('beforeunload', (e) => { if (SESSION.running) { autosave('interrupted'); e.preventDefault(); e.returnValue = ''; } });

function initSetup() {
  if (typeof initJsPsych !== 'function') { $('setup').innerHTML = '<h1>Error: the experiment library did not load.</h1><p>Download the battery file again from GitHub.</p>'; return; }
  $('version').textContent = STUDY.version; $('studyname').textContent = STUDY.name;
  $('exp').value = store.pref('exp'); $('school').value = store.pref('school');
  // order override menu (advanced)
  $('ordersel').innerHTML = '<option value="">Automatic (recommended)</option>' + Object.keys(STUDY.orders).map(g => `<option value="${g}">${g}</option>`).join('');
  ['pnum', 'demo', 'ordersel'].forEach(i => { $(i).addEventListener('input', refreshIdPreview); $(i).addEventListener('change', refreshIdPreview); });
  $('btn-v1').onclick = () => startSession('visit1');
  $('btn-v2').onclick = () => startSession('visit2');
  $('btn-all').onclick = () => startSession('all');
  document.querySelectorAll('[data-task]').forEach(b => b.onclick = () => startSession('single', b.dataset.task));
  // device check
  const small = window.innerWidth < 960 || window.innerHeight < 560;
  const emoji = emojiRenders();
  $('devicecheck').innerHTML =
    (small ? '<div class="warn">Screen/window is small. Maximise the browser window, or use a laptop with a larger screen.</div>' : '<div class="okline">&#10003; Screen size OK</div>') +
    (emoji ? '<div class="okline">&#10003; Picture icons display correctly</div>' : '<div class="warn">Picture icons (Task: more things) do not display on this laptop. Use Google Chrome, or skip that task and tell the supervisor.</div>') +
    (store.ok ? '<div class="okline">&#10003; Autosave works</div>' : '<div class="warn">Autosave not available. Use Google Chrome.</div>');
  refreshIdPreview(); renderHistory();
}
window.addEventListener('DOMContentLoaded', initSetup);
