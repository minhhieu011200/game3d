// Chuyển động của thuyền: hàm thuần, cảnh 3D gọi mỗi khung hình.
import { clampBoat, riverCenterZ, riverHeading, RIVER_HALF_WIDTH } from './world';
import { WHEEL, ZONES } from './layout';

export interface BoatState {
  x: number;
  z: number;
  /** Góc mũi thuyền quanh trục y (0 = hướng +z). */
  heading: number;
  /** Vận tốc theo hướng mũi thuyền (m/giây), âm là lùi. */
  speed: number;
}

export interface BoatInput {
  forward: boolean;
  back: boolean;
  left: boolean;
  right: boolean;
}

export const MAX_SPEED = 7;
const ACCEL = 4.5;
const DRAG = 1.6;
const TURN = 1.4; // rad/giây khi chạy hết tốc độ

export interface Dock {
  id: string;
  label: string;
  /** Vị trí dọc sông mà thuyền dừng lại. */
  x: number;
  /** Điểm camera quay sang nhìn khi thuyền tới bến (x, z); không có thì nhìn dọc sông. */
  look?: [number, number];
  /** Độ cao điểm nhìn khi đậu (mặc định ngang thuyền) — vật cao như vòng quay cần nhìn lên. */
  lookY?: number;
  /** Góc nghiêng camera mong muốn khi đậu (rad, tính từ phương thẳng đứng); không có thì giữ góc người dùng chọn. */
  polar?: number;
}

const frogX = (ZONES.frogs.x0 + ZONES.frogs.x1) / 2;
const storkX = (ZONES.storks.x0 + ZONES.storks.x1) / 2 + 1;

export const DOCKS: Dock[] = [
  // bến cổng nằm ngoài cổng: thuyền chạy qua cổng cầu vồng để vào vườn thú
  { id: 'gate', label: '🚪 Cổng', x: ZONES.gate - 4 },
  { id: 'frogs', label: '🐸 Bến ếch', x: frogX, look: [frogX, riverCenterZ(frogX) + RIVER_HALF_WIDTH + 2] },
  { id: 'storks', label: '🕊️ Bến cò', x: storkX, look: [storkX, riverCenterZ(storkX) - RIVER_HALF_WIDTH - 3] },
  { id: 'animals', label: '🦌 Bến thú', x: (ZONES.animals.x0 + ZONES.animals.x1) / 2 },
  // vòng quay nến ở cuối sông
  { id: 'candles', label: '🎡 Bến nến', x: WHEEL.x, look: [WHEEL.x, WHEEL.z], lookY: WHEEL.hubY - 1.2, polar: 1.32 },
];

export function dockById(id: string) {
  return DOCKS.find((d) => d.id === id) ?? DOCKS[0];
}

/** Thuyền đậu giữa dòng tại x, mũi hướng xuôi dòng (x tăng). */
export function boatAt(x: number): BoatState {
  return { x, z: riverCenterZ(x), heading: riverHeading(x), speed: 0 };
}

function wrapAngle(a: number) {
  return Math.atan2(Math.sin(a), Math.cos(a));
}

/** Một bước lái tay: tăng/giảm tốc, rẽ (rẽ nhanh hơn khi đang chạy), chạm bờ thì chậm lại. */
export function stepBoat(b: BoatState, input: BoatInput, dt: number): BoatState {
  const thrust = (input.forward ? 1 : 0) - (input.back ? 0.6 : 0);
  let speed = b.speed + thrust * ACCEL * dt;
  speed -= speed * DRAG * dt * (thrust ? 0.3 : 1);
  speed = Math.max(-MAX_SPEED * 0.4, Math.min(MAX_SPEED, speed));
  const steer = (input.left ? 1 : 0) - (input.right ? 1 : 0);
  const turnFactor = Math.min(1, 0.35 + Math.abs(speed) / MAX_SPEED);
  const heading = wrapAngle(b.heading + steer * TURN * turnFactor * dt * (speed < 0 ? -1 : 1));
  const nx = b.x + Math.sin(heading) * speed * dt;
  const nz = b.z + Math.cos(heading) * speed * dt;
  const c = clampBoat(nx, nz);
  if (!c.hit) return { x: c.x, z: c.z, heading, speed };
  // Chạm bờ: trượt dọc bờ và tự xoay mũi theo dòng sông (chiều gần nhất), để trẻ không bị kẹt.
  const along = riverHeading(c.x);
  const target = Math.cos(heading - along) >= 0 ? along : wrapAngle(along + Math.PI);
  return { x: c.x, z: c.z, heading: wrapAngle(heading + wrapAngle(target - heading) * Math.min(1, dt * 3)), speed: speed * 0.97 };
}

/** Một bước tự lái tới bến: chạy dọc giữa dòng, chậm dần khi gần tới. Trả về `arrived` khi đã tới. */
export function autopilot(b: BoatState, targetX: number, dt: number): { boat: BoatState; arrived: boolean } {
  const dx = targetX - b.x;
  if (Math.abs(dx) < 0.3) {
    // gần tới bến: chỉ giảm tốc, giữ hướng mũi (không quay đầu khi dx về 0)
    const speed = b.speed * Math.max(0, 1 - dt * 4);
    return Math.abs(speed) < 0.5 ? { boat: { ...b, speed: 0 }, arrived: true } : { boat: { ...b, speed }, arrived: false };
  }
  const dir = Math.sign(dx);
  const want = Math.min(MAX_SPEED, Math.abs(dx) * 0.9 + 0.4);
  const speed = b.speed + (want - Math.abs(b.speed)) * Math.min(1, dt * 2) * 1;
  const x = b.x + dir * Math.min(Math.abs(dx), Math.abs(speed) * dt);
  // về dần giữa dòng, mũi hướng theo chiều chạy
  const z = b.z + (riverCenterZ(x) - b.z) * Math.min(1, dt * 1.5);
  const wantHeading = dir > 0 ? riverHeading(x) : wrapAngle(riverHeading(x) + Math.PI);
  const heading = wrapAngle(b.heading + wrapAngle(wantHeading - b.heading) * Math.min(1, dt * 2.5));
  return { boat: { x, z, heading, speed: Math.abs(speed) }, arrived: false };
}
