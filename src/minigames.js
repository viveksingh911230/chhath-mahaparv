// ================= MINI GAMES =================
const MINI_LIST = [
  { id: 'soop', n: B('छठ का सूप सजाएँ', 'Arrange the Chhath Soop') }, { id: 'thekua', n: B('ठेकुआ बनाएँ', 'Prepare Thekua') },
  { id: 'daura', n: B('बाँस का दउरा सजाएँ', 'Decorate the Daura') }, { id: 'match', n: B('फल और प्रसाद की जोड़ी', 'Match Fruits & Offerings') },
  { id: 'clean', n: B('घाट-नदी की सफ़ाई', 'Clean the River Ghat') }, { id: 'light', n: B('दीये जलाएँ', 'Light the Diyas') },
  { id: 'symbols', n: B('पर्व के चिह्न मिलाएँ', 'Match Festival Symbols') }, { id: 'madhubani', n: B('मधुबनी पहेली', 'Madhubani Pattern Puzzle') }
];

function MiniShell(title, instr, standalone, onDone) {
  const m = { t: 0, won: false, wonT: 0, title, instr };
  m.back = { x: W - 130, y: 14, w: 116, h: 40 };
  m.win = () => { if (m.won) return; m.won = true; m.wonT = 0; Audio2.sfx('complete'); setTimeout(() => Audio2.sfx('level'), 500); };
  m.tick = dt => { m.t += dt; if (m.won) { m.wonT += dt; if (m.wonT > 2.4 && !m.fired) { m.fired = true; onDone(true); } } };
  m.bg = (top = '#fde3a7', bot = '#f7c873') => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, top); g.addColorStop(1, bot); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // faint madhubani motifs
    ctx.save(); ctx.globalAlpha = .12; for (let i = 0; i < 6; i++) { fish(80 + i * 170, 520, .8, C.red, i % 2 ? 1 : -1); } ctx.restore();
  };
  m.chrome = (prog) => {
    rrect(14, 12, W - 160, 58, 14); fillInk('rgba(255,243,214,.95)', 2.5);
    txt(L(title), 34, 32, 22, C.red, 'left', TFONT, '600'); txt(L(instr), 34, 56, 14, C.ink, 'left', FONT, '600');
    if (prog) txt(prog, W - 170, 41, 18, C.ink, 'right', FONT, '800');
    button(m.back, L(standalone ? B('वापस', 'Back') : B('छोड़ें', 'Skip')), { size: 16 });
    if (m.won) {
      const k = Math.min(1, m.wonT * 2); ctx.fillStyle = `rgba(40,15,0,${.45 * k})`; ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(k, k); frame(-210, -110, 420, 220);
      txtO(L(B('शाबाश!', 'Shabash!')), 0, -40, 46, '#ffd23f'); for (let i = 0; i < 3; i++) drawSun(-70 + i * 70, 35, 18, m.t, {});
      txt(L(B('तुमने बहुत सुंदर काम किया', 'Beautifully done')), 0, 80, 16, C.ink, 'center'); ctx.restore();
      if (Math.random() < .5) m.parts.push({ x: rand(0, W), y: -10, vy: rand(60, 140), c: ['#ff9f1c', '#ffd23f', '#e2401c'][Math.floor(rand(0, 3))] });
    }
    for (const p of m.parts) { p.y += p.vy / 60; ctx.fillStyle = p.c; ell(p.x, p.y, 5, 2.5, p.y * .05); ctx.fill(); }
    m.parts = m.parts.filter(p => p.y < H + 10);
  };
  m.parts = [];
  m.backHit = (x, y) => { if (inRect(x, y, m.back)) { Audio2.sfx('click'); if (standalone) onDone(false); else { m.won = true; m.wonT = 2.4; } return true; } return false; };
  return m;
}

