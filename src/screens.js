// ================= SCREENS: menu, cinematics, cards, extras =================
function simpleScene(o) { return Object.assign({ update() { }, draw() { }, down() { }, key() { } }, o); }
function backBtn() { return { x: 16, y: 14, w: 120, h: 44 }; }
function bgVillage(t, pal = 'day', sunX = 760) {
  const p = PAL[pal]; drawSky(p, t, sunX); drawHills(p, t * 8, t); drawRiver(372, t, p, t * 8, sunX); drawGround(p, t * 8, 'village');
  house(40, GY, 170, 120, 1, true); tree(300, GY, .9, 'mango', t); house(720, GY, 180, 125, 4, true); tree(930, GY, .9, 'banana', t);
}
function title(s, y = 60, size = 36) { txtO(s, W / 2, y, size, '#ffd23f', '#5a1a05', 'center', TFONT, 7); }

// ---------------- MAIN MENU ----------------
function Menu() {
  let t = 0;
  const items = [
    { l: 'नया खेल', s: 'New Game', a: () => go(HeroSelect()) },
    { l: 'खेल जारी रखें', s: 'Continue', a: () => go(LevelSelect()) },
    { l: 'छठ की परंपराएं', s: 'Festival Traditions', a: () => go(Traditions()) },
    { l: 'मिनी गेम्स', s: 'Mini Games', a: () => go(MiniMenu()) },
    { l: 'छठ गीत', s: 'Chhath Geet (Music)', a: () => go(Geet()) },
    { l: 'मेरा घाट', s: 'My Virtual Ghat', a: () => go(GhatSandbox()) },
    { l: 'गैलरी', s: 'Gallery', a: () => go(Gallery()) },
    { l: 'सेटिंग्स', s: 'Settings', a: () => go(Settings(() => Menu())) }
  ];
  const rects = items.map((it, i) => ({ x: W / 2 - 250 + (i % 2) * 260, y: 236 + Math.floor(i / 2) * 64, w: 240, h: 54 }));
  const langR = { x: 16, y: 14, w: 120, h: 40 }, fsR = { x: W - 60, y: 14, w: 44, h: 40 };
  return simpleScene({
    enter() { Audio2.play(0); Audio2.setAmb({ birds: 1, river: .4 }); },
    update(dt) { t += dt; },
    draw() {
      const p = PAL.dawn; drawSky(p, t, 0, { noSun: true });
      drawSun(W / 2, 150, 70, t, { face: true, glow: true });
      drawHills(p, t * 10, t); drawRiver(372, t, p, t * 10, W / 2); drawGround(p, t * 10, 'village');
      house(20, GY, 160, 115, 2, true); sugarcane(220, GY, 140, .1); sugarcane(240, GY, 150, -.05); tree(880, GY, .9, 'banana', t);
      house(760, GY + 2, 120, 90, 5, true);
      person(150, GY + 60, S.hero === 'aarya' ? 'aarya' : 'aarav', { t, pose: 'wave', s: 1.2 });
      pankhi(250 + Math.sin(t) * 30, 200 + Math.sin(t * 2) * 15, t, 1.1);
      for (let i = 0; i < 5; i++) diya(330 + i * 75, H - 12, .8, true, t + i);
      ctx.fillStyle = 'rgba(60,20,0,.25)'; ctx.fillRect(0, 0, W, 116);
      txtO('छठ महापर्व', W / 2, 40, 44, '#ffd23f', '#5a1a05', 'center', TFONT, 8);
      txtO('CHHATH MAHAPARV – THE SACRED JOURNEY OF SURYA DEV', W / 2, 80, 17, '#fff3d6', '#5a1a05', 'center', FONT, 5);
      txtO('सूर्य देव की पावन यात्रा', W / 2, 104, 15, '#ffe27a', '#5a1a05', 'center', FONT, 4);
      items.forEach((it, i) => button(rects[i], it.l, { sub: it.s, size: 19 }));
      txtO('“आस्था, प्रकृति और सूर्य उपासना का अद्भुत संगम”', W / 2, 500, 16, '#fff', '#5a1a05', 'center', FONT, 4);
      button(langR, S.lang === 'hi' ? 'हिंदी ⇄ EN' : 'English ⇄ हि', { size: 15 }); button(fsR, '⛶', { size: 18 });
    },
    down(x, y) {
      rects.forEach((r, i) => { if (inRect(x, y, r)) { Audio2.sfx('click'); items[i].a(); } });
      if (inRect(x, y, langR)) { S.lang = S.lang === 'hi' ? 'en' : 'hi'; save(); Audio2.sfx('click'); }
      if (inRect(x, y, fsR)) toggleFS();
    }
  });
}
function toggleFS() { try { if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => { }); else document.exitFullscreen(); } catch (e) { } }

// ---------------- HERO SELECT ----------------
function HeroSelect() {
  let t = 0; const A = { x: 170, y: 120, w: 280, h: 300 }, Bx = { x: 510, y: 120, w: 280, h: 300 }, fam = { x: W / 2 - 170, y: 432, w: 340, h: 44 }, start = { x: W / 2 - 110, y: 484, w: 220, h: 46 };
  return simpleScene({
    update(dt) { t += dt; },
    draw() {
      bgVillage(t); ctx.fillStyle = 'rgba(40,15,0,.35)'; ctx.fillRect(0, 0, W, H);
      title(L(B('अपना नायक चुनें', 'Choose your hero')), 60, 34);
      [[A, 'aarav'], [Bx, 'aarya']].forEach(([r, h]) => { frame(r.x, r.y, r.w, r.h, S.hero === h ? '#ffe27a' : '#fff3d6'); person(r.x + r.w / 2, r.y + 240, h, { t, s: 1.9, pose: S.hero === h ? 'wave' : 'idle' }); txt(L(PEOPLE[h].name), r.x + r.w / 2, r.y + 272, 24, C.red, 'center', TFONT); });
      button(fam, (S.family ? '☑ ' : '☐ ') + L(B('परिवार मोड (2 खिलाड़ी)', 'Family Mode (2 players)')), { size: 16, c1: S.family ? '#bff5a5' : undefined, c2: S.family ? '#5fb04a' : undefined });
      button(start, L(B('यात्रा शुरू करें ▸', 'Begin the journey ▸')), { size: 18 });
      button(backBtn(), L(B('◂ वापस', '◂ Back')), { size: 16 });
      if (S.family) txt(L(B('P1: A/D/W/E   ·   P2: तीर कुंजियाँ / Enter', 'P1: A/D/W/E   ·   P2: Arrow keys / Enter')), W / 2, 106, 14, '#fff', 'center', FONT, '700');
    },
    down(x, y) {
      if (inRect(x, y, A)) { S.hero = 'aarav'; Audio2.sfx('click'); } if (inRect(x, y, Bx)) { S.hero = 'aarya'; Audio2.sfx('click'); }
      if (inRect(x, y, fam)) { S.family = !S.family; Audio2.sfx('click'); }
      if (inRect(x, y, start)) { save(); Audio2.sfx('level'); go(Cinematic('intro', () => World(0))); }
      if (inRect(x, y, backBtn())) go(Menu());
    }
  });
}

