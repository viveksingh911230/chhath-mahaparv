// ================= ART: procedural Madhubani-inspired illustration =================
const C = {
  ink: '#3b1d0b', red: '#c8201c', ver: '#e2401c', tur: '#f4b400', gold: '#ffc93c', green: '#2e8b57', leaf: '#5aa02c',
  indigo: '#1f3a93', pink: '#e75480', cream: '#fff3d6', mud: '#c98a4b', mud2: '#a86a35', sky: '#8fd3f4', white: '#fffaf0', skin: '#b8743f', skin2: '#9a5c2e'
};
const PAL = {
  day: { top: '#7cc6ee', bot: '#fde7b0', sun: '#ffcc33', hill: '#7fae5a', water: '#3d9fc9', water2: '#9fd8ec', light: 1, sunY: 90 },
  noon: { top: '#86c9f0', bot: '#fff0c4', sun: '#ffd84a', hill: '#86b55e', water: '#3fa2c9', water2: '#a5dcee', light: 1, sunY: 80 },
  after: { top: '#f7b267', bot: '#fde3a7', sun: '#ffb627', hill: '#9a9a4a', water: '#4b8fb1', water2: '#f7c873', light: .95, sunY: 150 },
  sunset: { top: '#6a2c70', bot: '#ff8c42', sun: '#ff5e1a', hill: '#6b3a3a', water: '#7a3b52', water2: '#ff9a4d', light: .75, sunY: 330 },
  night: { top: '#0d1b3e', bot: '#2b3a67', sun: '#fff6d0', hill: '#1e2b4a', water: '#16264a', water2: '#3f5a8c', light: .45, sunY: -100 },
  predawn: { top: '#1b2a5a', bot: '#c9718a', sun: '#ff9966', hill: '#2f2f55', water: '#2c3868', water2: '#d98a8a', light: .55, sunY: 400 },
  dawn: { top: '#5fa8d3', bot: '#ffd29d', sun: '#ffb347', hill: '#6e8f5a', water: '#4a8fb8', water2: '#ffd08a', light: .9, sunY: 300 },
  kitchen: { top: '#e8b77a', bot: '#f6dcae', sun: '#ffcc33', hill: '#b07a45', water: '#3d9fc9', water2: '#9fd8ec', light: 1, sunY: -200 }
};
function mixPal(a, b, t) {
  const o = {}; for (const k in a) o[k] = typeof a[k] === 'number' ? lerp(a[k], b[k], t) : lerpCol(a[k], b[k], t); return o;
}
function strokeInk(w = 2.5, c = C.ink) { ctx.lineWidth = w; ctx.strokeStyle = c; ctx.lineJoin = 'round'; ctx.lineCap = 'round'; ctx.stroke(); }
function fillInk(f, w = 2.5) { ctx.fillStyle = f; ctx.fill(); strokeInk(w); }
function circ(x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); }
function ell(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); }

// ---------- sky ----------
function drawSky(p, t, sunX = 760, opts = {}) {
  const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, p.top); g.addColorStop(.75, p.bot); g.addColorStop(1, p.bot);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  if (p.light < .6) { // stars
    const r = seeded(7); ctx.fillStyle = `rgba(255,255,230,${(.6 - p.light) * 2})`;
    for (let i = 0; i < 70; i++) { const x = r() * W, y = r() * 300, tw = .5 + .5 * Math.sin(t * 2 + i); ctx.globalAlpha = tw * (.6 - p.light) * 1.6; circ(x, y, r() * 1.6 + .4); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  if (!opts.noSun && p.sunY > -50 && p.sunY < 460) drawSun(sunX, p.sunY, opts.sunR || 46, t, { col: p.sun, face: opts.face !== false, glow: true });
  // stylized madhubani clouds
  const cr = seeded(3);
  for (let i = 0; i < 4; i++) {
    const x = ((cr() * 1400 + t * (6 + i * 3)) % 1300) - 200, y = 40 + cr() * 120;
    cloud(x, y, .7 + cr() * .5, p);
  }
}
function cloud(x, y, s, p) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-60, 10);
  [[-45, -12], [-18, -24], [12, -22], [38, -10], [60, 10]].forEach(([cx, cy], i) => ctx.arc(cx, cy + 8, 18 + (i % 2) * 5, Math.PI, 0));
  ctx.closePath(); ctx.fillStyle = p.light < .6 ? 'rgba(200,190,230,.35)' : 'rgba(255,255,255,.85)'; ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = p.light < .6 ? 'rgba(80,70,120,.4)' : 'rgba(120,80,40,.35)'; ctx.stroke();
  ctx.restore();
}
function drawSun(x, y, r, t, o = {}) {
  ctx.save(); ctx.translate(x, y);
  if (o.glow) { const g = ctx.createRadialGradient(0, 0, r * .5, 0, 0, r * 4); g.addColorStop(0, 'rgba(255,220,120,.55)'); g.addColorStop(1, 'rgba(255,200,80,0)'); ctx.fillStyle = g; circ(0, 0, r * 4); ctx.fill(); }
  ctx.rotate(t * .1);
  const n = 16;
  for (let i = 0; i < n; i++) { // alternating triangular & wavy rays
    ctx.save(); ctx.rotate(i * Math.PI * 2 / n);
    ctx.beginPath();
    if (i % 2) { ctx.moveTo(-r * .18, -r * 1.05); ctx.lineTo(0, -r * 1.65); ctx.lineTo(r * .18, -r * 1.05); }
    else { ctx.moveTo(-r * .1, -r * 1.05); ctx.quadraticCurveTo(r * .25, -r * 1.3, 0, -r * 1.45); ctx.quadraticCurveTo(-r * .25, -r * 1.3, r * .1, -r * 1.05); }
    ctx.closePath(); fillInk(i % 2 ? C.red : C.tur, 2);
    ctx.restore();
  }
  ctx.rotate(-t * .1);
  circ(0, 0, r * 1.05); fillInk(C.red, 2.5);
  circ(0, 0, r * .92); fillInk(o.col || C.gold, 2);
  // dotted ring
  ctx.fillStyle = C.red; for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2; circ(Math.cos(a) * r * .99, Math.sin(a) * r * .99, 1.8); ctx.fill(); }
  if (o.face) {
    // serene folk face
    ctx.strokeStyle = C.ink; ctx.lineWidth = 2.2;
    ctx.beginPath(); ctx.ellipse(-r * .33, -r * .1, r * .17, r * .09, 0, 0, Math.PI * 2); ctx.fillStyle = '#fff'; ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.ellipse(r * .33, -r * .1, r * .17, r * .09, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.ink; circ(-r * .3, -r * .1, r * .055); ctx.fill(); circ(r * .36, -r * .1, r * .055); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-r * .55, -r * .3); ctx.quadraticCurveTo(-r * .33, -r * .42, -r * .12, -r * .3); ctx.moveTo(r * .55, -r * .3); ctx.quadraticCurveTo(r * .33, -r * .42, r * .12, -r * .3); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -r * .12); ctx.quadraticCurveTo(r * .08, r * .12, -r * .03, r * .14); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-r * .22, r * .35); ctx.quadraticCurveTo(0, r * .52, r * .22, r * .35); ctx.lineWidth = 2.5; ctx.strokeStyle = C.red; ctx.stroke();
    ctx.fillStyle = C.red; circ(0, -r * .48, r * .07); ctx.fill(); // tilak
    ctx.fillStyle = 'rgba(231,84,128,.35)'; circ(-r * .5, r * .2, r * .11); ctx.fill(); circ(r * .5, r * .2, r * .11); ctx.fill();
  }
  ctx.restore();
}

