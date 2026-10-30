// Quảng Trường Huy Hiệu: cổng chúc mừng "Hẹn gặp lại", bục huy chương, cờ của 4 cổng, dây cờ, bóng bay, pháo hoa.
// Không còn bảng thông báo che giữa màn hình: lời chúc nằm trên cổng và trong lời Vẹt Xanh.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../shared/3d/quality';
import { Sign3D } from '../shared/3d/Sign3D';
import { ArchBody, Balloons } from './Decor';
import { CLASS_NAME, gateNumber, isGate, SQUARE, STATIONS } from './logic';
import { SQUARE_LAYOUT, SQUARE_T } from './layout';
import { PATH } from './path';
import { useTour } from './store';
import { solid, stoneMaterial } from './textures';

type V3 = [number, number, number];

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const GOLD = '#ffcf3a';
const goldCache = new Map<string, THREE.MeshStandardMaterial>();
/**
 * Vàng sáng: kim loại vừa phải và tự phát sáng nhẹ, vì cảnh không có ảnh phản chiếu môi trường
 * (kim loại bóng hoàn toàn sẽ trông tối như đồng).
 */
function gold(color = GOLD, rough = 0.3) {
  const key = `${color}|${rough}`;
  let m = goldCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: 0.4, emissive: new THREE.Color(color), emissiveIntensity: 0.22 });
    goldCache.set(key, m);
  }
  return m;
}