// ---------------- LEVEL SELECT (Continue) ----------------
function LevelSelect() {
  let t = 0; const pts = LEVELS.map((lv, i) => ({ x: 110 + i * 105, y: 300 + Math.sin(i * 1.3) * 70 }));
  return simpleScene({
    update(dt) { t += dt; },
    draw() {
      const p = PAL.after; drawSky(p, t, 820); ctx.fillStyle = '#d9b77a'; ctx.fillRect(0, 160, W, H);
      ctx.beginPath(); ctx.moveTo(0, 360); pts.forEach(q => ctx.lineTo(q.x, q.y + 30)); ctx.lineTo(W, 330); ctx.lineWidth = 46; ctx.strokeStyle = '#4a9fc9'; ctx.stroke(); ctx.lineWidth = 3; ctx.strokeStyle = '#fff'; ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 20; ctx.stroke(); ctx.setLineDash([]);
      title(L(B('यात्रा का नक्शा — स्तर चुनें', 'Journey Map — choose a level')), 50, 30);
      pts.forEach((q, i) => {
        const lv = LEVELS[i], open = i < S.unlocked;
        circ(q.x, q.y, 36); fillInk(open ? (S.done[lv.id] ? '#9fd38a' : '#ffd23f') : '#aaa', 3);
        if (open) drawSun(q.x, q.y, 16, t, {}); else txt('🔒', q.x, q.y, 22, C.ink, 'center', 'system-ui');
        txt(String(i + 1), q.x + 26, q.y - 26, 16, C.red, 'center', FONT, '800');
        wrap(L(lv.title), q.x, q.y + 58, 100, 13, C.ink, 1.2, 'center', '800');
      });
      txt(L(B('✔ = पूरा   ·   पीला = खुला   ·   स्लेटी = बंद', '✔ green = done   ·   gold = open   ·   grey = locked')), W / 2, H - 22, 14, C.ink, 'center', FONT, '700');
      button(backBtn(), L(B('◂ वापस', '◂ Back')), { size: 16 });
    },
    down(x, y) { if (inRect(x, y, backBtn())) return go(Menu()); pts.forEach((q, i) => { if (Math.hypot(q.x - x, q.y - y) < 40) { if (i < S.unlocked) { Audio2.sfx('level'); go(World(i)); } else Audio2.sfx('wrong'); } }); }
  });
}

// ---------------- KNOWLEDGE CARD ----------------
function Card(idx) {
  const lv = LEVELS[idx]; let t = 0;
  const nx = { x: W / 2 + 20, y: H - 74, w: 230, h: 48 }, mn = { x: W / 2 - 250, y: H - 74, w: 230, h: 48 };
  const art = ART_LIST.find(a => a.id === lv.art);
  return simpleScene({
    enter() { Audio2.play(lv.track); narrate(L(lv.card.title) + '. ' + lv.card.facts.map(L).join(' ')); },
    update(dt) { t += dt; },
    draw() {
      bgVillage(t, lv.id >= 6 ? 'sunset' : 'day'); ctx.fillStyle = 'rgba(40,15,0,.45)'; ctx.fillRect(0, 0, W, H);
      frame(40, 24, W - 80, H - 112);
      txtO(L(B('सांस्कृतिक ज्ञान', 'Cultural Knowledge')) + ' · ' + L(DAYS[lv.day]), W / 2, 56, 16, '#fff', C.red, 'center', FONT, 4);
      txtO(L(lv.card.title), W / 2, 92, 30, '#ffd23f', '#5a1a05', 'center', TFONT, 6);
      // illustration
      ctx.save(); circ(170, 270, 100); ctx.fillStyle = '#ffe9b0'; ctx.fill(); strokeInk(3); ctx.clip(); cardPic(lv.card.pic, 170, 270, t); ctx.restore();
      person(170, 470 - 40, 'dadi', { t, s: .7, pose: 'idle' });
      txt(L(B('दादी बताती हैं:', 'Dadi explains:')), 300, 130, 16, C.red, 'left', FONT, '800');
      let y = 160; lv.card.facts.forEach(f => { item('flower', 312, y + 6, .45); y = wrap(L(f), 334, y + 4, W - 420, 16, C.ink, 1.38) + 8; });
      if (art) txt('🎨 ' + L(B('मधुबनी चित्र खुला: ', 'Madhubani art unlocked: ')) + L(art.n), W / 2, H - 100, 15, C.green, 'center', FONT, '800');
      button(mn, L(B('मुख्य मेनू', 'Main Menu')), { size: 17 });
      button(nx, idx < 7 ? L(B('अगला स्तर ▸', 'Next Level ▸')) : L(B('ज्ञान-पुस्तिका ▸', 'Knowledge Book ▸')), { size: 17 });
    },
    down(x, y) {
      try { speechSynthesis.cancel(); } catch (e) { }
      if (inRect(x, y, mn)) go(Menu());
      if (inRect(x, y, nx)) { Audio2.sfx('click'); go(idx < 7 ? World(idx + 1) : Traditions(true)); }
    },
    key(k) { if (t > 1.2 && (k === 'Enter' || k === ' ' || k === 'e')) { try { speechSynthesis.cancel(); } catch (e) { } Audio2.sfx('click'); go(idx < 7 ? World(idx + 1) : Traditions(true)); } }
  });
}
function cardPic(k, x, y, t) {
  if (k === 'sun') { ctx.fillStyle = '#8fd3f4'; ctx.fillRect(x - 100, y - 100, 200, 200); drawSun(x, y, 50, t, { face: true }); }
  else if (k === 'river') { ctx.fillStyle = '#fde7b0'; ctx.fillRect(x - 100, y - 100, 200, 200); ctx.fillStyle = '#3d9fc9'; ctx.fillRect(x - 100, y, 200, 100); person(x, y + 50, 'vrati', { pose: 'pray', t }); ctx.fillStyle = 'rgba(61,159,201,.85)'; ctx.fillRect(x - 100, y + 10, 200, 90); }
  else if (k === 'kheer') { ctx.fillStyle = '#f6dcae'; ctx.fillRect(x - 100, y - 100, 200, 200); chulha(x, y + 80, 1.6, t); ctx.beginPath(); ctx.ellipse(x, y - 4, 60, 16, 0, 0, Math.PI * 2); fillInk('#e8d1a8', 3); item('gur', x - 40, y - 50, 1); item('milk', x + 40, y - 52, 1); }
  else if (k === 'soop') { ctx.fillStyle = '#fde3a7'; ctx.fillRect(x - 100, y - 100, 200, 200); soop(x, y, 2.2, true, t); }
  else if (k === 'clean') { ctx.fillStyle = '#8fd3f4'; ctx.fillRect(x - 100, y - 100, 200, 200); ctx.fillStyle = '#3d9fc9'; ctx.fillRect(x - 100, y + 10, 200, 90); lotus(x - 40, y + 30, .7); fish(x + 40, y + 60, .6, C.tur); tree(x, y + 10, .6, 'peepal', t); }
  else if (k === 'sunset') { ctx.fillStyle = '#ff8c42'; ctx.fillRect(x - 100, y - 100, 200, 200); drawSun(x, y, 36, t, { face: true }); ctx.fillStyle = '#7a3b52'; ctx.fillRect(x - 100, y + 30, 200, 70); diya(x - 50, y + 60, .8, true, t); diya(x + 50, y + 70, .8, true, t); }
  else if (k === 'chariot') { ctx.fillStyle = '#ffd29d'; ctx.fillRect(x - 100, y - 100, 200, 200); suryaDev(x + 50, y + 70, .38, t); }
  else { ctx.fillStyle = '#ffd29d'; ctx.fillRect(x - 100, y - 100, 200, 200); person(x - 40, y + 80, 'dancer1', { pose: 'dance', t, s: .8 }); person(x + 40, y + 80, 'dancer2', { pose: 'dance', t: t + 1, s: .8 }); }
}

