// Bàn tay giả để test: dựng 21 điểm khớp (đơn vị mét) với từng ngón duỗi hoặc gập.
import type { Point } from './fingerCount';

export interface HandPose {
  thumb?: boolean;
  index?: boolean;
  middle?: boolean;
  ring?: boolean;
  pinky?: boolean;
  /** Lật trái/phải (tay còn lại). */
  mirror?: boolean;
  /** Xoay cả bàn tay quanh trục z (độ), như khi tay nghiêng. */
  tiltDeg?: number;
}

const p = (x: number, y: number, z = 0): Point => ({ x, y, z });

function finger(mcp: Point, extended: boolean): Point[] {
  if (extended) {
    return [mcp, p(mcp.x, mcp.y + 0.04), p(mcp.x, mcp.y + 0.065), p(mcp.x, mcp.y + 0.087)];
  }
  // Gập: khớp PIP nhô lên, đầu ngón quặp về lòng bàn tay.
  return [mcp, p(mcp.x, mcp.y + 0.035, -0.005), p(mcp.x, mcp.y + 0.02, -0.025), p(mcp.x, mcp.y - 0.005, -0.02)];
}

export function makeHand(pose: HandPose): Point[] {
  const wrist = p(0, 0);
  const cmc = p(0.022, 0.022);
  const tMcp = p(0.04, 0.035);
  const thumb = pose.thumb
    ? [cmc, tMcp, p(0.068, 0.05), p(0.093, 0.062)]
    : [cmc, tMcp, p(0.04, 0.06, -0.01), p(0.015, 0.065, -0.02)];
  const pts = [
    wrist,
    ...thumb,
    ...finger(p(0.025, 0.085), !!pose.index),
    ...finger(p(0.005, 0.09), !!pose.middle),
    ...finger(p(-0.015, 0.085), !!pose.ring),
    ...finger(p(-0.033, 0.075), !!pose.pinky),
  ];
  const a = ((pose.tiltDeg ?? 0) * Math.PI) / 180;
  const sx = pose.mirror ? -1 : 1;
  return pts.map(({ x, y, z }) => p((x * Math.cos(a) - y * Math.sin(a)) * sx, x * Math.sin(a) + y * Math.cos(a), z));
}

export const POSES: Record<number, HandPose> = {
  0: {},
  1: { index: true },
  2: { index: true, middle: true },
  3: { index: true, middle: true, ring: true },
  4: { index: true, middle: true, ring: true, pinky: true },
  5: { thumb: true, index: true, middle: true, ring: true, pinky: true },
};
