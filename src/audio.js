// ================= AUDIO: procedural Indian devotional soundscape (all original) =================
const Audio2 = (() => {
  let ac = null, master, musicG, sfxG, ambG, noiseBuf, unlocked = false;
  let curTrack = -1, nextT = 0, step = 0, droneNodes = [], schedTimer = null;
  const amb = { river: null, crowd: null, wind: null }, ambLv = { river: 0, crowd: 0, wind: 0, birds: 0 };
  let birdT = 0;

  const TRACKS = [
    { name: B('गाँव की सुबह', 'Village Morning'), bpm: 84, root: 261.6, scale: [0, 2, 4, 7, 9], tal: 'keherwa', seed: 11, bells: 0, manj: .5 },
    { name: B('रसोई की महक', 'Kitchen Aroma'), bpm: 96, root: 277.2, scale: [0, 2, 4, 5, 7, 9, 10], tal: 'dadra', seed: 23, bells: 0, manj: .4 },
    { name: B('संध्या धुन', 'Sandhya Dhun'), bpm: 64, root: 246.9, scale: [0, 2, 4, 6, 7, 9, 11], tal: 'slow', seed: 37, bells: 1, manj: .2 },
    { name: B('उषा राग', 'Usha Raag'), bpm: 58, root: 261.6, scale: [0, 1, 4, 5, 7, 8, 11], tal: 'slow', seed: 41, bells: 1, manj: .15 },
    { name: B('महापर्व उत्सव', 'Mahaparv Utsav'), bpm: 120, root: 293.7, scale: [0, 2, 4, 5, 7, 9, 11], tal: 'keherwa', seed: 53, bells: 0, manj: 1 },
    { name: B('घाट की लहर', 'Waves of the Ghat'), bpm: 72, root: 220, scale: [0, 2, 3, 7, 9], tal: 'dadra', seed: 67, bells: 1, manj: .3 },
  ];
  const TALS = {
    keherwa: ['dha', 'ge', 'na', 'ti', 'na', 'ka', 'dhi', 'na'],
    dadra: ['dha', 'dhi', 'na', 'dha', 'ti', 'na'],
    slow: ['dha', '', 'na', '', 'ti', '', 'na', '']
  };
  const melodies = {};
  function makeMelody(t) {
    const r = seeded(t.seed * 977), n = t.scale.length, out = [];
    // 4 phrases; each phrase = list of [degree(octave-aware), beats]
    const motifs = [];
    for (let m = 0; m < 2; m++) { const mot = []; let d = Math.floor(r() * n); for (let i = 0; i < 4; i++) { d += Math.floor(r() * 3) - 1; mot.push(d); } motifs.push(mot); }
    for (let p = 0; p < 4; p++) {
      const ph = []; let d = p % 2 ? n : Math.floor(n / 2);
      const mot = motifs[p % 2];
      for (let i = 0; i < 4; i++) ph.push([mot[i] + (p === 2 ? 2 : 0), r() < .3 ? 2 : 1]);
      for (let i = 0; i < 3; i++) { d += Math.floor(r() * 3) - 1; d = clamp(d, 0, n * 2 - 1); ph.push([d, r() < .25 ? .5 : 1]); if (ph[ph.length - 1][1] === .5) ph.push([d + 1, .5]); }
      ph.push([p === 3 ? 0 : (p === 1 ? n : 2), p === 3 ? 4 : 2]); // resolve
      ph.push([null, 1]);
      out.push(...ph);
    }
    return out;
  }
  function freqOf(t, deg) { const n = t.scale.length; const oct = Math.floor(deg / n), i = ((deg % n) + n) % n; return t.root * Math.pow(2, oct + t.scale[i] / 12); }

  function init() {
    if (ac) return;
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
    master = ac.createGain(); master.connect(ac.destination);
    musicG = ac.createGain(); musicG.connect(master);
    sfxG = ac.createGain(); sfxG.connect(master);
    ambG = ac.createGain(); ambG.connect(master);
    noiseBuf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);
    const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    // reverb-ish convolver
    applyVol();
    schedTimer = setInterval(tick, 40);
  }
  function applyVol() {
    if (!ac) return;
    master.gain.value = S.vol;
    musicG.gain.setTargetAtTime(S.music ? .55 : 0, ac.currentTime, .2);
    sfxG.gain.setTargetAtTime(S.sfx ? .8 : 0, ac.currentTime, .05);
    ambG.gain.setTargetAtTime(S.sfx ? .5 : 0, ac.currentTime, .2);
  }
  function unlock() {
    init(); if (!ac) return;
    if (ac.state === 'suspended') ac.resume();
    if (!unlocked) { unlocked = true; if (pendingTrack >= 0) play(pendingTrack); applyAmb(); }
  }
  let pendingTrack = -1;

  // ---------- instruments ----------
  function env(g, t, a, peak, dec, sus = 0.0001) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(Math.max(sus, 0.0001), t + a + dec); }
  function bansuri(f, t, dur, vol = .22) {
    const o = ac.createOscillator(), o2 = ac.createOscillator(), g = ac.createGain(), lp = ac.createBiquadFilter();
    o.type = 'sine'; o2.type = 'triangle'; o.frequency.value = f; o2.frequency.value = f * 2;
    const g2 = ac.createGain(); g2.gain.value = .12;
    const vib = ac.createOscillator(), vg = ac.createGain(); vib.frequency.value = 5.2; vg.gain.setValueAtTime(0, t); vg.gain.linearRampToValueAtTime(f * .012, t + Math.min(dur, .6));
    vib.connect(vg); vg.connect(o.frequency); vg.connect(o2.frequency);
    // slight glide in (meend)
    o.frequency.setValueAtTime(f * .985, t); o.frequency.exponentialRampToValueAtTime(f, t + .08);
    lp.type = 'lowpass'; lp.frequency.value = 2600;
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(lp); lp.connect(musicG);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .07); g.gain.setValueAtTime(vol, t + dur * .7); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + .25);
    // breath
    const n = ac.createBufferSource(), bp = ac.createBiquadFilter(), ng = ac.createGain(); n.buffer = noiseBuf; bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 4;
    ng.gain.setValueAtTime(0.0001, t); ng.gain.exponentialRampToValueAtTime(vol * .25, t + .04); ng.gain.exponentialRampToValueAtTime(0.0001, t + .25);
    n.connect(bp); bp.connect(ng); ng.connect(musicG);
    [o, o2, vib].forEach(x => { x.start(t); x.stop(t + dur + .3); }); n.start(t); n.stop(t + .3);
  }
  function tabla(bol, t, vol = 1) {
    if (!bol) return;
    const bass = bol.startsWith('dh') || bol === 'ge';
    if (bass) { // bayan
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine';
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(70, t + .25);
      env(g, t, .005, .5 * vol, .35); o.connect(g); g.connect(musicG); o.start(t); o.stop(t + .45);
    }
    if (bol !== 'ge') { // dayan
      const f = bol === 'ti' ? 760 : 520;
      [1, 1.5, 2.02].forEach((m, i) => {
        const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f * m;
        env(g, t, .003, (.22 / (i + 1)) * vol, bol === 'ka' ? .05 : .22); o.connect(g); g.connect(musicG); o.start(t); o.stop(t + .3);
      });
      const n = ac.createBufferSource(), hp = ac.createBiquadFilter(), ng = ac.createGain(); n.buffer = noiseBuf; hp.type = 'highpass'; hp.frequency.value = 2500;
      env(ng, t, .002, .12 * vol, .03); n.connect(hp); hp.connect(ng); ng.connect(musicG); n.start(t, Math.random()); n.stop(t + .06);
    }
  }
  function manjira(t, vol = .1) {
    const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 5000; const g = ac.createGain(); env(g, t, .002, vol, .6);
    hp.connect(g); g.connect(musicG);
    [3150, 4270, 5340, 6680].forEach(f => { const o = ac.createOscillator(); o.type = 'square'; o.frequency.value = f; o.connect(hp); o.start(t); o.stop(t + .7); });
  }
  function bell(t, f = 880, vol = .15, out) {
    [1, 2.76, 5.4, 8.93].forEach((m, i) => { const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine'; o.frequency.value = f * m; env(g, t, .002, vol / (i + 1.3), 2.2 / (i + 1)); o.connect(g); g.connect(out || musicG); o.start(t); o.stop(t + 2.5); });
  }
  function startDrone(tr) {
    stopDrone();
    const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700; lp.Q.value = 1;
    const g = ac.createGain(); g.gain.value = 0; g.gain.setTargetAtTime(.05, ac.currentTime, 1.5);
    lp.connect(g); g.connect(musicG);
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .15; lg.gain.value = 250; lfo.connect(lg); lg.connect(lp.frequency); lfo.start();
    const fs = [tr.root / 2, tr.root / 2 * 1.5, tr.root, tr.root / 4];
    const os = fs.map((f, i) => { const o = ac.createOscillator(); o.type = i === 3 ? 'triangle' : 'sawtooth'; o.frequency.value = f; o.detune.value = (i - 1.5) * 4; o.connect(lp); o.start(); return o; });
    droneNodes = [...os, lfo, g];
  }
  function stopDrone() {
    droneNodes.forEach(n => { try { if (n.gain) { n.gain.setTargetAtTime(0, ac.currentTime, .3); } else n.stop(ac.currentTime + 1.2); } catch (e) { } });
    droneNodes = [];
  }
  let melIdx = 0, melBeat = 0;
  function play(i) {
    if (S.track >= 0 && i >= 0 && !forceTrack) i = S.track;
    pendingTrack = i;
    if (!ac || !unlocked) return;
    if (i === curTrack) return;
    curTrack = i; if (i < 0) { stopDrone(); return; }
    const tr = TRACKS[i]; if (!melodies[i]) melodies[i] = makeMelody(tr);
    startDrone(tr); nextT = ac.currentTime + .3; step = 0; melIdx = 0; melBeat = 0;
  }
  let forceTrack = false;
  function playForce(i) { forceTrack = true; curTrack = -2; play(i); forceTrack = false; }
  function tick() {
    if (!ac || curTrack < 0) { ambTick(); return; }
    const tr = TRACKS[curTrack], spb = 60 / tr.bpm / 2; // eighth-note steps
    const tal = TALS[tr.tal], mel = melodies[curTrack];
    while (nextT < ac.currentTime + .15) {
      const t = nextT;
      if (S.music) {
        tabla(tal[step % tal.length], t, tr.tal === 'slow' ? .6 : .85);
        if (tr.manj && step % 4 === 0 && Math.random() < tr.manj) manjira(t, .05 + tr.manj * .05);
        if (tr.bells && step % 32 === 0) bell(t, tr.root * 2, .1);
        // melody: beat units = 2 steps
        if (melBeat <= 0) {
          const [deg, beats] = mel[melIdx % mel.length]; melIdx++;
          const dur = beats * spb * 2;
          if (deg !== null) bansuri(freqOf(tr, deg + tr.scale.length), t, dur * .95, .16);
          melBeat = beats * 2;
        }
      }
      melBeat--; step++; nextT += spb;
    }
    ambTick();
  }
  // ---------- ambience ----------
  function loopNoise(type, f, q) {
    const n = ac.createBufferSource(); n.buffer = noiseBuf; n.loop = true;
    const fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q;
    const g = ac.createGain(); g.gain.value = 0; n.connect(fl); fl.connect(g); g.connect(ambG); n.start();
    const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .2 + Math.random() * .2; lg.gain.value = f * .3; lfo.connect(lg); lg.connect(fl.frequency); lfo.start();
    return g;
  }
  function applyAmb() {
    if (!ac || !unlocked) return;
    if (!amb.river) { amb.river = loopNoise('lowpass', 450, 1); amb.crowd = loopNoise('bandpass', 700, .7); amb.wind = loopNoise('bandpass', 300, .5); }
    amb.river.gain.setTargetAtTime(ambLv.river * .5, ac.currentTime, .8);
    amb.crowd.gain.setTargetAtTime(ambLv.crowd * .12, ac.currentTime, .8);
    amb.wind.gain.setTargetAtTime(ambLv.wind * .35, ac.currentTime, .8);
  }
  function setAmb(o) { Object.assign(ambLv, { river: 0, crowd: 0, wind: 0, birds: 0 }, o); applyAmb(); }
  function ambTick() {
    if (!ac || !unlocked || !S.sfx) return;
    if (ambLv.birds > 0 && ac.currentTime > birdT) { birdT = ac.currentTime + rand(1.2, 4) / ambLv.birds; chirp(); }
  }
  function chirp() {
    const t = ac.currentTime + .05, n = 2 + Math.floor(Math.random() * 4), base = rand(2200, 3800);
    for (let i = 0; i < n; i++) {
      const o = ac.createOscillator(), g = ac.createGain(); o.type = 'sine';
      const s = t + i * rand(.08, .14); o.frequency.setValueAtTime(base, s); o.frequency.exponentialRampToValueAtTime(base * rand(1.2, 1.6), s + .06);
      env(g, s, .005, .05, .07); o.connect(g); g.connect(ambG); o.start(s); o.stop(s + .12);
    }
  }
  // ---------- sfx ----------
  function tone(f, t, d, type = 'sine', v = .2, f2) {
    const o = ac.createOscillator(), g = ac.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    env(g, t, .005, v, d); o.connect(g); g.connect(sfxG); o.start(t); o.stop(t + d + .05);
  }
  function noise(t, d, type, f, v) {
    const n = ac.createBufferSource(), fl = ac.createBiquadFilter(), g = ac.createGain(); n.buffer = noiseBuf; fl.type = type; fl.frequency.value = f;
    env(g, t, .01, v, d); n.connect(fl); fl.connect(g); g.connect(sfxG); n.start(t, Math.random()); n.stop(t + d + .05);
  }
  function sfx(name) {
    if (!ac || !unlocked || !S.sfx) return; const t = ac.currentTime + .01;
    switch (name) {
      case 'collect': tone(880, t, .12, 'triangle', .18); tone(1318, t + .07, .2, 'triangle', .16); break;
      case 'jump': tone(300, t, .18, 'sine', .12, 600); break;
      case 'step': noise(t, .05, 'lowpass', 900, .06); break;
      case 'diya': noise(t, .25, 'bandpass', 1800, .2); tone(440, t + .05, .5, 'sine', .08, 660); break;
      case 'complete': bell(t, 660, .25, sfxG); tone(990, t + .15, .3, 'triangle', .12); tone(1320, t + .3, .5, 'triangle', .12); break;
      case 'level': bell(t, 523, .3, sfxG); bell(t + .25, 784, .25, sfxG); bell(t + .5, 1046, .25, sfxG); break;
      case 'inv': tone(320, t, .08, 'triangle', .25); tone(240, t + .06, .1, 'triangle', .2); break;
      case 'click': tone(700, t, .05, 'triangle', .15); break;
      case 'wrong': tone(300, t, .2, 'sine', .15, 220); break;
      case 'sweep': noise(t, .35, 'highpass', 2500, .15); break;
      case 'splash': noise(t, .5, 'lowpass', 1200, .3); tone(500, t, .15, 'sine', .08, 200); break;
      case 'talk': tone(520 + Math.random() * 80, t, .06, 'triangle', .07); break;
      case 'pour': noise(t, 1.4, 'bandpass', 900, .18); break;
      case 'bell': bell(t, 880, .3, sfxG); break;
      case 'shutter': noise(t, .08, 'highpass', 3000, .3); tone(1200, t + .05, .05, 'square', .05); break;
    }
  }
  return { unlock, play, playForce, sfx, setAmb, applyVol, TRACKS, get cur() { return curTrack; }, get ok() { return !!ac; } };
})();
