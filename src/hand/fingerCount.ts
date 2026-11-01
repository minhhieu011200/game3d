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
  { mcp: 5, pip: 6, dip: 7, tip: 8 }, // trỏ
  { mcp: 9, pip: 10, dip: 11, tip: 12 }, // giữa
  { mcp: 13, pip: 14, dip: 15, tip: 16 }, // áp út
  { mcp: 17, pip: 18, dip: 19, tip: 20 }, // út
];
const INDEX_MCP = 5;
const MIDDLE_MCP = 9;
const PINKY_MCP = 17;

/** Đầu ngón phải xa cổ tay hơn khớp PIP ít nhất chừng này lần thì coi là duỗi. */
export const FINGER_RATIO = 1.1;
/** Ngón duỗi gần như thẳng: khoảng cách gốc đến đầu ngón so với tổng chiều dài các đốt phải đạt chừng này. */
export const FINGER_STRAIGHT = 0.6;
/** Đầu ngón cái phải cách gốc ngón trỏ ít nhất chừng này lần cỡ lòng bàn tay. */
export const THUMB_SPREAD = 0.55;
/** Góc gập tối đa (độ) ở khớp IP của ngón cái khi duỗi. */
export const THUMB_MAX_BEND_DEG = 40;
/** Chiều ngang lòng bàn tay nhân chừng này thì xấp xỉ chiều dọc (cổ tay đến gốc ngón giữa). */
const PALM_WIDTH_TO_LENGTH = 1.5;

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

/** Cỡ lòng bàn tay. Tay chĩa vào camera thì chiều dọc bị co lại, nên lấy thêm chiều ngang (gần như không đổi). */
function palmSize(h: Hand): number {
  return Math.max(dist(h[WRIST], h[MIDDLE_MCP]), dist(h[INDEX_MCP], h[PINKY_MCP]) * PALM_WIDTH_TO_LENGTH);
}

export function isThumbExtended(h: Hand): boolean {
  const spread = dist(h[THUMB.tip], h[INDEX_MCP]) / palmSize(h);
  const bend = bendDeg(h[THUMB.mcp], h[THUMB.ip], h[THUMB.tip]);
  // ngón cái gập ngang lòng bàn tay thì đầu ngón hướng về phía ngón út
  const awayFromPalm = dist(h[THUMB.tip], h[PINKY_MCP]) > dist(h[THUMB.ip], h[PINKY_MCP]);
  return spread > THUMB_SPREAD && bend < THUMB_MAX_BEND_DEG && awayFromPalm;
}

function isFingerExtended(h: Hand, f: (typeof FINGERS)[number]): boolean {
  const wrist = h[WRIST];
  const length = dist(h[f.mcp], h[f.pip]) + dist(h[f.pip], h[f.dip]) + dist(h[f.dip], h[f.tip]);
  // độ thẳng không dựa vào cổ tay nên vẫn đúng khi ngón chĩa vào camera
  const straight = length > 0 && dist(h[f.mcp], h[f.tip]) / length >= FINGER_STRAIGHT;
  return dist(h[f.tip], wrist) > dist(h[f.pip], wrist) * FINGER_RATIO && straight;
}

export function extendedFingers(h: Hand): boolean[] {
  return [isThumbExtended(h), ...FINGERS.map((f) => isFingerExtended(h, f))];
}

export function countHand(h: Hand): number {
  return extendedFingers(h).filter(Boolean).length;
}

/** Tổng số ngón trên tối đa 2 bàn tay; `null` nếu không thấy bàn tay nào. */
export function countFingers(hands: readonly Hand[]): number | null {
  if (hands.length === 0) return null;
  return hands.slice(0, 2).reduce((sum, h) => sum + countHand(h), 0);
}
