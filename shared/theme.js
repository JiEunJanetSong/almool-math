/* TouchMath 공용 테마 — classic script, window.TMTheme */
(function (root) {
'use strict';

const PAL_NORMAL = { A: '#534AB7', B: '#1D9E75', C: '#D85A30', D: '#BA7517', E: '#EF9F27', muted: '#888780', ok: '#1D9E75', progress: '#534AB7' };
const PAL_CB = { A: '#648FFF', B: '#DC267F', C: '#FE6100', D: '#785EF0', E: '#FFB000', muted: '#888780', ok: '#DC267F', progress: '#648FFF' };
const PAL_DARK = { A: '#58C4DD', B: '#83C167', C: '#FC6255', D: '#F3C969', E: '#F2A86F', muted: '#6B7280', ok: '#83C167', progress: '#58C4DD' };
const PAL_DARK_CB = { A: '#7AA2FF', B: '#FF7AB6', C: '#FF8A3D', D: '#B891FF', E: '#FFD166', muted: '#6B7280', ok: '#FF7AB6', progress: '#7AA2FF' };

function pickPalette(dark, cb) { return dark ? (cb ? PAL_DARK_CB : PAL_DARK) : (cb ? PAL_CB : PAL_NORMAL); }

const hasDOM = typeof root.document !== 'undefined';
const state = {
  themeMode: 'system',
  colorblind: false,
  glassMode: (hasDOM && root.localStorage && localStorage.getItem('almool:math:glassMode')) || 'auto',
};
let onChange = () => {};

function isDark() {
  if (state.themeMode === 'dark') return true;
  if (state.themeMode === 'light') return false;
  return hasDOM ? root.matchMedia('(prefers-color-scheme:dark)').matches : false;
}
function palette() { return pickPalette(isDark(), state.colorblind); }

function setTheme(t) {
  state.themeMode = t;
  if (!hasDOM) return;
  const b = document.body;
  b.classList.remove('theme-light', 'theme-dark', 'theme-system');
  b.classList.add('theme-' + t);
  document.querySelectorAll('#theme-group .seg-btn').forEach((btn, i) => {
    const on = ['light', 'system', 'dark'][i] === t;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-checked', String(on));
  });
  onChange('theme');
}

function toggleColorblind() {
  state.colorblind = !state.colorblind;
  if (!hasDOM) return;
  const btn = document.getElementById('cb-btn');
  if (btn) { btn.classList.toggle('active', state.colorblind); btn.setAttribute('aria-pressed', String(state.colorblind)); }
  onChange('colorblind');
}

function evaluateGlass() {
  if (state.glassMode === 'on') return true;
  if (state.glassMode === 'off') return false;
  const supports = (typeof CSS !== 'undefined' && CSS.supports) && (CSS.supports('backdrop-filter', 'blur(10px)') || CSS.supports('-webkit-backdrop-filter', 'blur(10px)'));
  const noReduceTransp = !root.matchMedia('(prefers-reduced-transparency:reduce)').matches;
  const noReduceMotion = !root.matchMedia('(prefers-reduced-motion:reduce)').matches;
  return !!(supports && noReduceTransp && noReduceMotion);
}
function applyGlass() {
  if (!hasDOM) return;
  const on = evaluateGlass();
  document.body.classList.toggle('glass-on', on);
  document.body.classList.toggle('glass-off', !on);
}
function setGlass(m) {
  state.glassMode = m;
  if (!hasDOM) return;
  if (m === 'auto') localStorage.removeItem('almool:math:glassMode'); else localStorage.setItem('almool:math:glassMode', m);
  document.querySelectorAll('#glass-group .seg-btn').forEach((btn, i) => {
    const on = ['auto', 'on', 'off'][i] === m;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-checked', String(on));
  });
  applyGlass();
}

function init(opts) {
  if (opts && opts.onChange) onChange = opts.onChange;
  if (!hasDOM) return;
  setGlass(state.glassMode);
  ['(prefers-reduced-transparency:reduce)', '(prefers-reduced-motion:reduce)'].forEach(q => {
    const mq = root.matchMedia(q);
    const h = () => { if (state.glassMode === 'auto') applyGlass(); };
    if (mq.addEventListener) mq.addEventListener('change', h); else mq.addListener(h);
  });
}

root.TMTheme = { init, setTheme, toggleColorblind, setGlass, isDark, palette, pickPalette, state };
})(typeof window !== 'undefined' ? window : globalThis);