// ---------- landscape ----------
function drawHills(p, cam, t) {
  ctx.fillStyle = p.hill; ctx.beginPath(); ctx.moveTo(0, 330);
  for (let x = 0; x <= W; x += 20) { const wx = x + cam * .15; ctx.lineTo(x, 320 - Math.sin(wx * .006) * 25 - Math.sin(wx * .017) * 10); }
  ctx.lineTo(W, 400); ctx.lineTo(0, 400); ctx.fill();
  // far temple silhouettes & palms
  const r = seeded(19); ctx.fillStyle = lerpCol(p.hill, '#000000', .25);
  for (let i = 0; i < 14; i++) {
    const wx = i * 260 + r() * 100, x = ((wx - cam * .25) % 3640 + 3640) % 3640 - 200;
    if (x < -100 || x > W + 100) continue;
    if (i % 4 === 0) { // little temple shikhara
      ctx.beginPath(); ctx.moveTo(x - 18, 330); ctx.lineTo(x - 18, 305); ctx.quadraticCurveTo(x, 270, x + 18, 305); ctx.lineTo(x + 18, 330); ctx.fill();
      ctx.fillRect(x - 1, 266, 2, 10);
    } else { // palm
      ctx.fillRect(x - 2, 280, 4, 50);
      for (let k = 0; k < 6; k++) { ctx.save(); ctx.translate(x, 282); ctx.rotate(-Math.PI / 2 + (k - 2.5) * .5 + Math.sin(t + i) * .05); ell(14, 0, 16, 4); ctx.fill(); ctx.restore(); }
    }
  }
}
function drawGround(p, cam, kind) {
  const g = ctx.createLinearGradient(0, GY - 10, 0, H);
  if (kind === 'ghat') { g.addColorStop(0, '#d9a066'); g.addColorStop(1, '#b07040'); }
  else if (kind === 'kitchen') { g.addColorStop(0, '#c98a4b'); g.addColorStop(1, '#9a6030'); }
  else { g.addColorStop(0, '#a3c24f'); g.addColorStop(.15, '#c99a5b'); g.addColorStop(1, '#a06a35'); }
  ctx.fillStyle = g; ctx.fillRect(0, GY, W, H - GY);
  ctx.fillStyle = 'rgba(0,0,0,' + (1 - p.light) * .5 + ')'; ctx.fillRect(0, GY, W, H - GY);
  // path border: madhubani zigzag band
  ctx.save(); ctx.translate(-((cam) % 24), 0);
  ctx.fillStyle = kind === 'village' ? '#6aa33a' : '#8a4b22';
  ctx.fillRect(0, GY, W + 48, 6);
  ctx.beginPath(); for (let x = 0; x < W + 48; x += 24) { ctx.moveTo(x, GY + 6); ctx.lineTo(x + 12, GY + 16); ctx.lineTo(x + 24, GY + 6); }
  ctx.strokeStyle = kind === 'village' ? '#3d6b1f' : '#5a2a10'; ctx.lineWidth = 2; ctx.stroke();
  ctx.fillStyle = C.red; for (let x = 12; x < W + 48; x += 24) { circ(x, GY + 26, 2); ctx.fill(); }
  ctx.restore();
}
function drawRiver(y, t, p, cam = 0, sunX = 700) {
  const g = ctx.createLinearGradient(0, y, 0, H); g.addColorStop(0, p.water2); g.addColorStop(.3, p.water); g.addColorStop(1, lerpCol(p.water, '#000000', .3));
  ctx.fillStyle = g; ctx.fillRect(0, y, W, H - y);
  // sun reflection
  if (p.sunY > -50 && p.sunY < 460) {
    for (let i = 0; i < 14; i++) {
      const yy = y + 8 + i * 9, w = 70 - i * 3 + Math.sin(t * 3 + i) * 10;
      ctx.fillStyle = `rgba(255,${200 - i * 6},90,${.55 - i * .03})`; ctx.fillRect(sunX - w / 2 + Math.sin(t * 2 + i) * 6, yy, w, 3);
    }
  }
  // madhubani wave rows
  ctx.strokeStyle = 'rgba(255,255,255,.45)'; ctx.lineWidth = 2;
  for (let row = 0; row < 6; row++) {
    const yy = y + 14 + row * 16, off = (t * (14 + row * 4) + cam * (.6 + row * .1)) % 40;
    ctx.beginPath();
    for (let x = -40 - off; x < W + 40; x += 40) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 10, yy - 6, x + 20, yy); ctx.quadraticCurveTo(x + 30, yy + 6, x + 40, yy); }
    ctx.globalAlpha = .7 - row * .08; ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
function ghatSteps(x, y, w, n = 5) {
  for (let i = 0; i < n; i++) {
    const yy = y + i * 14, xx = x + i * 10;
    ctx.fillStyle = i % 2 ? '#e3b27a' : '#d49a5e'; ctx.fillRect(xx, yy, w - i * 20, 14);
    ctx.strokeStyle = '#7a4a22'; ctx.lineWidth = 1.5; ctx.strokeRect(xx, yy, w - i * 20, 14);
    ctx.fillStyle = C.red; for (let k = xx + 10; k < xx + w - i * 20 - 6; k += 30) { circ(k, yy + 7, 1.6); ctx.fill(); }
  }
}

