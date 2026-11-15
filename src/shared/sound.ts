/**
 * Nhạc nền và hiệu ứng âm thanh tổng hợp bằng WebAudio: không cần file, chạy offline.
 * Trình duyệt chỉ cho phát tiếng sau một lần bấm, nên `unlockSound()` được gọi ở thao tác bấm đầu tiên.
 */

type ToneSfx = 'gate' | 'sip' | 'equation' | 'correct' | 'wrong';
export type Sfx = ToneSfx | 'frog' | 'stork' | 'hatch';

type Wave = OscillatorType;
/** [tần số Hz, bắt đầu (s), độ dài (s), dạng sóng, âm lượng, trượt tới tần số] */
type Note = [freq: number, start: number, dur: number, wave: Wave, vol: number, glide?: number];

const midi = (n: number) => 440 * 2 ** ((n - 69) / 12);

const SFX: Record<ToneSfx, Note[]> = {
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

// ---------- Tiếng con vật (Bài 4): tiếng ồn lọc + tiếng kêu rung, gần tiếng thật hơn sóng đơn ----------

let noiseBuf: AudioBuffer | null = null;
function noiseBuffer(c: AudioContext) {
  if (!noiseBuf) {
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  }
  return noiseBuf;
}

/** Tiếng ồn trắng qua bộ lọc có tần số trượt từ f0 tới f1: nước bắn, gió cánh, vỏ trứng nứt. */
function noise(dest: AudioNode, t: number, dur: number, vol: number, type: BiquadFilterType, f0: number, f1: number, q = 1) {
  const c = ctx!;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer(c);
  const f = c.createBiquadFilter();
  f.type = type;
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t);
  f.frequency.exponentialRampToValueAtTime(f1, t + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.012, dur / 4));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(f).connect(g).connect(dest);
  src.start(t, Math.random() * 0.5);
  src.stop(t + dur + 0.05);
}

/** Tiếng ếch "ộp": sóng răng cưa trầm qua lọc dải, rung nhanh (~30 lần/giây) cho ra tiếng rè rè của ếch. */
function croak(dest: AudioNode, t: number, freq: number, dur: number, vol: number) {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(freq, t);
  osc.frequency.exponentialRampToValueAtTime(freq * 0.8, t + dur);
  const bp = c.createBiquadFilter();
  bp.type = 'bandpass';
  bp.frequency.value = 800;
  bp.Q.value = 2.5;
  const am = c.createGain();
  am.gain.value = 0.5;
  const lfo = c.createOscillator();
  lfo.type = 'square';
  lfo.frequency.value = 32;
  const depth = c.createGain();
  depth.gain.value = 0.5;
  lfo.connect(depth).connect(am.gain);
  const env = c.createGain();
  env.gain.setValueAtTime(0.0001, t);
  env.gain.exponentialRampToValueAtTime(vol, t + 0.015);
  env.gain.setValueAtTime(vol, t + dur * 0.6);
  env.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(bp).connect(am).connect(env).connect(dest);
  for (const o of [osc, lfo]) {
    o.start(t);
    o.stop(t + dur + 0.05);
  }
}

/** Tiếng gà con "chiếp": lên cao rồi rơi xuống thật nhanh. */
function peep(dest: AudioNode, t: number, vol: number) {
  const c = ctx!;
  const osc = c.createOscillator();
  osc.type = 'sine';
  const base = 3000 + Math.random() * 400;
  osc.frequency.setValueAtTime(base, t);
  osc.frequency.exponentialRampToValueAtTime(base * 1.4, t + 0.04);
  osc.frequency.exponentialRampToValueAtTime(base * 1.15, t + 0.1);
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
  osc.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + 0.15);
}

