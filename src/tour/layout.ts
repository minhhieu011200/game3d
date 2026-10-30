// Bố cục màn đường đi: vị trí mọi đồ vật lớn (cổng chào, xe buýt, biển lớp, cổng, đồ trang trí, thú, cây)
// và vùng chiếm chỗ của chúng trên mặt đất. Các component đọc vị trí từ đây; test kiểm tra để
// không vật nào đè lên vật khác, không cây nào mọc chồng lên vật hay chắn tầm nhìn từ camera.
import * as THREE from 'three';
import type { AnimalKind } from '../games/zoo/scene/Animals';
import { isGate, SQUARE, STATIONS, STOP_BEFORE_GATE, STOP_BEFORE_SQUARE, type GateId } from './logic';
import { PATH } from './path';

/**
 * Camera đứng sau lưng bạn học sinh, cao hơn đầu bạn nhỏ nhiều: đường nhìn qua đầu bạn nhỏ
 * chạm đất trước cổng, nên bạn nhỏ không che hologram, bục hay màn hình trên cổng.
 */
export const CAM_BACK = 7.5;
export const CAM_H = 4.6;
/** Đỉnh đầu bạn nhỏ (m). */
export const KID_TOP = 2.0;

export const ARCH_T = 0.12;
export const BUS_T = 0.06;
export const ROAD_HALF = 2.4;
export const FENCE_SIDE = 3.4;

type XZ = [number, number];

/**
 * Toạ độ cục bộ tại điểm `t` trên đường → toạ độ thế giới.
 * x: ngang đường (âm = bên trái người đi), z: dương = phía người đi tới (ngược hướng đi).
 */
export function toWorld(t: number, x: number, z: number): XZ {
  const p = PATH.getPointAt(t);
  const d = PATH.getTangentAt(t);
  return [p.x - d.z * x - d.x * z, p.z + d.x * x - d.z * z];
}

// ---------- Vị trí (toạ độ cục bộ) ----------

/** Cổng chào: tháp, tường gạch, thú và bóng bay hai bên. */
export const ARCH = {
  span: 4.6,
  wallTo: 11.6,
  giraffe: { x: -8.8, z: -2.6, rot: 0.6 },
  elephant: { x: 9.2, z: -2.6, rot: -0.6 },
  balloons: { x: 6.6, z: -1.3 },
};

/** Xe buýt (khung tại BUS_T): đầu xe hướng +x cục bộ của xe, xoay `rot`. */
export const BUS = { x: -8.0, z: -0.6, rot: -0.75 };
/** Cột biển "Lớp …": cạnh đuôi xe, phía cổng chào, không chắn xe. */
export const CLASS_SIGN = { x: -5.0, z: -2.6, rot: 0.45 };

/** Đồ chung của mọi cổng (khung tại t của cổng). */
export const GATE = {
  console: { x: -2.4, z: 2.6, rot: 0.4 },
  balloons: { x: 8.0, z: 1.0 },
};

/** Đồ trang trí riêng theo cổng: [x, z]. */
export const GATE_DECOR = {
  ticket: { pot: [4.0, 1.6] as XZ },
  flower: { sixFlowers: [-10.4, 1.2] as XZ, bed: [10.4, 1.2] as XZ },
  bunny: { carrots: [-10.4, 1.4] as XZ, statue: [10.4, 1.4] as XZ, carrots2: [10.4, -1.8] as XZ },
  pond: { pond: [-10.9, 1.6] as XZ, frog: [-10.5, 1.3] as XZ, stork: [-10.4, -1.6] as XZ, candle: [4.1, 1.8] as XZ, wheel: [10.4, -1.8] as XZ },
};

/** Bán kính chiếm chỗ của từng loại đồ trang trí ở cổng. */
const DECOR_R: Record<string, number> = {
  pot: 0.45,
  sixFlowers: 1.7,
  bed: 1.1,
  carrots: 1.5,
  carrots2: 1.5,
  statue: 0.75,
  pond: 2.0,
  frog: 0.4,
  stork: 0.8,
  candle: 0.45,
  wheel: 1.7,
};

