// Vòng quay nến: góc quay thay đổi mỗi khung hình nên giữ ngoài React (giống boatRuntime).

/** Tốc độ quay khi rảnh: 1 vòng / 40 giây. */
export const SPIN = (Math.PI * 2) / 40;
/** Tốc độ tối đa khi chạy về góc "nhà". */
const HOME_MAX_SPEED = 1.2;
/** Hằng thời gian giảm chấn khi về nhà (giây). */
const HOME_TIME = 0.35;
/** Chạm vào nến thì vòng quay đứng yên chừng này giây. */
export const TOUCH_HOLD = 8;

export interface WheelState {
  /** Góc đã quay (rad); bội của 2π là góc "nhà" (cabin ngôi sao ở chỗ cũ). */
  angle: number;
  /** Tốc độ quay hiện tại (rad/giây). */
  speed: number;
}

export const wheelRuntime: WheelState & { touchedUntil: number } = { angle: 0, speed: SPIN, touchedUntil: -Infinity };

export function resetWheel() {
  wheelRuntime.angle = 0;
  wheelRuntime.speed = SPIN;
  wheelRuntime.touchedUntil = -Infinity;
}

/** Ghi nhận vừa chạm một ngọn nến (`now` tính bằng giây). */
export function touchWheel(now: number) {
  wheelRuntime.touchedUntil = now + TOUCH_HOLD;
}

/**
 * Một bước quay. `hold`: phải đứng yên ở góc "nhà" — chạy về bội của 2π gần nhất theo chiều ngắn hơn,
 * giảm chấn tới hạn, không vượt quá đà; hết `hold` thì tăng tốc dần lại tới SPIN.
 */
export function stepWheel(s: WheelState, dt: number, hold: boolean): WheelState {
  if (hold) {
    const home = Math.round(s.angle / (Math.PI * 2)) * Math.PI * 2;
    const err = home - s.angle;
    if (Math.abs(err) < 0.01 && Math.abs(s.speed) < 0.05) return { angle: 0, speed: 0 };
    // giảm chấn tới hạn: a = ω²·err − 2ω·v
    const w = 1 / HOME_TIME;
    let speed = s.speed + (w * w * err - 2 * w * s.speed) * dt;
    speed = Math.max(-HOME_MAX_SPEED, Math.min(HOME_MAX_SPEED, speed));
    let angle = s.angle + speed * dt;
    // không vượt quá đà qua góc nhà
    if (Math.sign(home - angle) !== Math.sign(err) && err !== 0) {
      angle = home;
      speed = 0;
    }
    return { angle: angle - home, speed };
  }
  const speed = s.speed + (SPIN - s.speed) * Math.min(1, dt * 0.8);
  return { angle: s.angle + speed * dt, speed };
}
