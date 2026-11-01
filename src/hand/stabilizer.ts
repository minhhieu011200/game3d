// Làm mượt số ngón theo thời gian và phát sự kiện "chốt" khi giữ ổn định đủ lâu.

export interface StabilizerOptions {
  /** Thời gian phải giữ nguyên để chốt (ms). */
  holdMs?: number;
  /** Số khung hình gần nhất dùng để lấy giá trị xuất hiện nhiều nhất. */
  window?: number;
}

export interface StabilizerState {
  /** Số ngón đã làm mượt; `null` = không thấy tay. */
  stable: number | null;
  /** 0..1, tiến độ giữ để chốt. */
  progress: number;
  /** Có giá trị khi vừa chốt ở lần cập nhật này (chỉ một lần). */
  committed: number | null;
}

export class FingerStabilizer {
  private holdMs: number;
  private size: number;
  private samples: Array<number | null> = [];
  private stable: number | null = null;
  private holdStart = 0;
  private locked: number | null = null;

  constructor(opts: StabilizerOptions = {}) {
    this.holdMs = opts.holdMs ?? 700;
    this.size = opts.window ?? 5;
  }

  update(raw: number | null, now: number): StabilizerState {
    this.samples.push(raw);
    if (this.samples.length > this.size) this.samples.shift();

    const next = this.mode();
    if (next !== this.stable) {
      this.stable = next;
      this.holdStart = now;
      // Đổi giá trị hoặc mất tay thì mở khóa để chốt lại được.
      if (next !== this.locked) this.locked = null;
    }

    if (this.stable === null) return { stable: null, progress: 0, committed: null };
    if (this.locked === this.stable) return { stable: this.stable, progress: 1, committed: null };

    const progress = Math.min(1, (now - this.holdStart) / this.holdMs);
    if (progress >= 1) {
      this.locked = this.stable;
      return { stable: this.stable, progress: 1, committed: this.stable };
    }
    return { stable: this.stable, progress, committed: null };
  }

  /** Bỏ khóa và tiến độ, ví dụ khi sang câu hỏi mới mà vẫn muốn chốt lại cùng giá trị. */
  reset() {
    this.samples = [];
    this.stable = null;
    this.locked = null;
  }

  private mode(): number | null {
    const counts = new Map<number | null, number>();
    for (const s of this.samples) counts.set(s, (counts.get(s) ?? 0) + 1);
    let best: number | null = this.stable;
    let bestCount = counts.get(this.stable) ?? 0; // hòa thì giữ giá trị cũ
    for (const [v, c] of counts) {
      if (c > bestCount) {
        best = v;
        bestCount = c;
      }
    }
    return best;
  }
}