// ---------------- CINEMATICS ----------------
function Cinematic(kind, next) {
  let t = 0, ended = false; const skip = { x: W - 130, y: 14, w: 116, h: 40 };
  const end = () => { if (ended) return; ended = true; try { speechSynthesis.cancel(); } catch (e) { } go(next()); };
  const C_ = CINE[kind];
  let lastCap = -1;
  return simpleScene({
    enter() { Audio2.play(C_.track); Audio2.setAmb(C_.amb || {}); },
    update(dt) {
      t += dt; if (t > C_.dur) end();
      const ci = C_.caps.findIndex((c, i) => t >= c[0] && (i === C_.caps.length - 1 || t < C_.caps[i + 1][0]));
      if (ci !== lastCap && ci >= 0) { lastCap = ci; if (C_.caps[ci][2]) Audio2.sfx(C_.caps[ci][2]); if (kind !== 'intro' || ci === 0) { } narrate(L(C_.caps[ci][1])); }
    },
    draw() {
      C_.draw(t);
      // letterbox bars
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, 34); ctx.fillRect(0, H - 34, W, 34);
      const ci = C_.caps.findIndex((c, i) => t >= c[0] && (i === C_.caps.length - 1 || t < C_.caps[i + 1][0]));
      if (ci >= 0) { const c = C_.caps[ci]; const a = Math.min(1, (t - c[0]) * 2); ctx.globalAlpha = a; ctx.fillStyle = 'rgba(30,10,0,.55)'; rrect(80, H - 112, W - 160, 64, 14); ctx.fill(); wrap(L(c[1]), W / 2, H - 92, W - 200, 19, '#fff6d0', 1.4, 'center', '700'); ctx.globalAlpha = 1; }
      button(skip, L(B('छोड़ें ▸▸', 'Skip ▸▸')), { size: 15 });
      if (t < 1) { ctx.fillStyle = `rgba(0,0,0,${1 - t})`; ctx.fillRect(0, 0, W, H); }
    },
    down(x, y) { if (inRect(x, y, skip)) end(); },
    key(k) { if (k === 'Escape' || k === 'Enter') end(); }
  });
}
function waterCrowd(t, p, waterY, offer, pourK) {
  const r = seeded(5);
  for (let i = 0; i < 9; i++) {
    const x = 80 + i * 105 + r() * 20, who = ['vrati', 'chachi', 'kaki', 'maa', 'vrati', 'dadi', 'chachi', 'vrati', 'kaki'][i];
    person(x, waterY + 52, who, { pose: offer ? 'offer' : 'pray', t: t + i, s: .9, carry: (a, b) => soop(a, b, .45, true, t) });
    if (offer && pourK > 0) { ctx.fillStyle = 'rgba(230,245,255,.8)'; for (let k = 0; k < 6; k++) { const yy = ((t * 120 + k * 14) % 70); circ(x + 28 * .9 + 4, waterY - 34 + yy, 2.2); ctx.fill(); } }
  }
  // water in front
  const g = ctx.createLinearGradient(0, waterY, 0, H); g.addColorStop(0, p.water2); g.addColorStop(1, p.water); ctx.globalAlpha = .88; ctx.fillStyle = g; ctx.fillRect(0, waterY, W, H - waterY); ctx.globalAlpha = 1;
  ctx.strokeStyle = 'rgba(255,255,255,.4)'; ctx.lineWidth = 2; for (let row = 0; row < 4; row++) { ctx.beginPath(); const yy = waterY + 12 + row * 18; for (let x = -40 + ((t * 20 + row * 10) % 40); x < W; x += 40) { ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + 10, yy - 5, x + 20, yy); } ctx.stroke(); }
}
function floatingDiyas(t, y0, n = 10) { for (let i = 0; i < n; i++) { const x = ((i * 110 + t * 25) % (W + 100)) - 50, y = y0 + (i % 3) * 22 + Math.sin(t * 2 + i) * 3; ctx.save(); ctx.translate(x, y); ctx.beginPath(); ctx.ellipse(0, 0, 18, 6, 0, 0, Math.PI * 2); fillInk('#5aa02c', 1.5); ctx.restore(); diya(x, y - 2, .7, true, t + i); } }
const CINE = {
  intro: {
    dur: 30, track: 0, amb: { birds: 1, river: .5 },
    caps: [[0, B('बिहार में, पवित्र गंगा के किनारे, एक सुंदर गाँव में सूरज उग रहा है…', 'In Bihar, beside the sacred Ganga, the sun rises over a beautiful village…'), 'bell'],
    [6, B('कार्तिक का महीना है। गाँव छठ महापर्व की तैयारी में डूबा है।', 'It is the month of Kartik. The village is busy preparing for Chhath Mahaparv.')],
    [12, B('माँ प्रसाद की तैयारी कर रही हैं, पापा ईख ला रहे हैं, दादी परंपराएँ सिखा रही हैं।', 'Mother prepares offerings, Father brings sugarcane, Dadi teaches the traditions.')],
    [18, B('एक शाम आकाश में रहस्यमयी सुनहरी रोशनी चमकी… और आया — सूर्य पंखी!', 'One evening, a mysterious golden light glowed in the sky… and out flew Surya Pankhi!'), 'bell'],
    [24, B('"एक जादुई आँधी ने पर्व की तैयारी बिखेर दी है। चलो, मिलकर सब ठीक करें!"', '"A magical storm has scattered the festival preparations. Let\'s set everything right together!"'), 'sweep']],
    draw(t) {
      if (t < 6) { const k = t / 6; const p = mixPal(PAL.predawn, PAL.dawn, k); drawSky(p, t, 0, { noSun: true }); drawSun(W / 2, lerp(420, 170, ease(k)), 55, t, { face: true, glow: true }); drawHills(p, t * 10, t); drawRiver(372, t, p, 0, W / 2); drawGround(p, t * 15, 'village'); house(80, GY, 180, 120, 1); house(400, GY, 150, 110, 3); tree(620, GY, 1, 'mango', t); house(720, GY, 190, 125, 5); }
      else if (t < 12) { // aerial-ish river panorama
        const k = (t - 6) / 6, p = PAL.day; drawSky(p, t, 820); ctx.fillStyle = p.hill; ctx.fillRect(0, 210, W, 60);
        const g = ctx.createLinearGradient(0, 260, 0, H); g.addColorStop(0, '#9fd8ec'); g.addColorStop(1, '#2b7fa8'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 300); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, 300 + Math.sin(x * .01 + k * 2) * 20); ctx.lineTo(W, 430); for (let x = W; x >= 0; x -= 20) ctx.lineTo(x, 430 + Math.sin(x * .012) * 15); ctx.fill();
        ctx.save(); ctx.translate(-k * 300, 0);
        for (let i = 0; i < 9; i++) { house(60 + i * 160, 290, 70, 40, i, false); }
        for (let i = 0; i < 8; i++) { ctx.save(); ctx.translate(100 + i * 180, 360 + Math.sin(t + i) * 3); ctx.scale(.6, .6); ctx.beginPath(); ctx.moveTo(-60, -10); ctx.quadraticCurveTo(0, 20, 60, -10); ctx.lineTo(50, -2); ctx.quadraticCurveTo(0, 10, -50, -2); ctx.closePath(); fillInk('#8a4a22', 2); ctx.restore(); }
        ghatSteps(200, 430, 300, 3); ghatSteps(800, 430, 300, 3); ctx.restore();
        ctx.fillStyle = '#c99a5b'; ctx.fillRect(0, 470, W, 70);
        for (let i = 0; i < 6; i++) pankhi(((t * 60 + i * 180) % (W + 100)) - 50, 120 + i * 12, t + i, .35);
      } else if (t < 18) { // family prep
        const p = PAL.after; drawSky(p, t, 820); drawHills(p, 0, t); drawGround(p, 0, 'village'); house(40, GY, 220, 130, 2); chulha(380, GY, 1.2, t);
        person(330, GY, 'maa', { pose: 'work', t }); person(560, GY, 'dadi', { pose: 'offer', t, carry: (x, y) => soop(x, y, .5, true, t) });
        person(720 + Math.sin(t) * 5, GY, 'papa', { pose: 'carry', t, carry: (x, y) => { sugarcane(x - 10, y + 20, 70, -.4, .7); sugarcane(x + 10, y + 20, 70, .4, .7); } });
        person(470, GY, S.hero, { pose: 'wave', t }); daura(860, GY - 20, .9, true, t); item('thekua', 420, GY - 70, 1);
      } else { // golden light & storm
        const k = clamp((t - 18) / 6, 0, 1), p = mixPal(PAL.after, PAL.sunset, k); drawSky(p, t, 820); drawHills(p, 0, t); drawGround(p, 0, 'village'); house(60, GY, 200, 125, 2); tree(420, GY, 1, 'mango', t + (t > 24 ? Math.sin(t * 8) * 2 : 0));
        person(560, GY, S.hero, { pose: t > 24 ? 'idle' : 'wave', t });
        const gx = W / 2 + 120, gy = 170; const gg = ctx.createRadialGradient(gx, gy, 5, gx, gy, 160); gg.addColorStop(0, 'rgba(255,240,170,' + (.9 * Math.min(1, (t - 18))) + ')'); gg.addColorStop(1, 'rgba(255,200,60,0)'); ctx.fillStyle = gg; circ(gx, gy, 160); ctx.fill();
        const bk = clamp((t - 19.5) / 3, 0, 1); pankhi(lerp(gx, 640, bk), lerp(gy, 320, bk), t, lerp(.3, 1.3, bk), -1);
        if (t > 24) { const s = (t - 24); ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3; for (let i = 0; i < 9; i++) { ctx.beginPath(); const y = 80 + i * 45; const x = ((s * 700 + i * 140) % (W + 400)) - 200; ctx.moveTo(x, y); ctx.bezierCurveTo(x + 60, y - 30, x + 120, y + 30, x + 200, y); ctx.stroke(); }
          ['flower', 'diya', 'soop', 'daura', 'banana', 'flower'].forEach((id, i) => item(id, ((s * 380 + i * 160) % (W + 200)) - 100, 140 + i * 40 + Math.sin(s * 5 + i) * 30, 1, t)); }
      }
    }
  },
  sunset: {
    dur: 22, track: 2, amb: { river: 1, crowd: .7 },
    caps: [[0, B('सूर्य धीरे-धीरे ढल रहा है। घाट पर हज़ारों दीये और गीत…', 'The sun slowly sets. Thousands of diyas and songs fill the ghat…'), 'bell'],
    [6, B('व्रती जल में खड़े होकर सूप से डूबते सूर्य को अर्घ्य देते हैं।', 'Standing in the water, the vratis offer arghya from the soop to the setting sun.'), 'pour'],
    [12, B('नदी पर तैरते दीये — बीते दिन के लिए धन्यवाद।', 'Diyas float on the river — gratitude for the day gone by.'), 'bell'],
    [17, B('"जो डूबता है, वही फिर उगता है।" कल भोर में फिर आएँगे।', '"What sets will rise again." We will return at dawn.')]],
    draw(t) {
      const k = clamp(t / 20, 0, 1), p = mixPal(PAL.after, PAL.sunset, Math.min(1, k * 1.4)); p.sunY = lerp(200, 380, k);
      drawSky(p, t, W / 2, { sunR: 54 }); drawHills(p, 0, t); drawRiver(372, t, p, 0, W / 2);
      if (t > 10) floatingDiyas(t - 10, 395, 9);
      ghatSteps(-20, 300, 180, 4); ghatSteps(820, 300, 180, 4);
      for (let i = 0; i < 4; i++) { sugarcane(40 + i * 18, 300, 100, (i - 1.5) * .08); sugarcane(860 + i * 18, 300, 100, (i - 1.5) * .08); }
      waterCrowd(t, p, 430, t > 5, t > 6 ? 1 : 0);
    }
  },
  sunrise: {
    dur: 26, track: 3, amb: { river: 1, birds: 1, crowd: .4 },
    caps: [[0, B('भोर से पहले का अँधेरा। पूरा गाँव जल में खड़ा सूर्य की प्रतीक्षा कर रहा है।', 'The darkness before dawn. The whole village waits in the water for the sun.')],
    [6, B('पूर्व में लालिमा… और फिर — सूर्य देव का उदय!', 'A blush in the east… and then — Surya Dev rises!'), 'bell'],
    [11, B('सात घोड़ों के स्वर्णिम रथ पर, सारथी अरुण के साथ, सूर्य देव पधारे।', 'On a golden chariot of seven horses, driven by Aruna, Surya Dev arrives.'), 'bell'],
    [18, B('उगते सूर्य को उषा अर्घ्य — नई आशा, नया जीवन। व्रत पूर्ण हुआ।', 'Usha Arghya to the rising sun — new hope, new life. The vrat is complete.'), 'pour']],
    draw(t) {
      const k = clamp(t / 12, 0, 1), p = mixPal(PAL.predawn, PAL.dawn, k); p.sunY = lerp(420, 210, ease(clamp((t - 5) / 10, 0, 1)));
      drawSky(p, t, W / 2, { sunR: 50, noSun: t > 11.5 });
      drawHills(p, 0, t);
      if (t > 10) { const a = clamp((t - 10) / 3, 0, 1); suryaDev(W / 2 + 150, lerp(360, 262, ease(a)), .9, t, a); }
      drawRiver(372, t, p, 0, W / 2);
      for (let i = 0; i < 7; i++) { const bx = ((t * 70 + i * 140) % (W + 200)) - 100; ctx.save(); ctx.translate(bx, 120 + i * 14 + Math.sin(t * 3 + i) * 6); ctx.beginPath(); const f = Math.sin(t * 10 + i) * 6; ctx.moveTo(-10, f); ctx.quadraticCurveTo(-4, -4, 0, 0); ctx.quadraticCurveTo(4, -4, 10, f); strokeInk(2.2, t > 8 ? '#3b1d0b' : '#cfa'); ctx.restore(); }
      floatingDiyas(t, 395, 8);
      waterCrowd(t, p, 430, t > 17, t > 18 ? 1 : 0);
    }
  },
  finale: {
    dur: 30, track: 4, amb: { crowd: 1, birds: 1 },
    caps: [[0, B('छठ महापर्व सम्पन्न हुआ! पूरा गाँव उत्सव में झूम उठा।', 'Chhath Mahaparv is complete! The whole village bursts into celebration.'), 'bell'],
    [8, B('प्रसाद सबमें बँटा — पड़ोसी, मेहमान, अजनबी — सब एक परिवार।', 'Prasad is shared with all — neighbours, guests, strangers — one family.')],
    [15, B('सूर्य देव का आशीर्वाद: आस्था, प्रकृति, परिवार, कृतज्ञता और सद्भाव।', 'Surya Dev\'s blessing: faith, nature, family, gratitude and harmony.'), 'bell'],
    [22, B('जब तक नदियाँ बहेंगी और सूरज उगेगा, छठ के गीत गूँजते रहेंगे। जय छठी मइया!', 'As long as rivers flow and the sun rises, Chhath songs will echo. Jai Chhathi Maiya!')]],
    draw(t) {
      if (t < 15) {
        const p = PAL.dawn; drawSky(p, t, 820); drawHills(p, t * 10, t); drawRiver(372, t, p, t * 10, 820); drawGround(p, t * 10, 'village');
        house(30, GY, 180, 120, 1); house(760, GY, 170, 115, 4);
        ['dancer1', 'dancer2', 'dancer1', S.hero, 'dancer2', 'munni', 'golu'].forEach((w, i) => person(230 + i * 85, GY, w, { pose: 'dance', t: t + i * .4, dir: i % 2 ? -1 : 1 }));
        person(130, GY, 'dholak', { pose: 'work', t }); person(850, GY, 'dadi', { pose: 'wave', t });
        for (let i = 0; i < 40; i++) { const x = (i * 97 + t * 30) % W, y = (i * 53 + t * 60) % H; ctx.fillStyle = ['#ff9f1c', '#ffd23f', '#e2401c', '#e75480'][i % 4]; ctx.save(); ctx.translate(x, y); ctx.rotate(t + i); ell(0, 0, 5, 2.5); ctx.fill(); ctx.restore(); }
      } else {
        const p = PAL.dawn; drawSky(p, t, 0, { noSun: true }); drawRiver(372, t, p, 0, W / 2); floatingDiyas(t, 400, 10);
        const a = clamp((t - 15) / 2, 0, 1); suryaDev(W / 2 + 150, 330, .85, t, a);
        if (t > 17) { const words = [B('आस्था', 'Faith'), B('प्रकृति', 'Nature'), B('परिवार', 'Family'), B('कृतज्ञता', 'Gratitude'), B('सद्भाव', 'Harmony')]; words.forEach((wd, i) => { const ap = clamp((t - 17 - i * .6) * 2, 0, 1); ctx.globalAlpha = ap; txtO(L(wd), 120 + i * 180, 70, 26, '#ffd23f', '#5a1a05', 'center', TFONT, 6); }); ctx.globalAlpha = 1; }
      }
    }
  }
};

