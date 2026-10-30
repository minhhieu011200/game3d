// Co giãn (squash & stretch) khi nhấc lên / thả xuống: lò xo tắt dần, hàm thuần.

export interface Spring {
  /** Tỉ lệ chiều cao hiện tại (1 = bình thường). */
  x: number;
  v: number;
}

/** Cứng và giảm chấn vừa đủ: nảy nhẹ (dưới 10%) rồi về yên trong khoảng 0,35 giây. */
const K = 300;
const C = 22;

export function stepSpring(s: Spring, target: number, dt: number): Spring {
  // chia nhỏ bước để ổn định cả khi khung hình chậm
  const n = Math.max(1, Math.ceil(dt / (1 / 120)));
  const h = dt / n;
  let { x, v } = s;
  for (let i = 0; i < n; i++) {
    v += (K * (target - x) - C * v) * h;
    x += v * h;
  }
  return { x, v };
}

/** Nhấc lên: kéo dài theo chiều cao. */
export const LIFT = 1.15;
/** Vừa chạm đất / nước: dẹt xuống rồi nảy về 1. */
export const LAND = 0.78;
