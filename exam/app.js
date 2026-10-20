/* 기출 풀이 앱 — problems.jsonl 로드, 내비/문항/단계 상태 관리 */
'use strict';

let problems = [];
let cur = null;      // 현재 record
let step = 0;
let solving = false;

const E = TMEngine.create({
  canvas: document.getElementById('c'),
  getBg: () => TMTheme.isDark() ? '#111827' : '#faf9f6',
  getTextColor: () => TMTheme.isDark() ? '#F2EECB' : '#1a1a1a',
});

function render() {
  if (!cur) return;
  E.beginFrame(TMTheme.isDark());
  TMSceneRenderer.draw(E, TMTheme.palette(), cur, solving ? step : 0, TMTheme.isDark());
}

function katexTo(el, tex) {
  el.innerHTML = '';
  if (typeof katex === 'undefined') { el.textContent = tex; return; }
  tex = tex.replace(/\n{2,}\$\$/g, '\n$$').replace(/\$\$\n{2,}/g, '$$\n');
  tex.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/).forEach(part => {
    if (part.startsWith('$$') && part.endsWith('$$') && part.length > 4) {
      const div = document.createElement('div');
      div.className = 'math-display';
      katex.render(part.slice(2, -2), div, { throwOnError: false, displayMode: true });
      el.appendChild(div);
    } else if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
      const span = document.createElement('span');
      katex.render(part.slice(1, -1), span, { throwOnError: false });
      el.appendChild(span);
    } else if (part) {
      el.appendChild(document.createTextNode(part));
    }
  });
}

const MONTH_ORDER = { '00': 0, '06': 1, '09': 2, '11': 3 };

function buildNav() {
  const nav = document.getElementById('nav');
  nav.innerHTML = '';
  const groups = new Map();
  for (const p of problems) {
    const key = TMLang.examGroup(p.exam.schoolYear, p.exam.month);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(p);
  }
  for (const [label, list] of groups) {
    const h = document.createElement('div');
    h.className = 'nav-exam'; h.textContent = label;
    nav.appendChild(h);
    for (const p of list.sort((a, b) => a.exam.number - b.exam.number)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'pbtn' + (cur && cur.id === p.id ? ' active' : '');
      const num = document.createElement('span');
      num.textContent = TMLang.t('problemNum')(p.exam.number);
      const topic = document.createElement('span');
      topic.className = 'topic';
      topic.textContent = TMLang.topicLabel(p.topic);
      b.append(num, topic);
      b.onclick = () => selectProblem(p.id);
      nav.appendChild(b);
    }
  }
}

function renderTexts() {
  if (!cur) return;
  document.getElementById('hint').textContent = cur.mode === '2d' ? TMLang.t('hintScroll') : TMLang.t('hintRotate');
  document.getElementById('prob-label').textContent = TMLang.examLabel(cur.exam.schoolYear, cur.exam.month, cur.exam.number);
  katexTo(document.getElementById('statement'), TMLang.field(cur, 'statement'));
  const thmCard = document.getElementById('thm-card');
  const links = document.getElementById('thm-links');
  links.innerHTML = '';
  if (cur.theorems && cur.theorems.length) {
    thmCard.hidden = false;
    for (const t of cur.theorems) {
      const a = document.createElement('a');
      a.href = `../geometry/index.html?scene=${encodeURIComponent(t.key)}`;
      a.textContent = TMLang.theoremLabel(t.key, t.label);
      links.appendChild(a);
    }
  } else thmCard.hidden = true;
}

function selectProblem(id) {
  cur = problems.find(p => p.id === id) || problems[0];
  step = 0; solving = false;
  if (cur.camera) { E.state.rotX = cur.camera.rotX; E.state.rotY = cur.camera.rotY; E.state.zoom = cur.camera.zoom; }
  renderTexts();
  document.getElementById('steps-ui').hidden = true;
  document.getElementById('start-solve').hidden = false;
  const url = new URL(location);
  url.searchParams.set('id', cur.id);
  history.replaceState(null, '', url);
  buildNav();
  render();
}

function onLangChange() {
  buildNav();
  renderTexts();
  if (solving) updateStep();
}

function startSolve() {
  solving = true; step = 0;
  document.getElementById('start-solve').hidden = true;
  document.getElementById('steps-ui').hidden = false;
  updateStep();
}

function updateStep() {
  const s = cur.steps[step];
  if (s.camera) { E.state.rotX = s.camera.rotX; E.state.rotY = s.camera.rotY; E.state.zoom = s.camera.zoom; }
  katexTo(document.getElementById('step-text'), TMLang.stepField(s, 'text'));
  document.getElementById('step-pos').textContent = `${step + 1} / ${cur.steps.length}`;
  document.getElementById('step-prev').disabled = step === 0;
  document.getElementById('step-next').disabled = step === cur.steps.length - 1;
  const last = step === cur.steps.length - 1;
  document.getElementById('answer-row').hidden = !last;
  if (last) katexTo(document.getElementById('answer-val'), `$${cur.answer}$`);
  render();
}

function stepPrev() { if (solving && step > 0) { step--; updateStep(); } }
function stepNext() { if (solving && step < cur.steps.length - 1) { step++; updateStep(); } }

document.addEventListener('keydown', e => {
  if (!solving) return;
  if (e.key === 'ArrowLeft') { stepPrev(); e.preventDefault(); }
  if (e.key === 'ArrowRight') { stepNext(); e.preventDefault(); }
});

TMTheme.init({ onChange: render });
TMLang.init({ onChange: onLangChange });
E.attachInput({ onRender: render, allowRotate: () => !cur || cur.mode !== '2d' });
window.addEventListener('resize', render);

fetch('problems.jsonl', { cache: 'no-store' })
  .then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
  .then(text => text.split('\n').filter(Boolean).map(l => JSON.parse(l)))
  .catch(() => {
    document.getElementById('statement').textContent = TMLang.t('loadError');
    return null;
  })
  .then(list => {
    if (!list) return;
    problems = list;
    problems.sort((a, b) => (b.exam.schoolYear - a.exam.schoolYear)
      || (MONTH_ORDER[a.exam.month] - MONTH_ORDER[b.exam.month])
      || (a.exam.number - b.exam.number));
    const want = new URLSearchParams(location.search).get('id');
    selectProblem(want || problems[0].id);
  });