// ---------------- TRADITIONS / KNOWLEDGE BOOK ----------------
function Traditions(fromEnd) {
  let t = 0, page = 0;
  const pages = [{ t: BOOK[0].t, cal: true }];
  LEVELS.forEach(lv => pages.push({ t: lv.card.title, card: lv.card, lock: !S.done[lv.id] }));
  BOOK.slice(1).forEach(b => pages.push({ t: b.t, p: b.p, lock: !S.book, book: true }));
  const listR = i => ({ x: 30, y: 78 + i * 31, w: 250, h: 28 });
  return simpleScene({
    enter() { Audio2.play(5); if (fromEnd) narrate(L(B('बधाई हो! आपने छठ की ज्ञान-पुस्तिका खोल ली है।', 'Congratulations! You have unlocked the Chhath Knowledge Book.'))); },
    update(dt) { t += dt; },
    draw() {
      ctx.fillStyle = '#f2d7a8'; ctx.fillRect(0, 0, W, H); ctx.save(); ctx.globalAlpha = .1; for (let i = 0; i < 8; i++) fish(60 + i * 130, 40 + (i % 2) * 480, .9, C.red, 1); ctx.restore();
      title(L(B('छठ की परंपराएं — ज्ञान-पुस्तिका', 'Chhath Traditions — Knowledge Book')), 36, 26);
      if (fromEnd) txt('✨ ' + L(B('अंतिम ज्ञान-पुस्तिका खुल गई!', 'Final knowledge book unlocked!')), W - 30, 36, 14, C.green, 'right', FONT, '800');
      pages.forEach((pg, i) => { const r = listR(i); rrect(r.x, r.y, r.w, r.h, 8); fillInk(i === page ? '#ffd23f' : pg.lock ? '#d8c8a8' : '#fff6e0', 1.5); txt((pg.lock ? '🔒 ' : '') + L(pg.t), r.x + 10, r.y + 14, 13, C.ink, 'left', FONT, '700'); });
      frame(300, 70, W - 320, H - 90);
      const pg = pages[page], x0 = 330, mw = W - 380;
      txtO(L(pg.t), 300 + (W - 320) / 2, 110, 24, '#ffd23f', '#5a1a05', 'center', TFONT, 5);
      if (pg.lock) { txt('🔒', 300 + (W - 320) / 2, 250, 50, C.ink, 'center', 'system-ui'); wrap(pg.book ? L(B('पूरा खेल खेलकर यह अध्याय खोलें।', 'Finish the full journey to unlock this chapter.')) : L(B('यह स्तर पूरा करके यह पन्ना खोलें।', 'Complete this level to unlock this page.')), 300 + (W - 320) / 2, 320, mw, 17, C.ink, 1.4, 'center'); }
      else if (pg.cal) {
        const days = [[B('नहाय-खाय', 'Nahay-Khay'), B('पवित्र स्नान; कद्दू-भात का सात्विक भोजन', 'Holy dip; satvik meal of kaddu-bhaat'), 'river'], [B('खरना', 'Kharna'), B('दिन भर उपवास; शाम को गुड़ की खीर-रोटी', 'Day-long fast; evening gur kheer & roti'), 'kheer'], [B('संध्या अर्घ्य', 'Sandhya Arghya'), B('डूबते सूर्य को घाट पर अर्घ्य', 'Arghya to the setting sun at the ghat'), 'sunset'], [B('उषा अर्घ्य', 'Usha Arghya'), B('उगते सूर्य को अर्घ्य, फिर पारण', 'Arghya to the rising sun, then parana'), 'chariot']];
        days.forEach((d, i) => { const cx = 360 + i * 145; rrect(cx - 10, 140, 130, 330, 12); fillInk('#fff', 2); txt(L(B('दिन ', 'Day ')) + (i + 1), cx + 55, 160, 14, C.red, 'center', FONT, '800'); ctx.save(); circ(cx + 55, 225, 50); ctx.clip(); ctx.translate(cx + 55, 225); ctx.scale(.5, .5); cardPic(d[2], 0, 0, t); ctx.restore(); circ(cx + 55, 225, 50); strokeInk(2.5); txt(L(d[0]), cx + 55, 296, 16, C.ink, 'center', FONT, '800'); wrap(L(d[1]), cx + 55, 325, 115, 13, C.ink, 1.35, 'center'); });
        txt(L(B('कार्तिक शुक्ल चतुर्थी से सप्तमी तक', 'From Kartik Shukla Chaturthi to Saptami')), 300 + (W - 320) / 2, 492, 14, C.red, 'center', FONT, '700');
      } else { let y = 150; (pg.card ? pg.card.facts : pg.p).forEach(f => { item('flower', x0 + 6, y + 6, .45); y = wrap(L(f), x0 + 26, y + 4, mw - 30, 17, C.ink, 1.42) + 12; }); }
      button(backBtn(), L(B('◂ मेनू', '◂ Menu')), { size: 15 });
    },
    down(x, y) { if (inRect(x, y, backBtn())) { try { speechSynthesis.cancel(); } catch (e) { } return go(Menu()); } pages.forEach((pg, i) => { if (inRect(x, y, listR(i))) { page = i; Audio2.sfx('click'); if (!pg.lock && (pg.card || pg.p)) narrate((pg.card ? pg.card.facts : pg.p).map(L).join(' ')); } }); }
  });
}