const MINIS = {
  // ---------- 1. Arrange the soop (drag & drop) ----------
  soop(arg, onDone, standalone) {
    const m = MiniShell(B('छठ का सूप सजाएँ', 'Arrange the Chhath Soop'), B('हर प्रसाद को सूप पर उसके सही स्थान पर खींचकर रखें', 'Drag each offering onto its matching place on the soop'), standalone, onDone);
    const ids = ['thekua', 'banana', 'coconut', 'apple', 'orange', 'lemon', 'ginger', 'turmeric'];
    const slotPos = [[-110, -60], [-36, -78], [40, -78], [112, -60], [-120, 26], [-40, 18], [40, 18], [120, 26]];
    const cx = W / 2, cy = 245;
    const slots = ids.map((id, i) => ({ id, x: cx + slotPos[i][0], y: cy + slotPos[i][1], filled: false }));
    const tray = shuffle(ids.slice()).map((id, i) => ({ id, x: 120 + i * 103, y: 470, hx: 120 + i * 103, hy: 470, placed: false }));
    let drag = null, shake = 0;
    return {
      _t: () => ({ slots, tray }),
      update(dt) { m.tick(dt); shake = Math.max(0, shake - dt); if (!drag) tray.forEach(it => { if (!it.placed) { it.x = lerp(it.x, it.hx, dt * 10); it.y = lerp(it.y, it.hy, dt * 10); } }); },
      draw() {
        m.bg();
        ctx.save(); ctx.translate(cx, cy); ctx.scale(4.2, 4.2); soop(0, 0, 1); ctx.restore();
        slots.forEach(s => { if (!s.filled) { ctx.save(); ctx.globalAlpha = .28; item(s.id, s.x, s.y, 1.2); ctx.restore(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.red; ctx.lineWidth = 2; circ(s.x, s.y, 30); ctx.stroke(); ctx.setLineDash([]); } else item(s.id, s.x, s.y, 1.25, m.t); });
        if (slots.every(s => s.filled)) { diya(cx - 150, cy + 80, 1, true, m.t); diya(cx + 150, cy + 80, 1, true, m.t); }
        rrect(60, 425, W - 120, 92, 16); fillInk('rgba(201,154,74,.5)', 2.5);
        tray.forEach(it => { if (!it.placed && it !== drag) { item(it.id, it.x, it.y, 1.1, m.t); txt(L(ITEMS[it.id]), it.hx, 508, 12, C.ink, 'center', FONT, '700'); } });
        if (drag) { ctx.save(); ctx.translate(shake ? Math.sin(m.t * 60) * 5 : 0, 0); item(drag.id, drag.x, drag.y, 1.4, m.t); ctx.restore(); }
        m.chrome(`${slots.filter(s => s.filled).length}/8`);
      },
      down(x, y) { if (m.backHit(x, y) || m.won) return; drag = tray.find(it => !it.placed && Math.hypot(it.x - x, it.y - y) < 40) || null; if (drag) Audio2.sfx('click'); },
      move(x, y) { if (drag) { drag.x = x; drag.y = y; } },
      up(x, y) {
        if (!drag) return; const s = slots.find(s => !s.filled && Math.hypot(s.x - x, s.y - y) < 46);
        if (s && s.id === drag.id) { s.filled = true; drag.placed = true; Audio2.sfx('collect'); if (slots.every(s => s.filled)) m.win(); }
        else if (s) { Audio2.sfx('wrong'); shake = .3; }
        drag = null;
      }
    };
  },

  // ---------- 2. Thekua (mix, press, fry) ----------
  thekua(arg, onDone, standalone) {
    const m = MiniShell(B('ठेकुआ बनाएँ', 'Prepare Thekua'), B('आटा → गुड़ → घी मिलाएँ, साँचे से दबाएँ, फिर सुनहरा तलें', 'Mix flour → jaggery → ghee, press with the mould, then fry golden'), standalone, onDone);
    let phase = 0, mixed = 0, stirA = 0, fried = 0, needle = 0, nd = 1, msg = '', msgT = 0;
    const order = ['atta', 'gur', 'ghee'];
    const shelf = [{ id: 'atta', x: 200 }, { id: 'gur', x: 300 }, { id: 'ghee', x: 400 }].map(s => Object.assign(s, { y: 200, used: false, shake: 0 }));
    shuffle(shelf).forEach((s, i) => s.x = 180 + i * 110);
    const balls = Array.from({ length: 6 }, (_, i) => ({ x: 300 + (i % 3) * 140, y: 270 + Math.floor(i / 3) * 120, pressed: 0 }));
    const say = s => { msg = L(s); msgT = 1.6; };
    return {
      _t: () => ({ phase, shelf, balls, order, mixed, needle }),
      update(dt) { m.tick(dt); msgT -= dt; stirA += dt * (phase === 0 ? 2 : 0); if (phase === 2 && !m.won) { needle += nd * dt * .55; if (needle > 1) { needle = 1; nd = -1; } if (needle < 0) { needle = 0; nd = 1; } } balls.forEach(b => { if (b.pressed > 0 && b.pressed < 1) b.pressed = Math.min(1, b.pressed + dt * 3); }); shelf.forEach(s => s.shake = Math.max(0, s.shake - dt)); },
      draw() {
        m.bg('#f6dcae', '#e8b77a');
        if (phase === 0) {
          rrect(130, 140, 380, 120, 12); fillInk('#a0703a', 2.5); txt(L(B('रसोई का रैक', 'Kitchen shelf')), 320, 156, 13, '#fff', 'center');
          shelf.forEach(s => { if (!s.used) { item(s.id, s.x + (s.shake ? Math.sin(m.t * 50) * 4 : 0), s.y, 1.4); txt(L(ITEMS[s.id]), s.x, 244, 13, '#fff', 'center', FONT, '700'); } });
          // bowl
          ctx.beginPath(); ctx.ellipse(700, 330, 130, 40, 0, 0, Math.PI); ctx.lineTo(830, 330); ctx.quadraticCurveTo(820, 440, 700, 450); ctx.quadraticCurveTo(580, 440, 570, 330); fillInk('#b87333', 3);
          ctx.beginPath(); ctx.ellipse(700, 330, 130, 40, 0, 0, Math.PI * 2); fillInk(mixed ? lerpCol('#e8d5a8', '#a0612c', mixed / 3) : '#5a3415', 3);
          if (mixed) { ctx.save(); ctx.translate(700, 330); ctx.rotate(stirA); ctx.strokeStyle = 'rgba(80,40,10,.4)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(0, 0, 60, 0, 4); ctx.stroke(); ctx.restore(); }
          // recipe card
          rrect(130, 300, 380, 150, 14); fillInk('#fff6e0', 2.5); txt(L(B('दादी की विधि', 'Dadi\'s recipe')), 320, 322, 18, C.red, 'center', TFONT);
          order.forEach((id, i) => { txt(`${i + 1}. ${L(ITEMS[id])}`, 170, 360 + i * 28, 17, i < mixed ? C.green : C.ink, 'left', FONT, '700'); if (i < mixed) txt('✔', 470, 360 + i * 28, 18, C.green); });
        } else if (phase === 1) {
          rrect(200, 200, 560, 290, 18); fillInk('#c9965a', 3); txt(L(B('हर लोई पर टैप करें — साँचे से दबाएँ', 'Tap each dough ball to press it with the sancha mould')), W / 2, 180, 16, C.ink, 'center', FONT, '700');
          balls.forEach(b => { if (b.pressed >= 1) item('thekua', b.x, b.y, 1.8); else { const k = b.pressed; ell(b.x, b.y, 26 + k * 10, 22 - k * 6); fillInk('#e2b87a', 2.5); if (k > 0) { ctx.save(); ctx.translate(b.x, b.y - 40 + k * 30); ctx.beginPath(); ctx.rect(-40, -20, 80, 24); fillInk('#7a4a22', 2.5); ctx.restore(); } } });
        } else {
          // kadhai
          chulha(W / 2, 470, 2.2, m.t);
          ctx.beginPath(); ctx.ellipse(W / 2, 360, 180, 50, 0, 0, Math.PI); fillInk('#3a3a3a', 3); ctx.beginPath(); ctx.ellipse(W / 2, 360, 180, 50, 0, 0, Math.PI * 2); fillInk('#c8a040', 3);
          for (let i = 0; i < 3; i++) { item('thekua', W / 2 - 80 + i * 80, 360, 1.4); ctx.fillStyle = 'rgba(255,255,255,.5)'; circ(W / 2 - 100 + i * 80 + Math.sin(m.t * 9 + i) * 20, 350 + Math.cos(m.t * 7 + i) * 8, 3); ctx.fill(); }
          // meter
          const mx = 230, mw = 500, my = 160; const g = ctx.createLinearGradient(mx, 0, mx + mw, 0); g.addColorStop(0, '#f2e2b0'); g.addColorStop(.45, '#e8a33c'); g.addColorStop(.6, '#c77a2c'); g.addColorStop(1, '#3a1a08');
          rrect(mx, my, mw, 36, 12); ctx.fillStyle = g; ctx.fill(); strokeInk(3);
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(mx + mw * .42, my - 4, mw * .2, 44); txt(L(B('सुनहरा', 'Golden')), mx + mw * .52, my + 56, 14, C.ink, 'center', FONT, '800');
          ctx.beginPath(); ctx.moveTo(mx + needle * mw, my - 14); ctx.lineTo(mx + needle * mw - 10, my - 30); ctx.lineTo(mx + needle * mw + 10, my - 30); ctx.closePath(); fillInk(C.red, 2);
          txt(L(B('सुनहरा होने पर टैप करें!', 'Tap when it turns golden!')) + `  ${fried}/3`, W / 2, 248, 18, C.ink, 'center', FONT, '800');
        }
        if (msgT > 0) txtO(msg, W / 2, 110, 22, '#fff', C.red, 'center', FONT, 5);
        m.chrome([L(B('मिलाएँ', 'Mix')), L(B('दबाएँ', 'Press')), L(B('तलें', 'Fry'))][phase]);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won) return;
        if (phase === 0) { const s = shelf.find(s => !s.used && Math.hypot(s.x - x, s.y - y) < 40); if (!s) return; if (s.id === order[mixed]) { s.used = true; mixed++; Audio2.sfx('collect'); if (mixed === 3) { say(B('आटा गूँथ गया!', 'Dough is ready!')); setTimeout(() => phase = 1, 700); } } else { s.shake = .35; Audio2.sfx('wrong'); say(B('विधि का क्रम देखें', 'Check the recipe order')); } }
        else if (phase === 1) { const b = balls.find(b => b.pressed === 0 && Math.hypot(b.x - x, b.y - y) < 40); if (b) { b.pressed = .01; Audio2.sfx('inv'); if (balls.every(b => b.pressed > 0)) setTimeout(() => { phase = 2; say(B('अब घी में तलें', 'Now fry in ghee')); }, 600); } }
        else { if (needle > .42 && needle < .62) { fried++; Audio2.sfx('collect'); say(B('एकदम सुनहरा!', 'Perfectly golden!')); if (fried >= 3) m.win(); } else { Audio2.sfx('wrong'); say(needle < .42 ? B('अभी कच्चा है', 'Still raw — wait') : B('ज़्यादा गहरा! फिर कोशिश करें', 'Too dark! Try again')); } }
      }
    };
  },

  // ---------- 3. Decorate the daura ----------
  daura(arg, onDone, standalone) {
    const m = MiniShell(B('बाँस का दउरा सजाएँ', 'Decorate the Bamboo Daura'), B('बाईं ओर से सजावट चुनें, फिर दउरे पर चमकते स्थान पर टैप करें', 'Pick a decoration on the left, then tap a glowing spot on the daura'), standalone, onDone);
    const pal = ['flower', 'sindoor', 'aipan', 'leaf', 'diya', 'sugarcane'];
    const palN = { flower: ITEMS.flower, sindoor: B('सिंदूर', 'Sindoor'), aipan: B('अरिपन', 'Aripan'), leaf: ITEMS.leaf, diya: ITEMS.diya, sugarcane: ITEMS.sugarcane };
    const cx = 560, cy = 300;
    const hs = [[-110, -70], [0, -78], [110, -70], [-80, 30], [0, 40], [80, 30]].map(([a, b]) => ({ x: cx + a, y: cy + b, d: null }));
    let sel = 'flower';
    function deco(d, x, y, s = 1) {
      if (d === 'sindoor') { ctx.fillStyle = C.red; for (let i = 0; i < 5; i++) { circ(x - 16 + i * 8, y + (i % 2) * 6, 4 * s); ctx.fill(); } }
      else if (d === 'aipan') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; for (let r = 6; r < 26; r += 7) { circ(x, y, r * s); ctx.stroke(); } ctx.fillStyle = '#fff'; for (let i = 0; i < 8; i++) { const a = i * .785; circ(x + Math.cos(a) * 28 * s, y + Math.sin(a) * 28 * s, 3); ctx.fill(); } }
      else if (d === 'sugarcane') sugarcane(x, y + 30, 70 * s, 0, .8);
      else item(d, x, y, 1.1 * s, m.t);
    }
    return {
      _t: () => ({ hs }),
      update(dt) { m.tick(dt); },
      draw() {
        m.bg('#fde7c4', '#f2b880');
        ctx.save(); ctx.translate(cx, cy); ctx.scale(4.4, 4.4); daura(0, 0, 1); ctx.restore();
        hs.forEach(h => { if (h.d) deco(h.d, h.x, h.y); else { ctx.fillStyle = `rgba(255,230,100,${.4 + .3 * Math.sin(m.t * 5)})`; circ(h.x, h.y, 22); ctx.fill(); ctx.setLineDash([4, 4]); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.stroke(); ctx.setLineDash([]); } });
        rrect(30, 90, 170, 430, 16); fillInk('rgba(255,243,214,.95)', 2.5);
        pal.forEach((d, i) => { const y = 135 + i * 64; if (d === sel) { rrect(40, y - 28, 150, 56, 12); fillInk('#ffd23f', 2); } deco(d, 80, y, .8); txt(L(palN[d]), 150, y, 13, C.ink, 'center', FONT, '700'); });
        m.chrome(`${hs.filter(h => h.d).length}/6`);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won) return;
        pal.forEach((d, i) => { if (inRect(x, y, { x: 40, y: 107 + i * 64, w: 150, h: 56 })) { sel = d; Audio2.sfx('click'); } });
        const h = hs.find(h => Math.hypot(h.x - x, h.y - y) < 34); if (h) { h.d = sel; Audio2.sfx('collect'); if (hs.every(h => h.d)) m.win(); }
      }
    };
  },

  // ---------- 4. Match fruits & offerings (memory) ----------
  match(arg, onDone, standalone) {
    const m = MiniShell(B('फल और प्रसाद की जोड़ी', 'Match Fruits & Offerings'), B('दो पत्ते पलटें और एक जैसे प्रसाद की जोड़ी बनाएँ', 'Flip two cards and find matching offerings'), standalone, onDone);
    const ids = ['thekua', 'banana', 'coconut', 'sugarcane', 'lemon', 'diya'];
    const cards = shuffle([...ids, ...ids]).map((id, i) => ({ id, x: 190 + (i % 4) * 150, y: 150 + Math.floor(i / 4) * 125, f: 0, open: false, done: false }));
    let pick = [], lock = 0, moves = 0;
    return {
      _t: () => ({ cards, lock }),
      update(dt) { m.tick(dt); cards.forEach(c => c.f = lerp(c.f, c.open || c.done ? 1 : 0, dt * 10)); if (lock > 0) { lock -= dt; if (lock <= 0) { pick.forEach(c => c.open = false); pick = []; } } },
      draw() {
        m.bg('#fde3a7', '#f7c873');
        cards.forEach(c => {
          const sx = Math.abs(Math.cos(c.f * Math.PI)); const face = c.f > .5;
          ctx.save(); ctx.translate(c.x + 55, c.y + 50); ctx.scale(sx || .02, 1);
          rrect(-55, -50, 110, 100, 12); fillInk(face ? (c.done ? '#d6f5c6' : '#fff6e0') : C.red, 3);
          if (face) { item(c.id, 0, -6, 1.3, m.t); ctx.scale(1 / (sx || .02), 1); txt(L(ITEMS[c.id]), 0, 36, 12, C.ink, 'center', FONT, '700'); }
          else { drawSun(0, 0, 18, 0, {}); }
          ctx.restore();
        });
        m.chrome(L(B('चालें', 'Moves')) + ': ' + moves);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won || lock > 0) return;
        const c = cards.find(c => !c.open && !c.done && inRect(x, y, { x: c.x, y: c.y, w: 110, h: 100 })); if (!c) return;
        c.open = true; pick.push(c); Audio2.sfx('click');
        if (pick.length === 2) { moves++; if (pick[0].id === pick[1].id) { pick.forEach(p => { p.done = true; p.open = false; }); pick = []; Audio2.sfx('collect'); if (cards.every(c => c.done)) m.win(); } else lock = .9; }
      }
    };
  },

  // ---------- 5. Clean the river ghat ----------
  clean(arg, onDone, standalone) {
    const m = MiniShell(B('घाट-नदी की सफ़ाई', 'Clean the River Ghat'), B('तैरता प्लास्टिक उठाएँ — पर फूल और दीये बहने दें', 'Scoop up floating plastic — but let flowers and diyas float'), standalone, onDone);
    let got = 0, sp = 0, msg = '', msgT = 0; const fl = [];
    const GOAL = 15;
    return {
      _t: () => ({ fl }),
      update(dt) {
        m.tick(dt); msgT -= dt; sp -= dt;
        if (sp <= 0 && !m.won) { sp = rand(.45, .9); const r = Math.random(); fl.push({ id: r < .38 ? 'plastic' : r < .7 ? 'bag' : r < .88 ? 'flower' : 'diya', x: W + 40, y: rand(250, 490), v: rand(55, 110), ph: rand(0, 6), gone: 0 }); }
        fl.forEach(f => { f.x -= f.v * dt; if (f.gone) f.gone += dt * 3; }); for (let i = fl.length - 1; i >= 0; i--) if (fl[i].x < -50 || fl[i].gone > 1) fl.splice(i, 1);
      },
      draw() {
        const p = PAL.noon; drawSky(p, m.t, 760); drawHills(p, m.t * 20, m.t); drawRiver(220, m.t, p, m.t * 40, 760);
        ghatSteps(0, 200, 260, 3);
        fl.forEach(f => { ctx.save(); ctx.globalAlpha = 1 - Math.min(1, f.gone); const by = Math.sin(m.t * 2 + f.ph) * 5; item(f.id, f.x, f.y + by - f.gone * 40, 1.2, m.t); ctx.restore(); });
        // net basket counter
        rrect(30, 430, 180, 80, 16); fillInk('rgba(255,243,214,.95)', 2.5); daura(80, 470, .7); txt(`${got}/${GOAL}`, 155, 470, 24, C.ink, 'center', FONT, '800');
        if (msgT > 0) txtO(msg, W / 2, 140, 22, '#fff', C.indigo, 'center', FONT, 5);
        m.chrome(`${got}/${GOAL}`);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won) return;
        const f = fl.find(f => !f.gone && Math.hypot(f.x - x, f.y - y) < 40); if (!f) return;
        if (f.id === 'plastic' || f.id === 'bag') { f.gone = .01; got++; Audio2.sfx('splash'); if (got >= GOAL) m.win(); }
        else { msg = L(B('यह तो पवित्र अर्पण है — इसे बहने दें!', 'That\'s a sacred offering — let it float!')); msgT = 1.6; Audio2.sfx('wrong'); }
      }
    };
  },

  // ---------- 6. Light the diyas ----------
  light(arg, onDone, standalone) {
    const m = MiniShell(B('दीये जलाएँ', 'Light the Diyas'), B('सारे 12 दीये एक साथ जलाएँ — हवा कुछ बुझा सकती है!', 'Light all 12 diyas at once — the breeze may blow some out!'), standalone, onDone);
    const ds = Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return { x: W / 2 + Math.cos(a) * 200, y: 300 + Math.sin(a) * 140, lit: false, fl: 0 }; });
    let windT = 3, gust = 0;
    return {
      _t: () => ({ ds }),
      update(dt) {
        m.tick(dt); gust = Math.max(0, gust - dt);
        if (!m.won) { windT -= dt; if (windT <= 0) { windT = rand(2.6, 3.6); const lit = ds.filter(d => d.lit); if (lit.length >= 3 && lit.length < 12) { const d = lit[Math.floor(Math.random() * lit.length)]; d.lit = false; d.fl = 1; gust = 1; Audio2.sfx('sweep'); } } }
        ds.forEach(d => d.fl = Math.max(0, d.fl - dt));
      },
      draw() {
        const p = PAL.night; drawSky(p, m.t, 0, { noSun: true }); drawRiver(380, m.t, p, 0, -999);
        rangoli(W / 2, 300, 150, m.t, .8);
        if (gust) { ctx.strokeStyle = `rgba(255,255,255,${gust * .6})`; ctx.lineWidth = 3; for (let i = 0; i < 5; i++) { ctx.beginPath(); const y = 160 + i * 60; ctx.moveTo(W - (1 - gust) * W * 1.2, y); ctx.quadraticCurveTo(W - (1 - gust) * W * 1.2 - 80, y - 20, W - (1 - gust) * W * 1.2 - 160, y); ctx.stroke(); } }
        ds.forEach(d => { if (d.fl) { ctx.fillStyle = `rgba(200,200,200,${d.fl * .6})`; circ(d.x, d.y - 30 - (1 - d.fl) * 20, 8); ctx.fill(); } diya(d.x, d.y, 1.6, d.lit, m.t); });
        pankhi(W / 2, 300 + Math.sin(m.t * 2) * 10, m.t, 1.2);
        m.chrome(`${ds.filter(d => d.lit).length}/12`);
      },
      down(x, y) { if (m.backHit(x, y) || m.won) return; const d = ds.find(d => !d.lit && Math.hypot(d.x - x, d.y - 10 - y) < 40); if (d) { d.lit = true; Audio2.sfx('diya'); if (ds.every(d => d.lit)) m.win(); } }
    };
  },

  // ---------- 7. Match festival symbols ----------
  symbols(arg, onDone, standalone) {
    const m = MiniShell(B('पर्व के चिह्न मिलाएँ', 'Match Festival Symbols'), B('बाईं ओर नाम चुनें, फिर दाईं ओर उसका सही चिह्न', 'Pick a name on the left, then its matching symbol on the right'), standalone, onDone);
    const defs = [
      { id: 'sun', n: B('सूर्य देव — जीवन का स्रोत', 'Surya Dev — source of life'), d: (x, y) => drawSun(x, y, 20, m.t, { face: true }) },
      { id: 'soop', n: B('सूप — अर्घ्य देने का पात्र', 'Soop — vessel for arghya'), d: (x, y) => soop(x, y, .8) },
      { id: 'thekua', n: B('ठेकुआ — विशेष प्रसाद', 'Thekua — special prasad'), d: (x, y) => item('thekua', x, y, 1.4) },
      { id: 'diya', n: B('दीया — प्रकाश और आशा', 'Diya — light and hope'), d: (x, y) => diya(x, y + 12, 1.3, true, m.t) },
      { id: 'cane', n: B('ईख — कोसी का मंडप', 'Sugarcane — the kosi canopy'), d: (x, y) => item('sugarcane', x, y, 1.1) },
      { id: 'daura', n: B('दउरा — प्रसाद की टोकरी', 'Daura — basket of offerings'), d: (x, y) => daura(x, y, .8) }
    ];
    const left = defs.map((d, i) => ({ ...d, x: 70, y: 110 + i * 70, done: false }));
    const right = shuffle(defs.slice()).map((d, i) => ({ ...d, x: 700, y: 110 + i * 70, done: false, shake: 0 }));
    let sel = null;
    return {
      _t: () => ({ left, right }),
      update(dt) { m.tick(dt); right.forEach(r => r.shake = Math.max(0, r.shake - dt)); },
      draw() {
        m.bg('#fff0c4', '#f7c873');
        left.forEach(l => { if (l.done) { const r = right.find(r => r.id === l.id); ctx.beginPath(); ctx.moveTo(l.x + 380, l.y + 30); ctx.bezierCurveTo(520, l.y + 30, 560, r.y + 30, r.x, r.y + 30); strokeInk(4, C.green); } });
        if (sel) { ctx.beginPath(); ctx.moveTo(sel.x + 380, sel.y + 30); ctx.lineTo(MOUSE.x, MOUSE.y); ctx.setLineDash([6, 6]); strokeInk(3, C.red); ctx.setLineDash([]); }
        left.forEach(l => { rrect(l.x, l.y, 380, 60, 14); fillInk(l.done ? '#d6f5c6' : sel === l ? '#ffd23f' : '#fff6e0', 2.5); txt(L(l.n), l.x + 18, l.y + 30, 16, C.ink, 'left', FONT, '700'); });
        right.forEach(r => { ctx.save(); ctx.translate(r.shake ? Math.sin(m.t * 60) * 5 : 0, 0); rrect(r.x, r.y, 180, 60, 14); fillInk(r.done ? '#d6f5c6' : '#fff6e0', 2.5); ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, 180, 60); ctx.clip(); r.d(r.x + 90, r.y + 30); ctx.restore(); ctx.restore(); });
        m.chrome(`${left.filter(l => l.done).length}/6`);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won) return;
        const l = left.find(l => !l.done && inRect(x, y, { x: l.x, y: l.y, w: 380, h: 60 })); if (l) { sel = l; Audio2.sfx('click'); return; }
        const r = right.find(r => !r.done && inRect(x, y, { x: r.x, y: r.y, w: 180, h: 60 }));
        if (r && sel) { if (r.id === sel.id) { r.done = sel.done = true; sel = null; Audio2.sfx('collect'); if (left.every(l => l.done)) m.win(); } else { r.shake = .35; Audio2.sfx('wrong'); } }
      }
    };
  },

  // ---------- 8. Madhubani pattern puzzle ----------
  madhubani(arg, onDone, standalone) {
    const m = MiniShell(B('मधुबनी पहेली', 'Madhubani Pattern Puzzle'), B('हर टुकड़े पर टैप करके घुमाएँ और चित्र पूरा करें', 'Tap each tile to rotate it and complete the painting'), standalone, onDone);
    const N = 3, SZ = 330, TS = SZ / N, ox = W / 2 - SZ / 2, oy = 120;
    const art = document.createElement('canvas'); art.width = SZ; art.height = SZ;
    paintArt(art, 'puzzle');
    const tiles = []; for (let i = 0; i < N * N; i++) tiles.push({ r: [1, 2, 3, 0, 1, 3, 2, 1, 3][i], a: 0 });
    tiles.forEach(tl => tl.a = tl.r * Math.PI / 2);
    return {
      _t: () => ({ tiles, ox, oy, TS, N }),
      update(dt) { m.tick(dt); tiles.forEach(tl => tl.a = lerp(tl.a, tl.r * Math.PI / 2, dt * 12)); },
      draw() {
        m.bg('#fde3a7', '#e8a35c');
        frame(ox - 30, oy - 30, SZ + 60, SZ + 60, '#3b1d0b');
        tiles.forEach((tl, i) => { const cx = ox + (i % N) * TS + TS / 2, cy = oy + Math.floor(i / N) * TS + TS / 2; ctx.save(); ctx.translate(cx, cy); ctx.rotate(tl.a); ctx.drawImage(art, (i % N) * TS, Math.floor(i / N) * TS, TS, TS, -TS / 2, -TS / 2, TS, TS); ctx.restore(); if (!m.won) { ctx.strokeStyle = 'rgba(59,29,11,.6)'; ctx.lineWidth = 2; ctx.strokeRect(cx - TS / 2, cy - TS / 2, TS, TS); } });
        // reference
        rrect(40, 140, 170, 200, 12); fillInk('#fff6e0', 2.5); txt(L(B('मूल चित्र', 'Original')), 125, 160, 14, C.red, 'center', FONT, '800'); ctx.drawImage(art, 55, 180, 140, 140);
        m.chrome(`${tiles.filter(t => t.r % 4 === 0).length}/9`);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won) return;
        const c = Math.floor((x - ox) / TS), r = Math.floor((y - oy) / TS); if (c < 0 || r < 0 || c >= N || r >= N) return;
        const tl = tiles[r * N + c]; tl.r = (tl.r + 1); if (tl.r % 4 === 0) { tl.a -= Math.PI * 2; tl.r = 0; }
        Audio2.sfx('click'); if (tiles.every(t => t.r % 4 === 0)) m.win();
      }
    };
  },

  // ---------- Recipe (Nahay-Khay meal / Kharna kheer) ----------
  recipe(arg, onDone, standalone) {
    const kheer = arg === 'kheer';
    const m = MiniShell(kheer ? B('खरना: गुड़ की खीर और रोटी', 'Kharna: Jaggery Kheer & Roti') : B('नहाय-खाय: कद्दू-भात', 'Nahay-Khay: Kaddu-Bhaat'),
      B('विधि के क्रम में सामग्री चुनें, फिर हिलाने के लिए बार-बार टैप करें', 'Add ingredients in recipe order, then tap repeatedly to stir'), standalone, onDone);
    const order = kheer ? ['milk', 'rice', 'gur'] : ['lauki', 'chana', 'rice', 'ghee'];
    const shelf = shuffle(order.slice()).map((id, i) => ({ id, x: 170 + i * 100, y: 200, used: false, shake: 0 }));
    let added = 0, stir = 0, ang = 0, msg = '', msgT = 0, phase = 0, rotis = 0;
    return {
      _t: () => ({ shelf, order, added }),
      update(dt) { m.tick(dt); msgT -= dt; shelf.forEach(s => s.shake = Math.max(0, s.shake - dt)); ang += dt * stir * .3; },
      draw() {
        m.bg('#f6dcae', '#d9a066');
        rrect(110, 140, 120 + order.length * 100, 120, 12); fillInk('#a0703a', 2.5);
        shelf.forEach(s => { if (!s.used) { item(s.id, s.x + (s.shake ? Math.sin(m.t * 50) * 4 : 0), s.y, 1.4); txt(L(ITEMS[s.id]), s.x, 244, 13, '#fff', 'center', FONT, '700'); } });
        rrect(110, 290, 360, 190, 14); fillInk('#fff6e0', 2.5); txt(L(B('दादी की विधि', 'Dadi\'s recipe')), 290, 312, 18, C.red, 'center', TFONT);
        order.forEach((id, i) => txt(`${i + 1}. ${L(ITEMS[id])}` + (i < added ? '  ✔' : ''), 150, 348 + i * 28, 17, i < added ? C.green : C.ink, 'left', FONT, '700'));
        txt((added === order.length ? '✔ ' : '') + L(B('अंत में: अच्छे से हिलाएँ', 'Finally: stir well')), 150, 348 + order.length * 28, 16, C.ink, 'left', FONT, '600');
        // pot on chulha
        chulha(700, 480, 2.4, m.t);
        ctx.beginPath(); ctx.moveTo(600, 300); ctx.quadraticCurveTo(590, 390, 700, 395); ctx.quadraticCurveTo(810, 390, 800, 300); ctx.closePath(); fillInk('#8a8a8a', 3);
        ctx.beginPath(); ctx.ellipse(700, 300, 100, 26, 0, 0, Math.PI * 2); fillInk(added ? (kheer ? lerpCol('#fffaf0', '#c8955a', Math.min(1, stir / 12)) : lerpCol('#d8c890', '#b8a040', Math.min(1, stir / 12))) : '#3a3a3a', 3);
        if (added) { ctx.save(); ctx.translate(700, 300); for (let i = 0; i < added * 3; i++) { const a = ang + i * 1.3; ctx.fillStyle = kheer ? '#fff' : '#8cc63f'; ell(Math.cos(a) * 60, Math.sin(a) * 14, 5, 3); ctx.fill(); } ctx.restore(); }
        if (added === order.length) { ctx.save(); ctx.translate(700 + Math.cos(ang * 3) * 40, 290); ctx.rotate(-.5 + Math.sin(ang * 3) * .2); ctx.beginPath(); ctx.rect(-4, -90, 8, 90); fillInk('#7a4a22', 2); ctx.restore(); }
        for (let k = 0; k < 3; k++) { ctx.globalAlpha = .35; circ(680 + k * 20, 260 - ((m.t * 30 + k * 20) % 60), 8); ctx.fillStyle = '#fff'; ctx.fill(); ctx.globalAlpha = 1; }
        if (added === order.length) { rrect(560, 130, 280, 30, 12); fillInk('#fff', 2); rrect(562, 132, 276 * Math.min(1, stir / 12), 26, 10); ctx.fillStyle = '#ff9f1c'; ctx.fill(); txt(L(B('टैप करके हिलाएँ!', 'Tap to stir!')), 700, 146, 15, C.ink, 'center', FONT, '800'); }
        if (msgT > 0) txtO(msg, W / 2, 104, 22, '#fff', C.red, 'center', FONT, 5);
        m.chrome(`${added}/${order.length}`);
      },
      down(x, y) {
        if (m.backHit(x, y) || m.won) return;
        if (added < order.length) {
          const s = shelf.find(s => !s.used && Math.hypot(s.x - x, s.y - y) < 40); if (!s) return;
          if (s.id === order[added]) { s.used = true; added++; Audio2.sfx('splash'); } else { s.shake = .35; Audio2.sfx('wrong'); msg = L(B('विधि का क्रम देखें', 'Check the recipe order')); msgT = 1.4; }
        } else { stir++; Audio2.sfx('step'); if (stir >= 12) { msg = L(kheer ? B('रसियाव तैयार! सुगंध फैल गई।', 'Rasiyaw is ready — what an aroma!') : B('कद्दू-भात तैयार!', 'Kaddu-bhaat is ready!')); msgT = 2; m.win(); } }
      }
    };
  }
};