// ---------- village structures ----------
function house(x, y, w, h, seed, deco = true, lit = false) {
  const r = seeded(seed * 31 + 7);
  const wallC = ['#d9a066', '#e2b07a', '#cf9358', '#e6bd8a'][seed % 4];
  // wall
  ctx.beginPath(); ctx.rect(x, y - h, w, h); fillInk(wallC, 2.5);
  // lower painted band
  ctx.fillStyle = '#a0522d'; ctx.fillRect(x + 1, y - 18, w - 2, 17);
  ctx.strokeStyle = C.cream; ctx.lineWidth = 2; ctx.beginPath();
  for (let k = x + 4; k < x + w - 8; k += 14) { ctx.moveTo(k, y - 4); ctx.lineTo(k + 7, y - 14); ctx.lineTo(k + 14, y - 4); } ctx.stroke();
  // thatched roof
  ctx.beginPath(); ctx.moveTo(x - 18, y - h + 4); ctx.lineTo(x + w / 2, y - h - h * .55); ctx.lineTo(x + w + 18, y - h + 4); ctx.closePath(); fillInk('#c9a23c', 2.5);
  ctx.strokeStyle = '#8a6a1c'; ctx.lineWidth = 1.5; ctx.beginPath();
  for (let i = 1; i < 10; i++) { const tx = x - 18 + i * (w + 36) / 10; ctx.moveTo(tx, y - h + 3); ctx.lineTo(lerp(tx, x + w / 2, .7), lerp(y - h + 3, y - h - h * .55, .7)); } ctx.stroke();
  // door
  const dw = w * .26, dx = x + w / 2 - dw / 2;
  ctx.beginPath(); ctx.moveTo(dx, y); ctx.lineTo(dx, y - h * .55); ctx.quadraticCurveTo(dx + dw / 2, y - h * .72, dx + dw, y - h * .55); ctx.lineTo(dx + dw, y); fillInk(lit ? '#ffcf6b' : '#5a2a10', 2.5);
  // window
  if (w > 110) { ctx.beginPath(); ctx.rect(x + 14, y - h * .7, 22, 22); fillInk('#5a2a10', 2); ctx.beginPath(); ctx.rect(x + w - 36, y - h * .7, 22, 22); fillInk('#5a2a10', 2); }
  if (deco) {
    // madhubani motifs on wall: fish & sun dots & aipan
    ctx.save(); ctx.globalAlpha = .9;
    fish(x + w * .22, y - h * .35, .45, C.red, 1); fish(x + w * .78, y - h * .35, .45, C.indigo, -1);
    ctx.restore();
    // toran (mango leaves + marigold)
    for (let k = 0; k < 7; k++) { const tx = dx - 6 + k * (dw + 12) / 6; ctx.save(); ctx.translate(tx, y - h * .66); ctx.rotate(.1 * Math.sin(k)); ell(0, 8, 4, 9); fillInk(C.leaf, 1.2); ctx.restore(); circ(tx, y - h * .69, 4); fillInk(C.tur, 1.2); }
  }
}
function tree(x, y, s, kind = 'mango', t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const sway = Math.sin(t * 1.2 + x * .01) * .03;
  if (kind === 'banana') {
    ctx.beginPath(); ctx.moveTo(-6, 0); ctx.lineTo(-4, -90); ctx.lineTo(4, -90); ctx.lineTo(6, 0); fillInk('#7aa040', 2);
    for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(0, -88); ctx.rotate(-Math.PI / 2 + (i - 2.5) * .55 + sway * 3); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -16, 62, 6); ctx.quadraticCurveTo(30, 10, 0, 0); fillInk(i % 2 ? '#4f9a2e' : '#67b23a', 2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -3, 60, 6); strokeInk(1, '#2d5e18'); ctx.restore(); }
    ctx.restore(); return;
  }
  // trunk
  ctx.beginPath(); ctx.moveTo(-10, 0); ctx.quadraticCurveTo(-6, -50, -4, -90); ctx.lineTo(4, -90); ctx.quadraticCurveTo(6, -50, 12, 0); fillInk('#7a4a22', 2.5);
  ctx.strokeStyle = '#5a3415'; ctx.lineWidth = 1.5; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-6, -i * 16); ctx.lineTo(6, -i * 16 - 4); ctx.stroke(); }
  ctx.rotate(sway);
  // canopy of madhubani leaves
  const leaves = kind === 'peepal' ? 26 : 22; const r = seeded(Math.floor(x) + 3);
  ctx.beginPath(); ell(0, -130, 70, 55); fillInk(kind === 'peepal' ? '#3f8f3a' : '#2f7d32', 2.5);
  for (let i = 0; i < leaves; i++) {
    const a = r() * Math.PI * 2, d = r() * 52, lx = Math.cos(a) * d * 1.2, ly = -130 + Math.sin(a) * d * .9;
    ctx.save(); ctx.translate(lx, ly); ctx.rotate(a);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(8, -7, 16, 0); ctx.quadraticCurveTo(8, 7, 0, 0); fillInk(i % 3 ? '#6dbb45' : '#9bd35a', 1.2);
    ctx.restore();
  }
  if (kind === 'mango') { ctx.fillStyle = C.tur; for (let i = 0; i < 6; i++) { circ(-40 + i * 16, -105 + (i % 2) * 14, 5); fillInk(C.tur, 1.2); } }
  ctx.restore();
}
function sugarcane(x, y, h = 120, lean = 0, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(lean); ctx.scale(s, s);
  ctx.beginPath(); ctx.rect(-4, -h, 8, h); fillInk('#5c8a2a', 2);
  ctx.strokeStyle = '#2f4f15'; ctx.lineWidth = 2; for (let k = 18; k < h; k += 20) { ctx.beginPath(); ctx.moveTo(-5, -k); ctx.lineTo(5, -k); ctx.stroke(); }
  ctx.fillStyle = '#7a3a5a'; ctx.fillRect(-3, -h * .35, 6, h * .35); // purple base
  for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(0, -h); ctx.rotate(-Math.PI / 2 + (i - 2) * .5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(25, -10, 45, 6); ctx.quadraticCurveTo(25, 2, 0, 0); fillInk('#6fae3a', 1.5); ctx.restore(); }
  ctx.restore();
}
function fish(x, y, s, col, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  ctx.beginPath(); ctx.moveTo(-30, 0); ctx.quadraticCurveTo(0, -24, 30, 0); ctx.quadraticCurveTo(0, 24, -30, 0); fillInk(col, 2.5);
  ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(-46, -14); ctx.lineTo(-46, 14); ctx.closePath(); fillInk(col, 2.5);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; for (let i = -16; i < 18; i += 8) { ctx.beginPath(); ctx.arc(i, 0, 7, -1, 1); ctx.stroke(); }
  circ(20, -3, 4); fillInk('#fff', 1.5); ctx.fillStyle = C.ink; circ(21, -3, 1.8); ctx.fill();
  ctx.restore();
}
function lotus(x, y, s, col = C.pink) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = -3; i <= 3; i++) { ctx.save(); ctx.rotate(i * .32); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-10, -20, 0, -36); ctx.quadraticCurveTo(10, -20, 0, 0); fillInk(i % 2 ? col : '#f7a1c4', 1.8); ctx.restore(); }
  ctx.beginPath(); ctx.ellipse(0, 2, 22, 6, 0, 0, Math.PI * 2); fillInk(C.green, 1.8);
  ctx.restore();
}
function peacock(x, y, s, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  for (let i = 0; i < 9; i++) { ctx.save(); ctx.rotate(-1.9 + i * .22 + Math.sin(t + i) * .02); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(10, -50, 0, -90); ctx.quadraticCurveTo(-10, -50, 0, 0); fillInk(C.green, 1.5); circ(0, -78, 8); fillInk(C.indigo, 1.5); circ(0, -78, 4); fillInk(C.tur, 1); ctx.restore(); }
  ctx.beginPath(); ctx.moveTo(-10, 10); ctx.quadraticCurveTo(-30, -10, -18, -40); ctx.quadraticCurveTo(-10, -55, -4, -40); ctx.quadraticCurveTo(10, -10, 20, 12); ctx.closePath(); fillInk(C.indigo, 2);
  ctx.beginPath(); ctx.moveTo(-4, -46); ctx.lineTo(4, -42); ctx.lineTo(-4, -38); fillInk(C.tur, 1.5);
  ctx.fillStyle = '#fff'; circ(-10, -44, 3); ctx.fill(); ctx.fillStyle = C.ink; circ(-9, -44, 1.5); ctx.fill();
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(-14 + i * 3, -52); ctx.lineTo(-18 + i * 4, -62); strokeInk(1.2); circ(-18 + i * 4, -63, 2); fillInk(C.indigo, 1); }
  ctx.restore();
}
function rangoli(x, y, r, t = 0, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(1, .45); ctx.globalAlpha = alpha;
  const cols = [C.red, C.tur, C.pink, C.green, C.indigo];
  for (let ring = 4; ring >= 0; ring--) { circ(0, 0, r * (ring + 1) / 5); ctx.fillStyle = cols[ring]; ctx.fill(); }
  ctx.fillStyle = '#fff'; for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; ctx.save(); ctx.rotate(a); ell(r * .6, 0, r * .18, r * .07); ctx.fill(); ctx.restore(); }
  ctx.restore();
}

