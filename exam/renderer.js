/* 선언적 씬 → TMEngine 호출. classic script, window.TMSceneRenderer */
(function (root) {
'use strict';

const ORDER = { plane: 0, projection: 1, sphere: 2, circle: 3, arc3d: 3, ellipse: 3, parabola: 3, hyperbola: 3, segment: 4, vector: 5, point: 6, rightangle: 7, arc: 8, label: 9 };

function mapPoint(p, scale) { return [p[0] * scale, p[2] * scale, p[1] * scale]; }

/* 캔버스 라벨용 LaTeX → 유니코드 평문 수식. 캔버스 텍스트는 KaTeX를 못 쓰므로
   저작된 LaTeX 라벨을 읽을 수 있는 평문 표기로 바꿔 그린다. */
const SUP = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹', '+': '⁺', '-': '⁻', 'n': 'ⁿ' };
const SUB = { '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉', '+': '₊', '-': '₋' };
const SYM = {
  times: '×', cdot: '·', div: '÷', pm: '±', mp: '∓', le: '≤', leq: '≤', ge: '≥', geq: '≥', ne: '≠', neq: '≠',
  angle: '∠', perp: '⊥', parallel: '∥', therefore: '∴', because: '∵', infty: '∞', rightarrow: '→', to: '→',
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', theta: 'θ', pi: 'π', lambda: 'λ', mu: 'μ', phi: 'φ', omega: 'ω',
  triangle: '△', square: '□', circ: '°', prime: '′', in: '∈', subset: '⊂', cap: '∩', cup: '∪', equiv: '≡', sim: '∼', approx: '≈',
  sin: 'sin', cos: 'cos', tan: 'tan', cot: 'cot', sec: 'sec', csc: 'csc', log: 'log', ln: 'ln', lim: 'lim', min: 'min', max: 'max',
  quad: ' ', qquad: ' ', Rightarrow: '⇒', Leftrightarrow: '⇔', implies: '⇒',
};
const SYMRE = new RegExp('\\\\(' + Object.keys(SYM).sort((a, b) => b.length - a.length).join('|') + ')(?![a-zA-Z])', 'g');
function plainMath(s) {
  if (!s || s.indexOf('\\') === -1 && s.indexOf('$') === -1 && s.indexOf('^') === -1 && s.indexOf('_') === -1) return s;
  let t = String(s).replace(/\$/g, '').replace(SYMRE, (m, w) => SYM[w]);
  const grp = '((?:[^{}]|\\{[^{}]*\\})*)';
  for (let i = 0; i < 4; i++) {
    t = t
      .replace(new RegExp('\\\\(?:d?frac)\\{' + grp + '\\}\\{' + grp + '\\}', 'g'),
        (m, a, b) => `${/[+\-±∓ ]/.test(a) ? '(' + a + ')' : a}/${/[+\-±∓ ]/.test(b) ? '(' + b + ')' : b}`)
      .replace(new RegExp('\\\\sqrt\\{' + grp + '\\}', 'g'), (m, a) => /[+\-± ]/.test(a) ? `√(${a})` : `√${a}`)
      .replace(/\\sqrt\s*(\d+|[a-zA-Z])/g, '√$1')
      .replace(/\\d?frac\s*(\d|[a-zA-Z])\s*(\d|[a-zA-Z])/g, '$1/$2')
      .replace(new RegExp('\\\\(?:mathrm|mrm|text|operatorname)\\{' + grp + '\\}', 'g'), '$1')
      .replace(new RegExp('\\\\(?:overrightarrow|overline|vec|bar|hat|widehat)\\{' + grp + '\\}', 'g'), '$1')
      .replace(new RegExp('\\\\left\\s*([(\\[|{.])', 'g'), (m, d) => d === '{' ? '{' : d === '.' ? '' : d)
      .replace(new RegExp('\\\\right\\s*([)\\]|}.])', 'g'), (m, d) => d === '}' ? '}' : d === '.' ? '' : d);
  }
  t = t
    .replace(/\^\{([^{}]*)\}/g, (m, a) => [...a].every(c => SUP[c]) ? [...a].map(c => SUP[c]).join('') : '^' + a)
    .replace(/\^(\d|[+\-n])/g, (m, a) => SUP[a] || '^' + a)
    .replace(/_\{([^{}]*)\}/g, (m, a) => [...a].every(c => SUB[c]) ? [...a].map(c => SUB[c]).join('') : a)
    .replace(/_(\d)/g, (m, a) => SUB[a] || a)
    .replace(/_([A-Za-z](?:'|′)?)/g, '$1')
    .replace(/\^(?:o\b|\{?°\}?)/g, '°')
    .replace(/\\([a-zA-Z]+)/g, (m, w) => SYM[w] !== undefined ? SYM[w] : m)
    .replace(/\\([{}%$])/g, '$1')
    .replace(/\\[,;:!]|\\ /g, ' ')
    .replace(/[{}]/g, '')
    .replace(/([A-Za-z0-9√²³]+)\/([A-Za-z0-9√]+)(?=[A-Za-z(])/g, '($1/$2)')
    .replace(/\s+/g, ' ')
    .trim();
  return t;
}

function localText(o, key) {
  if (typeof TMLang !== 'undefined' && TMLang.lang() === 'en' && o[key + '_en']) return o[key + '_en'];
  return o[key];
}

function visibleObjects(rec, stepIndex) {
  const show = new Set((rec.steps[stepIndex] || rec.steps[0]).show);
  return rec.objects.filter(o => o.tags.some(t => show.has(t)));
}

function circlePoints(center, normal, r, n) {
  n = n || 64;
  const [nx, ny, nz] = normal;
  const nl = Math.hypot(nx, ny, nz);
  const u0 = Math.abs(nx / nl) < 0.9 ? [1, 0, 0] : [0, 1, 0];
  // u = normalize(u0 × n), v = normalize(n × u)
  let u = [u0[1] * nz - u0[2] * ny, u0[2] * nx - u0[0] * nz, u0[0] * ny - u0[1] * nx];
  const ul = Math.hypot(...u); u = u.map(c => c / ul);
  let v = [ny * u[2] - nz * u[1], nz * u[0] - nx * u[2], nx * u[1] - ny * u[0]];
  const vl = Math.hypot(...v); v = v.map(c => c / vl);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([
      center[0] + r * (u[0] * Math.cos(t) + v[0] * Math.sin(t)),
      center[1] + r * (u[1] * Math.cos(t) + v[1] * Math.sin(t)),
      center[2] + r * (u[2] * Math.cos(t) + v[2] * Math.sin(t)),
    ]);
  }
  return pts;
}

function ellipsePoints(center, rx, ry, n) {
  n = n || 64;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2;
    pts.push([center[0] + rx * Math.cos(t), center[1] + ry * Math.sin(t), 0]);
  }
  return pts;
}

function parabolaPoints(form, p, vertex, span, n) {
  n = n || 48;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = -span + (i / n) * (2 * span);
    const sq = (t * t) / (4 * p);
    const [x, y] = form === 'x2=4py' ? [t, sq] : [sq, t];
    pts.push([vertex[0] + x, vertex[1] + y, 0]);
  }
  return pts;
}

function hyperbolaPoints(form, a, b, center, span, sign, n) {
  n = n || 40;
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = -span + (i / n) * (2 * span);
    const ch = sign * a * Math.cosh(t), sh = b * Math.sinh(t);
    const [x, y] = form === 'y2-x2' ? [sh, ch] : [ch, sh];
    pts.push([center[0] + x, center[1] + y, 0]);
  }
  return pts;
}

function placeLabel(lay, x, y, w, h) {
  const clampX = v => Math.min(Math.max(v, 4), Math.max(4, lay.W - w - 4));
  const clampY = v => Math.min(Math.max(v, h + 4), lay.H - 6);
  const cands = [[0, 0], [0, h + 6], [0, -(h + 6)], [w / 2 + 10, 0], [-(w / 2 + 10), 0],
    [0, 2 * (h + 6)], [w / 2 + 10, h + 6], [-(w / 2 + 10), h + 6], [0, -2 * (h + 6)], [0, 3 * (h + 6)]];
  for (const [dx, dy] of cands) {
    const nx = clampX(x + dx), ny = clampY(y + dy);
    const box = { x: nx - 2, y: ny - h - 2, w: w + 4, h: h + 4 };
    if (!lay.boxes.some(b => box.x < b.x + b.w && b.x < box.x + box.w && box.y < b.y + b.h && b.y < box.y + box.h)) {
      lay.boxes.push(box);
      return [nx, ny];
    }
  }
  const fx = clampX(x), fy = clampY(y);
  lay.boxes.push({ x: fx - 2, y: fy - h - 2, w: w + 4, h: h + 4 });
  return [fx, fy];
}

function draw(E, pal, rec, stepIndex, dark) {
  const step = rec.steps[stepIndex] || rec.steps[0];
  const focus = new Set(step.focus || []);
  const textCol = dark ? '#F2EECB' : '#1a1a1a';
  const col = o => (o.color === 'text' || !o.color) ? textCol : pal[o.color];
  const s = rec.scale;
  const ctx = E.ctx;
  const P = p => mapPoint(p, s);

  const labelQueue = [];
  const objs = visibleObjects(rec, stepIndex).slice().sort((a, b) => ORDER[a.type] - ORDER[b.type]);
  for (const o of objs) {
    const focused = focus.size === 0 || o.tags.some(t => focus.has(t));
    const dim = focused ? 1 : 0.35;
    ctx.globalAlpha = dim;
    drawObj(E, ctx, o, col(o), P, rec, s, textCol, dim, labelQueue);
    ctx.globalAlpha = 1;
  }
  // 라벨 레이아웃: 점 라벨(pri 0) 우선 고정 배치, 나머지는 충돌 회피
  const lay = { boxes: [], W: (E.canvas.offsetWidth || E.canvas.width || 800), H: (E.canvas.offsetHeight || E.canvas.height || 600) };
  labelQueue.sort((a, b) => a.pri - b.pri);
  for (const q of labelQueue) {
    ctx.font = q.font;
    const w = ctx.measureText(q.text).width;
    const hm = q.font.match(/(\d+(?:\.\d+)?)px/);
    const h = hm ? parseFloat(hm[1]) : 16;
    const [x, y] = placeLabel(lay, q.x, q.y, w, h);
    ctx.globalAlpha = q.alpha;
    E.haloText(q.text, x, y, q.color, q.font, q.halo);
    ctx.globalAlpha = 1;
  }
}

function polyline(E, ctx, pts3, color, width, dash, close) {
  ctx.beginPath();
  pts3.forEach((p, i) => {
    const [px, py] = E.project(p[0], p[1], p[2]);
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  });
  if (close) ctx.closePath();
  ctx.strokeStyle = color; ctx.lineWidth = width || 2;
  ctx.setLineDash(dash || []); ctx.stroke(); ctx.setLineDash([]);
}

function drawObj(E, ctx, o, color, P, rec, s, textCol, dim, labelQueue) {
  switch (o.type) {
    case 'plane': {
      E.plane(o.corners.map(P), color, (o.alpha || 0.13) * dim);
      ctx.globalAlpha = dim;
      if (o.label) {
        const c = P(o.corners[0]); const [px, py] = E.project(c[0], c[1], c[2]);
        labelQueue.push({ pri: 1, text: plainMath(localText(o, 'label')), x: px, y: py, font: E.fonts.MATH(13), color, halo: 3.5, alpha: dim });
      }
      break;
    }
    case 'point': {
      const [x, y, z] = P(o.at);
      E.dot(x, y, z, color, 6);
      if (o.label) {
        const [px, py] = E.project(x, y, z);
        labelQueue.push({ pri: 0, text: plainMath(o.label), x: px + 11, y: py - 6, font: E.fonts.MATH_LBL(19), color: textCol, halo: 4, alpha: dim });
      }
      break;
    }
    case 'segment':
      polyline(E, ctx, [P(o.from), P(o.to)], color, o.width || 2, o.dash);
      break;
    case 'sphere': {
      const [x, y, z] = P(o.center);
      const [cx, cy] = E.project(x, y, z);
      // 화면 반지름: 중심에서 카메라-우측으로 r만큼 이동한 점의 투영 거리
      const [ex, ey] = E.project(x + o.r * s, y, z);
      const pr = Math.hypot(ex - cx, ey - cy);
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.fillStyle = color; ctx.globalAlpha *= 0.12; ctx.fill(); ctx.globalAlpha /= 0.12;
      ctx.beginPath(); ctx.arc(cx, cy, pr, 0, Math.PI * 2);
      ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.stroke();
      break;
    }
    case 'circle':
      polyline(E, ctx, circlePoints(o.center, o.normal, o.r).map(P), color, 2, o.dash, true);
      break;
    case 'arc3d': {
      const sub = (p, q) => [p[0] - q[0], p[1] - q[1], p[2] - q[2]];
      const cr = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
      const dt = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
      const C = o.center, r = o.r;
      const u0 = sub(o.from, C), v0 = sub(o.via, C);
      let n = cr(u0, v0);
      const nl = Math.hypot(n[0], n[1], n[2]); n = n.map(c => c / nl);
      const ul = Math.hypot(u0[0], u0[1], u0[2]);
      const u = u0.map(c => c / ul);
      const w = cr(n, u);
      const ang = p => { const d = sub(p, C); let a = Math.atan2(dt(d, w), dt(d, u)); return a <= 0 ? a + 2 * Math.PI : a; };
      const aTo = ang(o.to), aVia = ang(o.via);
      const sweep = aVia <= aTo ? aTo : aTo - 2 * Math.PI;
      const N = 48, pts = [];
      for (let i = 0; i <= N; i++) {
        const t = sweep * i / N;
        pts.push([C[0] + r * (u[0] * Math.cos(t) + w[0] * Math.sin(t)),
                  C[1] + r * (u[1] * Math.cos(t) + w[1] * Math.sin(t)),
                  C[2] + r * (u[2] * Math.cos(t) + w[2] * Math.sin(t))]);
      }
      polyline(E, ctx, pts.map(P), color, o.width || 2, o.dash);
      break;
    }
    case 'projection': {
      const src = rec.objects.find(x => x.id === o.of);
      const pts = circlePoints(src.center, src.normal, src.r).map(p => [p[0], p[1], o.toZ]);
      polyline(E, ctx, pts.map(P), color, 2, o.dash || [4, 4], true);
      break;
    }
    case 'rightangle': {
      const v = P(o.vertex), a = P(o.a), b = P(o.b);
      E.rightAngle(v[0], v[1], v[2], a[0], a[1], a[2], b[0], b[1], b[2], color);
      break;
    }
    case 'vector': {
      const a = P(o.from), b = P(o.to);
      const [x1, y1] = E.project(a[0], a[1], a[2]), [x2, y2] = E.project(b[0], b[1], b[2]);
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = o.width || 2.5;
      ctx.setLineDash(o.dash || []); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke(); ctx.setLineDash([]);
      const ang = Math.atan2(y2 - y1, x2 - x1), ah = 11;
      ctx.beginPath();
      ctx.moveTo(x2, y2);
      ctx.lineTo(x2 - ah * Math.cos(ang - 0.42), y2 - ah * Math.sin(ang - 0.42));
      ctx.lineTo(x2 - ah * Math.cos(ang + 0.42), y2 - ah * Math.sin(ang + 0.42));
      ctx.closePath(); ctx.fillStyle = color; ctx.fill();
      if (o.label) labelQueue.push({ pri: 1, text: plainMath(localText(o, 'label')), x: (x1 + x2) / 2 + 8, y: (y1 + y2) / 2 - 8, font: E.fonts.MATH_LBL(18), color, halo: 4, alpha: dim });
      break;
    }
    case 'arc': {
      const c = P(o.center), pa = P(o.a), pb = P(o.b);
      const [cx, cy] = E.project(c[0], c[1], c[2]);
      const [ax, ay] = E.project(pa[0], pa[1], pa[2]), [bx, by] = E.project(pb[0], pb[1], pb[2]);
      const a1 = Math.atan2(ay - cy, ax - cx), a2 = Math.atan2(by - cy, bx - cx);
      let d = a2 - a1;
      while (d <= -Math.PI) d += 2 * Math.PI;
      while (d > Math.PI) d -= 2 * Math.PI;
      const r = o.r || 22;
      ctx.beginPath(); ctx.strokeStyle = color; ctx.lineWidth = 1.6;
      ctx.arc(cx, cy, r, a1, a1 + d, d < 0); ctx.stroke();
      if (o.label) {
        const am = a1 + d / 2;
        labelQueue.push({ pri: 1, text: plainMath(localText(o, 'label')), x: cx + (r + 12) * Math.cos(am), y: cy + (r + 12) * Math.sin(am), font: E.fonts.MATH_LBL(16), color, halo: 3.5, alpha: dim });
      }
      break;
    }
    case 'label': {
      const [x, y, z] = P(o.at);
      { const [px, py] = E.project(x, y, z);
        labelQueue.push({ pri: 1, text: plainMath(localText(o, 'text')), x: px, y: py, font: E.fonts.MATH((o.size || 17)), color, halo: 3.5, alpha: dim }); }
      break;
    }
    case 'ellipse':
      polyline(E, ctx, ellipsePoints(o.center, o.rx, o.ry).map(P), color, o.width || 2, o.dash, true);
      break;
    case 'parabola':
      polyline(E, ctx, parabolaPoints(o.form, o.p, o.vertex, o.span).map(P), color, o.width || 2, o.dash);
      break;
    case 'hyperbola': {
      const signs = o.branch === 'both' ? [1, -1] : [o.branch === 'neg' ? -1 : 1];
      signs.forEach(sign => {
        polyline(E, ctx, hyperbolaPoints(o.form, o.a, o.b, o.center, o.span, sign).map(P), color, o.width || 2, o.dash);
      });
      break;
    }
  }
}

root.TMSceneRenderer = { draw, visibleObjects, mapPoint, circlePoints, ellipsePoints, parabolaPoints, hyperbolaPoints, plainMath };
})(typeof window !== 'undefined' ? window : globalThis);
