// ================= MAIN LOOP =================
let lastT = performance.now();
function frameLoop(now) {
  const dt = Math.min(.05, (now - lastT) / 1000); lastT = now;
  ctx.setTransform(SCALE * DPR, 0, 0, SCALE * DPR, 0, 0);
  ctx.clearRect(0, 0, W, H);
  try {
    if (scene) { scene.update(dt); scene.draw(); }
  } catch (e) { console.error(e); }
  for (const k in pressed) delete pressed[k];
  if (fadeDir) {
    fade += dt * 3 * fadeDir;
    if (fadeDir > 0 && fade >= 1) { fade = 1; scene = nextScene || scene || Menu(); nextScene = null; for (const k in keys) keys[k] = false; scene.enter && scene.enter(); fadeDir = -1; }
    else if (fadeDir < 0 && fade <= 0) { fade = 0; fadeDir = 0; }
  }
  if (fade > 0) { ctx.fillStyle = `rgba(30,10,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  requestAnimationFrame(frameLoop);
}
load(); resize();
// first screen: tap to begin (unlocks audio on browsers that require a gesture)
function Splash() {
  let t = 0;
  return simpleScene({
    update(dt) { t += dt; },
    draw() {
      const p = PAL.predawn; drawSky(p, t, 0, { noSun: true }); drawSun(W / 2, 250, 60, t, { face: true, glow: true }); drawRiver(372, t, p, 0, W / 2);
      txtO('छठ महापर्व', W / 2, 100, 48, '#ffd23f', '#5a1a05', 'center', TFONT, 8);
      txtO('Chhath Mahaparv – The Sacred Journey of Surya Dev', W / 2, 146, 18, '#fff3d6', '#5a1a05', 'center', FONT, 5);
      ctx.globalAlpha = .6 + .4 * Math.sin(t * 3); txtO(IS_TOUCH ? 'शुरू करने के लिए टैप करें · Tap to begin' : 'शुरू करने के लिए क्लिक करें या कोई कुंजी दबाएँ · Click or press any key', W / 2, 430, 20, '#fff', '#3b1d0b', 'center', FONT, 5); ctx.globalAlpha = 1;
      txt('🎧 ध्वनि के साथ खेलें · Best with sound', W / 2, 470, 14, '#ffe9b0', 'center');
    },
    down() { Audio2.unlock(); go(Menu()); },
    key() { Audio2.unlock(); go(Menu()); }
  });
}
go(Splash());
requestAnimationFrame(frameLoop);
if (window.speechSynthesis) try { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); } catch (e) { }
window.__game = { go, World, MINIS, LEVELS, S, get scene() { return scene; } };