// ---------- festival objects ----------
function diya(x, y, s = 1, lit = true, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (lit) {
    const g = ctx.createRadialGradient(0, -14, 2, 0, -14, 34); g.addColorStop(0, 'rgba(255,220,120,.7)'); g.addColorStop(1, 'rgba(255,180,60,0)');
    ctx.fillStyle = g; circ(0, -14, 34); ctx.fill();
    const fl = Math.sin(t * 12 + x) * 1.5;
    ctx.beginPath(); ctx.moveTo(-5, -6); ctx.quadraticCurveTo(-6 + fl, -18, 0 + fl, -26); ctx.quadraticCurveTo(6 + fl, -18, 5, -6); ctx.closePath(); ctx.fillStyle = '#ffb000'; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-2.5, -7); ctx.quadraticCurveTo(-2, -14, fl * .5, -18); ctx.quadraticCurveTo(2, -14, 2.5, -7); ctx.fillStyle = '#fff6b0'; ctx.fill();
  }
  ctx.beginPath(); ctx.moveTo(-16, -6); ctx.quadraticCurveTo(0, 12, 16, -6); ctx.quadraticCurveTo(18, -9, 22, -10); ctx.quadraticCurveTo(10, -4, -16, -6); fillInk('#c0602a', 2);
  ctx.strokeStyle = C.tur; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(-10, -2); ctx.quadraticCurveTo(0, 6, 10, -2); ctx.stroke();
  ctx.restore();
}
function soop(x, y, s = 1, filled = false, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(34, -22); ctx.quadraticCurveTo(40, 10, 24, 26); ctx.lineTo(-24, 26); ctx.quadraticCurveTo(-40, 10, -34, -22); fillInk('#d9b36a', 2.5);
  ctx.strokeStyle = '#9a7432'; ctx.lineWidth = 1.2;
  for (let i = -30; i < 32; i += 6) { ctx.beginPath(); ctx.moveTo(i, -20); ctx.lineTo(i * .75, 24); ctx.stroke(); }
  for (let j = -14; j < 24; j += 8) { ctx.beginPath(); ctx.moveTo(-34, j); ctx.lineTo(34, j); ctx.globalAlpha = .4; ctx.stroke(); ctx.globalAlpha = 1; }
  ctx.beginPath(); ctx.moveTo(-34, -22); ctx.lineTo(34, -22); strokeInk(5, '#8a5a1c');
  ctx.fillStyle = C.red; [[-26, -22], [26, -22], [0, -22]].forEach(([a, b]) => { circ(a, b, 3); ctx.fill(); }); // sindoor marks
  if (filled) { item('thekua', -14, 2, .5); item('banana', 10, 4, .5); item('orange', -2, 12, .45); diya(18, 18, .45, true, t); item('ginger', -20, 14, .4); }
  ctx.restore();
}
function daura(x, y, s = 1, filled = false, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  if (filled) { sugarcane(-20, -18, 50, -.2, .6); sugarcane(20, -18, 50, .2, .6); item('banana', -12, -24, .55); item('coconut', 10, -22, .5); item('apple', -2, -28, .45); }
  ctx.beginPath(); ctx.moveTo(-36, -18); ctx.lineTo(36, -18); ctx.lineTo(28, 22); ctx.lineTo(-28, 22); ctx.closePath(); fillInk('#c99a4a', 2.5);
  ctx.strokeStyle = '#8a6420'; ctx.lineWidth = 1.5;
  for (let j = -12; j < 22; j += 7) { ctx.beginPath(); for (let i = -34; i < 34; i += 8) { ctx.moveTo(i, j); ctx.lineTo(i + 4, j + 4); } ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, -18, 36, 6, 0, 0, Math.PI * 2); fillInk('#e0b868', 2);
  ctx.fillStyle = C.red; for (let i = -24; i <= 24; i += 12) { circ(i, 4, 2.4); ctx.fill(); }
  ctx.restore();
}
function kalash(x, y, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-10, -30); ctx.quadraticCurveTo(-24, -10, -14, 0); ctx.lineTo(14, 0); ctx.quadraticCurveTo(24, -10, 10, -30); ctx.closePath(); fillInk('#d4882c', 2);
  ctx.fillStyle = C.red; ctx.fillRect(-16, -16, 32, 4); ctx.beginPath(); ctx.rect(-8, -36, 16, 6); fillInk('#b86a1c', 1.5);
  for (let i = -2; i <= 2; i++) { ctx.save(); ctx.translate(i * 5, -36); ctx.rotate(i * .35); ell(0, -8, 3, 9); fillInk(C.leaf, 1); ctx.restore(); }
  circ(0, -46, 8); fillInk('#8a5a22', 1.5);
  ctx.restore();
}
function chulha(x, y, s = 1, t = 0, fire = true) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.beginPath(); ctx.moveTo(-40, 0); ctx.lineTo(-34, -40); ctx.lineTo(34, -40); ctx.lineTo(40, 0); ctx.closePath(); fillInk('#b5703a', 2.5);
  ctx.beginPath(); ctx.moveTo(-14, 0); ctx.arc(0, 0, 14, Math.PI, 0); fillInk('#2a1206', 2);
  if (fire) for (let i = 0; i < 3; i++) { const f = Math.sin(t * 14 + i * 2) * 3; ctx.beginPath(); ctx.moveTo(-8 + i * 8, 0); ctx.quadraticCurveTo(-10 + i * 8 + f, -10, -6 + i * 7 + f, -18); ctx.quadraticCurveTo(-2 + i * 8, -8, -2 + i * 8, 0); ctx.fillStyle = i === 1 ? '#ffd23f' : '#ff7b00'; ctx.fill(); }
  ctx.fillStyle = C.cream; for (let i = -28; i <= 28; i += 14) { circ(i, -26, 2); ctx.fill(); }
  ctx.restore();
}