/** Quảng Trường Huy Hiệu (khung tại SQUARE_T): sân, cổng chúc mừng, bục huy chương, cờ 4 cổng, bóng bay. */
export const SQUARE_T = 0.975;
export const SQUARE_LAYOUT = {
  floor: 9.5,
  arch: { z: -9, wallTo: 8.6 },
  medal: { x: 0, z: 0 },
  /** Băng rôn Cổng 1 … 4 gắn trên hai bức tường của cổng chúc mừng: [x, độ cao], hai hàng mỗi bên. */
  banners: [
    [-7.0, 1.95],
    [-7.0, 1.15],
    [7.0, 1.95],
    [7.0, 1.15],
  ] as XZ[],
  balloons: [
    [-10.8, -8.2],
    [10.8, -8.2],
  ] as XZ[],
};

export const ROADSIDE_ANIMALS: { kind: AnimalKind; t: number; side: number; wander?: number }[] = [
  { kind: 'panda', t: 0.168, side: 7.2 },
  { kind: 'lion', t: 0.29, side: 8 },
  { kind: 'tiger', t: 0.31, side: -8, wander: 1 },
  { kind: 'giraffe', t: 0.49, side: -8.5, wander: 1.2 },
  { kind: 'elephant', t: 0.51, side: 8.5 },
  { kind: 'monkey', t: 0.69, side: 7.5 },
  { kind: 'panda', t: 0.71, side: -7.5 },
  { kind: 'tiger', t: 0.88, side: 8, wander: 1 },
  { kind: 'giraffe', t: 0.89, side: -8.5 },
];

const ANIMAL_R: Record<AnimalKind, number> = { elephant: 2.0, giraffe: 1.5, lion: 1.3, tiger: 1.3, panda: 1.2, monkey: 1.0 };

/** Đoạn đường có hàng rào: bỏ trước cổng chào, quanh các cổng và quảng trường. */
export function fenced(t: number) {
  if (t < ARCH_T + 0.025 || t > 0.93) return false;
  return !STATIONS.filter(isGate).some((st) => Math.abs(st.t - t) < 0.03);
}

/** Đèn lồng dừng trước khu quảng trường (không đặt đèn trong khung hình cổng chúc mừng). */
export const LAMP_END = 0.83;

/** Đèn lồng trong hàng rào, xen kẽ hai bên; bỏ cây đèn nào chắn tầm nhìn ở một điểm dừng. */
export function lampSpots() {
  const out: { t: number; side: number }[] = [];
  for (let t = ARCH_T + 0.045, i = 0; t < LAMP_END; t += 0.045, i++) {
    const side = (i % 2 ? 1 : -1) * (FENCE_SIDE - 0.5);
    if (fenced(t) && !blocksView(...toWorld(t, side, 0), LAMP_R)) out.push({ t, side });
  }
  return out;
}

/** Bụi hoa ngoài hàng rào, xen kẽ hai bên (`dense`: chất lượng cao). */
export function bushSpots(dense: boolean) {
  const out: { t: number; side: number }[] = [];
  let i = 0;
  for (let t = ARCH_T + 0.03; t < 0.92; t += dense ? 0.018 : 0.036) {
    if (!fenced(t)) continue;
    const side = (i % 2 ? 1 : -1) * (FENCE_SIDE + 0.9);
    i++;
    if (!blocksView(...toWorld(t, side, 0), BUSH_R)) out.push({ t, side });
  }
  return out;
}

// ---------- Vùng chiếm chỗ ----------

export interface Footprint {
  /** Tên vật. */
  id: string;
  /** Các mảnh cùng một vật được phép chạm nhau. */
  group: string;
  /** Mặt sân: cây phải tránh, nhưng đồ vật được đặt lên trên. */
  floor?: boolean;
  x: number;
  z: number;
  r: number;
}

function fp(id: string, group: string, t: number, x: number, z: number, r: number): Footprint {
  const [wx, wz] = toWorld(t, x, z);
  return { id, group, x: wx, z: wz, r };
}

/** Vùng chiếm chỗ của một cổng tham quan (khung, cánh tường, bục, bóng bay, đồ trang trí). */
export function gateFootprints(id: GateId, t: number): Footprint[] {
  const g = `gate-${id}`;
  const out: Footprint[] = [];
  for (const s of [-1, 1]) {
    out.push(fp(`${g}-pillar${s}`, g, t, s * 2.4, 0, 0.55));
    out.push(fp(`${g}-column${s}`, g, t, s * 3.25, 0, 0.55));
    for (const x of [4.4, 5.55, 6.7]) out.push(fp(`${g}-wing${s}-${x}`, g, t, s * x, -0.1, 0.55));
    out.push(fp(`${g}-endcol${s}`, g, t, s * 7.6, -0.1, 0.4));
    out.push(fp(`${g}-balloons${s}`, `${g}-balloons${s}`, t, s * GATE.balloons.x, GATE.balloons.z, 0.6));
  }
  out.push(fp(`${g}-console`, `${g}-console`, t, GATE.console.x, GATE.console.z, 0.6));
  for (const [name, [x, z]] of Object.entries(GATE_DECOR[id])) {
    // ếch ngồi trên hồ: cùng nhóm với hồ
    const group = id === 'pond' && name === 'frog' ? `${g}-pond` : `${g}-${name}`;
    out.push(fp(`${g}-${name}`, group, t, x, z, DECOR_R[name]));
  }
  return out;
}

