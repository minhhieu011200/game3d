import { voiceFile } from './voiceLines';

export interface AudioLike {
  play(): Promise<void> | void;
  pause(): void;
  onended: (() => void) | null;
  onerror: (() => void) | null;
}

export type AudioFactory = (src: string) => AudioLike;

const defaultFactory: AudioFactory = (src) => new Audio(src) as unknown as AudioLike;

/** Phát lời đọc theo hàng đợi: không bao giờ đọc chồng hai câu. */
export class AudioManager {
  private queue: string[] = [];
  private current: AudioLike | null = null;
  private muted = false;

  constructor(private factory: AudioFactory = defaultFactory) {}

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) this.stop();
  }

  isMuted() {
    return this.muted;
  }

  /** Thêm câu vào hàng đợi. `interrupt` bỏ câu đang đọc và các câu đang chờ. */
  say(keys: string | string[], opts: { interrupt?: boolean } = {}) {
    if (this.muted) return;
    if (opts.interrupt) this.stop();
    this.queue.push(...(Array.isArray(keys) ? keys : [keys]));
    if (!this.current) this.next();
  }

  stop() {
    this.queue = [];
    if (this.current) {
      this.current.onended = null;
      this.current.onerror = null;
      this.current.pause();
      this.current = null;
    }
  }

  isSpeaking() {
    return this.current !== null;
  }

  private next() {
    const key = this.queue.shift();
    if (key === undefined) {
      this.current = null;
      return;
    }
    const a = this.factory(voiceFile(key));
    this.current = a;
    const advance = () => {
      if (this.current === a) this.next();
    };
    a.onended = advance;
    a.onerror = advance; // thiếu file thì bỏ qua câu đó
    try {
      const p = a.play();
      if (p && typeof p.catch === 'function') p.catch(advance);
    } catch {
      advance();
    }
  }
}

export const audio = new AudioManager();

// Hiệu ứng âm thanh tổng hợp bằng WebAudio, không cần file.
let ctx: AudioContext | null = null;
let sfxMuted = false;

export function setSfxMuted(m: boolean) {
  sfxMuted = m;
}

/** Gọi trong một thao tác bấm của người dùng để trình duyệt cho phép phát âm thanh. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === 'suspended') void ctx.resume();
  } catch {
    ctx = null;
  }
}

export type Sfx = 'hop' | 'correct' | 'wrong' | 'pop' | 'whoosh' | 'splash' | 'puff' | 'win';

const SFX: Record<Sfx, Array<[freq: number, start: number, dur: number, type: OscillatorType]>> = {
  hop: [[420, 0, 0.12, 'sine'], [640, 0.06, 0.12, 'sine']],
  correct: [[660, 0, 0.12, 'triangle'], [880, 0.1, 0.18, 'triangle']],
  wrong: [[300, 0, 0.18, 'sawtooth'], [220, 0.15, 0.25, 'sawtooth']],
  pop: [[900, 0, 0.06, 'square']],
  whoosh: [[200, 0, 0.35, 'sine'], [500, 0.05, 0.3, 'sine']],
  splash: [[160, 0, 0.25, 'triangle'], [120, 0.08, 0.3, 'sine']],
  puff: [[120, 0, 0.2, 'sine']],
  win: [[523, 0, 0.15, 'triangle'], [659, 0.15, 0.15, 'triangle'], [784, 0.3, 0.15, 'triangle'], [1047, 0.45, 0.35, 'triangle']],
};

export function sfx(name: Sfx) {
  if (sfxMuted || !ctx) return;
  const now = ctx.currentTime;
  for (const [freq, start, dur, type] of SFX[name]) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now + start);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(type === 'sawtooth' ? 0.08 : 0.18, now + start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.05);
  }
}