// ---------- items (icons) ----------
const ITEMS = {
  flower: B('गेंदा फूल', 'Marigold'), thekua: B('ठेकुआ', 'Thekua'), rice: B('अरवा चावल', 'Rice'), sugarcane: B('ईख (गन्ना)', 'Sugarcane'),
  banana: B('केला', 'Banana'), coconut: B('नारियल', 'Coconut'), apple: B('सेब', 'Apple'), orange: B('संतरा', 'Orange'), lemon: B('डाभ नींबू', 'Lemon'),
  ginger: B('अदरक', 'Ginger'), turmeric: B('हल्दी', 'Turmeric'), soop: B('सूप', 'Bamboo Soop'), daura: B('दउरा', 'Bamboo Daura'), diya: B('दीया', 'Diya'),
  lauki: B('लौकी', 'Bottle Gourd'), chana: B('चना दाल', 'Chana Dal'), gur: B('गुड़', 'Jaggery'), milk: B('दूध', 'Milk'), atta: B('गेहूँ का आटा', 'Wheat Flour'),
  ghee: B('घी', 'Ghee'), plastic: B('प्लास्टिक', 'Plastic'), bag: B('पॉलीथीन', 'Polythene'), memory: B('स्मृति', 'Memory'), kalash: B('कलश', 'Kalash'), leaf: B('आम के पत्ते', 'Mango Leaves')
};
function item(id, x, y, s = 1, t = 0) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  switch (id) {
    case 'flower': for (let i = 0; i < 10; i++) { ctx.save(); ctx.rotate(i * .628); ell(0, -10, 6, 10); fillInk(i % 2 ? '#ff9f1c' : '#ffbf1f', 1.5); ctx.restore(); } circ(0, 0, 7); fillInk('#e86a00', 1.5); break;
    case 'thekua': ell(0, 0, 20, 15); fillInk('#c77a2c', 2); ctx.strokeStyle = '#7a3e10'; ctx.lineWidth = 1.5; for (let i = -12; i <= 12; i += 6) { ctx.beginPath(); ctx.moveTo(i, -10); ctx.lineTo(i, 10); ctx.stroke(); } ctx.beginPath(); ctx.ellipse(0, 0, 9, 6, 0, 0, Math.PI * 2); ctx.stroke(); break;
    case 'rice': ctx.beginPath(); ctx.moveTo(-20, -6); ctx.quadraticCurveTo(0, 26, 20, -6); ctx.closePath(); fillInk('#a0612c', 2); ctx.beginPath(); ctx.ellipse(0, -7, 20, 8, 0, Math.PI, 0); fillInk('#fffaf0', 1.5); ctx.fillStyle = '#ddd'; for (let i = 0; i < 8; i++) { ell(-12 + i * 3.5, -10 + (i % 2) * 3, 2, 1); ctx.fill(); } break;
    case 'sugarcane': ctx.rotate(.4); ctx.beginPath(); ctx.rect(-3, -24, 6, 48); fillInk('#5c8a2a', 1.5); ctx.fillStyle = '#7a3a5a'; ctx.fillRect(-3, 6, 6, 18); ctx.strokeStyle = C.ink; for (let k = -16; k < 24; k += 10) { ctx.beginPath(); ctx.moveTo(-3, k); ctx.lineTo(3, k); ctx.stroke(); } ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(14, -34, 18, -26); strokeInk(2.5, '#6fae3a'); break;
    case 'banana': for (let i = -1; i <= 1; i++) { ctx.save(); ctx.rotate(i * .3); ctx.beginPath(); ctx.moveTo(-4, 10); ctx.quadraticCurveTo(-18, -8, -2, -24); ctx.quadraticCurveTo(-8, -6, 4, 10); fillInk('#ffd93b', 1.5); ctx.restore(); } ctx.beginPath(); ctx.rect(-3, 8, 6, 6); fillInk('#7a5a1c', 1); break;
    case 'coconut': circ(0, 0, 17); fillInk('#7a4a22', 2); ctx.fillStyle = '#4a2a10'; [[-5, -6], [5, -6], [0, 2]].forEach(([a, b]) => { circ(a, b, 2.5); ctx.fill(); }); ctx.strokeStyle = '#a07040'; ctx.lineWidth = 1; for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(0, 0, 13, i, i + .5); ctx.stroke(); } break;
    case 'apple': ctx.beginPath(); ctx.moveTo(0, -10); ctx.bezierCurveTo(-22, -22, -22, 18, 0, 16); ctx.bezierCurveTo(22, 18, 22, -22, 0, -10); fillInk('#d62828', 2); ctx.beginPath(); ctx.moveTo(0, -10); ctx.lineTo(2, -18); strokeInk(2); ell(7, -17, 6, 3, -.4); fillInk(C.leaf, 1.2); ctx.fillStyle = 'rgba(255,255,255,.5)'; ell(-7, -4, 3, 5); ctx.fill(); break;
    case 'orange': circ(0, 0, 16); fillInk('#ff8c1a', 2); ctx.fillStyle = 'rgba(160,70,0,.4)'; for (let i = 0; i < 9; i++) { circ(-8 + (i % 3) * 8, -8 + Math.floor(i / 3) * 8, 1.2); ctx.fill(); } ell(4, -16, 6, 3, .3); fillInk(C.leaf, 1.2); break;
    case 'lemon': ell(0, 0, 18, 13); fillInk('#c8e04a', 2); ctx.fillStyle = 'rgba(255,255,255,.5)'; ell(-5, -4, 5, 3); ctx.fill(); ell(18, 0, 3, 2); fillInk('#a8c03a', 1); break;
    case 'ginger': ctx.beginPath(); ctx.moveTo(-18, 4); ctx.quadraticCurveTo(-14, -10, -4, -4); ctx.quadraticCurveTo(0, -16, 8, -8); ctx.quadraticCurveTo(18, -6, 16, 6); ctx.quadraticCurveTo(0, 14, -18, 4); fillInk('#d9b07a', 2); ctx.strokeStyle = '#9a7040'; ctx.lineWidth = 1; [-8, 2, 10].forEach(i => { ctx.beginPath(); ctx.moveTo(i, -2); ctx.lineTo(i + 2, 6); ctx.stroke(); }); break;
    case 'turmeric': for (let i = 0; i < 3; i++) { ctx.save(); ctx.rotate(-.5 + i * .5); ell(0, -8, 5, 13); fillInk('#e8a33c', 1.8); ctx.restore(); } ctx.beginPath(); ctx.moveTo(0, -8); ctx.quadraticCurveTo(6, -30, 18, -30); strokeInk(3, C.leaf); break;
    case 'soop': ctx.restore(); soop(x, y, s * .5); return;
    case 'daura': ctx.restore(); daura(x, y, s * .45); return;
    case 'diya': ctx.restore(); diya(x, y + 8 * s, s * .9, true, t); return;
    case 'kalash': ctx.restore(); kalash(x, y + 16 * s, s * .8); return;
    case 'lauki': ctx.rotate(-.5); ctx.beginPath(); ctx.moveTo(0, -24); ctx.quadraticCurveTo(-8, -10, -11, 8); ctx.quadraticCurveTo(-10, 22, 0, 22); ctx.quadraticCurveTo(10, 22, 11, 8); ctx.quadraticCurveTo(8, -10, 0, -24); fillInk('#8cc63f', 2); ctx.fillStyle = 'rgba(255,255,255,.35)'; ell(-4, 6, 3, 8); ctx.fill(); ctx.beginPath(); ctx.rect(-2, -28, 4, 5); fillInk('#5a7a20', 1); break;
    case 'chana': ctx.beginPath(); ctx.moveTo(-18, -4); ctx.quadraticCurveTo(0, 22, 18, -4); ctx.closePath(); fillInk('#c08040', 2); ctx.fillStyle = '#f2c230'; for (let i = 0; i < 10; i++) { circ(-12 + (i % 5) * 6, -6 + Math.floor(i / 5) * 5, 2.6); ctx.fill(); } break;
    case 'gur': ctx.beginPath(); ctx.moveTo(-14, 10); ctx.lineTo(-16, -6); ctx.quadraticCurveTo(0, -18, 16, -6); ctx.lineTo(14, 10); ctx.closePath(); fillInk('#8a4a12', 2); ctx.fillStyle = 'rgba(255,200,120,.4)'; ell(-4, -6, 6, 3); ctx.fill(); break;
    case 'milk': ctx.beginPath(); ctx.moveTo(-12, 16); ctx.lineTo(-14, -6); ctx.quadraticCurveTo(-10, -14, -6, -14); ctx.lineTo(-6, -20); ctx.lineTo(6, -20); ctx.lineTo(6, -14); ctx.quadraticCurveTo(10, -14, 14, -6); ctx.lineTo(12, 16); ctx.closePath(); fillInk('#c0c4c8', 2); ctx.fillStyle = '#fff'; ctx.fillRect(-11, -4, 22, 6); break;
    case 'atta': ctx.beginPath(); ctx.moveTo(-16, 18); ctx.lineTo(-14, -14); ctx.lineTo(14, -14); ctx.lineTo(16, 18); ctx.closePath(); fillInk('#e8d5a8', 2); ctx.beginPath(); ctx.moveTo(-14, -14); ctx.lineTo(-6, -22); ctx.lineTo(6, -22); ctx.lineTo(14, -14); fillInk('#e8d5a8', 2); txt('आटा', 0, 4, 9, '#7a4a12', 'center'); break;
    case 'ghee': ctx.beginPath(); ctx.rect(-12, -12, 24, 26); fillInk('#c08a3a', 2); ctx.beginPath(); ctx.ellipse(0, -12, 12, 4, 0, 0, Math.PI * 2); fillInk('#ffe08a', 1.5); break;
    case 'plastic': ctx.rotate(.6); ctx.beginPath(); ctx.rect(-7, -16, 14, 30); fillInk('rgba(170,220,255,.85)', 2); ctx.beginPath(); ctx.rect(-4, -22, 8, 6); fillInk('#3a7bd5', 1.5); ctx.fillStyle = '#e74c3c'; ctx.fillRect(-7, -4, 14, 7); break;
    case 'bag': ctx.beginPath(); ctx.moveTo(-14, -8); ctx.lineTo(-16, 16); ctx.lineTo(16, 16); ctx.lineTo(14, -8); ctx.closePath(); fillInk('rgba(240,240,250,.9)', 2); ctx.beginPath(); ctx.moveTo(-10, -8); ctx.quadraticCurveTo(-8, -20, -4, -8); ctx.moveTo(4, -8); ctx.quadraticCurveTo(8, -20, 10, -8); strokeInk(2); break;
    case 'memory': { const p = 1 + Math.sin(t * 4) * .1; ctx.scale(p, p); ctx.beginPath(); for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? 8 : 18; ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } ctx.closePath(); fillInk('#ffe066', 2); circ(0, 0, 4); ctx.fillStyle = C.red; ctx.fill(); break; }
    case 'leaf': for (let i = -2; i <= 2; i++) { ctx.save(); ctx.rotate(i * .35); ell(0, -12, 5, 14); fillInk(C.leaf, 1.5); ctx.restore(); } break;
    case 'dust': ctx.fillStyle = 'rgba(120,90,60,.6)'; for (let i = 0; i < 6; i++) { circ(-14 + i * 6, Math.sin(i) * 3, 7 - Math.abs(i - 2.5)); ctx.fill(); } break;
    default: circ(0, 0, 12); fillInk('#ccc', 2);
  }
  ctx.restore();
}

