// Mặt chibi vẽ bằng canvas rồi dán lên phần trước của đầu: mắt to nhiều lớp màu, lông mày, má hồng, miệng cười.
// Vẽ nét 2D nên mịn hơn nhiều so với ghép khối, mà vẫn ăn theo đường cong của đầu.
import * as THREE from 'three';

export type FaceKind = 'boy' | 'girl' | 'teacher';

/** Tâm và bán kính khối mặt trong toạ độ đầu (xem ChibiHead). */
export const FACE_CENTER: [number, number, number] = [0, -0.02, 0.03];
export const FACE_RADIUS: [number, number, number] = [0.25, 0.235, 0.235];

const PHI = 2.2;
const THETA = 1.7;
const W = 1024;
const H = 768;

/** Miếng cầu ôm mặt, nhìn về +z: u chạy từ trái sang phải, v từ dưới lên, trọn vẹn trong ảnh. */
export const FACE_PATCH = new THREE.SphereGeometry(1, 32, 24, Math.PI / 2 - PHI / 2, PHI, Math.PI / 2 - THETA / 2, THETA);

/** Đổi toạ độ trên mặt (m, gốc ở tâm mặt) sang điểm ảnh. */
const px = (x: number) => W / 2 + (x * W) / (PHI * FACE_RADIUS[0]);
const py = (y: number) => H / 2 - (y * H) / (THETA * FACE_RADIUS[1]);
const len = (d: number) => (d * W) / (PHI * FACE_RADIUS[0]);

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, lashes: boolean, side: number) {
  const cx = px(x);
  const cy = py(y);
  const a = len(rx);
  const b = len(ry);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2);
  ctx.fill();
  // tròng nâu: tối ở trên, sáng dần xuống dưới
  const iris = ctx.createLinearGradient(0, cy - b, 0, cy + b);
  iris.addColorStop(0, '#2a150b');
  iris.addColorStop(0.5, '#5e3216');
  iris.addColorStop(1, '#b8743a');
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.ellipse(cx, cy + b * 0.03, a * 0.88, b * 0.93, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#160b06';
  ctx.beginPath();
  ctx.ellipse(cx, cy + b * 0.02, a * 0.45, b * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx - a * 0.32, cy - b * 0.42, a * 0.3, b * 0.28, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx + a * 0.34, cy + b * 0.38, a * 0.13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.65)';
  ctx.beginPath();
  ctx.arc(cx + a * 0.3, cy - b * 0.5, a * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // mí trên đậm
  ctx.strokeStyle = '#2a150b';
  ctx.lineCap = 'round';
  ctx.lineWidth = len(0.011);
  ctx.beginPath();
  ctx.ellipse(cx, cy, a * 1.02, b * 1.02, 0, Math.PI * 1.08, Math.PI * 1.92);
  ctx.stroke();
  if (lashes) {
    ctx.lineWidth = len(0.006);
    for (const [ang, l] of [
      [0.2, 0.024],
      [0.42, 0.02],
    ] as const) {
      const ex = cx + side * Math.cos(ang) * a;
      const ey = cy - Math.sin(ang) * b;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex + side * len(l), ey - len(l) * 0.55);
      ctx.stroke();
    }
  }
}

function drawClosedEye(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number) {
  ctx.strokeStyle = '#2a150b';
  ctx.lineCap = 'round';
  ctx.lineWidth = len(0.011);
  ctx.beginPath();
  ctx.moveTo(px(x - rx), py(y));
  ctx.quadraticCurveTo(px(x), py(y - 0.035), px(x + rx), py(y));
  ctx.stroke();
}

function drawFace(kind: FaceKind, closed: boolean) {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const ctx = c.getContext('2d');
  if (!ctx) return null;
  const adult = kind === 'teacher';
  const lashes = kind !== 'boy';
  const ex = adult ? 0.09 : 0.1;
  const ey = adult ? -0.005 : -0.012;
  const rx = adult ? 0.052 : 0.066;
  const ry = adult ? 0.058 : 0.08;

  // má hồng
  for (const s of [-1, 1]) {
    const bx = px(s * (adult ? 0.15 : 0.165));
    const by = py(-0.08);
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, len(0.062));
    g.addColorStop(0, 'rgba(255,120,130,0.62)');
    g.addColorStop(1, 'rgba(255,120,130,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(bx, by, len(0.062), len(0.045), 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // lông mày
  ctx.strokeStyle = adult ? '#4a2c1c' : '#5e3a22';
  ctx.lineCap = 'round';
  ctx.lineWidth = len(adult ? 0.012 : kind === 'boy' ? 0.013 : 0.01);
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(px(s * (ex - 0.052)), py(ey + ry + (adult ? 0.038 : 0.034)));
    ctx.quadraticCurveTo(px(s * ex), py(ey + ry + 0.056), px(s * (ex + 0.056)), py(ey + ry + 0.026));
    ctx.stroke();
  }

  // mắt
  for (const s of [-1, 1]) {
    if (closed) drawClosedEye(ctx, s * ex, ey, rx);
    else drawEye(ctx, s * ex, ey, rx, ry, lashes, s);
  }

  // mũi
  ctx.fillStyle = 'rgba(235,130,115,0.75)';
  ctx.beginPath();
  ctx.ellipse(px(0), py(-0.072), len(0.011), len(0.008), 0, 0, Math.PI * 2);
  ctx.fill();

  // miệng cười há nhẹ, răng trên và lưỡi
  const mw = adult ? 0.05 : 0.046;
  const my = -0.104;
  const md = adult ? 0.052 : 0.05;
  const mouth = () => {
    ctx.beginPath();
    ctx.moveTo(px(-mw), py(my));
    ctx.quadraticCurveTo(px(0), py(my + 0.006), px(mw), py(my));
    ctx.quadraticCurveTo(px(mw * 0.72), py(my - md), px(0), py(my - md));
    ctx.quadraticCurveTo(px(-mw * 0.72), py(my - md), px(-mw), py(my));
    ctx.closePath();
  };
  ctx.save();
  mouth();
  ctx.fillStyle = '#9c2d38';
  ctx.fill();
  ctx.clip();
  ctx.fillStyle = '#f0727a';
  ctx.beginPath();
  ctx.ellipse(px(0), py(my - md * 0.95), len(mw * 0.62), len(md * 0.46), 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(px(-mw), py(my + 0.01), len(mw * 2), len(0.021));
  ctx.restore();
  mouth();
  ctx.strokeStyle = adult ? '#b5474f' : '#8c3a33';
  ctx.lineWidth = len(0.005);
  ctx.stroke();

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

export interface FaceMaterials {
  open: THREE.MeshBasicMaterial;
  closed: THREE.MeshBasicMaterial;
}

const cache = new Map<FaceKind, FaceMaterials | null>();

/** Vật liệu mặt mở mắt và nhắm mắt của từng kiểu nhân vật; `null` khi không có canvas (môi trường test). */
export function faceMaterials(kind: FaceKind): FaceMaterials | null {
  if (cache.has(kind)) return cache.get(kind)!;
  const open = drawFace(kind, false);
  const closed = drawFace(kind, true);
  const make = (map: THREE.Texture) => new THREE.MeshBasicMaterial({ map, transparent: true, depthWrite: false });
  const m = open && closed ? { open: make(open), closed: make(closed) } : null;
  cache.set(kind, m);
  return m;
}
