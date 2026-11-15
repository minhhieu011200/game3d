/**
 * Nhạc nền và hiệu ứng âm thanh tổng hợp bằng WebAudio: không cần file, chạy offline.
 * Trình duyệt chỉ cho phát tiếng sau một lần bấm, nên `unlockSound()` được gọi ở thao tác bấm đầu tiên.
 */

export type Sfx = 'gate' | 'sip' | 'equation' | 'correct' | 'wrong';

type Wave = OscillatorType;
/** [tần số Hz, bắt đầu (s), độ dài (s), dạng sóng, âm lượng, trượt tới tần số] */
type Note = [freq: number, start: number, dur: number, wave: Wave, vol: number, glide?: number];

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

const SFX: Record<Sfx, Note[]> = {
  // vào cổng: chuỗi nốt đi lên lấp lánh
  gate: [72, 76, 79, 84, 88].map((n, i): Note => [midi(n), i * 0.07, 0.35, 'triangle', 0.16]).concat([[midi(96), 0.36, 0.5, 'sine', 0.06]]),
  // bướm hút mật: ba tiếng "chụt" nhỏ rồi một tiếng lấp lánh
  sip: [
    [620, 0, 0.09, 'sine', 0.14, 950],
    [660, 0.12, 0.09, 'sine', 0.14, 1000],
    [700, 0.24, 0.09, 'sine', 0.14, 1050],
    [midi(91), 0.38, 0.35, 'triangle', 0.08],
  ],
  // phép tính hiện ra: "bụp" rồi "ting"
  equation: [
    [380, 0, 0.09, 'sine', 0.18, 1000],
    [midi(88), 0.08, 0.4, 'triangle', 0.12],
  ],
  // trả lời đúng: ta-da vui vẻ
  correct: [
    [midi(72), 0, 0.12, 'triangle', 0.16],
    [midi(76), 0.09, 0.12, 'triangle', 0.16],
    [midi(79), 0.18, 0.12, 'triangle', 0.16],
    [midi(84), 0.27, 0.45, 'triangle', 0.18],
    [midi(96), 0.3, 0.4, 'sine', 0.05],
  ],
  // trả lời sai: "ơ-ơ" nhẹ nhàng, không chói
  wrong: [
    [midi(67), 0, 0.2, 'triangle', 0.15, midi(66)],
    [midi(63), 0.22, 0.35, 'triangle', 0.15, midi(60)],
  ],
};

// Nhạc nền tự sáng tác: giai điệu Đô trưởng, 8 ô nhịp lặp lại. [nốt MIDI (0 = nghỉ), số móc đơn]
const MELODY: Array<[number, number]> = [
  [72, 1], [76, 1], [79, 2], [76, 1], [74, 1], [72, 2],
  [74, 1], [76, 1], [77, 2], [76, 1], [74, 1], [79, 2],
  [72, 1], [76, 1], [79, 2], [81, 1], [79, 1], [76, 2],
  [77, 1], [76, 1], [74, 1], [71, 1], [72, 4],
  [76, 2], [76, 1], [77, 1], [79, 2], [79, 2],
  [81, 1], [79, 1], [77, 1], [76, 1], [74, 4],
  [77, 2], [77, 1], [76, 1], [74, 2], [74, 2],
  [76, 1], [74, 1], [72, 1], [71, 1], [72, 4],
];
/** Bè trầm: mỗi ô nhịp 4 nốt đen. */
const BASS = [
  [48, 55, 48, 55], [43, 50, 43, 50], [48, 55, 45, 52], [43, 50, 48, 48],
  [48, 55, 48, 55], [41, 48, 43, 50], [38, 45, 38, 45], [43, 50, 48, 48],
];
const EIGHTH = 60 / 112 / 2;
const MUSIC_VOL = 0.13;
/** Nhân âm lượng hiệu ứng (giáo viên yêu cầu to hơn để cả lớp nghe rõ). */
const SFX_GAIN = 2;

const KEY = 'trochoi-toan1.sound';
function loadPrefs(): { music: boolean; sfx: boolean } {
  try {
    const v = JSON.parse(window.localStorage.getItem(KEY) ?? '{}');
    return { music: v.music !== false, sfx: v.sfx !== false };
  } catch {
    return { music: true, sfx: true };
  }
}

