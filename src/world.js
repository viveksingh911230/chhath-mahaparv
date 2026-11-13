// ================= WORLD: side-scrolling level gameplay =================
function mkPlayer(hero, x, p2 = false) { return { hero, x, y: GY, vx: 0, vy: 0, on: true, dir: 1, ph: 0, p2, stepT: 0 }; }

function World(idx) {
  const lv = LEVELS[idx];
  const w = {
    got: {}, talked: new Set(), escDone: {}, carry: null, goals: lv.goals, lv,
    findItem: id => { const it = items.find(i => !i.taken && i.id === id); return it ? it.x : null; },
    findNpc: () => { const n = npcs.find(n => !w.talked.has(n.who)); return n ? n.x : null; },
    findSpot: k => { const s = spots.find(s => !s.done && s.kind === k); return s ? s.x : null; },
    findEsc: who => { const n = npcs.find(n => n.who === who); if (!n) return null; return n.follow ? n.target : n.x; },
    spotDone: k => spots.filter(s => s.kind === k && s.done).length
  };
  const items = lv.items.map(([id, x, y]) => ({ id, x, y: y || GY - 34, taken: false, ph: Math.random() * 6 }));
  const npcs = lv.npcs.map(n => Object.assign({ ph: 0, dir: -1, follow: false, home: n.x }, n));
  const SPOT_L = { sweep: B('झाड़ू लगाएँ', 'Sweep'), arrange: B('बर्तन सजाएँ', 'Arrange pots'), decor: B('माला लगाएँ', 'Hang garland'), cane: B('ईख लगाएँ', 'Place sugarcane'), diya: B('दीया जलाएँ', 'Light diya') };
  const spots = lv.spots.map(s => Object.assign({ done: false, anim: 0, label: SPOT_L[s.kind] }, s));
  const other = S.hero === 'aarav' ? 'aarya' : 'aarav';
  const players = [mkPlayer(S.hero, 100)];
  if (S.family) players.push(mkPlayer(other, 50, true));
  const pk = { x: 60, y: GY - 160, dir: 1, tx: 0, ty: 0 };
  let t = 0, cam = 0, dialog = null, overlay = null, mini = null, gateOpen = false, finished = false;
  let touchJump = false;
  let toasts = [], parts = [], hint = { t: 0, x: null }, idleHint = 12, photoFlash = 0, touchBtns = [];
  const goalDone = g => g.n(w) >= g.of;
  const allDone = () => lv.goals.every(goalDone);
  const progress = () => lv.goals.reduce((a, g) => a + Math.min(1, g.n(w) / g.of), 0) / lv.goals.length;
  const gateX = lv.width - 110;

  function toast(s, col = '#fff') { toasts.push({ s: L(s), t: 2.6, col }); }
  function burst(x, y, col = '#ffd23f', n = 14, kind = 'spark') { for (let i = 0; i < n; i++) parts.push({ x, y, vx: rand(-120, 120), vy: rand(-200, -40), life: rand(.6, 1.2), col, kind }); }
  function speak(s) { narrate(L(s)); }

  let entered = false;
  function enter() {
    Audio2.play(lv.track); Audio2.setAmb(lv.amb || {});
    if (entered) return; entered = true;
    toast(L(lv.title) + ' — ' + L(lv.sub), '#ffe27a');
    setTimeout(() => { if (scene === self && !dialog) say(PEOPLE.aarav, [B('सूर्य पंखी: मैं तुम्हारे साथ हूँ! कोई मुश्किल हो तो H दबाओ या मुझ पर टैप करो।', 'Surya Pankhi: I\'m with you! Press H or tap me for a hint.')], 'pankhi'); }, 900);
  }
  function say(who, lines, portrait) { dialog = { who, lines, i: 0, ch: 0, portrait }; }

  function interactTarget(p) {
    let best = null, bd = 70;
    for (const n of npcs) { if (n.follow) continue; const d = Math.abs(n.x - p.x); if (d < bd) { bd = d; best = { type: 'npc', o: n }; } }
    for (const s of spots) { if (s.done) continue; if (s.kind === 'pickup' && w.carry) continue; const d = Math.abs(s.x - p.x); if (d < bd) { bd = d; best = { type: 'spot', o: s }; } }
    if (gateOpen && Math.abs(gateX - p.x) < 90) best = { type: 'gate' };
    if (!best) for (const n of npcs) if (n.follow && Math.abs(n.x - p.x) < 70) best = { type: 'npc', o: n };
    return best;
  }
  function interact(p) {
    const tg = interactTarget(p); if (!tg) return;
    if (tg.type === 'npc') {
      const n = tg.o; const first = !w.talked.has(n.who); w.talked.add(n.who);
      if (n.esc && !n.follow && !w.escDone[n.who]) { n.follow = true; toast(B('साथ चल रहे हैं — घाट तक ले चलें!', 'Walking together — lead the way to the ghat!'), '#aef'); }
      say(PEOPLE[n.who], n.follow && !first && n.escLines ? n.escLines : n.lines);
      if (n.who === 'dadi' || n.who === 'pandit') speak(n.lines[0]);
      if (first) Audio2.sfx('talk');
    } else if (tg.type === 'spot') useSpot(tg.o);
    else if (tg.type === 'gate') finish();
  }
  function useSpot(s) {
    if (s.need && !s.need(w)) { toast(s.needMsg || B('अभी नहीं', 'Not yet'), '#ffb3a7'); Audio2.sfx('wrong'); return; }
    if (s.mini) {
      Audio2.sfx('click');
      mini = MINIS[s.mini](s.arg, ok => {
        mini = null; Audio2.play(lv.track);
        s.done = true; burst(s.x - cam, GY - 60, '#ffd23f', 30); Audio2.sfx('complete');
        if (s.give) { w.got[s.give] = (w.got[s.give] || 0) + 1; toast(B('ठेकुआ तैयार! टोकरी में रखा।', 'Thekua ready! Added to basket.'), '#ffe27a'); }
        else toast(B('बहुत बढ़िया!', 'Wonderful!'), '#ffe27a');
      }, false);
      return;
    }
    s.done = true; s.anim = 1;
    const fx = { sweep: ['sweep', '#c9a27a', B('साफ़!', 'Clean!')], door: ['collect', '#ff9f1c', B('दरवाज़ा सज गया!', 'Door decorated!')], arrange: ['inv', '#ffd23f', B('बर्तन सज गए!', 'Pots arranged!')], decor: ['collect', '#ff9f1c', B('फूलों की माला लगी!', 'Garland restored!')], cane: ['collect', '#6fae3a', B('ईख का मंडप सजा!', 'Sugarcane arranged!')], diya: ['diya', '#ffd23f', B('दीया जला!', 'Diya lit!')], pickup: ['inv', '#ffd23f', B('दउरा सिर पर उठाया', 'Daura lifted with care')], place: ['bell', '#ffd23f', B('दउरा घाट पर रखा', 'Daura placed at the ghat')] }[s.kind] || ['collect', '#fff', B('हो गया!', 'Done!')];
    Audio2.sfx(fx[0]); burst(s.x - cam, GY - 40, fx[1], 18, s.kind === 'sweep' ? 'dust' : 'spark'); toast(fx[2], '#ffe27a');
    if (s.kind === 'pickup') w.carry = 'daura';
    if (s.kind === 'place') w.carry = null;
  }
  function finish() {
    if (finished) return; finished = true;
    Audio2.sfx('level');
    S.done[lv.id] = true; S.unlocked = Math.max(S.unlocked, Math.min(8, lv.id + 1)); if (!S.art.includes(lv.art)) S.art.push(lv.art);
    if (lv.id === 8) S.book = true;
    if (lv.id === 8) items.filter(i => i.id === 'memory').forEach((m, i) => { if (!S.memories.includes(i)) S.memories.push(i); });
    save();
    if (lv.cine) go(Cinematic(lv.cine, () => Card(idx))); else go(Card(idx));
  }

  // ---------- update ----------
  function update(dt) {
    t += dt;
    if (mini) { mini.update(dt); return; }
    const pressedJ = { sp: !!pressed[' '], w: !!pressed['w'], up: !!pressed['ArrowUp'] };
    for (const k of Object.keys(pressed)) handleKey(k);
    if (dialog) { dialog.ch += dt * 40; updateParts(dt); return; }
    if (overlay) { updateParts(dt); return; }
    // input
    const tb = touchState(); const jumpTap = touchJump; touchJump = false;
    players.forEach((p, i) => {
      let L_ = false, R_ = false, J_ = false;
      if (!p.p2) {
        L_ = keys['a'] || (!S.family && keys['ArrowLeft']) || tb.l; R_ = keys['d'] || (!S.family && keys['ArrowRight']) || tb.r;
        J_ = keys[' '] || keys['w'] || (!S.family && keys['ArrowUp']) || tb.j;
      } else if (!touchUI || keys['ArrowLeft'] || keys['ArrowRight']) {
        L_ = keys['ArrowLeft']; R_ = keys['ArrowRight']; J_ = keys['ArrowUp'];
        if (!L_ && !R_ && Math.abs(players[0].x - p.x) > 120 && !keys['ArrowUp']) { L_ = players[0].x < p.x; R_ = !L_; } // gentle auto-follow
      }
      // jump buffer so quick taps are never lost
      if (!p.p2 ? (jumpTap || (!S.family && pressedJ.up)) || pressedJ.sp || pressedJ.w : pressedJ.up) p.jb = .15;
      if (J_) p.jb = Math.max(p.jb || 0, .02);
      p.jb = Math.max(0, (p.jb || 0) - dt); J_ = p.jb > 0;
      const spd = w.carry ? 190 : 235;
      p.vx = (R_ ? spd : 0) - (L_ ? spd : 0); if (p.vx) p.dir = Math.sign(p.vx);
      if (J_ && p.on) { p.vy = -560; p.on = false; p.jb = 0; Audio2.sfx('jump'); }
      p.vy += 1500 * dt; const oy = p.y; p.x += p.vx * dt; p.y += p.vy * dt;
      p.x = clamp(p.x, 30, lv.width - 30);
      if (S.family && players.length > 1) { const o = players[1 - i]; p.x = clamp(p.x, o.x - (W - 120), o.x + (W - 120)); }
      p.on = false;
      if (p.y >= GY) { p.y = GY; p.vy = 0; p.on = true; }
      else if (p.vy >= 0) for (const pl of lv.plats) { if (p.x > pl.x - 6 && p.x < pl.x + pl.w + 6 && oy <= pl.y + 1 && p.y >= pl.y && !(keys['s'] || keys['ArrowDown'])) { p.y = pl.y; p.vy = 0; p.on = true; break; } }
      if (p.vx && p.on) { p.ph += dt * 11; p.stepT -= dt; if (p.stepT <= 0) { p.stepT = .3; Audio2.sfx('step'); } }
      // collect
      for (const it of items) if (!it.taken && Math.abs(it.x - p.x) < 34 && Math.abs((it.y) - (p.y - 40)) < 58) {
        it.taken = true; w.got[it.id] = (w.got[it.id] || 0) + 1; Audio2.sfx(it.id === 'diya' && lv.dark ? 'diya' : 'collect');
        burst(it.x - cam, it.y, it.id === 'plastic' || it.id === 'bag' ? '#9fd8ec' : '#ffd23f', 14);
        toast('+ ' + L(ITEMS[it.id]), '#fff'); idleHint = 18;
        flyers.push({ id: it.id, x: it.x - cam, y: it.y, t: 0 });
      }
    });
    // camera
    const fx = players.reduce((a, p) => a + p.x, 0) / players.length;
    cam = lerp(cam, clamp(fx - W * .42, 0, lv.width - W), Math.min(1, dt * 6));
    // npcs
    for (const n of npcs) {
      n.ph += dt;
      if (n.follow) {
        const lead = players[0], tx = lead.x - 70 * lead.dir;
        const d = tx - n.x;
        if (Math.abs(d) > 20) { n.x += Math.sign(d) * Math.min(Math.abs(d) * 3, 200) * dt; n.dir = Math.sign(d); n.walk = (n.walk || 0) + dt * 10; n.moving = true; } else n.moving = false;
        if (n.x >= n.target - 60) { n.follow = false; w.escDone[n.who] = true; toast(B('घाट पर पहुँच गए!', 'Reached the ghat!'), '#aef'); Audio2.sfx('complete'); burst(n.x - cam, GY - 80, '#aef', 20); n.pose = 'pray'; }
      } else { n.moving = false; n.dir = players[0].x < n.x ? -1 : 1; }
    }
    // pankhi follows
    const lp = players[0];
    let tx = lp.x - 60 * lp.dir, ty = lp.y - 150 + Math.sin(t * 2) * 12;
    if (hint.t > 0 && hint.x != null) { tx = lerp(lp.x, hint.x, .6); ty = GY - 190; hint.t -= dt; }
    pk.x = lerp(pk.x, tx, dt * 3); pk.y = lerp(pk.y, ty, dt * 3); pk.dir = tx > pk.x ? 1 : -1;
    // goals & gate
    if (!gateOpen && allDone()) { gateOpen = true; Audio2.sfx('level'); say(PEOPLE.aarav, [B('सूर्य पंखी: शाबाश! सारे काम पूरे हुए। आगे सूर्य-चक्र द्वार तक चलो!', 'Surya Pankhi: Well done! Every task is complete. Head to the golden Surya Chakra gate ahead!')], 'pankhi'); }
    if (gateOpen && players.some(p => Math.abs(p.x - gateX) < 40)) finish();
    idleHint -= dt; if (idleHint < 0) { idleHint = 15; showHint(true); }
    updateParts(dt);
  }
  const flyers = [];
  function updateParts(dt) {
    for (const p of parts) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; p.life -= dt; }
    parts = parts.filter(p => p.life > 0);
    for (const tt of toasts) tt.t -= dt; toasts = toasts.filter(x => x.t > 0);
    for (const f of flyers) f.t += dt * 1.6; while (flyers.length && flyers[0].t >= 1) flyers.shift();
    if (lv.festive && Math.random() < .3) parts.push({ x: rand(0, W), y: -10, vx: rand(-20, 20), vy: rand(30, 60), life: 6, col: ['#ff9f1c', '#ffd23f', '#e2401c', '#e75480'][Math.floor(rand(0, 4))], kind: 'petal' });
    photoFlash = Math.max(0, photoFlash - dt * 2);
  }
  function showHint(auto) {
    const g = lv.goals.find(g => !goalDone(g));
    let x = null, msg;
    if (!g) { x = gateX; msg = B('सूर्य-चक्र द्वार की ओर चलो!', 'Go to the Surya Chakra gate!'); }
    else { x = g.find(w); msg = g.t; }
    hint = { t: 4, x, msg: L(msg) };
    if (!auto) Audio2.sfx('bell');
  }

  function handleKey(k) {
    delete pressed[k];
    if (mini) return;
    if (dialog) { if (k === 'e' || k === ' ' || k === 'Enter') advance(); if (k === 'Escape') dialog = null; return; }
    if (overlay === 'photo') { if (k === ' ' || k === 'Enter') takePhoto(); if (k === 'Escape' || k === 'p') overlay = null; return; }
    if (overlay) { if (k === 'Escape' || k === 'i' || k === 'm' || k === 'Enter') { overlay = null; Audio2.sfx('inv'); } return; }
    if (k === 'e') interact(players[0]);
    if ((k === 'Enter' || k === '/') && players[1]) interact(players[1]);
    if (k === 'i') { overlay = 'inv'; Audio2.sfx('inv'); }
    if (k === 'm') { overlay = 'map'; Audio2.sfx('inv'); }
    if (k === 'h') showHint(false);
    if (k === 'p') overlay = 'photo';
    if (k === 'Escape') overlay = 'pause';
  }
  function advance() {
    if (dialog.ch < L(dialog.lines[dialog.i]).length) { dialog.ch = 999; return; }
    dialog.i++; dialog.ch = 0; Audio2.sfx('talk');
    if (dialog.i >= dialog.lines.length) dialog = null;
    else if (dialog.who === PEOPLE.dadi) speak(dialog.lines[dialog.i]);
  }
  function takePhoto() {
    try {
      const c = document.createElement('canvas'); c.width = 480; c.height = 270; c.getContext('2d').drawImage(cv, 0, 0, 480, 270);
      PHOTOS.push(c.toDataURL('image/jpeg', .7)); if (PHOTOS.length > 8) PHOTOS.shift(); savePhotos();
      photoFlash = 1; Audio2.sfx('shutter'); toast(B('फ़ोटो गैलरी में सहेजी गई!', 'Photo saved to Gallery!'), '#fff');
    } catch (e) { toast(B('फ़ोटो सहेज नहीं सकी', 'Could not save photo')); }
  }

  // ---------- touch ----------
  function touchLayout() {
    return {
      l: { x: 20, y: H - 110, w: 84, h: 84 }, r: { x: 116, y: H - 110, w: 84, h: 84 },
      j: { x: W - 110, y: H - 120, w: 92, h: 92 }, e: { x: W - 210, y: H - 100, w: 80, h: 80 }
    };
  }
  function touchState() {
    const o = { l: false, r: false, j: false }; if (!touchUI) return o;
    const tl = touchLayout();
    for (const id in pointers) { const p = pointers[id]; if (inRect(p.x, p.y, tl.l)) o.l = true; if (inRect(p.x, p.y, tl.r)) o.r = true; if (inRect(p.x, p.y, tl.j)) o.j = true; }
    return o;
  }
  const hudBtns = () => [{ id: 'pause', x: W - 52, y: 10, w: 42, h: 42 }, { id: 'inv', x: W - 100, y: 10, w: 42, h: 42 }, { id: 'map', x: W - 148, y: 10, w: 42, h: 42 }, { id: 'photo', x: W - 196, y: 10, w: 42, h: 42 }, { id: 'music', x: W - 244, y: 10, w: 42, h: 42 }];
  function down(x, y) {
    if (mini) { mini.down && mini.down(x, y); return; }
    if (dialog) { advance(); return; }
    if (overlay === 'photo') { if (inRect(x, y, { x: W - 120, y: 14, w: 106, h: 40 })) overlay = null; else takePhoto(); return; }
    if (overlay === 'pause') {
      const bs = pauseBtns(); for (const b of bs) if (inRect(x, y, b)) { Audio2.sfx('click'); b.act(); return; }
      return;
    }
    if (overlay) { overlay = null; Audio2.sfx('inv'); return; }
    for (const b of hudBtns()) if (inRect(x, y, b)) {
      Audio2.sfx('click');
      if (b.id === 'pause') overlay = 'pause'; else if (b.id === 'inv') overlay = 'inv'; else if (b.id === 'map') overlay = 'map'; else if (b.id === 'photo') overlay = 'photo';
      else { S.music = !S.music; Audio2.applyVol(); save(); }
      return;
    }
    // tap Surya Pankhi for hint
    if (Math.hypot(x - (pk.x - cam), y - pk.y) < 45) { showHint(false); return; }
    if (touchUI) { const tl = touchLayout(); if (inRect(x, y, tl.e)) { interact(players[0]); return; } if (inRect(x, y, tl.j)) touchJump = true; }
  }
  function pauseBtns() {
    const cx = W / 2 - 130;
    return [
      { x: cx, y: 170, w: 260, h: 50, l: B('जारी रखें', 'Resume'), act: () => overlay = null },
      { x: cx, y: 230, w: 260, h: 50, l: B('फ़ोटो मोड', 'Photo Mode'), act: () => overlay = 'photo' },
      { x: cx, y: 290, w: 260, h: 50, l: B('सेटिंग्स', 'Settings'), act: () => { overlay = null; go(Settings(() => self)); } },
      { x: cx, y: 350, w: 260, h: 50, l: B('स्तर फिर से शुरू', 'Restart Level'), act: () => go(World(idx)) },
      { x: cx, y: 410, w: 125, h: 50, l: B('अगला स्तर', 'Skip level'), act: () => { overlay = null; finish(); } },
      { x: cx + 135, y: 410, w: 125, h: 50, l: B('मेनू', 'Menu'), act: () => go(Menu()) }
    ];
  }

  // ---------- drawing ----------
  function curPal() {
    if (lv.palTo) { const k = clamp((players[0].x - 300) / (lv.width - 600), 0, 1); return mixPal(PAL[lv.pal], PAL[lv.palTo], k); }
    return PAL[lv.pal];
  }
  function draw() {
    if (mini) { mini.draw(); return; }
    const p = curPal();
    const sunX = lv.sunset ? 620 : 780;
    drawSky(p, t, sunX - cam * .02);
    drawHills(p, cam, t);
    if (lv.bgRiver) drawRiver(372, t, p, cam, sunX);
    // far village silhouettes
    ctx.save(); ctx.globalAlpha = .35; ctx.fillStyle = lerpCol(p.hill, '#000000', .35);
    for (let i = 0; i < 12; i++) { const x = ((i * 330 - cam * .45) % 3960 + 3960) % 3960 - 200; if (x > -120 && x < W + 60) { ctx.fillRect(x, 382 - (i % 3) * 6, 70, 40); ctx.beginPath(); ctx.moveTo(x - 10, 384 - (i % 3) * 6); ctx.lineTo(x + 35, 352 - (i % 3) * 6); ctx.lineTo(x + 80, 384 - (i % 3) * 6); ctx.fill(); } }
    ctx.restore();
    drawGround(p, cam, lv.ground);
    ctx.save(); ctx.translate(-cam, 0);
    for (const s of lv.scenery) if (s.x + (s.w || 200) > cam - 100 && s.x - 200 < cam + W) drawScenery(s, p);
    for (const pl of lv.plats) if (pl.x + pl.w > cam && pl.x < cam + W) drawPlat(pl);
    if (gateOpen) drawGate(gateX, t);
    for (const s of spots) drawSpot(s);
    for (const it of items) if (!it.taken && it.x > cam - 40 && it.x < cam + W + 40) {
      const by = Math.sin(t * 3 + it.ph) * 5;
      ctx.fillStyle = 'rgba(255,230,120,.35)'; circ(it.x, it.y + by, 26 + Math.sin(t * 4 + it.ph) * 3); ctx.fill();
      item(it.id, it.x, it.y + by, .9, t);
    }
    for (const n of npcs) {
      if (n.x < cam - 80 || n.x > cam + W + 80) continue;
      person(n.x, GY, n.who, { pose: n.moving ? 'walk' : (n.pose || 'idle'), ph: n.walk || 0, t: t + n.home, dir: n.dir });
      if (!w.talked.has(n.who)) { ctx.save(); ctx.translate(n.x, GY - 135 * PEOPLE[n.who].s - 12 + Math.sin(t * 4) * 3); rrect(-12, -14, 24, 24, 8); fillInk('#fff', 2); txt('!', 0, -2, 18, C.red, 'center', FONT, '800'); ctx.restore(); }
    }
    players.forEach(pl => {
      const carry = w.carry ? (x, y) => daura(x, y - 6, .7, true, t) : null;
      person(pl.x, pl.y, pl.hero, { pose: w.carry ? 'carry' : (!pl.on ? 'wave' : pl.vx ? 'walk' : 'idle'), ph: pl.ph, t, dir: pl.dir, carry });
      if (players.length > 1) txt(pl.p2 ? 'P2' : 'P1', pl.x, pl.y - 112, 12, '#fff', 'center', FONT, '800');
    });
    pankhi(pk.x, pk.y, t, .9, pk.dir);
    // interact prompt
    const tg = interactTarget(players[0]);
    if (tg && !dialog && !overlay) {
      const x = tg.type === 'gate' ? gateX : tg.o.x, lbl = tg.type === 'npc' ? L(B('बात करें', 'Talk')) : tg.type === 'gate' ? L(B('आगे बढ़ें', 'Continue')) : L(tg.o.label || B('मदद करें', 'Help'));
      ctx.font = `700 15px ${FONT}`; const tw = ctx.measureText(lbl).width + 46;
      ctx.save(); ctx.translate(x, GY - 170 + Math.sin(t * 5) * 2); rrect(-tw / 2, -16, tw, 32, 16); fillInk('rgba(255,248,225,.95)', 2);
      rrect(-tw / 2 + 4, -12, 24, 24, 6); fillInk(C.tur, 1.5); txt(touchUI ? '☝' : 'E', -tw / 2 + 16, 0, 14, C.ink, 'center', FONT, '800'); txt(lbl, 12, 0, 15, C.ink, 'center', FONT, '700'); ctx.restore();
    }
    // hint arrow
    if (hint.t > 0 && hint.x != null) {
      const hx = clamp(hint.x, cam + 40, cam + W - 40); ctx.save(); ctx.translate(hx, GY - 230 + Math.sin(t * 6) * 6);
      ctx.beginPath(); ctx.moveTo(-14, -10); ctx.lineTo(14, -10); ctx.lineTo(0, 12); ctx.closePath(); fillInk('#ffd23f', 2); ctx.restore();
    }
    ctx.restore();
    // foreground grass & flowers (parallax 1.2)
    if (lv.ground !== 'ghat') { ctx.save(); for (let i = 0; i < 26; i++) { const x = ((i * 157 - cam * 1.2) % (26 * 157) + 26 * 157) % (26 * 157) - 60; if (x > W + 30) continue; ctx.fillStyle = '#4f8f2a'; for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.moveTo(x + k * 5, H); ctx.quadraticCurveTo(x + k * 5 + 4, H - 20, x + k * 6 + Math.sin(t * 2 + i) * 4, H - 34 - (k % 2) * 8); ctx.lineTo(x + k * 5 + 3, H); ctx.fill(); } if (i % 3 === 0) item('flower', x + 12, H - 38, .5); } ctx.restore(); }
    if (lv.dark) drawDarkness(p);
    // particles
    for (const pt of parts) {
      ctx.globalAlpha = Math.min(1, pt.life * 1.5); ctx.fillStyle = pt.col;
      if (pt.kind === 'petal') { ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.y * .05); ell(0, 0, 5, 2.5); ctx.fill(); ctx.restore(); pt.vy = 50; }
      else if (pt.kind === 'dust') { circ(pt.x, pt.y, 6); ctx.fill(); }
      else { ctx.save(); ctx.translate(pt.x, pt.y); ctx.rotate(pt.life * 5); ctx.fillRect(-3, -3, 6, 6); ctx.restore(); }
    }
    ctx.globalAlpha = 1;
    for (const f of flyers) { const k = ease(Math.min(1, f.t)); item(f.id, lerp(f.x, W - 79, k), lerp(f.y, 31, k) - Math.sin(k * Math.PI) * 80, 1 - k * .5, t); }
    if (overlay !== 'photo') drawHUD(p);
    if (dialog) drawDialog();
    if (overlay === 'inv') drawInventory();
    if (overlay === 'map') drawMap();
    if (overlay === 'pause') { ctx.fillStyle = 'rgba(30,10,0,.55)'; ctx.fillRect(0, 0, W, H); frame(W / 2 - 170, 90, 340, 400); txtO(L(B('विराम', 'Paused')), W / 2, 135, 32, '#ffd23f'); for (const b of pauseBtns()) button(b, L(b.l), { size: 18 }); }
    if (overlay === 'photo') { ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.strokeRect(20, 20, W - 40, H - 40); [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]].forEach(([a, b]) => { circ(a, b, 6); ctx.fillStyle = '#fff'; ctx.fill(); }); txtO(L(B('फ़ोटो मोड — टैप/स्पेस से फ़ोटो लें', 'Photo Mode — tap/Space to capture')), W / 2, H - 50, 18, '#fff', '#000', 'center', FONT, 4); button({ x: W - 120, y: 14, w: 106, h: 40 }, L(B('बंद करें', 'Close')), { size: 15 }); }
    if (photoFlash > 0) { ctx.fillStyle = `rgba(255,255,255,${photoFlash})`; ctx.fillRect(0, 0, W, H); }
  }
  function drawDarkness(p) {
    const dc = drawDarkness.c || (drawDarkness.c = document.createElement('canvas')); dc.width = W; dc.height = H; const d = dc.getContext('2d');
    d.fillStyle = 'rgba(8,10,35,.62)'; d.fillRect(0, 0, W, H); d.globalCompositeOperation = 'destination-out';
    const hole = (x, y, r) => { const g = d.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); d.fillStyle = g; d.beginPath(); d.arc(x, y, r, 0, 7); d.fill(); };
    players.forEach(pl => hole(pl.x - cam, pl.y - 50, 150)); hole(pk.x - cam, pk.y, 110);
    items.forEach(it => { if (!it.taken) hole(it.x - cam, it.y, 90); });
    spots.forEach(s => { if (s.done || s.kind === 'light') hole(s.x - cam, GY - 30, 120); });
    for (const s of lv.scenery) if (s.k === 'kosi' || s.k === 'crowd') hole(s.x - cam + (s.w || 0) / 2, GY - 60, 160 + (s.w || 0) / 3);
    ctx.drawImage(dc, 0, 0);
  }
  function drawHUD(p) {
    // day badge
    ctx.save(); rrect(10, 10, 250, 58, 14); fillInk('rgba(255,243,214,.94)', 2.5);
    for (let i = 0; i < 4; i++) diya(32 + i * 26, 50, .55, lv.day > i || lv.day === 5, t);
    txt(L(DAYS[lv.day]), 140, 26, 14, C.red, 'center', FONT, '800');
    { ctx.font = `700 15px ${FONT}`; const tw = ctx.measureText(L(lv.title)).width; txt(L(lv.title), 140, 47, Math.min(15, 15 * 112 / tw), C.ink, 'left', FONT, '700'); } ctx.restore();
    // progress bar
    const pr = progress(); rrect(10, 74, 250, 16, 8); fillInk('#fff3d6', 2); rrect(12, 76, Math.max(12, 246 * pr), 12, 6); ctx.fillStyle = '#ff9f1c'; ctx.fill();
    txt(L(B('सेवा', 'Seva')) + ' ' + Math.round(pr * 100) + '%', 135, 82, 11, C.ink, 'center', FONT, '800');
    // missions
    rrect(10, 96, 250, 26 + lv.goals.length * 22, 12); ctx.fillStyle = 'rgba(59,29,11,.62)'; ctx.fill();
    txt(L(B('मिशन', 'Missions')), 22, 110, 13, '#ffd23f', 'left', FONT, '800');
    lv.goals.forEach((g, i) => { const d = goalDone(g); txt((d ? '✔ ' : '○ ') + L(g.t) + `  ${Math.min(g.n(w), g.of)}/${g.of}`, 22, 132 + i * 22, 13, d ? '#9f9' : '#fff', 'left', FONT, '600'); });
    // minimap
    const mx = 320, mw = 300; rrect(mx - 8, 12, mw + 16, 30, 10); fillInk('rgba(255,243,214,.9)', 2);
    ctx.fillStyle = '#c99a5b'; ctx.fillRect(mx, 27, mw, 3);
    const M = x => mx + x / lv.width * mw;
    items.forEach(it => { if (!it.taken) { ctx.fillStyle = '#e8a317'; circ(M(it.x), 28, 2.5); ctx.fill(); } });
    npcs.forEach(n => { ctx.fillStyle = w.talked.has(n.who) ? '#7fb3d5' : '#1f3a93'; circ(M(n.x), 22, 3); ctx.fill(); });
    spots.forEach(s => { if (!s.done) { ctx.fillStyle = C.red; ctx.fillRect(M(s.x) - 2.5, 30, 5, 5); } });
    if (gateOpen) { ctx.fillStyle = '#ff9f1c'; circ(M(gateX), 28, 5); ctx.fill(); }
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.strokeRect(M(cam), 15, W / lv.width * mw, 24);
    players.forEach(pl => { ctx.fillStyle = pl.p2 ? '#e75480' : '#2e8b57'; circ(M(pl.x), 28, 4.5); ctx.fill(); ctx.stroke(); });
    // buttons
    const icons = { pause: '❚❚', inv: '🧺', map: '🗺', photo: '📷', music: S.music ? '♫' : '✕' };
    hudBtns().forEach(b => { rrect(b.x, b.y, b.w, b.h, 12); fillInk('rgba(255,210,74,.95)', 2); txt(icons[b.id], b.x + b.w / 2, b.y + b.h / 2 + 1, 18, C.ink, 'center', 'system-ui', '700'); });
    // basket counter
    const tot = Object.values(w.got).reduce((a, b) => a + b, 0); txt(tot, W - 72, 58, 12, '#fff', 'center', FONT, '800');
    // toasts
    toasts.forEach((tt, i) => { ctx.globalAlpha = Math.min(1, tt.t); ctx.font = `700 18px ${FONT}`; const tw = ctx.measureText(tt.s).width + 30; rrect(470 - tw / 2, 60 + i * 34, tw, 30, 15); ctx.fillStyle = 'rgba(59,29,11,.78)'; ctx.fill(); txt(tt.s, 470, 76 + i * 34, 18, tt.col, 'center', FONT, '700'); }); ctx.globalAlpha = 1;
    if (gateOpen && !finished) { const a = .75 + .25 * Math.sin(t * 5); ctx.globalAlpha = a; rrect(W / 2 - 200, H - 92, 400, 40, 20); fillInk('#ffd23f', 2.5); txt(L(B('सारे काम पूरे! दाईं ओर सूर्य-चक्र द्वार तक चलें ➜', 'All tasks done! Walk right to the Surya Chakra gate ➜')), W / 2, H - 72, 15, C.ink, 'center', FONT, '800'); ctx.globalAlpha = 1; }
    // hint bubble
    if (hint.t > 0 && hint.msg) { const bx = clamp(pk.x - cam, 140, W - 140), by = pk.y - 50; ctx.font = `700 15px ${FONT}`; const tw = ctx.measureText(hint.msg).width + 30; rrect(bx - tw / 2, by - 18, tw, 34, 14); fillInk('#fffbe6', 2); txt(hint.msg, bx, by, 15, C.ink, 'center', FONT, '700'); }
    // touch controls
    if (touchUI) {
      const tl = touchLayout(), ts = touchState();
      const tbtn = (r, s, on) => { ctx.globalAlpha = on ? .95 : .6; circ(r.x + r.w / 2, r.y + r.h / 2, r.w / 2); fillInk('#ffd24a', 3); txt(s, r.x + r.w / 2, r.y + r.h / 2 + 2, 30, C.ink, 'center', 'system-ui', '800'); ctx.globalAlpha = 1; };
      tbtn(tl.l, '◀', ts.l); tbtn(tl.r, '▶', ts.r); tbtn(tl.j, '⤒', ts.j); tbtn(tl.e, '✋', false);
    } else txt(L(B('A/D चलें · स्पेस कूदें · E बात/मदद · I टोकरी · M नक्शा · H संकेत · P फ़ोटो · Esc विराम', 'A/D move · Space jump · E interact · I basket · M map · H hint · P photo · Esc pause')), W / 2, H - 14, 12, 'rgba(255,255,255,.9)', 'center', FONT, '700');
  }
  function drawDialog() {
    const d = dialog, line = L(d.lines[d.i]), shown = line.slice(0, Math.floor(d.ch));
    if (Math.floor(d.ch) % 3 === 0 && d.ch < line.length) Audio2.sfx('talk');
    frame(70, H - 175, W - 140, 155, '#fff6e0');
    // portrait
    ctx.save(); circ(150, H - 98, 56); ctx.fillStyle = '#ffe9b0'; ctx.fill(); strokeInk(3); ctx.clip();
    if (d.portrait === 'pankhi') pankhi(150, H - 100, t, 1.3); else person(150, H - 20 + (d.who.child ? -10 : 40), d.who, { t, s: d.who.child ? 1.4 : 1.1, pose: 'idle' });
    ctx.restore();
    txt(d.portrait === 'pankhi' ? L(B('सूर्य पंखी', 'Surya Pankhi')) : L(d.who.name), 225, H - 145, 20, C.red, 'left', FONT, '800');
    wrap(shown, 225, H - 112, W - 340, 18, C.ink, 1.45);
    txt(L(B('आगे ▸', 'Next ▸')), W - 100, H - 42, 14, C.red, 'right', FONT, '800');
  }
  function drawInventory() {
    ctx.fillStyle = 'rgba(30,10,0,.55)'; ctx.fillRect(0, 0, W, H);
    frame(140, 60, W - 280, H - 120, '#e8c98a');
    // bamboo weave
    ctx.save(); rrect(160, 80, W - 320, H - 160, 12); ctx.clip(); ctx.strokeStyle = 'rgba(140,100,40,.35)'; ctx.lineWidth = 6;
    for (let i = -400; i < W; i += 22) { ctx.beginPath(); ctx.moveTo(i, 80); ctx.lineTo(i + 400, H - 80); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + 400, 80); ctx.lineTo(i, H - 80); ctx.stroke(); } ctx.restore();
    txtO(L(B('मेरी बाँस की टोकरी', 'My Bamboo Basket')), W / 2, 108, 28, '#ffd23f');
    const ids = Object.keys(w.got).filter(k => w.got[k] > 0);
    if (!ids.length) txt(L(B('टोकरी अभी खाली है — चीज़ें इकट्ठा करें!', 'The basket is empty — go collect things!')), W / 2, H / 2, 18, C.ink, 'center');
    ids.forEach((id, i) => {
      const cx = 220 + (i % 6) * 92, cy = 175 + Math.floor(i / 6) * 110;
      circ(cx, cy, 36); fillInk('#fff3d6', 2.5); item(id, cx, cy, 1.1, t);
      rrect(cx + 14, cy + 18, 28, 20, 8); fillInk(C.red, 1.5); txt('×' + w.got[id], cx + 28, cy + 28, 12, '#fff', 'center', FONT, '800');
      txt(L(ITEMS[id]), cx, cy + 52, 13, C.ink, 'center', FONT, '700');
    });
    txt(L(B('बंद करने के लिए टैप करें / I', 'Tap or press I to close')), W / 2, H - 98, 13, C.ink, 'center');
  }
  function drawMap() {
    ctx.fillStyle = 'rgba(30,10,0,.6)'; ctx.fillRect(0, 0, W, H); frame(80, 60, W - 160, H - 120);
    txtO(L(B('गाँव का नक्शा', 'Village Map')) + ' — ' + L(lv.title), W / 2, 100, 26, '#ffd23f');
    const mx = 120, mw = W - 240, my = 230, M = x => mx + x / lv.width * mw;
    ctx.fillStyle = '#9fd8ec'; ctx.fillRect(mx, my - 50, mw, 30); ctx.fillStyle = '#c99a5b'; ctx.fillRect(mx, my - 20, mw, 40); strokeInk(2);
    lv.scenery.forEach(s => { if (s.k === 'house') { ctx.fillStyle = '#d9a066'; ctx.fillRect(M(s.x), my - 34, s.w / lv.width * mw, 16); } if (s.k === 'tree') { ctx.fillStyle = '#2f7d32'; circ(M(s.x), my - 30, 6); ctx.fill(); } });
    items.forEach(it => { if (!it.taken) item(it.id, M(it.x), my + 8, .4, t); });
    spots.forEach(s => { ctx.fillStyle = s.done ? '#2e8b57' : C.red; ctx.fillRect(M(s.x) - 4, my + 22, 8, 8); });
    npcs.forEach(n => { ctx.fillStyle = '#1f3a93'; circ(M(n.x), my - 6, 5); ctx.fill(); });
    players.forEach(pl => { ctx.fillStyle = '#2e8b57'; circ(M(pl.x), my, 8); fillInk('#2e8b57', 2); });
    if (gateOpen) drawSun(M(gateX), my - 8, 8, t);
    const leg = [['#2e8b57', B('आप', 'You')], ['#1f3a93', B('गाँव वाले', 'Villagers')], [C.red, B('काम', 'Tasks')], ['#e8a317', B('सामान', 'Items')]];
    leg.forEach(([c, l], i) => { ctx.fillStyle = c; circ(160 + i * 170, 300, 7); ctx.fill(); txt(L(l), 175 + i * 170, 300, 15, C.ink); });
    lv.goals.forEach((g, i) => txt((goalDone(g) ? '✔ ' : '○ ') + L(g.t) + ` (${Math.min(g.n(w), g.of)}/${g.of})`, 160 + (i % 2) * 330, 345 + Math.floor(i / 2) * 30, 16, goalDone(g) ? C.green : C.ink, 'left', FONT, '700'));
  }
  function drawGate(x, t) {
    ctx.save(); const g = ctx.createRadialGradient(x, GY - 90, 10, x, GY - 90, 140); g.addColorStop(0, 'rgba(255,230,120,.8)'); g.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = g; circ(x, GY - 90, 140); ctx.fill();
    ctx.beginPath(); ctx.moveTo(x - 50, GY); ctx.lineTo(x - 50, GY - 110); ctx.arc(x, GY - 110, 50, Math.PI, 0); ctx.lineTo(x + 50, GY); strokeInk(10, '#ffc93c'); strokeInk(2);
    drawSun(x, GY - 110, 26, t, { face: true }); ctx.restore();
  }
  function drawPlat(pl) {
    const { x, y, w: pw, kind } = pl;
    if (kind === 'charpai') { ctx.beginPath(); ctx.rect(x, y - 6, pw, 10); fillInk('#8a5a22', 2); ctx.strokeStyle = '#e8d5a8'; ctx.lineWidth = 1.5; for (let i = x + 6; i < x + pw - 4; i += 8) { ctx.beginPath(); ctx.moveTo(i, y - 4); ctx.lineTo(i + 6, y + 2); ctx.stroke(); } [x + 6, x + pw - 6].forEach(lx => { ctx.beginPath(); ctx.rect(lx - 4, y + 4, 8, GY - y - 4); fillInk('#7a4a22', 2); }); }
    else if (kind === 'hay') { ctx.beginPath(); ctx.moveTo(x, GY); ctx.quadraticCurveTo(x - 10, y + 10, x + pw / 2, y - 8); ctx.quadraticCurveTo(x + pw + 10, y + 10, x + pw, GY); fillInk('#e2b84a', 2.5); ctx.strokeStyle = '#a07a20'; ctx.lineWidth = 1.2; for (let i = 0; i < 10; i++) { ctx.beginPath(); ctx.moveTo(x + 8 + i * 8, y + 14 + (i % 3) * 10); ctx.lineTo(x + 14 + i * 8, y + 4 + (i % 3) * 10); ctx.stroke(); } }
    else if (kind === 'crate' || kind === 'shelf') { ctx.beginPath(); ctx.rect(x, y, pw, kind === 'shelf' ? 12 : GY - y); fillInk(kind === 'shelf' ? '#7a4a22' : '#b5793a', 2.5); if (kind === 'crate') { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + pw, GY); ctx.moveTo(x + pw, y); ctx.lineTo(x, GY); strokeInk(1.5, '#7a4a22'); } else { ctx.beginPath(); ctx.rect(x + pw / 2 - 4, y + 12, 8, GY - y - 12); fillInk('#5a3415', 2); } }
    else if (kind === 'branch') { ctx.beginPath(); ctx.moveTo(x - 10, y + 10); ctx.quadraticCurveTo(x + pw / 2, y - 6, x + pw + 10, y + 4); ctx.lineTo(x + pw + 10, y + 12); ctx.quadraticCurveTo(x + pw / 2, y + 4, x - 10, y + 18); ctx.closePath(); fillInk('#7a4a22', 2); for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(x + i * pw / 4, y + 2); ctx.rotate(-.8 + i * .4); ell(0, -8, 4, 9); fillInk(C.leaf, 1.2); ctx.restore(); } }
    else if (kind === 'vine') { ctx.beginPath(); ctx.rect(x, y - 4, pw, 8); fillInk('#8a6a3a', 2); [x + 4, x + pw - 4].forEach(lx => { ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx, GY); strokeInk(4, '#8a6a3a'); }); for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(x + 10 + i * (pw - 20) / 5, y - 4); ell(0, -6, 9, 7); fillInk('#5aa02c', 1.5); ctx.restore(); } }
    else if (kind === 'step') { ctx.beginPath(); ctx.rect(x, y, pw, GY - y); fillInk('#e3b27a', 2); ctx.fillStyle = C.red; for (let k = x + 12; k < x + pw; k += 26) { circ(k, y + 8, 2); ctx.fill(); } }
    else if (kind === 'stage') { ctx.beginPath(); ctx.rect(x, y, pw, GY - y); fillInk('#a0522d', 2.5); ctx.fillStyle = C.tur; for (let k = x + 10; k < x + pw; k += 20) { ctx.beginPath(); ctx.moveTo(k, y + 4); ctx.lineTo(k + 10, y + 20); ctx.lineTo(k + 20, y + 4); ctx.fill(); } }
  }
  function drawSpot(s) {
    const x = s.x; if (x < cam - 120 || x > cam + W + 120) return;
    const glow = !s.done ? .5 + .5 * Math.sin(t * 4) : 0;
    if (!s.done) { ctx.fillStyle = `rgba(255,220,100,${.25 + glow * .25})`; ell(x, GY + 4, 34, 8); ctx.fill(); }
    switch (s.kind) {
      case 'sweep': if (!s.done) { item('dust', x, GY - 6, 1.8); ctx.save(); ctx.translate(x + 26, GY - 4); ctx.rotate(-.5); ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -46); strokeInk(3, '#8a6a3a'); ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(0, -16); ctx.lineTo(8, 0); ctx.closePath(); fillInk('#d9b36a', 1.5); ctx.restore(); } else { ctx.fillStyle = 'rgba(255,255,255,.3)'; ell(x, GY + 3, 30, 5); ctx.fill(); } break;
      case 'door': if (s.done) { for (let k = 0; k < 7; k++) { const tx = x - 40 + k * 13; ell(tx, GY - 95, 5, 10); fillInk(C.leaf, 1.2); circ(tx, GY - 104, 5); fillInk('#ff9f1c', 1.2); } rangoli(x, GY + 14, 34, t); } else { ctx.setLineDash([4, 4]); ctx.strokeStyle = C.red; ctx.lineWidth = 2; ctx.strokeRect(x - 42, GY - 112, 84, 20); ctx.setLineDash([]); } break;
      case 'quiz': case 'thekua': case 'cook': case 'soop': case 'daura': case 'match': case 'puzzle': case 'light': case 'river': {
        if (s.kind === 'cook' || s.kind === 'thekua') { /* chulha drawn in scenery */ }
        ctx.save(); ctx.translate(x, GY - 40); ctx.rotate(Math.sin(t * 2) * .05);
        ctx.beginPath(); ctx.rect(-2, 0, 4, 40); fillInk('#7a4a22', 1.5);
        rrect(-30, -30, 60, 34, 8); fillInk(s.done ? '#9fd38a' : '#ffd23f', 2);
        const ic = { quiz: '?', thekua: '◉', cook: '♨', soop: '✦', daura: '✿', match: '❖', puzzle: '▦', light: '✺', river: '≈' }[s.kind];
        txt(s.done ? '✔' : ic, 0, -13, 20, C.ink, 'center', 'system-ui', '800'); ctx.restore();
        if (s.kind === 'soop' && s.done) soop(x + 50, GY - 20, .8, true, t);
        if (s.kind === 'daura' && s.done && !w.carry && w.spotDone('place') === 0 && !spots.find(q => q.kind === 'pickup' && q.done)) daura(x + 60, GY - 20, .8, true, t);
        break;
      }
      case 'arrange': if (s.done) { [-14, 0, 14].forEach((o, i) => { ctx.beginPath(); ctx.ellipse(x + o, GY - 14 - i * 3, 12, 10, 0, 0, Math.PI * 2); fillInk(['#c8952c', '#b87333', '#d4a84a'][i], 2); }); } else { ctx.setLineDash([3, 4]); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; circ(x, GY - 16, 18); ctx.stroke(); ctx.setLineDash([]); } break;
      case 'decor': if (s.done) { ctx.beginPath(); for (let k = 0; k <= 10; k++) { const a = k / 10; const yy = GY - 160 + Math.sin(a * Math.PI) * 40; item('flower', x - 50 + a * 100, yy, .45); } } break;
      case 'cane': if (s.done) { sugarcane(x - 22, GY, 120, .18); sugarcane(x + 22, GY, 120, -.18); sugarcane(x, GY, 130, 0); } else { ctx.setLineDash([4, 4]); ctx.strokeStyle = '#6fae3a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 20, GY); ctx.lineTo(x, GY - 120); ctx.lineTo(x + 20, GY); ctx.stroke(); ctx.setLineDash([]); } break;
      case 'diya': diya(x, GY - 2, 1.1, s.done, t); break;
      case 'pickup': if (!s.done && w.spotDone('daura')) daura(x, GY - 20, .8, true, t); break;
      case 'place': if (s.done) { daura(x, GY - 20, .8, true, t); soop(x + 60, GY - 18, .7, true, t); diya(x - 40, GY, .8, true, t); } else { ctx.setLineDash([4, 4]); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 2; ctx.strokeRect(x - 40, GY - 50, 80, 50); ctx.setLineDash([]); } break;
    }
  }
  function drawScenery(s, p) {
    switch (s.k) {
      case 'house': house(s.x, GY, s.w, s.h, s.seed, true, p.light < .6); break;
      case 'tree': tree(s.x, GY, s.s, s.kind, t); break;
      case 'palm': ctx.save(); ctx.beginPath(); ctx.moveTo(s.x - 6, GY); ctx.quadraticCurveTo(s.x + 10, GY - 120, s.x, GY - 230); ctx.lineTo(s.x + 8, GY - 230); ctx.quadraticCurveTo(s.x + 18, GY - 120, s.x + 8, GY); fillInk('#8a6a3a', 2); for (let k = 0; k < 7; k++) { ctx.save(); ctx.translate(s.x + 4, GY - 230); ctx.rotate(k * .9 + Math.sin(t) * .05); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(30, -18, 70, 10); ctx.quadraticCurveTo(30, -4, 0, 0); fillInk('#3f8f3a', 1.5); ctx.restore(); } ctx.restore(); break;
      case 'pond': ctx.beginPath(); ctx.ellipse(s.x + s.w / 2, GY + 30, s.w / 2, 22, 0, 0, Math.PI * 2); fillInk('#4aa3c9', 2.5); lotus(s.x + 50, GY + 30, .5); lotus(s.x + 130, GY + 26, .45); break;
      case 'wall': ctx.beginPath(); ctx.rect(s.x, GY - 70, s.w, 70); fillInk('#e6bd8a', 2.5); ctx.fillStyle = '#a0522d'; ctx.fillRect(s.x, GY - 16, s.w, 16); for (let k = s.x + 40; k < s.x + s.w - 30; k += 140) { fish(k, GY - 42, .4, k % 280 ? C.indigo : C.red, 1); peacock(k + 70, GY - 22, .28, t); } break;
      case 'tulsi': ctx.beginPath(); ctx.rect(s.x - 22, GY - 50, 44, 50); fillInk('#e2b07a', 2.5); ctx.fillStyle = C.red; ctx.fillRect(s.x - 22, GY - 30, 44, 6); for (let k = 0; k < 9; k++) { ctx.save(); ctx.translate(s.x, GY - 50); ctx.rotate(-1.2 + k * .3); ell(0, -14, 4, 12); fillInk('#3f8f3a', 1.2); ctx.restore(); } diya(s.x, GY - 1, .6, true, t); break;
      case 'vine': break;
      case 'aangan': rangoli(s.x + s.w / 2, GY + 20, 60, t, .9); break;
      case 'chulha': chulha(s.x, GY, 1.1, t, true); ctx.beginPath(); ctx.ellipse(s.x, GY - 46, 26, 8, 0, 0, Math.PI * 2); fillInk('#8a8a8a', 2); for (let k = 0; k < 3; k++) { ctx.globalAlpha = .4; circ(s.x - 10 + k * 10, GY - 60 - ((t * 30 + k * 20) % 60), 6 + ((t * 10 + k * 5) % 6)); ctx.fillStyle = '#fff'; ctx.fill(); ctx.globalAlpha = 1; } break;
      case 'shelf': break;
      case 'cow': { const x = s.x; ctx.save(); ctx.beginPath(); ctx.ellipse(x, GY - 50, 50, 26, 0, 0, Math.PI * 2); fillInk('#fffaf0', 2.5); [-30, -16, 20, 34].forEach(lx => { ctx.beginPath(); ctx.rect(x + lx - 4, GY - 30, 8, 30); fillInk('#fffaf0', 2); }); ctx.beginPath(); ctx.ellipse(x - 58, GY - 62, 18, 14, -.3, 0, Math.PI * 2); fillInk('#fffaf0', 2.5); ctx.beginPath(); ctx.moveTo(x - 66, GY - 74); ctx.lineTo(x - 72, GY - 90); ctx.moveTo(x - 54, GY - 74); ctx.lineTo(x - 50, GY - 90); strokeInk(3); ctx.fillStyle = C.ink; circ(x - 62, GY - 64, 2); ctx.fill(); ctx.fillStyle = C.red; circ(x - 58, GY - 72, 3); ctx.fill(); ctx.fillStyle = 'rgba(160,100,60,.5)'; circ(x + 10, GY - 56, 10); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 48, GY - 56); ctx.quadraticCurveTo(x + 60 + Math.sin(t * 3) * 5, GY - 40, x + 56, GY - 20); strokeInk(2.5); ctx.restore(); break; }
      case 'field': for (let k = 0; k < s.w; k += 26) { ctx.beginPath(); ctx.moveTo(s.x + k, GY); ctx.lineTo(s.x + k, GY - 30); strokeInk(2, '#5a8a2a'); ell(s.x + k, GY - 34, 6, 10); fillInk('#c8b040', 1.5); } break;
      case 'canefield': for (let k = 0; k < s.w; k += 22) sugarcane(s.x + k, GY, 110 + (k % 3) * 14, Math.sin(t + k) * .03); break;
      case 'stall': { const x = s.x; ctx.beginPath(); ctx.rect(x, GY - 60, s.w, 60); fillInk('#b5793a', 2.5); [x + 10, x + s.w - 10].forEach(px => { ctx.beginPath(); ctx.rect(px - 4, GY - 150, 8, 90); fillInk('#7a4a22', 2); }); ctx.beginPath(); ctx.moveTo(x - 20, GY - 150); ctx.lineTo(x + s.w + 20, GY - 150); ctx.lineTo(x + s.w, GY - 180); ctx.lineTo(x, GY - 180); ctx.closePath(); fillInk(C.red, 2.5); ctx.fillStyle = C.tur; for (let k = x; k < x + s.w; k += 30) { ctx.beginPath(); ctx.moveTo(k, GY - 150); ctx.lineTo(k + 15, GY - 136); ctx.lineTo(k + 30, GY - 150); ctx.fill(); } txtO(L(s.label), x + s.w / 2, GY - 165, 16, '#fff', C.ink, 'center', FONT, 4); ['banana', 'coconut', 'apple', 'orange', 'lemon', 'sugarcane'].forEach((id, i) => item(id, x + 30 + i * (s.w - 60) / 5, GY - 72, .7, t)); break; }
      case 'bamboo': for (let k = 0; k < 5; k++) { ctx.beginPath(); ctx.rect(s.x - 80 + k * 14, GY - 200 - k * 8, 8, 200 + k * 8); fillInk('#9ab84a', 1.5); for (let j = 0; j < 8; j++) { ctx.beginPath(); ctx.moveTo(s.x - 80 + k * 14, GY - j * 26); ctx.lineTo(s.x - 72 + k * 14, GY - j * 26); strokeInk(1.5); } } soop(s.x + 30, GY - 70, .6); daura(s.x + 80, GY - 20, .6); break;
      case 'potter': { ctx.save(); ctx.translate(s.x, GY); for (let i = 0; i < 6; i++) diya(-60 + i * 22, -1, .6, false, t); kalash(70, 0, .9); ctx.beginPath(); ctx.ellipse(30, -6, 26, 6, 0, 0, Math.PI * 2); fillInk('#7a4a22', 2); ctx.restore(); break; }
      case 'temple': { const x = s.x; ctx.beginPath(); ctx.rect(x - 50, GY - 90, 100, 90); fillInk('#f2d7a8', 2.5); ctx.beginPath(); ctx.moveTo(x - 50, GY - 90); ctx.quadraticCurveTo(x - 40, GY - 200, x, GY - 230); ctx.quadraticCurveTo(x + 40, GY - 200, x + 50, GY - 90); fillInk('#f7c873', 2.5); ctx.beginPath(); ctx.moveTo(x, GY - 230); ctx.lineTo(x, GY - 260); strokeInk(2); ctx.beginPath(); ctx.moveTo(x, GY - 260); ctx.lineTo(x + 20, GY - 252); ctx.lineTo(x, GY - 245); fillInk(C.red, 1.5); ctx.beginPath(); ctx.moveTo(x - 18, GY); ctx.lineTo(x - 18, GY - 50); ctx.arc(x, GY - 50, 18, Math.PI, 0); ctx.lineTo(x + 18, GY); fillInk('#5a2a10', 2); drawSun(x, GY - 150, 12, t, {}); break; }
      case 'pillar': ctx.beginPath(); ctx.rect(s.x - 10, GY - 150, 20, 150); fillInk('#f2d7a8', 2.5); ctx.beginPath(); ctx.rect(s.x - 16, GY - 160, 32, 12); fillInk('#e2b07a', 2); ctx.fillStyle = C.red; for (let k = 0; k < 5; k++) { circ(s.x, GY - 130 + k * 26, 3); ctx.fill(); } break;
      case 'boat': { ctx.save(); ctx.translate(s.x, 395 + Math.sin(t * 1.5) * 3); ctx.beginPath(); ctx.moveTo(-60, -10); ctx.quadraticCurveTo(0, 20, 60, -10); ctx.lineTo(50, -2); ctx.quadraticCurveTo(0, 10, -50, -2); ctx.closePath(); fillInk('#8a4a22', 2); ctx.beginPath(); ctx.moveTo(0, -4); ctx.lineTo(0, -60); strokeInk(3); ctx.beginPath(); ctx.moveTo(2, -58); ctx.quadraticCurveTo(30, -36, 2, -10); fillInk('#f2e6c8', 2); ctx.restore(); break; }
      case 'kosi': { const x = s.x; ctx.save(); [-30, -10, 10, 30].forEach((o, i) => { ctx.beginPath(); ctx.moveTo(x + o, GY); ctx.lineTo(x, GY - 140); strokeInk(6, '#5c8a2a'); }); for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(x, GY - 140); ctx.rotate(-Math.PI / 2 + (i - 2.5) * .45); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(25, -10, 45, 6); ctx.quadraticCurveTo(25, 2, 0, 0); fillInk('#6fae3a', 1.5); ctx.restore(); } ctx.beginPath(); ctx.moveTo(x - 50, GY - 60); ctx.quadraticCurveTo(x, GY - 40, x + 50, GY - 60); strokeInk(4, C.red); for (let i = 0; i < 7; i++) diya(x - 45 + i * 15, GY, .55, true, t); kalash(x, GY - 2, .7); ctx.restore(); break; }
      case 'crowd': { const r = seeded(Math.floor(s.x)); for (let k = 0; k < s.w; k += 60) { const who = ['vrati', 'chachi', 'kaki', 'chacha', 'vrati'][Math.floor(r() * 5)]; person(s.x + k + r() * 20, GY - 8, who, { pose: k % 120 ? 'pray' : 'offer', t: t + k, s: .78, carry: (x, y) => soop(x, y, .45, true, t) }); } break; }
      case 'stage': ctx.beginPath(); ctx.moveTo(s.x, GY - 50); ctx.lineTo(s.x, GY - 200); ctx.moveTo(s.x + s.w, GY - 50); ctx.lineTo(s.x + s.w, GY - 200); strokeInk(6, '#7a4a22'); for (let k = 0; k <= 14; k++) { const a = k / 14; item('flower', s.x + a * s.w, GY - 200 + Math.sin(a * Math.PI) * 30, .5); } break;
    }
  }
  function key(k) { }
  const self = { _dbg: () => ({ items, spots, npcs, w, players, finish, interact, get mini() { return mini; }, get dialog() { return dialog; }, get overlay() { return overlay; } }), enter, update, draw, key, down, up: (x, y) => mini && mini.up && mini.up(x, y), move: (x, y) => mini && mini.move && mini.move(x, y) };
  return self;
}

// ---------- narration (Web Speech, optional) ----------
function narrate(text) {
  if (!S.narr) return;
  try {
    const sp = window.speechSynthesis; if (!sp) return; sp.cancel();
    const u = new SpeechSynthesisUtterance(text.replace(/सूर्य पंखी:|Surya Pankhi:/g, ''));
    u.lang = S.lang === 'hi' ? 'hi-IN' : 'en-IN'; u.rate = .92; u.pitch = 1.05;
    const v = sp.getVoices().find(v => v.lang && v.lang.toLowerCase().startsWith(S.lang === 'hi' ? 'hi' : 'en-in')); if (v) u.voice = v;
    sp.speak(u);
  } catch (e) { }
}