// ---------------- MINI GAMES MENU ----------------
function MiniMenu() {
  let t = 0; const r = i => ({ x: 70 + (i % 4) * 210, y: 110 + Math.floor(i / 4) * 200, w: 190, h: 180 });
  const icons = [x => soop(x.x + 95, x.y + 70, 1.1, true, t), x => item('thekua', x.x + 95, x.y + 70, 2.2), x => daura(x.x + 95, x.y + 80, 1, true, t), x => { item('banana', x.x + 70, x.y + 70, 1.4); item('coconut', x.x + 120, x.y + 70, 1.4); }, x => { item('plastic', x.x + 70, x.y + 70, 1.4); item('bag', x.x + 120, x.y + 70, 1.4); }, x => { diya(x.x + 60, x.y + 90, 1.2, true, t); diya(x.x + 130, x.y + 90, 1.2, true, t); }, x => drawSun(x.x + 95, x.y + 70, 30, t, { face: true }), x => fish(x.x + 100, x.y + 70, 1.1, C.red)];
  return simpleScene({
    enter() { Audio2.play(4); Audio2.setAmb({}); },
    update(dt) { t += dt; },
    draw() {
      ctx.fillStyle = '#fde3a7'; ctx.fillRect(0, 0, W, H); title(L(B('मिनी गेम्स', 'Mini Games')), 50, 32);
      MINI_LIST.forEach((mg, i) => { const q = r(i); frame(q.x, q.y, q.w, q.h, '#fff6e0'); ctx.save(); rrect(q.x + 10, q.y + 10, q.w - 20, q.h - 20, 10); ctx.clip(); icons[i](q); ctx.restore(); wrap(L(mg.n), q.x + q.w / 2, q.y + 140, q.w - 30, 14, C.ink, 1.2, 'center', '800'); });
      button(backBtn(), L(B('◂ मेनू', '◂ Menu')), { size: 15 });
    },
    down(x, y) { if (inRect(x, y, backBtn())) return go(Menu()); MINI_LIST.forEach((mg, i) => { if (inRect(x, y, r(i))) { Audio2.sfx('click'); go(MiniScene(mg.id)); } }); }
  });
}
function MiniScene(id) {
  const m = MINIS[id](null, () => go(MiniMenu()), true);
  return simpleScene({ update: dt => m.update(dt), draw: () => m.draw(), down: (x, y) => m.down && m.down(x, y), up: (x, y) => m.up && m.up(x, y), move: (x, y) => m.move && m.move(x, y) });
}