export function archFootprints(): Footprint[] {
  const t = ARCH_T;
  const out: Footprint[] = [];
  for (const s of [-1, 1]) {
    out.push(fp(`arch-tower${s}`, 'arch', t, s * ARCH.span, 0, 1.0));
    for (let x = ARCH.span + 0.8; x <= ARCH.wallTo; x += 1) out.push(fp(`arch-wall${s}-${x.toFixed(1)}`, 'arch', t, s * x, 0, 0.35));
  }
  out.push(fp('arch-giraffe', 'arch-giraffe', t, ARCH.giraffe.x, ARCH.giraffe.z, ANIMAL_R.giraffe));
  out.push(fp('arch-elephant', 'arch-elephant', t, ARCH.elephant.x, ARCH.elephant.z, ANIMAL_R.elephant));
  out.push(fp('arch-balloons', 'arch-balloons', t, ARCH.balloons.x, ARCH.balloons.z, 0.6));
  return out;
}

export function busFootprints(): Footprint[] {
  // trục dọc xe (đầu xe) sau khi xoay `rot` quanh trục y
  const ax = Math.cos(BUS.rot);
  const az = -Math.sin(BUS.rot);
  const out = [-2.0, -0.7, 0.6, 1.9].map((s, i) => fp(`bus-${i}`, 'bus', BUS_T, BUS.x + ax * s, BUS.z + az * s, 1.2));
  out.push(fp('bus-hood', 'bus', BUS_T, BUS.x + ax * 2.6, BUS.z + az * 2.6, 0.95));
  out.push(fp('class-sign', 'class-sign', BUS_T, CLASS_SIGN.x, CLASS_SIGN.z, 1.5));
  return out;
}

export function animalFootprints(): Footprint[] {
  return ROADSIDE_ANIMALS.map((a, i) => fp(`animal-${i}-${a.kind}`, `animal-${i}`, a.t, a.side, 0, ANIMAL_R[a.kind] + (a.wander ?? 0)));
}

export const LAMP_R = 0.3;
export const BUSH_R = 0.7;

export function smallFootprints(): Footprint[] {
  return [
    ...lampSpots().map((l, i) => fp(`lamp-${i}`, `lamp-${i}`, l.t, l.side, 0, LAMP_R)),
    ...bushSpots(true).map((b, i) => fp(`bush-${i}`, `bush-${i}`, b.t, b.side, 0, BUSH_R)),
  ];
}

export function squareFootprints(): Footprint[] {
  const t = SQUARE_T;
  const L = SQUARE_LAYOUT;
  const out: Footprint[] = [{ ...fp('square-floor', 'square-floor', t, 0, 0, L.floor), floor: true }];
  out.push(fp('square-medal', 'square-medal', t, L.medal.x, L.medal.z, 2.4));
  for (const s of [-1, 1]) {
    out.push(fp(`square-tower${s}`, 'square-arch', t, s * ARCH.span, L.arch.z, 1.0));
    for (let x = ARCH.span + 0.8; x <= L.arch.wallTo; x += 1) out.push(fp(`square-wall${s}-${x.toFixed(1)}`, 'square-arch', t, s * x, L.arch.z, 0.35));
  }
  L.balloons.forEach(([x, z], i) => out.push(fp(`square-balloons${i}`, `square-balloons${i}`, t, x, z, 0.6)));
  return out;
}

export function allFootprints(): Footprint[] {
  return [
    ...archFootprints(),
    ...busFootprints(),
    ...animalFootprints(),
    ...smallFootprints(),
    ...squareFootprints(),
    ...STATIONS.filter(isGate).flatMap((st) => gateFootprints(st.id, st.t)),
  ];
}

// ---------- Điểm dừng và tầm nhìn ----------

