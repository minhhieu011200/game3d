// Đếm số ngón tay đang giơ từ 21 điểm khớp của MediaPipe (ưu tiên worldLandmarks, đơn vị mét).
// Chỉ dùng khoảng cách và góc nên không phụ thuộc tay trái/phải, camera lật hay tay nghiêng.

export interface Point {
  x: number;
  y: number;
  z: number;
}

export type Hand = readonly Point[];

// Chỉ số điểm khớp theo MediaPipe.
const WRIST = 0;
const THUMB = { mcp: 2, ip: 3, tip: 4 };
const FINGERS = [
  { mcp: 5, pip: 6, tip: 8 }, // trỏ
  { mcp: 9, pip: 10, tip: 12 }, // giữa
  { mcp: 13, pip: 14, tip: 16 }, // áp út
  { mcp: 17, pip: 18, tip: 20 }, // út
];
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;

/** Đầu ngón phải xa cổ tay hơn khớp PIP ít nhất chừng này lần thì coi là duỗi. */
export const FINGER_RATIO = 1.1;
/** Đầu ngón cái phải cách gốc ngón trỏ ít nhất chừng này lần cỡ lòng bàn tay. */
export const THUMB_SPREAD = 0.55;
/** Góc gập tối đa (độ) ở khớp IP của ngón cái khi duỗi. */
export const THUMB_MAX_BEND_DEG = 40;

function dist(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

function bendDeg(a: Point, b: Point, c: Point): number {
  const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z };
  const v = { x: c.x - b.x, y: c.y - b.y, z: c.z - b.z };
  const dot = u.x * v.x + u.y * v.y + u.z * v.z;
  const len = Math.hypot(u.x, u.y, u.z) * Math.hypot(v.x, v.y, v.z);
  if (len === 0) return 0;
  return (Math.acos(Math.max(-1, Math.min(1, dot / len))) * 180) / Math.PI;
}

export function isThumbExtended(h: Hand): boolean {
  const palm = dist(h[WRIST], h[MIDDLE_MCP]);
  const spread = dist(h[THUMB.tip], h[INDEX_MCP]) / palm;
  const bend = bendDeg(h[THUMB.mcp], h[THUMB.ip], h[THUMB.tip]);
  return spread > THUMB_SPREAD && bend < THUMB_MAX_BEND_DEG;
}

export function extendedFingers(h: Hand): boolean[] {
  const wrist = h[WRIST];
  return [
    isThumbExtended(h),
    ...FINGERS.map((f) => dist(h[f.tip], wrist) > dist(h[f.pip], wrist) * FINGER_RATIO),
  ];
}

export function countHand(h: Hand): number {
  return extendedFingers(h).filter(Boolean).length;
}

/** Tổng số ngón trên tối đa 2 bàn tay; `null` nếu không thấy bàn tay nào. */
export function countFingers(hands: readonly Hand[]): number | null {
  if (hands.length === 0) return null;
  return hands.slice(0, 2).reduce((sum, h) => sum + countHand(h), 0);
}