// ---------------- GALLERY ----------------
const MEMS = [B('दादी की गोद में कहानियाँ', 'Stories on Dadi\'s lap'), B('ठेकुआ की मीठी खुशबू', 'The sweet smell of thekua'), B('ईख का पहला मंडप', 'The first sugarcane canopy'), B('घाट पर पहला दीया', 'The first diya at the ghat'), B('डूबते सूरज की लाली', 'The red glow of sunset'), B('भोर का पहला अर्घ्य', 'The first arghya at dawn'), B('ढोलक की थाप पर नाच', 'Dancing to the dholak'), B('सबके साथ बाँटा प्रसाद', 'Prasad shared with everyone')];
function Gallery() {
  let t = 0, tab = 0, big = null; const tabs = [B('मधुबनी कला', 'Madhubani Art'), B('स्मृतियाँ', 'Memories'), B('फ़ोटो एल्बम', 'Photo Album')];
  const tabR = i => ({ x: 200 + i * 190, y: 72, w: 180, h: 40 });
  const cache = {}; const artC = id => { if (!cache[id]) { const c = document.createElement('canvas'); c.width = 330; c.height = 330; paintArt(c, id); cache[id] = c; } return cache[id]; };
  const imgs = PHOTOS.map(src => { const im = new Image(); im.src = src; return im; });
  const cell = i => ({ x: 70 + (i % 4) * 210, y: 130 + Math.floor(i / 4) * 200, w: 190, h: 185 });
  return simpleScene({
    update(dt) { t += dt; },
    draw() {
      ctx.fillStyle = '#f2d7a8'; ctx.fillRect(0, 0, W, H); title(L(B('गैलरी', 'Gallery')), 38, 30);
      tabs.forEach((tb, i) => button(tabR(i), L(tb), { size: 15, c1: i === tab ? '#fff3a0' : '#ffd24a' }));
      if (tab === 0) ART_LIST.forEach((a, i) => { const q = cell(i), open = S.art.includes(a.id); frame(q.x, q.y, q.w, q.h, '#fff6e0'); if (open) ctx.drawImage(artC(a.id), q.x + 25, q.y + 14, 140, 140); else txt('🔒', q.x + q.w / 2, q.y + 80, 40, C.ink, 'center', 'system-ui'); txt(open ? L(a.n) : L(B('स्तर ', 'Level ')) + (i + 1), q.x + q.w / 2, q.y + 168, 14, C.ink, 'center', FONT, '800'); });
      if (tab === 1) MEMS.forEach((mm, i) => { const q = cell(i), open = S.memories.includes(i); frame(q.x, q.y, q.w, q.h, '#fff6e0'); if (open) { item('memory', q.x + q.w / 2, q.y + 70, 2.4, t); wrap(L(mm), q.x + q.w / 2, q.y + 130, q.w - 30, 14, C.ink, 1.3, 'center', '700'); } else { txt('🔒', q.x + q.w / 2, q.y + 80, 40, C.ink, 'center', 'system-ui'); txt(L(B('स्तर 8 में खोजें', 'Find in Level 8')), q.x + q.w / 2, q.y + 150, 13, C.ink, 'center'); } });
      if (tab === 2) { if (!imgs.length) wrap(L(B('अभी कोई फ़ोटो नहीं। खेलते समय P दबाएँ या 📷 बटन से फ़ोटो लें!', 'No photos yet. Press P or the 📷 button while playing to capture moments!')), W / 2, 280, 600, 18, C.ink, 1.4, 'center'); imgs.forEach((im, i) => { const q = { x: 70 + (i % 4) * 210, y: 140 + Math.floor(i / 4) * 150, w: 190, h: 130 }; frame(q.x, q.y, q.w, q.h, '#fff'); try { ctx.drawImage(im, q.x + 12, q.y + 12, q.w - 24, q.h - 24); } catch (e) { } }); }
      if (big) { ctx.fillStyle = 'rgba(30,10,0,.7)'; ctx.fillRect(0, 0, W, H); if (big.img) ctx.drawImage(big.img, W / 2 - 320, H / 2 - 180, 640, 360); else ctx.drawImage(artC(big.id), W / 2 - 210, H / 2 - 210, 420, 420); }
      button(backBtn(), L(B('◂ मेनू', '◂ Menu')), { size: 15 });
    },
    down(x, y) {
      if (big) { big = null; return; }
      if (inRect(x, y, backBtn())) return go(Menu());
      tabs.forEach((_, i) => { if (inRect(x, y, tabR(i))) { tab = i; Audio2.sfx('click'); } });
      if (tab === 0) ART_LIST.forEach((a, i) => { if (S.art.includes(a.id) && inRect(x, y, cell(i))) big = { id: a.id }; });
      if (tab === 2) imgs.forEach((im, i) => { if (inRect(x, y, { x: 70 + (i % 4) * 210, y: 140 + Math.floor(i / 4) * 150, w: 190, h: 130 })) big = { img: im }; });
    }
  });
}

