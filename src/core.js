// ================= CORE: canvas, input, i18n, save, utils =================
'use strict';
const W = 960, H = 540, GY = 452; // logical size, ground line
const cv = document.getElementById('game');
let ctx = cv.getContext('2d');
function swapCtx(c) { ctx = c; }
let SCALE = 1, OX = 0, OY = 0, DPR = 1;
const FONT = "'Noto Sans Devanagari','Kalam','Nirmala UI','Mangal','Kohinoor Devanagari',system-ui,sans-serif";
const TFONT = "'Yatra One','Noto Sans Devanagari','Nirmala UI','Mangal',serif";

function resize() {
  DPR = Math.min(window.devicePixelRatio || 1, 2);
  const vw = window.innerWidth, vh = window.innerHeight;
  SCALE = Math.min(vw / W, vh / H);
  cv.style.width = (W * SCALE) + 'px';
  cv.style.height = (H * SCALE) + 'px';
  cv.width = Math.round(W * SCALE * DPR);
  cv.height = Math.round(H * SCALE * DPR);
  const r = cv.getBoundingClientRect(); OX = r.left; OY = r.top;
}
window.addEventListener('resize', resize);

// ---------- utils ----------
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
function seeded(s) { return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function lerpCol(a, b, t) {
  const pa = hex(a), pb = hex(b);
  return `rgb(${Math.round(lerp(pa[0], pb[0], t))},${Math.round(lerp(pa[1], pb[1], t))},${Math.round(lerp(pa[2], pb[2], t))})`;
}
function hex(c) { if (c[0] !== '#') { const m = c.match(/\d+/g); return [+m[0], +m[1], +m[2]]; } const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const inRect = (x, y, r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// ---------- save ----------
const SAVE_KEY = 'chhath_mahaparv_v1';
const DEF = { lang: 'hi', music: true, sfx: true, vol: 0.8, track: -1, narr: true, hero: 'aarav', unlocked: 1, done: {}, art: [], memories: [], book: false, family: false, ghat: [], stars: {} };
let S = Object.assign({}, DEF);
let PHOTOS = [];
function load() {
  try { const d = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null'); if (d) S = Object.assign({}, DEF, d); } catch (e) { }
  try { PHOTOS = JSON.parse(localStorage.getItem(SAVE_KEY + '_ph') || '[]'); } catch (e) { PHOTOS = []; }
}
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { }
}
function savePhotos() { try { localStorage.setItem(SAVE_KEY + '_ph', JSON.stringify(PHOTOS.slice(-8))); } catch (e) { } }

// ---------- i18n ----------
const L = o => (o && typeof o === 'object') ? (o[S.lang] || o.en) : o;
const B = (hi, en) => ({ hi, en });

// ---------- text ----------
function txt(s, x, y, size = 20, col = '#3b1d0b', align = 'left', font = FONT, weight = '600') {
  ctx.font = `${weight} ${size}px ${font}`; ctx.fillStyle = col; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.fillText(s, x, y);
}
function txtO(s, x, y, size, col, out = '#3b1d0b', align = 'center', font = TFONT, lw = 4) {
  ctx.font = `600 ${size}px ${font}`; ctx.textAlign = align; ctx.textBaseline = 'middle';
  ctx.lineJoin = 'round'; ctx.strokeStyle = out; ctx.lineWidth = lw; ctx.strokeText(s, x, y);
  ctx.fillStyle = col; ctx.fillText(s, x, y);
}
function wrap(s, x, y, maxW, size = 18, col = '#3b1d0b', lh = 1.4, align = 'left', weight = '500') {
  ctx.font = `${weight} ${size}px ${FONT}`;
  const words = String(s).split(' '); let line = '', yy = y; const lines = [];
  for (const w of words) { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; } else line = t; }
  if (line) lines.push(line);
  for (const l of lines) { txt(l, x, yy, size, col, align, FONT, weight); yy += size * lh; }
  return yy;
}
function rrect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

// ---------- input ----------
const keys = {}, pressed = {};
const IS_TOUCH = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
let touchUI = IS_TOUCH;
window.addEventListener('keydown', e => {
  const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (!keys[k]) pressed[k] = true; keys[k] = true;
  if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
  Audio2.unlock();
  if (scene && scene.key) scene.key(k);
});
window.addEventListener('keyup', e => { const k = e.key.length === 1 ? e.key.toLowerCase() : e.key; keys[k] = false; });
const pointers = {}; // id -> {x,y}
function toLogical(e) { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / SCALE, y: (e.clientY - r.top) / SCALE }; }
cv.addEventListener('pointerdown', e => {
  e.preventDefault(); Audio2.unlock(); const p = toLogical(e); pointers[e.pointerId] = p;
  if (e.pointerType === 'touch') touchUI = true;
  try { cv.setPointerCapture(e.pointerId); } catch (_) { }
  if (scene && scene.down) scene.down(p.x, p.y, e.pointerId);
});
cv.addEventListener('pointermove', e => { const p = toLogical(e); if (pointers[e.pointerId]) pointers[e.pointerId] = p; MOUSE.x = p.x; MOUSE.y = p.y; if (scene && scene.move) scene.move(p.x, p.y, e.pointerId); });
const upH = e => { const p = toLogical(e); delete pointers[e.pointerId]; if (scene && scene.up) scene.up(p.x, p.y, e.pointerId); };
cv.addEventListener('pointerup', upH); cv.addEventListener('pointercancel', upH);
cv.addEventListener('contextmenu', e => e.preventDefault());
const MOUSE = { x: 0, y: 0 };

// ---------- scene manager with fade ----------
let scene = null, fade = 0, fadeDir = 0, nextScene = null;
function go(s) { if (!s) return; if (!scene) { scene = s; s.enter && s.enter(); return; } nextScene = s; fadeDir = 1; }

// ---------- generic button ----------
function button(r, label, opts = {}) {
  const hov = inRect(MOUSE.x, MOUSE.y, r) && !touchUI;
  ctx.save();
  ctx.shadowColor = 'rgba(80,30,0,.35)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3;
  rrect(r.x, r.y, r.w, r.h, r.r || 14);
  const g = ctx.createLinearGradient(0, r.y, 0, r.y + r.h);
  const c1 = opts.c1 || (hov ? '#ffe27a' : '#ffd24a'), c2 = opts.c2 || (hov ? '#f39c12' : '#e67e22');
  g.addColorStop(0, opts.disabled ? '#ccc' : c1); g.addColorStop(1, opts.disabled ? '#999' : c2);
  ctx.fillStyle = g; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 3; ctx.strokeStyle = '#7a2e0b'; ctx.stroke();
  // inner dotted madhubani line
  ctx.setLineDash([2, 5]); ctx.lineWidth = 2; ctx.strokeStyle = '#a3001b';
  rrect(r.x + 5, r.y + 5, r.w - 10, r.h - 10, (r.r || 14) - 4); ctx.stroke(); ctx.setLineDash([]);
  ctx.restore();
  if (opts.sub) { txt(label, r.x + r.w / 2, r.y + r.h / 2 - 8, opts.size || 20, '#4a1405', 'center', FONT, '700'); txt(opts.sub, r.x + r.w / 2, r.y + r.h / 2 + 13, 13, '#6b2a0a', 'center'); }
  else txt(label, r.x + r.w / 2, r.y + r.h / 2 + 1, opts.size || 20, '#4a1405', 'center', FONT, '700');
}