export interface Viewpoint {
  name: string;
  cam: XZ;
  /** Những vật cần nhìn thấy rõ từ điểm dừng này. */
  targets: Footprint[];
}

function cameraAt(t: number): XZ {
  const p = PATH.getPointAt(t);
  const d = PATH.getTangentAt(t);
  return [p.x - d.x * CAM_BACK, p.z - d.z * CAM_BACK];
}

export function viewpoints(): Viewpoint[] {
  const out: Viewpoint[] = [{ name: 'start', cam: cameraAt(STATIONS[0].t), targets: [...archFootprints(), ...busFootprints()] }];
  for (const st of STATIONS.filter(isGate)) out.push({ name: st.id, cam: cameraAt(st.t - STOP_BEFORE_GATE), targets: gateFootprints(st.id, st.t) });
  out.push({ name: 'square', cam: cameraAt(STATIONS[SQUARE].t - STOP_BEFORE_SQUARE), targets: squareFootprints().filter((f) => !f.floor) });
  return out;
}

let viewsCache: Viewpoint[] | null = null;

/**
 * Vật tròn bán kính r tại (x, z) có nằm trên đường nhìn từ camera tới một vật cần thấy ở điểm dừng nào không.
 * Tính trên mặt đất (bỏ qua chiều cao), nên chặt hơn thực tế một chút.
 */
export function blocksView(x: number, z: number, r: number, views = (viewsCache ??= viewpoints())) {
  return views.some((v) => v.targets.some((tg) => Math.hypot(tg.x - x, tg.z - z) > tg.r + r && distToSegment([x, z], v.cam, [tg.x, tg.z]) < r + 0.3));
}

/** Khoảng cách từ điểm p tới đoạn thẳng ab (mặt phẳng xz). */
export function distToSegment(p: XZ, a: XZ, b: XZ) {
  const abx = b[0] - a[0];
  const abz = b[1] - a[1];
  const k = THREE.MathUtils.clamp(((p[0] - a[0]) * abx + (p[1] - a[1]) * abz) / (abx * abx + abz * abz || 1), 0, 1);
  return Math.hypot(p[0] - (a[0] + abx * k), p[1] - (a[1] + abz * k));
}

// ---------- Cây ----------

export interface TreeSpot {
  x: number;
  z: number;
  s: number;
  /** Bán kính tán cây (đã nhân tỉ lệ). */
  r: number;
}

/** Tán cây rộng khoảng 2,5 m ở tỉ lệ 1. */
export const TREE_R = 2.5;

function lateralOf(x: number, z: number) {
  // khoảng cách tới tim đường (lấy mẫu thô, đủ cho việc trồng cây)
  let best = Infinity;
  for (let i = 0; i <= 200; i++) {
    const p = PATH.getPointAt(i / 200);
    best = Math.min(best, Math.hypot(p.x - x, p.z - z));
  }
  return best;
}

/** Chỗ này trồng cây được không: xa đường, không chồng lên vật, không chắn tầm nhìn ở điểm dừng nào. */
export function treeFits(x: number, z: number, r: number, foot = allFootprints(), views = viewpoints()) {
  if (lateralOf(x, z) < FENCE_SIDE + 1.2 + r) return false;
  if (foot.some((f) => Math.hypot(f.x - x, f.z - z) < f.r + r + 0.3)) return false;
  return !views.some((v) => v.targets.some((tg) => distToSegment([x, z], v.cam, [tg.x, tg.z]) < r + 0.4));
}

/** Rải cây ngẫu nhiên (có hạt giống cố định) hai bên đường, bỏ chỗ không hợp lệ. */
export function plantTrees(count: number, seed = 7): TreeSpot[] {
  let s = seed >>> 0;
  const r = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  const foot = allFootprints();
  const views = viewpoints();
  const out: TreeSpot[] = [];
  for (let tries = 0; out.length < count && tries < count * 40; tries++) {
    const t = 0.0 + r() * 0.96;
    const side = (r() < 0.5 ? -1 : 1) * (6 + r() * 16);
    const scale = 0.8 + r() * 0.7;
    const rad = TREE_R * scale;
    const [x, z] = toWorld(t, side, 0);
    if (!treeFits(x, z, rad, foot, views)) continue;
    if (out.some((o) => Math.hypot(o.x - x, o.z - z) < (o.r + rad) * 0.6)) continue;
    out.push({ x, z, s: scale, r: rad });
  }
  return out;
}