// ---------------- SETTINGS ----------------
function Settings(back) {
  let t = 0, confirm = false;
  const rows = () => [
    { l: B('भाषा', 'Language'), v: S.lang === 'hi' ? 'हिंदी' : 'English', a: () => S.lang = S.lang === 'hi' ? 'en' : 'hi' },
    { l: B('संगीत', 'Music'), v: S.music ? L(B('चालू', 'ON')) : L(B('बंद', 'OFF')), a: () => S.music = !S.music },
    { l: B('ध्वनि प्रभाव', 'Sound effects'), v: S.sfx ? L(B('चालू', 'ON')) : L(B('बंद', 'OFF')), a: () => S.sfx = !S.sfx },
    { l: B('आवाज़', 'Volume'), v: Math.round(S.vol * 100) + '%', minus: () => S.vol = clamp(S.vol - .1, 0, 1), plus: () => S.vol = clamp(S.vol + .1, 0, 1) },
    { l: B('संगीत चयन', 'Music selection'), v: S.track < 0 ? L(B('स्वचालित (स्तर अनुसार)', 'Auto (per level)')) : L(Audio2.TRACKS[S.track].name), a: () => { S.track = S.track + 1 >= Audio2.TRACKS.length ? -1 : S.track + 1; } },
    { l: B('दादी की आवाज़ (कथन)', 'Grandmother narration'), v: S.narr ? L(B('चालू', 'ON')) : L(B('बंद', 'OFF')), a: () => { S.narr = !S.narr; if (S.narr) narrate(L(B('नमस्ते बेटा! मैं तुम्हें छठ की कहानी सुनाऊँगी।', 'Namaste beta! I will tell you the story of Chhath.'))); else try { speechSynthesis.cancel(); } catch (e) { } } },
    { l: B('टच नियंत्रण', 'Touch controls'), v: touchUI ? L(B('दिखाएँ', 'Show')) : L(B('छिपाएँ', 'Hide')), a: () => touchUI = !touchUI },
    { l: B('फ़ुल-स्क्रीन', 'Full screen'), v: '⛶', a: toggleFS },
    { l: B('प्रगति रीसेट करें', 'Reset progress'), v: confirm ? L(B('पक्का? फिर टैप करें', 'Sure? Tap again')) : '↺', a: () => { if (confirm) { const keep = { lang: S.lang, vol: S.vol }; S = Object.assign({}, DEF, keep); PHOTOS = []; savePhotos(); confirm = false; } else confirm = true; } }
  ];
  const rr = i => ({ x: 200, y: 92 + i * 47, w: 560, h: 40 });
  return simpleScene({
    update(dt) { t += dt; },
    draw() {
      bgVillage(t); ctx.fillStyle = 'rgba(40,15,0,.45)'; ctx.fillRect(0, 0, W, H); frame(170, 50, 620, 480); title(L(B('सेटिंग्स', 'Settings')), 50, 30);
      rows().forEach((r, i) => { const q = rr(i); rrect(q.x, q.y, q.w, q.h, 10); fillInk(i % 2 ? '#fff6e0' : '#ffeec8', 1.5); txt(L(r.l), q.x + 16, q.y + 20, 16, C.ink, 'left', FONT, '700'); if (r.minus) { button({ x: q.x + 330, y: q.y + 3, w: 44, h: 34 }, '−', { size: 20 }); txt(r.v, q.x + 430, q.y + 20, 16, C.red, 'center', FONT, '800'); button({ x: q.x + 486, y: q.y + 3, w: 44, h: 34 }, '+', { size: 20 }); } else { button({ x: q.x + 300, y: q.y + 3, w: 250, h: 34 }, r.v, { size: 14 }); } });
      button(backBtn(), L(B('◂ वापस', '◂ Back')), { size: 15 });
    },
    down(x, y) {
      if (inRect(x, y, backBtn())) { save(); return go(back()); }
      rows().forEach((r, i) => { const q = rr(i); if (r.minus) { if (inRect(x, y, { x: q.x + 330, y: q.y, w: 44, h: 40 })) r.minus(); if (inRect(x, y, { x: q.x + 486, y: q.y, w: 44, h: 40 })) r.plus(); } else if (inRect(x, y, { x: q.x + 300, y: q.y, w: 250, h: 40 })) { if (i !== 8) confirm = false; r.a(); } });
      Audio2.applyVol(); Audio2.sfx('click'); if (S.track >= 0) Audio2.playForce(S.track); save();
    }
  });
}

// ---------------- CHHATH GEET MODE ----------------
function Geet() {
  let t = 0, cur = -1; const rr = i => ({ x: 60, y: 110 + i * 62, w: 330, h: 52 });
  return simpleScene({
    enter() { Audio2.setAmb({ river: .6 }); },
    update(dt) { t += dt; },
    draw() {
      const p = PAL.sunset; drawSky(p, t, 700, { sunR: 44 }); drawHills(p, 0, t); drawRiver(372, t, p, t * 5, 700); floatingDiyas(t, 400, 9);
      for (let i = 0; i < 5; i++) person(470 + i * 95, 470, ['vrati', 'chachi', 'kaki', 'dadi', 'maa'][i], { pose: cur >= 0 ? 'offer' : 'pray', t: t + i, s: .85, carry: (a, b) => soop(a, b, .45, true, t) });
      ctx.fillStyle = 'rgba(122,59,82,.85)'; ctx.fillRect(0, 470, W, 70);
      title(L(B('छठ गीत — भक्ति संगीत', 'Chhath Geet — Devotional Music')), 50, 28);
      Audio2.TRACKS.forEach((tr, i) => { const q = rr(i); button(q, (cur === i ? '❚❚  ' : '▶  ') + L(tr.name), { size: 17, c1: cur === i ? '#fff3a0' : undefined }); });
      if (cur >= 0) { for (let i = 0; i < 24; i++) { const h = 8 + Math.abs(Math.sin(t * (3 + i * .3) + i)) * 30; ctx.fillStyle = 'rgba(255,210,74,.8)'; ctx.fillRect(470 + i * 18, 160 - h, 10, h); } }
      wrap(L(B('बाँसुरी, तबला, मंजीरा, घंटियाँ और तानपुरा — ये सभी मूल वाद्य रचनाएँ हैं, लोकधुनों से प्रेरित।', 'Bansuri, tabla, manjira, bells and tanpura drone — all original instrumental compositions inspired by folk melodies.')), 660, 200, 420, 14, '#fff', 1.4, 'center', '700');
      button(backBtn(), L(B('◂ मेनू', '◂ Menu')), { size: 15 });
    },
    down(x, y) {
      if (inRect(x, y, backBtn())) { return go(Menu()); }
      Audio2.TRACKS.forEach((_, i) => { if (inRect(x, y, rr(i))) { if (cur === i) { cur = -1; Audio2.playForce(-1); } else { cur = i; Audio2.playForce(i); } } });
    }
  });
}