let ctx: AudioContext | null = null;
let musicBus: GainNode | null = null;
const prefs = typeof window === 'undefined' ? { music: true, sfx: true } : loadPrefs();
let timer: number | null = null;
let nextAt = 0;
let melodyIdx = 0;
let beat = 0;

function savePrefs() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {
    // trình duyệt chặn lưu trữ: vẫn dùng được, chỉ không nhớ lựa chọn
  }
}

function tone(dest: AudioNode, [freq, start, dur, wave, vol, glide]: Note, at: number) {
  const c = ctx!;
  const osc = c.createOscillator();
  const gain = c.createGain();
  const t = at + start;
  osc.type = wave;
  osc.frequency.setValueAtTime(freq, t);
  if (glide) osc.frequency.exponentialRampToValueAtTime(glide, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

/** Lên lịch nhạc trước khoảng 0,4 giây, chạy mỗi 100 ms. */
function schedule() {
  if (!ctx || !musicBus) return;
  while (nextAt < ctx.currentTime + 0.4) {
    const [n, len] = MELODY[melodyIdx];
    if (n) tone(musicBus, [midi(n), 0, len * EIGHTH * 0.9, 'triangle', 0.9], nextAt);
    // bè trầm theo từng phách (2 móc đơn), tính theo vị trí trong bài
    for (let k = 0; k < len; k++) {
      const pos = beat + k;
      if (pos % 2 === 0) {
        const bar = Math.floor(pos / 8) % BASS.length;
        tone(musicBus, [midi(BASS[bar][(pos % 8) / 2]), k * EIGHTH, EIGHTH * 1.6, 'sine', 0.8], nextAt);
      }
    }
    beat = (beat + len) % (BASS.length * 8);
    nextAt += len * EIGHTH;
    melodyIdx = (melodyIdx + 1) % MELODY.length;
  }
}

/** Đang ở trong một trò chơi: nhạc nền nghỉ, chỉ còn hiệu ứng. */
let inGame = false;

export function setInGame(on: boolean) {
  inGame = on;
  if (on) stopMusic();
  else startMusic();
}

function startMusic() {
  if (!ctx || timer !== null || !prefs.music || inGame) return;
  musicBus = ctx.createGain();
  musicBus.gain.value = MUSIC_VOL;
  musicBus.connect(ctx.destination);
  nextAt = ctx.currentTime + 0.1;
  melodyIdx = 0;
  beat = 0;
  timer = window.setInterval(schedule, 100);
  schedule();
}

function stopMusic() {
  if (timer !== null) window.clearInterval(timer);
  timer = null;
  // tắt dần để không nghe tiếng "bụp"
  if (ctx && musicBus) {
    musicBus.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
    const bus = musicBus;
    window.setTimeout(() => bus.disconnect(), 400);
  }
  musicBus = null;
}

/** Gọi trong một thao tác bấm/phím của người dùng. */
export function unlockSound() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
    startMusic();
  } catch {
    ctx = null;
  }
}

/** Phát một hiệu ứng, sau `delay` giây (ví dụ chờ bướm bay tới hoa). */
export function sfx(name: Sfx, delay = 0) {
  if (!ctx || !prefs.sfx) return;
  const at = ctx.currentTime + delay;
  for (const n of SFX[name]) tone(ctx.destination, [n[0], n[1], n[2], n[3], n[4] * SFX_GAIN, n[5]], at);
}

export const soundPrefs = () => ({ ...prefs });

export function setMusicOn(on: boolean) {
  prefs.music = on;
  savePrefs();
  if (on) startMusic();
  else stopMusic();
}

export function setSfxOn(on: boolean) {
  prefs.sfx = on;
  savePrefs();
}

/** Dùng cho test: độ dài một vòng nhạc phải khớp số ô nhịp của bè trầm. */
export const MUSIC_EIGHTHS = MELODY.reduce((n, [, len]) => n + len, 0);
export const BASS_EIGHTHS = BASS.length * 8;
