const SOUNDS = {
  correct:  '/sfx/mixkit-correct-positive-notification-957.wav',
  wrong:    '/sfx/mixkit-wrong-answer-fail-notification-946.wav',
  tick:     '/sfx/mixkit-simple-game-countdown-921.wav',
  spin:     '/sfx/victorabdo-spin-232536.mp3',
  spinStop: '/sfx/freesound_community-wheel-spin-click-slow-down-101152.mp3',
};

// Browsers block audio not triggered directly by a user gesture.
// On first click/touch we silently play+pause to grant the page audio permission.
let unlocked = false;
function unlockAudio() {
  if (unlocked) return;
  const a = new Audio(SOUNDS.correct);
  a.volume = 0;
  a.play().then(() => {
    a.pause();
    unlocked = true;
    document.removeEventListener('click', unlockAudio);
    document.removeEventListener('touchstart', unlockAudio);
  }).catch(() => {});
}
document.addEventListener('click', unlockAudio);
document.addEventListener('touchstart', unlockAudio);

export function play(name, { volume = 1 } = {}) {
  const src = SOUNDS[name];
  if (!src) return;
  try {
    const audio = new Audio(src);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {}
}