type AnimalSfx = 'frog' | 'stork' | 'hatch';
const ANIMALS: Record<AnimalSfx, (d: AudioNode, at: number, k: number) => void> = {
  // các con vật làm cùng lúc nên là một lượt chung, tiếng chồng lên nhau (lệch vài phần trăm giây cho tự nhiên)
  // ếch cùng nhảy: dàn "ộp ộp" rồi một tiếng "tõm" lớn
  frog: (d, at, k) => {
    for (let i = 0; i < 5; i++) {
      const j = Math.random() * 0.04;
      croak(d, at + j, 190 + i * 15, 0.13, 0.12 * k);
      croak(d, at + 0.16 + j, 175 + i * 15, 0.15, 0.12 * k);
    }
    noise(d, at + 0.36, 0.45, 0.5 * k, 'lowpass', 3500, 250);
    tone(d, [480, 0, 0.16, 'sine', 0.18 * k, 140], at + 0.36);
  },
  // cò cùng bay: "phạch phạch" vỗ cánh rồi mỏ gõ lách cách
  stork: (d, at, k) => {
    for (let i = 0; i < 4; i++) {
      noise(d, at + i * 0.2, 0.16, 0.4 * k, 'bandpass', 1100, 350, 0.9);
      noise(d, at + i * 0.2 + 0.03, 0.16, 0.3 * k, 'bandpass', 900, 300, 0.9);
    }
    for (let i = 0; i < 10; i++) noise(d, at + 0.9 + i * 0.045, 0.025, 0.25 * k, 'bandpass', 2600, 2200, 4);
  },
  // trứng cùng nở: vỏ nứt "rắc" rồi gà con "chiếp chiếp" cùng lúc
  hatch: (d, at, k) => {
    noise(d, at, 0.05, 0.45 * k, 'highpass', 3500, 2500, 0.7);
    noise(d, at + 0.09, 0.06, 0.4 * k, 'bandpass', 2200, 1800, 1.5);
    for (let i = 0; i < 3; i++) {
      const j = Math.random() * 0.05;
      peep(d, at + 0.25 + j, 0.06 * k);
      peep(d, at + 0.4 + j, 0.06 * k);
    }
  },
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
  if (name === 'frog' || name === 'stork' || name === 'hatch') return ANIMALS[name](ctx.destination, at, SFX_GAIN / 2);
  for (const n of SFX[name]) tone(ctx.destination, [n[0], n[1], n[2], n[3], n[4] * SFX_GAIN, n[5]], at);
}

let fwNoise: AudioBuffer | null = null;
/** Vang ngoài trời: tiếng nổ dội lại kéo dài vài giây như pháo hoa thật. */
let fwBus: AudioNode | null = null;

function fireworkBus(c: AudioContext) {
  if (fwBus) return fwBus;
  fwNoise = c.createBuffer(1, c.sampleRate * 4, c.sampleRate);
  const d = fwNoise.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  // xung vang 3,5 giây: tiếng ồn tắt dần, hai kênh khác nhau cho rộng
  const len = c.sampleRate * 3.5;
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const v = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) v[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 3;
  }
  const verb = c.createConvolver();
  verb.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.6;
  const bus = c.createGain();
  bus.connect(c.destination);
  bus.connect(verb).connect(wet).connect(c.destination);
  return (fwBus = bus);
}

/** Pháo hoa: tiếng xì bay lên (`rise` giây), tiếng "đùng" trầm có vang, rồi tràng lách tách. Chỉ dùng tiếng ồn, không có nốt nhạc. */
export function firework(rise: number) {
  if (!ctx || !prefs.sfx) return;
  const c = ctx;
  const out = fireworkBus(c);
  const noise = (at: number, dur: number, vol: number, type: BiquadFilterType, from: number, to = from, attack = 0.003) => {
    const src = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const gain = c.createGain();
    src.buffer = fwNoise;
    filter.type = type;
    filter.frequency.setValueAtTime(from, at);
    filter.frequency.exponentialRampToValueAtTime(to, at + dur);
    gain.gain.setValueAtTime(0.0001, at);
    gain.gain.exponentialRampToValueAtTime(vol, at + attack);
    gain.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    src.connect(filter).connect(gain).connect(out);
    src.start(at, Math.random() * 1.5);
    src.stop(at + dur + 0.05);
  };
  const t = c.currentTime;
  // tiếng xì của tên lửa bay lên: ồn dải hẹp, cao dần
  noise(t, rise, 0.05 * SFX_GAIN, 'bandpass', 1500, 4000, rise * 0.6);
  const boom = t + rise;
  // "đùng": thân trầm rền và lớp vỡ sáng
  noise(boom, 2.2, 0.9 * SFX_GAIN, 'lowpass', 600, 60);
  noise(boom, 0.35, 0.35 * SFX_GAIN, 'lowpass', 3500, 400);
  // tràng lách tách của tàn pháo rơi
  const crackles = 25 + Math.floor(Math.random() * 20);
  for (let i = 0; i < crackles; i++) noise(boom + 0.4 + Math.random() * 1.8, 0.02 + Math.random() * 0.03, (0.05 + Math.random() * 0.1) * SFX_GAIN, 'highpass', 2500);
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