// ---------------- VIRTUAL GHAT (sandbox) ----------------
function GhatSandbox() {
  let t = 0, sel = 'diya', drag = null, erase = false, eve = true;
  const pal = ['diya', 'kosi', 'soop', 'daura', 'kalash', 'flower', 'rangoli', 'banana', 'vrati', 'lotus'];
  const palN = { diya: ITEMS.diya, kosi: B('कोसी मंडप', 'Kosi canopy'), soop: ITEMS.soop, daura: ITEMS.daura, kalash: ITEMS.kalash, flower: ITEMS.flower, rangoli: B('रंगोली', 'Rangoli'), banana: B('केले का पौधा', 'Banana plant'), vrati: B('व्रती', 'Devotee'), lotus: B('कमल', 'Lotus') };
  const pr = i => ({ x: 10 + i * 94, y: H - 82, w: 88, h: 74 });
  const btns = { time: { x: W - 300, y: 14, w: 140, h: 40 }, erase: { x: W - 450, y: 14, w: 140, h: 40 }, clear: { x: W - 150, y: 14, w: 136, h: 40 } };
  function drawObj(o, s = 1) {
    switch (o.k) {
      case 'diya': diya(o.x, o.y, 1.2 * s, true, t); break; case 'kosi': ctx.save(); ctx.translate(o.x, o.y); ctx.scale(.8 * s, .8 * s); [-30, -10, 10, 30].forEach(a => { ctx.beginPath(); ctx.moveTo(a, 0); ctx.lineTo(0, -140); strokeInk(6, '#5c8a2a'); }); for (let i = 0; i < 6; i++) { ctx.save(); ctx.translate(0, -140); ctx.rotate(-Math.PI / 2 + (i - 2.5) * .45); ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(25, -10, 45, 6); ctx.quadraticCurveTo(25, 2, 0, 0); fillInk('#6fae3a', 1.5); ctx.restore(); } for (let i = 0; i < 5; i++) diya(-36 + i * 18, 0, .55, true, t); ctx.restore(); break;
      case 'soop': soop(o.x, o.y, .9 * s, true, t); break; case 'daura': daura(o.x, o.y, .9 * s, true, t); break; case 'kalash': kalash(o.x, o.y, 1.1 * s); break;
      case 'flower': item('flower', o.x, o.y, 1.2 * s); break; case 'rangoli': rangoli(o.x, o.y, 50 * s, t); break; case 'banana': tree(o.x, o.y, .7 * s, 'banana', t); break;
      case 'vrati': person(o.x, o.y, 'vrati', { pose: 'offer', s: .8 * s, t, carry: (a, b) => soop(a, b, .45, true, t) }); break; case 'lotus': lotus(o.x, o.y, .9 * s); break;
    }
  }
  return simpleScene({
    enter() { Audio2.play(5); Audio2.setAmb({ river: .8 }); },
    update(dt) { t += dt; },
    draw() {
      const p = eve ? PAL.sunset : PAL.dawn; drawSky(p, t, W / 2); drawHills(p, 0, t); drawRiver(330, t, p, 0, W / 2);
      ghatSteps(0, 330, W + 60, 1); ctx.fillStyle = '#d9a066'; ctx.fillRect(0, 344, W, 120); ctx.fillStyle = C.red; for (let x = 20; x < W; x += 40) { circ(x, 350, 2); ctx.fill(); }
      [...S.ghat].sort((a, b) => a.y - b.y).forEach(o => drawObj(o));
      title(L(B('मेरा घाट — अपना घाट सजाएँ', 'My Ghat — decorate your own')), 72, 22);
      button(btns.time, eve ? L(B('🌅 संध्या', '🌅 Evening')) : L(B('🌄 भोर', '🌄 Dawn')), { size: 14 });
      button(btns.erase, erase ? L(B('✖ हटाना चालू', '✖ Erase ON')) : L(B('हटाएँ', 'Erase')), { size: 14, c1: erase ? '#ffb3a7' : undefined });
      button(btns.clear, L(B('सब साफ़', 'Clear all')), { size: 14 });
      ctx.fillStyle = 'rgba(59,29,11,.85)'; ctx.fillRect(0, H - 90, W, 90);
      pal.forEach((k, i) => { const q = pr(i); rrect(q.x, q.y, q.w, q.h, 10); fillInk(k === sel && !erase ? '#ffd23f' : '#fff6e0', 2); ctx.save(); ctx.beginPath(); ctx.rect(q.x, q.y, q.w, q.h - 16); ctx.clip(); drawObj({ k, x: q.x + q.w / 2, y: q.y + (k === 'kosi' || k === 'banana' || k === 'vrati' ? 56 : k === 'rangoli' ? 30 : 38) }, k === 'kosi' || k === 'banana' || k === 'vrati' ? .4 : .6); ctx.restore(); txt(L(palN[k]), q.x + q.w / 2, q.y + q.h - 9, 11, C.ink, 'center', FONT, '700'); });
      button(backBtn(), L(B('◂ मेनू', '◂ Menu')), { size: 15 });
      if (!S.ghat.length) txtO(L(B('नीचे से कुछ चुनें और घाट पर टैप करें', 'Pick something below and tap on the ghat')), W / 2, 250, 18, '#fff', C.ink, 'center', FONT, 4);
    },
    down(x, y) {
      if (inRect(x, y, backBtn())) { save(); return go(Menu()); }
      if (inRect(x, y, btns.time)) { eve = !eve; return; } if (inRect(x, y, btns.erase)) { erase = !erase; return; } if (inRect(x, y, btns.clear)) { S.ghat = []; save(); return; }
      for (let i = 0; i < pal.length; i++) if (inRect(x, y, pr(i))) { sel = pal[i]; erase = false; Audio2.sfx('click'); return; }
      if (y > H - 90 || y < 60) return;
      const hit = [...S.ghat].reverse().find(o => Math.hypot(o.x - x, (o.y - 20) - y) < 40);
      if (hit) { if (erase) { S.ghat.splice(S.ghat.indexOf(hit), 1); Audio2.sfx('sweep'); save(); } else drag = hit; return; }
      if (!erase && S.ghat.length < 60) { S.ghat.push({ k: sel, x, y: clamp(y, 300, H - 95) }); Audio2.sfx(sel === 'diya' ? 'diya' : 'collect'); save(); }
    },
    move(x, y) { if (drag) { drag.x = x; drag.y = clamp(y, 300, H - 95); } },
    up() { if (drag) { drag = null; save(); } }
  });
}