// ---------- people ----------
const PEOPLE = {
  maa: { female: true, cloth: '#e2401c', cloth2: C.tur, skin: '#b8743f', name: B('माँ', 'Mother'), s: 1 },
  papa: { female: false, cloth: '#f2e6c8', cloth2: '#d4882c', skin: '#a8683a', name: B('पापा', 'Father'), s: 1.05, mustache: true },
  dadi: { female: true, cloth: '#f4e9d0', cloth2: C.red, skin: '#a8683a', name: B('दादी', 'Grandmother'), s: .95, grey: true, glasses: true },
  chacha: { female: false, cloth: '#7fb3d5', cloth2: '#f2e6c8', skin: '#9a5c2e', name: B('चाचा', 'Uncle'), s: 1.02, mustache: true },
  chachi: { female: true, cloth: '#2e8b57', cloth2: C.pink, skin: '#b8743f', name: B('चाची', 'Aunt'), s: .98 },
  pandit: { female: false, cloth: '#ff9933', cloth2: '#fff', skin: '#a8683a', name: B('पंडित जी', 'Panditji'), s: 1, grey: true },
  munni: { female: true, cloth: '#e75480', cloth2: C.tur, skin: '#b8743f', name: B('मुन्नी', 'Munni'), s: .68, child: true },
  golu: { female: false, cloth: '#1f9bd1', cloth2: '#fff', skin: '#9a5c2e', name: B('गोलू', 'Golu'), s: .7, child: true },
  kaki: { female: true, cloth: '#7d3c98', cloth2: C.tur, skin: '#9a5c2e', name: B('काकी', 'Neighbour Kaki'), s: .97 },
  vrati: { female: true, cloth: '#ffcc00', cloth2: C.red, skin: '#b8743f', name: B('व्रती', 'Devotee'), s: 1 },
  aarav: { female: false, cloth: '#ffcc33', cloth2: C.red, skin: '#b8743f', name: B('आरव', 'Aarav'), s: .72, child: true, hero: true },
  aarya: { female: true, cloth: '#ff5c8a', cloth2: C.tur, skin: '#b8743f', name: B('आर्या', 'Aarya'), s: .72, child: true, hero: true }
};
function person(x, y, who, o = {}) {
  const P = typeof who === 'string' ? PEOPLE[who] : who;
  const s = (o.s || 1) * P.s, ph = o.ph || 0, pose = o.pose || 'idle', dir = o.dir || 1, t = o.t || 0;
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,.2)'; ell(0, 2, 24, 5); ctx.fill();
  const bob = pose === 'walk' ? Math.abs(Math.sin(ph)) * 3 : pose === 'dance' ? Math.abs(Math.sin(t * 6)) * 6 : Math.sin(t * 2) * 1;
  ctx.translate(0, -bob);
  const legSw = pose === 'walk' ? Math.sin(ph) * 14 : pose === 'dance' ? Math.sin(t * 6) * 10 : 0;
  // legs
  ctx.lineCap = 'round';
  [[-6, legSw], [6, -legSw]].forEach(([lx, sw]) => {
    ctx.beginPath(); ctx.moveTo(lx, -46); ctx.lineTo(lx + sw * .7, -2); strokeInk(9, C.ink); ctx.beginPath(); ctx.moveTo(lx, -46); ctx.lineTo(lx + sw * .7, -2); strokeInk(6, P.female ? P.skin : '#fffaf0');
    ell(lx + sw * .7 + 3, -1, 6, 3); fillInk(P.skin, 1.5);
  });
  // body
  if (P.female) {
    ctx.beginPath(); ctx.moveTo(-14, -78); ctx.lineTo(14, -78); ctx.lineTo(22, -6); ctx.quadraticCurveTo(0, 0, -22, -6); ctx.closePath(); fillInk(P.cloth, 2.5);
    ctx.beginPath(); ctx.moveTo(-22, -12); ctx.quadraticCurveTo(0, -4, 22, -12); strokeInk(5, P.cloth2);
    // pleats
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.5; [-6, 0, 6].forEach(i => { ctx.beginPath(); ctx.moveTo(i, -50); ctx.lineTo(i * 1.6, -10); ctx.stroke(); });
    // pallu
    ctx.beginPath(); ctx.moveTo(-14, -80); ctx.lineTo(16, -40); ctx.lineTo(8, -36); ctx.lineTo(-16, -66); ctx.closePath(); fillInk(P.cloth2, 2);
    ctx.fillStyle = C.red; for (let i = 0; i < 4; i++) { circ(-6 + i * 5, -64 + i * 7, 1.5); ctx.fill(); }
  } else {
    ctx.beginPath(); ctx.moveTo(-14, -80); ctx.lineTo(14, -80); ctx.lineTo(17, -36); ctx.lineTo(-17, -36); ctx.closePath(); fillInk(P.cloth, 2.5);
    ctx.beginPath(); ctx.moveTo(-17, -40); ctx.lineTo(17, -40); strokeInk(3, P.cloth2);
    ctx.beginPath(); ctx.moveTo(0, -80); ctx.lineTo(0, -60); strokeInk(1.5);
    ctx.fillStyle = P.cloth2; [-72, -66].forEach(yy => { circ(0, yy, 1.5); ctx.fill(); });
    if (o.gamchha !== false && !P.child) { ctx.beginPath(); ctx.moveTo(-14, -80); ctx.lineTo(14, -56); strokeInk(4, C.red); }
  }
  // arms
  const sh = [-13, -76], sh2 = [13, -76];
  let a1, a2;
  if (pose === 'walk') { a1 = [-14 - legSw * .6, -48]; a2 = [14 + legSw * .6, -48]; }
  else if (pose === 'pray') { a1 = [-2, -66]; a2 = [2, -66]; }
  else if (pose === 'carry') { a1 = [-14, -112]; a2 = [14, -112]; }
  else if (pose === 'offer') { a1 = [22, -86]; a2 = [30, -90]; }
  else if (pose === 'dance') { const w = Math.sin(t * 6); a1 = [-28, -100 + w * 14]; a2 = [28, -100 - w * 14]; }
  else if (pose === 'wave') { a1 = [-16, -46]; a2 = [26 + Math.sin(t * 8) * 4, -104]; }
  else if (pose === 'work') { const w = Math.sin(t * 8) * 8; a1 = [18 + w, -50]; a2 = [24 - w, -54]; }
  else { a1 = [-17, -46 + Math.sin(t * 2) * 1]; a2 = [17, -46]; }
  [[sh, a1], [sh2, a2]].forEach(([s0, e]) => { const m = [(s0[0] + e[0]) / 2 + (e[1] < -80 ? (s0[0] < 0 ? -6 : 6) : 0), (s0[1] + e[1]) / 2]; ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.quadraticCurveTo(m[0], m[1], e[0], e[1]); strokeInk(8); ctx.beginPath(); ctx.moveTo(s0[0], s0[1]); ctx.quadraticCurveTo(m[0], m[1], e[0], e[1]); strokeInk(5, P.skin); circ(e[0], e[1], 3.5); fillInk(P.skin, 1.2); if (P.female) { ctx.beginPath(); ctx.moveTo(e[0] - 3, e[1] + 4); ctx.lineTo(e[0] + 3, e[1] + 4); strokeInk(2, C.red); } });
  if (pose === 'carry' && o.carry) { o.carry(0, -118); }
  if (pose === 'offer' && o.carry) { o.carry(30, -96); }
  // head
  ctx.beginPath(); ctx.rect(-4, -86, 8, 8); fillInk(P.skin, 1.5);
  const hy = -100;
  if (P.female && !P.child) { ctx.beginPath(); ctx.arc(0, hy - 2, 17, Math.PI * .9, Math.PI * 2.1); fillInk(P.cloth2 && pose !== 'dance' && P.grey ? P.cloth : (P.grey ? '#ddd' : '#1a0d05'), 2); }
  circ(0, hy, 15); fillInk(P.skin, 2.2);
  // hair
  const hair = P.grey ? '#d8d8d8' : '#1a0d05';
  ctx.beginPath(); ctx.arc(0, hy - 2, 15.5, Math.PI * 1.05, Math.PI * 1.95); ctx.lineTo(13, hy - 6); ctx.quadraticCurveTo(0, hy - 10, -13, hy - 6); ctx.closePath(); fillInk(hair, 1.8);
  if (P.female) {
    if (P.child) { [-1, 1].forEach(sd => { ctx.beginPath(); ctx.moveTo(sd * 13, hy - 4); ctx.quadraticCurveTo(sd * 20, hy + 10, sd * 15, hy + 26); strokeInk(5, hair); circ(sd * 15, hy + 27, 3); fillInk(C.red, 1); }); }
    else { circ(-14, hy - 4, 7); fillInk(hair, 1.8); }
    ctx.fillStyle = C.red; circ(0, hy - 7, 2.2); ctx.fill(); // bindi
    if (!P.child) { ctx.beginPath(); ctx.moveTo(0, hy - 15); ctx.lineTo(0, hy - 9); strokeInk(2.5, C.red); } // sindoor
  }
  // face
  ctx.fillStyle = '#fff'; ell(-5.5, hy, 3.6, 2.6); ctx.fill(); ell(5.5, hy, 3.6, 2.6); ctx.fill();
  ctx.fillStyle = C.ink; circ(-5, hy, 1.7); ctx.fill(); circ(6, hy, 1.7); ctx.fill();
  if (P.glasses) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; circ(-5.5, hy, 4.5); ctx.stroke(); circ(5.5, hy, 4.5); ctx.stroke(); }
  ctx.beginPath(); ctx.moveTo(-4, hy + 6); ctx.quadraticCurveTo(0, hy + (pose === 'pray' ? 8 : 10), 4, hy + 6); strokeInk(1.6, '#7a1a0a');
  ctx.fillStyle = 'rgba(231,84,128,.35)'; circ(-9, hy + 4, 3); ctx.fill(); circ(9, hy + 4, 3); ctx.fill();
  if (P.mustache) { ctx.beginPath(); ctx.moveTo(-6, hy + 4); ctx.quadraticCurveTo(0, hy + 2, 6, hy + 4); strokeInk(2.2, hair); }
  if (P.hero && !P.female) { ctx.beginPath(); ctx.arc(0, hy - 14, 4, 0, Math.PI * 2); fillInk(C.red, 1); } // tilak dot / hero mark
  if (pose === 'pray') { ctx.fillStyle = C.ink; ctx.fillRect(-7, hy - 1, 4, 1.5); ctx.fillRect(3, hy - 1, 4, 1.5); }
  ctx.restore();
}