// Paints one of the collectible Madhubani artworks onto a canvas
const ART_LIST = [
  { id: 'sun', n: B('सूर्य देव', 'Surya Dev') }, { id: 'fish', n: B('मछली युगल', 'Fish Pair') }, { id: 'lotus', n: B('कमल सरोवर', 'Lotus Pond') }, { id: 'peacock', n: B('मोर', 'Peacock') },
  { id: 'tree', n: B('जीवन वृक्ष', 'Tree of Life') }, { id: 'diyas', n: B('संध्या के दीप', 'Evening Lamps') }, { id: 'chariot', n: B('सूर्य रथ', 'Sun Chariot') }, { id: 'grand', n: B('छठ घाट', 'Chhath Ghat') }
];
function paintArt(cnv, id, t = 0) {
  const prev = ctx; const c2 = cnv.getContext('2d');
  // temporarily redirect drawing to the canvas
  const sz = cnv.width; swapCtx(c2);
  ctx.save(); ctx.scale(sz / 330, sz / 330);
  ctx.fillStyle = '#fff3d6'; ctx.fillRect(0, 0, 330, 330);
  // double border with zigzag
  ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.strokeRect(8, 8, 314, 314); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(18, 18, 294, 294);
  ctx.beginPath(); for (let k = 18; k < 312; k += 14) { ctx.moveTo(k, 18); ctx.lineTo(k + 7, 28); ctx.lineTo(k + 14, 18); ctx.moveTo(k, 312); ctx.lineTo(k + 7, 302); ctx.lineTo(k + 14, 312); ctx.moveTo(18, k); ctx.lineTo(28, k + 7); ctx.lineTo(18, k + 14); ctx.moveTo(312, k); ctx.lineTo(302, k + 7); ctx.lineTo(312, k + 14); } ctx.strokeStyle = C.tur; ctx.stroke();
  switch (id) {
    case 'sun': case 'puzzle': drawSun(165, 165, 62, 0, { face: true }); fish(70, 270, .7, C.indigo, 1); fish(260, 270, .7, C.green, -1); lotus(70, 90, .8); lotus(260, 90, .8); break;
    case 'fish': fish(165, 120, 1.8, C.red, 1); fish(165, 220, 1.8, C.indigo, -1); lotus(60, 290, .6); lotus(270, 290, .6); break;
    case 'lotus': ctx.fillStyle = '#9fd8ec'; ctx.fillRect(30, 200, 270, 100); [80, 165, 250].forEach((x, i) => lotus(x, 220 + (i % 2) * 20, 1.2, i % 2 ? C.pink : C.red)); fish(120, 275, .6, C.tur, 1); drawSun(165, 95, 34, 0, { face: true }); break;
    case 'peacock': peacock(165, 260, 1.5, 0); lotus(60, 290, .6); lotus(270, 290, .6); break;
    case 'tree': tree(165, 300, 1.4, 'peepal', 0); peacock(90, 300, .45); peacock(240, 300, .45); break;
    case 'diyas': ctx.fillStyle = '#ff9a4d'; ctx.fillRect(30, 30, 270, 150); drawSun(165, 170, 40, 0, { face: true }); ctx.fillStyle = '#7a3b52'; ctx.fillRect(30, 180, 270, 120); for (let i = 0; i < 6; i++) diya(60 + i * 42, 240 + (i % 2) * 20, 1, true, i); break;
    case 'chariot': suryaDev(225, 235, .6, 0); break;
    case 'grand': ctx.fillStyle = '#ffd29d'; ctx.fillRect(30, 30, 270, 160); drawSun(165, 110, 36, 0, { face: true }); ctx.fillStyle = '#4a8fb8'; ctx.fillRect(30, 190, 270, 110); for (let i = 0; i < 4; i++) person(70 + i * 65, 250, ['vrati', 'chachi', 'kaki', 'maa'][i], { pose: 'offer', s: .55, carry: (x, y) => soop(x, y, .5, true) }); break;
  }
  ctx.restore(); swapCtx(prev);
}
