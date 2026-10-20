/* TouchMath 공용 다국어 — classic script, window.TMLang */
(function (root) {
'use strict';

const MONTH_KEY = { '00': 'preliminary', '06': 'june', '09': 'september', '11': 'csat' };

const DICT = {
  ko: {
    title: '기출 풀이 시각화 — 공간도형·벡터',
    metaDescription: '평가원 기하 4점 기출(공간도형·벡터)의 풀이를 단계별 3D 시각화로 추적하는 학습 도구.',
    h1: '기출 풀이 시각화',
    sub: '공간도형·벡터 4점 — 평가원',
    backlink: '기본명제 학습 →',
    settingsLabel: '설정',
    themeLabel: '테마', themeLight: '라이트', themeSystem: '시스템', themeDark: '다크',
    glassLabel: '시각 효과 모드', glassAuto: '자동', glassOn: '켬', glassOff: '끔',
    colorblind: '색각 보정',
    langLabel: '언어',
    navLabel: '문항 목록',
    canvasLabel: '풀이 단계 3D 시각화',
    hintRotate: '드래그 회전 · 스크롤 확대',
    hintScroll: '스크롤 확대',
    thmCardTitle: '이 풀이에 쓰인 기본명제',
    startSolve: '풀이 시작',
    stepPrev: '이전단계',
    stepNext: '다음단계',
    answerLabel: '정답',
    loadError: '문항 데이터를 불러오지 못했습니다. 로컬 서버(python3 -m http.server)로 열었는지 확인해 주세요.',
    noscript: '이 도구는 JavaScript로 도형을 그립니다. JavaScript를 활성화해 주세요.',
    problemNum: n => `${n}번`,
    monthName: { preliminary: '예비시행', june: '6월', september: '9월', csat: '수능' },
    examGroup: (year, monthKey) => `20${year}학년도 ${DICT.ko.monthName[monthKey]}`,
    examLabel: (year, monthKey, number) => `20${year}학년도 ${DICT.ko.monthName[monthKey]} 기하 ${number}번`,
    topics: {
      '정사영': '정사영', '이면각': '이면각', '삼수선': '삼수선', '구': '구', '단면': '단면',
      '공간좌표': '공간좌표', '벡터연산': '벡터연산', '내적': '내적', '자취': '자취',
    },
    theorems: {
      'orthogonal-projection-proof': "정사영 넓이 S'=S cos θ",
    },
    geoTitle: '손끝으로 이해하는 3D 증명',
    geoTitleMobile: '3D증명',
    geoMetaDescription: '고등학생을 위한 공간도형 기본명제 3D 시각화·증명 추적 학습 도구. 정사영, 이면각, 삼수선을 직접 회전·드래그로 체화한다.',
    proofNavAria: '증명 단계 이동',
    prevStepAria: '이전 증명 단계',
    nextStepAria: '다음 증명 단계',
    mobileMenuAria: '학습 메뉴',
    viewMode: '관람하기',
    playMode: '풀어보기',
    studyModeAria: '학습 모드',
    stageNavLabel: '단계',
    theoremsNavLabel: '정리',
    theoremListAria: '정리 목록',
    examplesNavLabel: '예제',
    exampleListAria: '예제 목록',
    modeNavLabel: '모드',
    navLocationAria: '학습 위치',
    canvasLabelGeo: '3D 기하 증명 시각화',
    canvasOverlayAria: '현재 단계 — 클릭 시 사이드 패널로 이동',
    givenLabel: '주어진 상황',
    proveLabel: '증명할 결론',
    doneLabel: '완료',
    solveLabel: '풀기',
    chipCurrent: '지금 볼 단계',
    chipOpen: '열린 단계',
    chipConclusion: '결론',
    slotResult: 'Result 연결',
    stepAriaLocked: '잠긴',
    stepAriaRevealed: '열린',
    stepAriaSuffix: '증명 단계',
    defaultActionError: '그 행동은 지금 할 수 없습니다.',
    proofCompleteMark: '증명 완료',
    summaryFact: (total, wrong, optimal) => `${total}단계 · 실수 ${wrong}회 (최적 ${optimal}단계)`,
    actionsLabel: '조작',
    mistakesLabel: '실수',
    countSuffix: '회',
    optimalBadgeTemplate: n => `최적: ${n}단계`,
    undoLabel: '↩ 되돌리기',
    retryLabel: '다시 도전',
    historyTemplate: n => `조작 기록 (${n})`,
    checkConditions: '조건을 확인하세요.',
  },
  en: {
    title: 'Exam Solution Visualizer — Solid Geometry & Vectors',
    metaDescription: 'A learning tool that traces KICE geometry exam solutions (solid geometry, vectors) through step-by-step 3D visualization.',
    h1: 'Exam Solution Visualizer',
    sub: 'Solid Geometry & Vectors, 4pt — KICE',
    backlink: 'Learn the Base Theorems →',
    settingsLabel: 'Settings',
    themeLabel: 'Theme', themeLight: 'Light', themeSystem: 'System', themeDark: 'Dark',
    glassLabel: 'Visual Effects', glassAuto: 'Auto', glassOn: 'On', glassOff: 'Off',
    colorblind: 'Colorblind Mode',
    langLabel: 'Language',
    navLabel: 'Problem List',
    canvasLabel: '3D visualization of the solution steps',
    hintRotate: 'Drag to rotate · Scroll to zoom',
    hintScroll: 'Scroll to zoom',
    thmCardTitle: 'Base theorems used in this solution',
    startSolve: 'Start Solving',
    stepPrev: 'Previous',
    stepNext: 'Next',
    answerLabel: 'Answer',
    loadError: 'Failed to load problem data. Make sure you opened this via a local server (python3 -m http.server).',
    noscript: 'This tool draws shapes with JavaScript. Please enable JavaScript.',
    problemNum: n => `#${n}`,
    monthName: { preliminary: 'Preliminary', june: 'June', september: 'September', csat: 'CSAT' },
    examGroup: (year, monthKey) => `20${year} ${DICT.en.monthName[monthKey]}`,
    examLabel: (year, monthKey, number) => `20${year} ${DICT.en.monthName[monthKey]} Geometry #${number}`,
    topics: {
      '정사영': 'Orthogonal Projection', '이면각': 'Dihedral Angle', '삼수선': 'Three Perpendiculars',
      '구': 'Sphere', '단면': 'Cross Section', '공간좌표': 'Space Coordinates',
      '벡터연산': 'Vector Operations', '내적': 'Dot Product', '자취': 'Locus',
    },
    theorems: {
      'orthogonal-projection-proof': 'Orthogonal Projection Area S′ = S cos θ',
    },
    geoTitle: 'Understanding 3D Proofs, Hands-On',
    geoTitleMobile: '3D Proof',
    geoMetaDescription: 'A 3D visualization and proof-tracing tool for high-school solid-geometry theorems — feel orthogonal projection, dihedral angles, and the three-perpendiculars theorem through direct rotation and dragging.',
    proofNavAria: 'Move between proof steps',
    prevStepAria: 'Previous proof step',
    nextStepAria: 'Next proof step',
    mobileMenuAria: 'Study menu',
    viewMode: 'Watch',
    playMode: 'Practice',
    studyModeAria: 'Study mode',
    stageNavLabel: 'Stage',
    theoremsNavLabel: 'Theorems',
    theoremListAria: 'Theorem list',
    examplesNavLabel: 'Examples',
    exampleListAria: 'Example list',
    modeNavLabel: 'Mode',
    navLocationAria: 'Your position',
    canvasLabelGeo: '3D visualization of the geometry proof',
    canvasOverlayAria: 'Current step — click to jump to the side panel',
    givenLabel: 'Given',
    proveLabel: 'To Prove',
    doneLabel: 'Done',
    solveLabel: 'Solve',
    chipCurrent: 'Current step',
    chipOpen: 'Revealed step',
    chipConclusion: 'Conclusion',
    slotResult: 'Result',
    stepAriaLocked: 'Locked',
    stepAriaRevealed: 'Revealed',
    stepAriaSuffix: 'proof step',
    defaultActionError: "You can't do that right now.",
    proofCompleteMark: 'Proof complete',
    summaryFact: (total, wrong, optimal) => `${total} steps · ${wrong} mistakes (optimal: ${optimal} steps)`,
    actionsLabel: 'Actions',
    mistakesLabel: 'Mistakes',
    countSuffix: '',
    optimalBadgeTemplate: n => `Optimal: ${n} steps`,
    undoLabel: '↩ Undo',
    retryLabel: 'Try Again',
    historyTemplate: n => `Action history (${n})`,
    checkConditions: 'Check the conditions.',
  },
};

const hasDOM = typeof root.document !== 'undefined';
function detectDefault() {
  if (hasDOM && root.localStorage) {
    const saved = localStorage.getItem('almool:math:lang');
    if (saved === 'ko' || saved === 'en') return saved;
  }
  return 'en';
}

const state = { lang: detectDefault() };
let onChange = () => {};

function t(key) { return DICT[state.lang][key]; }
function lang() { return state.lang; }

function monthKey(examMonth) { return MONTH_KEY[examMonth] || 'csat'; }

function examGroup(schoolYear, examMonth) { return t('examGroup')(schoolYear, monthKey(examMonth)); }
function examLabel(schoolYear, examMonth, number) { return t('examLabel')(schoolYear, monthKey(examMonth), number); }
function topicLabel(topic) { return t('topics')[topic] || topic; }
function theoremLabel(key, fallback) { return t('theorems')[key] || fallback; }

/* record 필드 중 언어별 값을 고른다. `${field}_en`이 없으면 한국어로 폴백. */
function field(record, name) {
  if (state.lang === 'en' && record[name + '_en']) return record[name + '_en'];
  return record[name];
}
function stepField(step, name) {
  if (state.lang === 'en' && step[name + '_en']) return step[name + '_en'];
  return step[name];
}

function applyStaticText() {
  if (!hasDOM) return;
  document.documentElement.lang = state.lang;
  document.title = t('title');
  const meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', t('metaDescription'));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (DICT[state.lang][key] !== undefined) el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => {
    const key = el.getAttribute('data-i18n-aria');
    if (DICT[state.lang][key] !== undefined) el.setAttribute('aria-label', t(key));
  });
  document.querySelectorAll('#lang-group .seg-btn').forEach((btn, i) => {
    const on = ['ko', 'en'][i] === state.lang;
    btn.classList.toggle('active', on);
    btn.setAttribute('aria-checked', String(on));
  });
}

function setLang(l) {
  state.lang = l;
  if (hasDOM && root.localStorage) localStorage.setItem('almool:math:lang', l);
  applyStaticText();
  onChange('almool:math:lang');
}

function init(opts) {
  if (opts && opts.onChange) onChange = opts.onChange;
  applyStaticText();
}

root.TMLang = { init, setLang, lang, t, examGroup, examLabel, topicLabel, theoremLabel, field, stepField, state };
})(typeof window !== 'undefined' ? window : globalThis);