// ---------- Surya Pankhi (golden guide bird) ----------
function pankhi(x, y, t, s = 1, dir = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s * dir, s);
  const g = ctx.createRadialGradient(0, 0, 4, 0, 0, 40); g.addColorStop(0, 'rgba(255,230,120,.6)'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; circ(0, 0, 40); ctx.fill();
  const f = Math.sin(t * 14);
  // tail plumes
  for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.moveTo(-14, 2); ctx.quadraticCurveTo(-34, 6 + i * 10, -46, i * 14 + 8); ctx.quadraticCurveTo(-30, i * 6, -14, 2); fillInk(i ? C.red : C.tur, 1.6); circ(-44, i * 14 + 8, 3); fillInk(C.indigo, 1); }
  // back wing
  ctx.save(); ctx.rotate(-f * .5); ctx.beginPath(); ctx.moveTo(0, -2); ctx.quadraticCurveTo(-6, -30, 8, -36); ctx.quadraticCurveTo(10, -16, 0, -2); fillInk('#e8a317', 1.8); ctx.restore();
  // body
  ctx.beginPath(); ell(0, 0, 18, 12); fillInk(C.gold, 2);
  ctx.strokeStyle = C.red; ctx.lineWidth = 1.4; for (let i = -10; i <= 6; i += 5) { ctx.beginPath(); ctx.arc(i, 2, 4, 0, Math.PI); ctx.stroke(); }
  // front wing
  ctx.save(); ctx.translate(-2, -2); ctx.rotate(f * .6 - .2); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-4, -26, 12, -32); ctx.quadraticCurveTo(14, -12, 0, 0); fillInk('#ffd23f', 1.8);
  ctx.strokeStyle = C.red; ctx.lineWidth = 1; for (let k = 0; k < 3; k++) { ctx.beginPath(); ctx.moveTo(2, -6 - k * 7); ctx.lineTo(8, -8 - k * 7); ctx.stroke(); } ctx.restore();
  // head
  circ(16, -8, 9); fillInk(C.gold, 2);
  ctx.beginPath(); ctx.moveTo(24, -10); ctx.lineTo(33, -6); ctx.lineTo(24, -4); fillInk('#ff7b00', 1.5);
  ctx.fillStyle = '#fff'; ell(18, -10, 3.5, 2.6); ctx.fill(); ctx.fillStyle = C.ink; circ(19, -10, 1.6); ctx.fill();
  // crest
  for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.moveTo(14, -16); ctx.lineTo(8 + i * 5, -27); strokeInk(1.5); circ(8 + i * 5, -28, 2.2); fillInk(C.red, 1); }
  ctx.restore();
}