function starGeometry(outer: number, inner: number, depth: number) {
  const s = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 ? inner : outer;
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/** Vẽ chữ chạy theo cung tròn (trên: đọc xuôi theo chiều kim đồng hồ; dưới: ngược lại để vẫn đọc xuôi). */
function arcText(g: CanvasRenderingContext2D, text: string, cx: number, cy: number, r: number, top: boolean) {
  const chars = [...text];
  const step = 0.16;
  const start = (top ? -Math.PI / 2 : Math.PI / 2) - (top ? 1 : -1) * ((chars.length - 1) * step) / 2;
  chars.forEach((ch, i) => {
    const a = start + (top ? 1 : -1) * i * step;
    g.save();
    g.translate(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    g.rotate(top ? a + Math.PI / 2 : a - Math.PI / 2);
    g.fillText(ch, 0, 0);
    g.restore();
  });
}

let faceTexture: THREE.Texture | null = null;
/** Mặt huy chương: nền vàng có vân tia, chữ "NHÀ THÁM HIỂM PHÉP TRỪ NHÍ" phía trên, "LỚP …" phía dưới. */
function medalFace() {
  if (faceTexture) return faceTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(220, 200, 30, 256, 256, 256);
  grad.addColorStop(0, '#fff2a8');
  grad.addColorStop(0.6, '#ffcf3a');
  grad.addColorStop(1, '#d99a12');
  g.fillStyle = grad;
  g.beginPath();
  g.arc(256, 256, 256, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(160,100,0,0.35)';
  g.lineWidth = 3;
  for (let i = 0; i < 48; i++) {
    const a = (i / 48) * Math.PI * 2;
    g.beginPath();
    g.moveTo(256 + Math.cos(a) * 140, 256 + Math.sin(a) * 140);
    g.lineTo(256 + Math.cos(a) * 160, 256 + Math.sin(a) * 160);
    g.stroke();
  }
  g.fillStyle = '#7a4a00';
  g.font = `800 34px "Baloo 2", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  arcText(g, 'NHÀ THÁM HIỂM PHÉP TRỪ NHÍ', 256, 256, 205, true);
  arcText(g, `★ LỚP ${CLASS_NAME} ★`, 256, 256, 205, false);
  faceTexture = new THREE.CanvasTexture(c);
  faceTexture.colorSpace = THREE.SRGBColorSpace;
  faceTexture.anisotropy = 8;
  return faceTexture;
}

let haloTexture: THREE.Texture | null = null;
/** Vầng sáng có tia sau huy chương. */
function halo() {
  if (haloTexture) return haloTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(128, 128, 20, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255,240,170,0.95)');
  grad.addColorStop(0.45, 'rgba(255,210,90,0.45)');
  grad.addColorStop(1, 'rgba(255,200,80,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 256, 256);
  g.translate(128, 128);
  g.fillStyle = 'rgba(255,236,150,0.35)';
  for (let i = 0; i < 16; i++) {
    g.rotate(Math.PI / 8);
    g.beginPath();
    g.moveTo(0, 0);
    g.lineTo(-10, -128);
    g.lineTo(10, -128);
    g.closePath();
    g.fill();
  }
  haloTexture = new THREE.CanvasTexture(c);
  haloTexture.colorSpace = THREE.SRGBColorSpace;
  return haloTexture;
}

/** Dải ruy băng sọc (đỏ – trắng – xanh) nối huy chương lên trên. */
function RibbonStrip({ side }: { side: 1 | -1 }) {
  const cols = ['#d63b2f', '#ffffff', '#2f6fc0'];
  return (
    <group position={[side * 0.5, 1.5, -0.05]} rotation-z={side * 0.32}>
      {cols.map((c, i) => (
        <mesh key={c} position={[(i - 1) * 0.2 * side, 0, 0]} material={solid(c, 0.6)} castShadow>
          <boxGeometry args={[0.2, 1.8, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

/** Huy chương vàng lớn: viền nổi, ngôi sao nổi hai mặt, ruy băng sọc, vầng sáng và đốm lấp lánh. */
function Medal() {
  const body = useRef<THREE.Group>(null);
  const ray = useRef<THREE.Mesh>(null);
  const sparks = useRef<THREE.Group>(null);
  const star = useMemo(() => starGeometry(0.62, 0.27, 0.12), []);
  useEffect(() => () => star.dispose(), [star]);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (body.current) {
      body.current.rotation.y = Math.sin(t * 0.7) * 0.45;
      body.current.position.y = Math.sin(t * 1.4) * 0.08;
    }
    if (ray.current) ray.current.rotation.z = t * 0.25;
    if (sparks.current) sparks.current.rotation.z = -t * 0.6;
  });
  return (
    <group>
      <mesh ref={ray} position={[0, 0, -0.4]} renderOrder={1}>
        <planeGeometry args={[3.8, 3.8]} />
        <meshBasicMaterial map={halo()} transparent opacity={0.8} depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
      </mesh>
      <group ref={sparks}>
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return (
            <mesh key={i} position={[Math.cos(a) * 1.65, Math.sin(a) * 1.65, 0.1]} rotation-z={a} scale={i % 2 ? 0.09 : 0.14}>
              <octahedronGeometry args={[1, 0]} />
              <meshBasicMaterial color="#fff6c8" toneMapped={false} />
            </mesh>
          );
        })}
      </group>
      <group ref={body}>
        <RibbonStrip side={-1} />
        <RibbonStrip side={1} />
        {/* khoen nối ruy băng */}
        <mesh position={[0, 1.33, 0]} rotation-x={Math.PI / 2} material={gold()}>
          <torusGeometry args={[0.2, 0.06, 10, 24]} />
        </mesh>
        <mesh rotation-x={Math.PI / 2} material={gold()} castShadow>
          <cylinderGeometry args={[1.2, 1.2, 0.2, 48]} />
        </mesh>
        <mesh material={gold('#e0a91f', 0.3)}>
          <torusGeometry args={[1.2, 0.1, 12, 48]} />
        </mesh>
        {[0.11, -0.11].map((z) => (
          <group key={z} rotation-y={z < 0 ? Math.PI : 0} position={[0, 0, z]}>
            <mesh position={[0, 0, 0.002]}>
              <circleGeometry args={[1.12, 48]} />
              <meshStandardMaterial map={medalFace()} roughness={0.35} metalness={0.3} emissive="#ffcf3a" emissiveIntensity={0.12} />
            </mesh>
            <mesh material={gold('#ffd968', 0.35)}>
              <torusGeometry args={[0.66, 0.03, 8, 48]} />
            </mesh>
            <mesh geometry={star} material={gold('#ff9f1c', 0.25)} castShadow scale={0.85} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Bục ba tầng thấp bằng đá trắng viền vàng. */
function Podium() {
  return (
    <group>
      <mesh position={[0, 0.15, 0]} material={stoneMaterial()} castShadow receiveShadow>
        <cylinderGeometry args={[1.9, 2.0, 0.3, 40]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={solid('#f4efe6', 0.5)} castShadow>
        <cylinderGeometry args={[1.45, 1.55, 0.5, 40]} />
      </mesh>
      {[0.32, 0.79].map((y) => (
        <mesh key={y} position={[0, y, 0]} material={gold()}>
          <torusGeometry args={[1.5, 0.05, 8, 48]} />
        </mesh>
      ))}
      <mesh position={[0, 0.9, 0]} material={solid('#f4efe6', 0.5)} castShadow>
        <cylinderGeometry args={[1.1, 1.2, 0.2, 40]} />
      </mesh>
    </group>
  );
}

/** Băng rôn một cổng gắn trên tường: tô màu cổng và có dấu ✓ khi đã qua. */
function WallBanner({ x, y, label, color, on }: { x: number; y: number; label: string; color: string; on: boolean }) {
  return <Sign3D text={on ? `✓ ${label}` : label} height={0.62} bg={on ? color : '#9a9a9a'} border="#ffffff" billboard={false} position={[x, y, 0.34]} />;
}

/** Dây cờ tam giác võng giữa hai điểm. */
function Bunting({ a, b, sag = 0.9 }: { a: V3; b: V3; sag?: number }) {
  const items = useMemo(() => {
    const n = 14;
    const cols = ['#e8443a', '#f7d046', '#3d8fd6', '#5cb85c', '#ff8fb1', '#7b5cc9'];
    return Array.from({ length: n }, (_, i) => {
      const k = (i + 0.5) / n;
      return {
        p: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k - Math.sin(k * Math.PI) * sag, a[2] + (b[2] - a[2]) * k] as V3,
        c: cols[i % cols.length],
      };
    });
  }, [a, b, sag]);
  const ang = Math.atan2(b[2] - a[2], b[0] - a[0]);
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} rotation-y={-ang} material={solid(it.c, 0.6)}>
          <coneGeometry args={[0.2, 0.45, 3]} />
        </mesh>
      ))}
    </>
  );
}

let dotTexture: THREE.Texture | null = null;
/** Hạt tròn: lõi trắng sáng, viền mờ dần (hợp với cộng màu). */
function dot() {
  if (dotTexture) return dotTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d')!;
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, 'rgba(255,255,255,1)');
  grad.addColorStop(0.35, 'rgba(255,255,255,0.95)');
  grad.addColorStop(0.6, 'rgba(255,255,255,0.45)');
  grad.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 64);
  dotTexture = new THREE.CanvasTexture(c);
  return dotTexture;
}

/** Bảng màu rực rỡ; mỗi phát nổ lấy 2–3 màu trong này. */
const FIREWORK_COLORS = ['#ff1744', '#ffc400', '#00b0ff', '#00e676', '#f50fd8', '#ff6d00', '#7c4dff', '#00e5c8', '#ff4081'];
type Shape = 'sphere' | 'ring' | 'double' | 'willow';
const SHAPES: Shape[] = ['sphere', 'ring', 'double', 'sphere', 'willow'];

const BURSTS = 7;
const N = 180; // hạt mỗi phát nổ
const TRAIL = 8; // vệt sáng sau tên lửa
const RISE = 0.9; // giây bay lên
/** Độ to của phát nổ. */
const POWER = 1.45;
const LIFE = 2.6; // giây từ lúc nổ tới lúc tàn

interface Burst {
  /** < 0: chờ; 0 … RISE: đang bay lên; > RISE: đã nổ. */
  age: number;
  from: THREE.Vector3;
  to: THREE.Vector3;
  shape: Shape;
  vel: THREE.Vector3[];
  colors: THREE.Color[];
  twinkle: number[];
}

function newBurst(r: () => number, center: THREE.Vector3, delay: number): Burst {
  // nổ hai bên biển chúc mừng (không che chữ), thấp vừa khung hình
  const side = r() < 0.5 ? -1 : 1;
  // bên phải thấp hơn một chút: góc trên bên phải màn hình có bong bóng lời Vẹt Xanh
  const to = new THREE.Vector3(center.x + side * (6.5 + r() * 6), side < 0 ? 9 + r() * 3 : 7.5 + r() * 2, center.z - 11 + (r() - 0.5) * 6);
  const from = new THREE.Vector3(to.x + (r() - 0.5) * 3, 0.5, to.z + (r() - 0.5) * 2);
  const shape = SHAPES[Math.floor(r() * SHAPES.length)];
  const k = 2 + Math.floor(r() * 2);
  const palette = Array.from({ length: k }, () => new THREE.Color(FIREWORK_COLORS[Math.floor(r() * FIREWORK_COLORS.length)]));
  // vòng nổ nghiêng ngẫu nhiên cho đỡ đơn điệu
  const tilt = new THREE.Euler(r() * 1.2 - 0.6, r() * Math.PI, r() * 1.2 - 0.6);
  const vel: THREE.Vector3[] = [];
  const colors: THREE.Color[] = [];
  for (let i = 0; i < N; i++) {
    let v: THREE.Vector3;
    let ci: number;
    if (shape === 'ring') {
      const a = (i / N) * Math.PI * 2;
      v = new THREE.Vector3(Math.cos(a), 0, Math.sin(a)).applyEuler(tilt).multiplyScalar(6.5 + r() * 0.4);
      ci = i % palette.length;
    } else if (shape === 'double') {
      const inner = i % 2 === 0;
      v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar(inner ? 3.2 + r() * 0.3 : 6.8 + r() * 0.4);
      ci = inner ? 0 : 1 % palette.length;
    } else {
      v = new THREE.Vector3(r() - 0.5, r() - 0.5, r() - 0.5).normalize().multiplyScalar((shape === 'willow' ? 4.5 : 6) + r() * 1.2);
      ci = Math.floor(r() * palette.length);
    }
    vel.push(v.multiplyScalar(POWER));
    colors.push(palette[ci]);
  }
  return { age: -delay, from, to, shape, vel, colors, twinkle: Array.from({ length: N }, () => r() * 10) };
}

/** Pháo hoa nhiều màu: tên lửa bay lên có vệt sáng, nổ hình cầu / vòng / hai lớp / liễu rủ, chớp sáng, lấp lánh rồi tàn. */
function Fireworks() {
  const r = useMemo(() => rng(11), []);
  const center = useMemo(() => PATH.getPointAt(SQUARE_T), []);
  const bursts = useRef<Burst[]>(Array.from({ length: BURSTS }, (_, i) => newBurst(r, center, i * 0.55)));
  const { sparks, flashes } = useMemo(() => {
    const mk = (n: number) => {
      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(n * 3), 3));
      // màu có kênh alpha: giữ màu đậm, mờ dần bằng độ trong suốt (không ngả trắng trên nền trời sáng)
      g.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(n * 4), 4));
      return g;
    };
    return { sparks: mk(BURSTS * (N + TRAIL)), flashes: mk(BURSTS) };
  }, []);
  useEffect(
    () => () => {
      sparks.dispose();
      flashes.dispose();
    },
    [sparks, flashes],
  );
  useFrame(({ clock }, dt) => {
    const time = clock.elapsedTime;
    const pos = sparks.attributes.position as THREE.BufferAttribute;
    const col = sparks.attributes.color as THREE.BufferAttribute;
    const fpos = flashes.attributes.position as THREE.BufferAttribute;
    const fcol = flashes.attributes.color as THREE.BufferAttribute;
    const tmp = new THREE.Vector3();
    bursts.current.forEach((b, bi) => {
      b.age += Math.min(dt, 0.05);
      if (b.age > RISE + LIFE) bursts.current[bi] = b = newBurst(r, center, 0.2 + r() * 0.8);
      const base = bi * (N + TRAIL);
      const hide = (i: number) => {
        pos.setXYZ(i, 0, -50, 0);
        col.setXYZW(i, 0, 0, 0, 0);
      };
      if (b.age < 0) {
        for (let i = 0; i < N + TRAIL; i++) hide(base + i);
        fpos.setXYZ(bi, 0, -50, 0);
        fcol.setXYZW(bi, 0, 0, 0, 0);
        return;
      }
      if (b.age <= RISE) {
        // tên lửa: đầu sáng vàng trắng, vệt đuôi mờ dần
        const k = b.age / RISE;
        const ease = 1 - (1 - k) * (1 - k);
        for (let j = 0; j < TRAIL; j++) {
          const kk = Math.max(0, ease - j * 0.035);
          tmp.lerpVectors(b.from, b.to, kk);
          pos.setXYZ(base + N + j, tmp.x + Math.sin(time * 30 + j) * 0.03, tmp.y, tmp.z);
          col.setXYZW(base + N + j, 1, 0.85, 0.4, (1 - j / TRAIL) * 0.95);
        }
        for (let i = 0; i < N; i++) hide(base + i);
        fpos.setXYZ(bi, 0, -50, 0);
        fcol.setXYZW(bi, 0, 0, 0, 0);
        return;
      }
      for (let j = 0; j < TRAIL; j++) hide(base + N + j);
      const t = b.age - RISE;
      const life = t / LIFE;
      // bay chậm dần do lực cản, rơi vì trọng lực (liễu rủ rơi nhiều hơn)
      const drag = (1 - Math.exp(-2.2 * t)) / 2.2;
      const fall = (b.shape === 'willow' ? 2.2 : 1.1) * t * t;
      const fade = Math.pow(Math.max(0, 1 - life), 1.6);
      for (let i = 0; i < N; i++) {
        const v = b.vel[i];
        pos.setXYZ(base + i, b.to.x + v.x * drag, b.to.y + v.y * drag - fall, b.to.z + v.z * drag);
        // lấp lánh khi sắp tàn
        const tw = life > 0.45 ? 0.35 + 0.65 * Math.max(0, Math.sin(time * 22 + b.twinkle[i])) : 1;
        // lúc mới nổ ánh trắng thoáng qua rồi chuyển sang màu thật
        const white = Math.max(0, 1 - t * 8) * 0.6;
        const c = b.colors[i];
        col.setXYZW(base + i, c.r + (1 - c.r) * white, c.g + (1 - c.g) * white, c.b + (1 - c.b) * white, fade * tw);
      }
      // chớp sáng to ở tâm, tắt nhanh
      const flash = Math.max(0, 1 - t * 3.5);
      const c0 = b.colors[0];
      fpos.setXYZ(bi, b.to.x, b.to.y, b.to.z);
      fcol.setXYZW(bi, 0.5 + c0.r * 0.5, 0.5 + c0.g * 0.5, 0.5 + c0.b * 0.5, flash * 0.8);
    });
    pos.needsUpdate = col.needsUpdate = fpos.needsUpdate = fcol.needsUpdate = true;
  });
  return (
    <>
      <points geometry={sparks} frustumCulled={false} renderOrder={5}>
        <pointsMaterial size={1.05} map={dot()} vertexColors transparent depthWrite={false} toneMapped={false} />
      </points>
      <points geometry={flashes} frustumCulled={false} renderOrder={5}>
        <pointsMaterial size={3.2} map={dot()} vertexColors transparent depthWrite={false} toneMapped={false} />
      </points>
    </>
  );
}

export function Square() {
  const q = useQuality();
  const atSquare = useTour((s) => s.at === SQUARE && s.phase === 'atGate');
  const passed = useTour((s) => s.passed);
  const p = PATH.getPointAt(SQUARE_T);
  const d = PATH.getTangentAt(SQUARE_T);
  const yaw = Math.atan2(-d.x, -d.z);
  const L = SQUARE_LAYOUT;
  return (
    <>
      <group position={[p.x, 0, p.z]} rotation-y={yaw}>
        {/* sân lát đá tròn, viền gạch */}
        <mesh rotation-x={-Math.PI / 2} position-y={0.04} material={stoneMaterial()} receiveShadow>
          <circleGeometry args={[L.floor, 48]} />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position-y={0.05} material={solid('#a5533a', 0.9)}>
          <ringGeometry args={[L.floor - 0.4, L.floor, 64]} />
        </mesh>
        {/* cổng chúc mừng phía sau quảng trường */}
        <group position={[0, 0, L.arch.z]}>
          <ArchBody title={`🎉 CHÚC MỪNG LỚP ${CLASS_NAME}! 🎉`} sub="Hẹn gặp lại các bạn nhỏ! 👋" flags={['🏅', '🎈']} wallTo={L.arch.wallTo} />
          {STATIONS.filter(isGate).map((st, i) => (
            <WallBanner key={st.id} x={L.banners[i][0]} y={L.banners[i][1]} label={`Cổng ${gateNumber(st.id)} ${st.emoji}`} color={st.color} on={passed.includes(st.id)} />
          ))}
          <Bunting a={[-4.6, 5.6, 0.3]} b={[-L.arch.wallTo, 2.3, 0.3]} sag={0.6} />
          <Bunting a={[4.6, 5.6, 0.3]} b={[L.arch.wallTo, 2.3, 0.3]} sag={0.6} />
        </group>
        <group position={[L.medal.x, 0, L.medal.z]} scale={1.2}>
          <Podium />
          <group position={[0, 2.25, 0]}>
            <Medal />
          </group>
        </group>
        {L.balloons.map(([x, z], i) => (
          <Balloons key={i} p={[x, 0, z]} seed={i + 3} />
        ))}
      </group>
      {atSquare && q.particles && <Fireworks />}
    </>
  );
}
