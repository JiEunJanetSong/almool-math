/* TouchMath 공용 캔버스 3D 미니 엔진 — classic script, window.TMEngine */
(function (root) {
'use strict';

const MATH_SCALE = 1.45;
const FONTS = {
  MATH: (sz, w) => `italic ${w || 400} ${Math.round((sz || 16) * MATH_SCALE)}px "KaTeX_Math","Latin Modern Math","STIX Two Math","Cambria Math","Palatino Linotype",Palatino,'Pretendard Variable',Pretendard,Georgia,serif`,
  MATH_LBL: (sz) => `italic 400 ${sz || 24}px "KaTeX_Math","Latin Modern Math","STIX Two Math","Cambria Math","Palatino Linotype",Palatino,'Pretendard Variable',Pretendard,Georgia,serif`,
  UI: (sz, w) => `${w || 500} ${sz || 16}px 'Pretendard Variable',Pretendard,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif`,
};

function create(opts) {
  const canvas = opts.canvas;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  const getBg = opts.getBg || (() => '#faf9f6');
  const getTextColor = opts.getTextColor || (() => '#1a1a1a');
  const avoidLabel = opts.avoidLabel || ((x, y) => [x, y]);
  const state = { rotX: 0.42, rotY: -0.28, zoom: 1.5, sc: 1, drag: false, lx: 0, ly: 0, pinchDist: 0, pinchZoom: 1 };

  function project(x, y, z) {
    const dpr = root.devicePixelRatio || 1;
    const W = canvas.width / dpr, H = canvas.height / dpr;
    const cx = Math.cos(state.rotX), sx = Math.sin(state.rotX), cy = Math.cos(state.rotY), sy = Math.sin(state.rotY);
    const y2 = y * cx - z * sx, z2 = y * sx + z * cx;
    const x3 = x * cy + z2 * sy, z3 = -x * sy + z2 * cy;
    const f = 4 / (4 + z3 * 0.001 * state.sc);
    return [W / 2 + x3 * state.sc * f, H / 2 - y2 * state.sc * f];
  }

  function beginFrame(dark) {
    const dpr = root.devicePixelRatio || 1;
    canvas.width = canvas.offsetWidth * dpr;
    canvas.height = canvas.offsetHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.textBaseline = 'alphabetic';
    state.sc = Math.min(canvas.offsetWidth, canvas.offsetHeight) * 0.0022 * state.zoom;
    const W = canvas.offsetWidth, H = canvas.offsetHeight;
    ctx.fillStyle = getBg(); ctx.fillRect(0, 0, W, H);
    const grd = ctx.createRadialGradient(W * 0.32, H * 0.30, Math.min(W, H) * 0.1, W * 0.5, H * 0.55, Math.max(W, H) * 0.85);
    grd.addColorStop(0, dark ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.55)');
    grd.addColorStop(1, dark ? 'rgba(0,0,0,0.10)' : 'rgba(0,0,0,0.04)');
    ctx.fillStyle = grd; ctx.fillRect(0, 0, W, H);
  }

  function haloText(text, x, y, color, font, haloW) {
    ctx.font = font;
    const m = ctx.measureText(text);
    const sizeMatch = font.match(/(\d+(?:\.\d+)?)px/);
    const h = sizeMatch ? parseFloat(sizeMatch[1]) : 16;
    const adj = avoidLabel(x, y, m.width, h);
    ctx.lineWidth = haloW || 4;
    ctx.strokeStyle = getBg();
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    ctx.strokeText(text, adj[0], adj[1]);
    ctx.fillStyle = color;
    ctx.fillText(text, adj[0], adj[1]);
  }

  function line(ax, ay, az, bx, by, bz, col, w, dash) {
    const [x1, y1] = project(ax, ay, az), [x2, y2] = project(bx, by, bz);
    ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = w || 2;
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.setLineDash(dash || []); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
  }

  function dot(x, y, z, col, r, label) {
    const [px, py] = project(x, y, z);
    const rad = r || 7;
    ctx.beginPath(); ctx.arc(px, py, rad + 1.6, 0, Math.PI * 2); ctx.fillStyle = getBg(); ctx.fill();
    ctx.beginPath(); ctx.arc(px, py, rad, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill();
    if (label) haloText(label, px + rad + 5, py - rad, getTextColor(), FONTS.MATH_LBL(19), 4);
  }

  function plane(corners, col, a) {
    const pts = corners.map(([x, y, z]) => project(x, y, z));
    ctx.beginPath();
    pts.forEach(([px, py], i) => { i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.closePath();
    ctx.fillStyle = col; ctx.globalAlpha = a || 0.13; ctx.fill();
    ctx.globalAlpha = Math.min(0.55, (a || 0.13) * 3.5); ctx.lineWidth = 1; ctx.lineJoin = 'round'; ctx.strokeStyle = col; ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function text(x, y, z, str, col, size) {
    const [px, py] = project(x, y, z);
    haloText(str, px, py, col || getTextColor(), FONTS.MATH(size || 17), 3.5);
  }

  function rightAngle(vx, vy, vz, ax, ay, az, bx, by, bz, col) {
    const pv = project(vx, vy, vz), pa = project(ax, ay, az), pb = project(bx, by, bz);
    const da = [pa[0] - pv[0], pa[1] - pv[1]], db = [pb[0] - pv[0], pb[1] - pv[1]];
    const la = Math.hypot(da[0], da[1]), lb = Math.hypot(db[0], db[1]);
    if (la < 1 || lb < 1) return;
    const ua = [da[0] / la * 12, da[1] / la * 12], ub = [db[0] / lb * 12, db[1] / lb * 12];
    ctx.beginPath();
    ctx.moveTo(pv[0] + ua[0], pv[1] + ua[1]);
    ctx.lineTo(pv[0] + ua[0] + ub[0], pv[1] + ua[1] + ub[1]);
    ctx.lineTo(pv[0] + ub[0], pv[1] + ub[1]);
    ctx.strokeStyle = col || getTextColor(); ctx.lineWidth = 1.8; ctx.lineCap = 'square'; ctx.lineJoin = 'miter'; ctx.stroke();
  }

  function attachInput(o) {
    const onRender = (o && o.onRender) || (() => {});
    const allow = () => {
      const v = o && o.allowRotate;
      return (typeof v === 'function' ? v() : v) !== false;
    };
    const st = state;
    canvas.addEventListener('mousedown', e => { st.drag = true; st.lx = e.clientX; st.ly = e.clientY; });
    canvas.addEventListener('mousemove', e => {
      if (!st.drag || !allow()) return;
      st.rotY += (e.clientX - st.lx) * 0.008; st.rotX += (e.clientY - st.ly) * 0.008;
      st.lx = e.clientX; st.ly = e.clientY; onRender();
    });
    root.document.addEventListener('mouseup', () => st.drag = false);
    canvas.addEventListener('wheel', e => {
      st.zoom *= e.deltaY > 0 ? 0.92 : 1.09;
      st.zoom = Math.max(0.4, Math.min(3.5, st.zoom));
      onRender(); e.preventDefault();
    }, { passive: false });
    function touchDistance(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
    canvas.addEventListener('touchstart', e => {
      if (e.touches.length === 2) { st.drag = false; st.pinchDist = touchDistance(e.touches); st.pinchZoom = st.zoom; e.preventDefault(); return; }
      st.drag = true; st.pinchDist = 0; st.lx = e.touches[0].clientX; st.ly = e.touches[0].clientY;
    }, { passive: false });
    canvas.addEventListener('touchmove', e => {
      if (e.touches.length === 2 && st.pinchDist > 0) {
        const ratio = touchDistance(e.touches) / st.pinchDist;
        st.zoom = Math.max(0.4, Math.min(3.5, st.pinchZoom * ratio));
        onRender(); e.preventDefault(); return;
      }
      if (!st.drag || e.touches.length !== 1 || !allow()) return;
      st.rotY += (e.touches[0].clientX - st.lx) * 0.009;
      st.rotX += (e.touches[0].clientY - st.ly) * 0.009;
      st.lx = e.touches[0].clientX; st.ly = e.touches[0].clientY;
      onRender(); e.preventDefault();
    }, { passive: false });
    canvas.addEventListener('touchend', e => { if (e.touches.length < 2) st.pinchDist = 0; if (e.touches.length === 0) st.drag = false; });
    canvas.addEventListener('touchcancel', () => { st.drag = false; st.pinchDist = 0; });
  }

  return { canvas, ctx, state, project, beginFrame, line, dot, plane, text, rightAngle, haloText, fonts: FONTS, attachInput };
}

root.TMEngine = { create, FONTS };
})(typeof window !== 'undefined' ? window : globalThis);