// ---------- Surya Dev on golden chariot ----------
function suryaDev(x, y, s, t, alpha = 1) {
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(x, y); ctx.scale(s, s);
  // halo
  const g = ctx.createRadialGradient(0, -120, 20, 0, -120, 260); g.addColorStop(0, 'rgba(255,240,170,.95)'); g.addColorStop(.4, 'rgba(255,190,60,.5)'); g.addColorStop(1, 'rgba(255,150,30,0)');
  ctx.fillStyle = g; circ(0, -120, 260); ctx.fill();
  ctx.save(); ctx.translate(0, -120); ctx.rotate(t * .08);
  for (let i = 0; i < 24; i++) { ctx.rotate(Math.PI / 12); ctx.beginPath(); ctx.moveTo(-6, -70); ctx.lineTo(0, -150 - (i % 2) * 30); ctx.lineTo(6, -70); ctx.fillStyle = i % 2 ? 'rgba(255,215,90,.8)' : 'rgba(255,170,40,.7)'; ctx.fill(); }
  ctx.restore();
  circ(0, -120, 72); fillInk('#ffd54a', 3); circ(0, -120, 62); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.setLineDash([3, 5]); ctx.stroke(); ctx.setLineDash([]);
  // seven horses (stylised, madhubani colours) galloping
  const hcol = ['#fffaf0', '#ffd23f', '#ff9f1c', '#e2401c', '#e75480', '#4fa3d9', '#2e8b57'];
  for (let i = 6; i >= 0; i--) {
    const hx = -150 - i * 16, hy = 26 - i * 9 + Math.sin(t * 6 + i) * 3;
    horse(hx, hy, 1.05, t * 6 + i * .7, hcol[i]);
  }
  // reins
  ctx.strokeStyle = '#ffd54a'; ctx.lineWidth = 2; for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.moveTo(-56, -44); ctx.quadraticCurveTo(-110, -70, -150 - i * 16 - 46, 26 - i * 9 - 40); ctx.stroke(); }
  // chariot body
  ctx.beginPath(); ctx.moveTo(-70, -20); ctx.lineTo(70, -20); ctx.lineTo(60, 20); ctx.lineTo(-60, 20); ctx.closePath(); fillInk('#ffc93c', 3);
  ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.beginPath(); for (let k = -60; k < 60; k += 12) { ctx.moveTo(k, 14); ctx.lineTo(k + 6, -14); ctx.lineTo(k + 12, 14); } ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-70, -20); ctx.lineTo(-80, -40); ctx.moveTo(70, -20); ctx.lineTo(80, -40); strokeInk(4, '#ffc93c');
  // single great wheel
  ctx.save(); ctx.translate(10, 30); ctx.rotate(t * 2);
  circ(0, 0, 36); fillInk('#ffd54a', 3); circ(0, 0, 28); strokeInk(2, C.red);
  for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -28); strokeInk(2.5); }
  circ(0, 0, 7); fillInk(C.red, 2); ctx.restore();
  // Surya Dev figure (seated, holding two lotuses)
  ctx.save(); ctx.translate(0, -26);
  ctx.beginPath(); ctx.moveTo(-34, 0); ctx.quadraticCurveTo(-36, -50, -18, -72); ctx.lineTo(18, -72); ctx.quadraticCurveTo(36, -50, 34, 0); ctx.closePath(); fillInk('#ff9933', 2.5);
  ctx.beginPath(); ctx.moveTo(-18, -72); ctx.lineTo(10, -10); ctx.lineTo(20, -14); ctx.lineTo(0, -72); fillInk('#ffd23f', 1.5); // sacred stole
  ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, -66, 16, .2, Math.PI - .2); ctx.stroke(); // necklace
  // arms raised holding lotuses
  [[-1], [1]].forEach(([sd]) => { ctx.beginPath(); ctx.moveTo(sd * 18, -66); ctx.quadraticCurveTo(sd * 42, -60, sd * 44, -86); strokeInk(9); ctx.beginPath(); ctx.moveTo(sd * 18, -66); ctx.quadraticCurveTo(sd * 42, -60, sd * 44, -86); strokeInk(6, '#e8a35c'); ctx.beginPath(); ctx.moveTo(sd * 44, -86); ctx.lineTo(sd * 44, -96); strokeInk(2, C.green); lotus(sd * 44, -96, .55); });
  // head
  circ(0, -88, 16); fillInk('#e8a35c', 2.2);
  ctx.fillStyle = '#fff'; ell(-6, -89, 4, 2.4); ctx.fill(); ell(6, -89, 4, 2.4); ctx.fill(); ctx.fillStyle = C.ink; circ(-6, -89, 1.6); ctx.fill(); circ(6, -89, 1.6); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4, -80); ctx.quadraticCurveTo(0, -77, 4, -80); strokeInk(1.6, '#7a1a0a');
  ctx.beginPath(); ctx.moveTo(0, -98); ctx.lineTo(0, -93); strokeInk(2.5, C.red);
  // crown (mukut)
  ctx.beginPath(); ctx.moveTo(-15, -98); ctx.lineTo(-13, -116); ctx.lineTo(-6, -108); ctx.lineTo(0, -126); ctx.lineTo(6, -108); ctx.lineTo(13, -116); ctx.lineTo(15, -98); ctx.closePath(); fillInk('#ffd23f', 2);
  ctx.fillStyle = C.red; circ(0, -110, 3); ctx.fill(); circ(-10, -104, 2); ctx.fill(); circ(10, -104, 2); ctx.fill();
  // earrings
  circ(-15, -84, 3.5); fillInk('#ffd23f', 1.2); circ(15, -84, 3.5); fillInk('#ffd23f', 1.2);
  ctx.restore();
  // charioteer Aruna (small)
  ctx.save(); ctx.translate(-56, -26); ctx.beginPath(); ctx.rect(-8, -26, 16, 26); fillInk('#e2401c', 1.8); circ(0, -32, 8); fillInk('#d89050', 1.8); ctx.restore();
  ctx.restore();
}
function horse(x, y, s, ph, col) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const l = Math.sin(ph) * 16;
  [[-24, l], [-14, -l], [18, -l], [28, l]].forEach(([lx, sw]) => { ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + sw * .6, 30); strokeInk(6); ctx.beginPath(); ctx.moveTo(lx, 0); ctx.lineTo(lx + sw * .6, 30); strokeInk(3.5, col); });
  ctx.beginPath(); ctx.ellipse(0, -6, 38, 16, 0, 0, Math.PI * 2); fillInk(col, 2.5);
  ctx.beginPath(); ctx.moveTo(-28, -14); ctx.quadraticCurveTo(-42, -30, -44, -46); ctx.lineTo(-58, -38); ctx.quadraticCurveTo(-60, -30, -52, -30); ctx.lineTo(-40, -6); ctx.closePath(); fillInk(col, 2.5);
  ctx.fillStyle = C.ink; circ(-48, -40, 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-38, -44); ctx.quadraticCurveTo(-30, -30, -24, -18); strokeInk(4, C.red); // mane
  ctx.beginPath(); ctx.moveTo(36, -10); ctx.quadraticCurveTo(52, -4, 48, 16); strokeInk(4, C.red); // tail
  ctx.strokeStyle = C.red; ctx.lineWidth = 1.5; for (let i = -20; i < 24; i += 9) { ctx.beginPath(); ctx.arc(i, -6, 5, 0, Math.PI); ctx.stroke(); }
  ctx.fillStyle = C.tur; circ(-44, -46, 3); ctx.fill(); // plume
  ctx.restore();
}

// ---------- Madhubani frame ----------
function frame(x, y, w, h, bg = '#fff3d6') {
  ctx.save();
  ctx.shadowColor = 'rgba(60,20,0,.4)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 4;
  rrect(x, y, w, h, 18); ctx.fillStyle = bg; ctx.fill(); ctx.shadowColor = 'transparent';
  ctx.lineWidth = 4; ctx.strokeStyle = C.ink; ctx.stroke();
  rrect(x + 8, y + 8, w - 16, h - 16, 12); ctx.lineWidth = 2; ctx.strokeStyle = C.red; ctx.stroke();
  // zigzag band
  ctx.beginPath(); ctx.strokeStyle = C.tur; ctx.lineWidth = 2;
  for (let k = x + 20; k < x + w - 20; k += 12) { ctx.moveTo(k, y + 14); ctx.lineTo(k + 6, y + 20); ctx.lineTo(k + 12, y + 14); ctx.moveTo(k, y + h - 14); ctx.lineTo(k + 6, y + h - 20); ctx.lineTo(k + 12, y + h - 14); }
  ctx.stroke();
  // corner suns
  [[x + 14, y + 14], [x + w - 14, y + 14], [x + 14, y + h - 14], [x + w - 14, y + h - 14]].forEach(([a, b]) => { circ(a, b, 9); fillInk(C.tur, 2); circ(a, b, 4); fillInk(C.red, 1); });
  ctx.restore();
}
