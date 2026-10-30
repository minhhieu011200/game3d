// Hình dạng vườn thú: địa hình, dòng sông, ranh giới. Hàm thuần, dùng chung cho cảnh 3D và luật chơi.

export const WORLD_HALF = 45;
export const WATER_Y = -0.55;
/** Thả vật cao hơn mức này thì coi là "trên trời". */
export const SKY_Y = 3.4;
/** Độ cao bay lượn của vật ở trên trời (vẫn nằm trong khung nhìn của camera). */
export const FLY_Y = 6.5;

/** Nửa bề rộng mặt nước: đủ rộng cho thuyền chạy và quay đầu. */
export const RIVER_HALF_WIDTH = 6.5;
const BANK = 3;
/** Thuyền phải cách bờ chừng này (nửa bề ngang thuyền cộng khoảng an toàn). */
const BOAT_MARGIN = 1.8;
/** Thuyền chạy được trong khoảng x này (hai đầu sông). */
export const BOAT_X_RANGE: [number, number] = [-WORLD_HALF + 4, WORLD_HALF - 4];

/** Tâm dòng sông theo trục z, uốn lượn nhẹ theo x để thuyền dễ lái. */
export function riverCenterZ(x: number) {
  return -9 + 3 * Math.sin(x / 14) + 0.8 * Math.sin(x / 7 + 1);
}

/** Hướng dòng sông (góc quay quanh trục y, 0 = hướng +z) tại x, theo chiều x tăng. */
export function riverHeading(x: number) {
  const dz = (riverCenterZ(x + 0.5) - riverCenterZ(x - 0.5)) / 1;
  return Math.atan2(1, dz); // vector (1, dz) đổi sang góc so với trục +z
}

/** Khoảng cách (theo z) tới tâm sông. */
function riverDist(x: number, z: number) {
  return Math.abs(z - riverCenterZ(x));
}

/** Giữ thuyền trên mặt nước: không lên bờ, không ra khỏi hai đầu sông. Trả về vị trí hợp lệ gần nhất. */
export function clampBoat(x: number, z: number): { x: number; z: number; hit: boolean } {
  const cx = Math.max(BOAT_X_RANGE[0], Math.min(BOAT_X_RANGE[1], x));
  const c = riverCenterZ(cx);
  const lim = RIVER_HALF_WIDTH - BOAT_MARGIN;
  const cz = Math.max(c - lim, Math.min(c + lim, z));
  return { x: cx, z: cz, hit: cx !== x || Math.abs(cz - z) > 1e-9 };
}

export function isInRiver(x: number, z: number) {
  return riverDist(x, z) < RIVER_HALF_WIDTH - 0.3;
}

function smoothstep(a: number, b: number, t: number) {
  const x = Math.min(1, Math.max(0, (t - a) / (b - a)));
  return x * x * (3 - 2 * x);
}

/** Độ cao mặt đất tại (x, z): bằng phẳng, lõm xuống thành lòng sông có bờ thoải. */
export function groundHeight(x: number, z: number) {
  const d = riverDist(x, z);
  const bed = -1.6;
  const k = smoothstep(RIVER_HALF_WIDTH - 0.8, RIVER_HALF_WIDTH + BANK, d);
  const gentle = 0.15 * Math.sin(x * 0.21) * Math.cos(z * 0.17);
  return bed * (1 - k) + gentle * k;
}

/** Chỗ dừng của vật khi thả: mặt nước nếu ở trên sông, mặt đất nếu không. */
export function restHeight(x: number, z: number) {
  return isInRiver(x, z) ? WATER_Y : groundHeight(x, z);
}

/** Mặt mà vật có thể đứng lên: mặt nước ở trên sông, mặt đất ở chỗ khác. */
export function surfaceHeight(x: number, z: number) {
  return Math.max(groundHeight(x, z), isInRiver(x, z) ? WATER_Y : -Infinity);
}

/**
 * Giao điểm của tia (từ camera qua con trỏ) với mặt đất/mặt nước.
 * Trả về `null` nếu tia chỉ lên trời hoặc ra ngoài vườn.
 */
export function intersectSurface(
  o: { x: number; y: number; z: number },
  d: { x: number; y: number; z: number },
  maxDist = 140,
): [number, number, number] | null {
  const step = 0.4;
  let prev = 0;
  for (let t = step; t < maxDist; t += step) {
    const x = o.x + d.x * t;
    const z = o.z + d.z * t;
    if (Math.abs(x) > WORLD_HALF || Math.abs(z) > WORLD_HALF) return null;
    if (o.y + d.y * t <= surfaceHeight(x, z)) {
      // tìm chính xác hơn trong đoạn [prev, t]
      let lo = prev;
      let hi = t;
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        const mx = o.x + d.x * mid;
        const mz = o.z + d.z * mid;
        if (o.y + d.y * mid <= surfaceHeight(mx, mz)) hi = mid;
        else lo = mid;
      }
      const hx = o.x + d.x * hi;
      const hz = o.z + d.z * hi;
      return [hx, surfaceHeight(hx, hz), hz];
    }
    prev = t;
  }
  return null;
}

export function clampToWorld(x: number, z: number): [number, number] {
  const m = WORLD_HALF - 2;
  return [Math.max(-m, Math.min(m, x)), Math.max(-m, Math.min(m, z))];
}
