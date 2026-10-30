// Con bướm 3D dùng chung: thân, râu, cánh trước + cánh sau có viền và chấm.
// Bay chập chờn như bướm thật: tự chọn điểm đến quanh chỗ neo, lượn mềm, đầu quay theo hướng bay,
// nghiêng khi rẽ, vỗ cánh mạnh xen lúc lướt, thân nhấp nhô theo nhịp vỗ.
// Bướm đậu (perch) thì từ từ khép mở cánh, thỉnh thoảng vỗ nhanh vài cái.
// Trục cục bộ: +z là đầu bướm, cánh nằm trong mặt phẳng xz.
import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

type V3 = [number, number, number];

function rng(seed: number) {
  let s = (seed * 2654435761) >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// ---------- Hình cánh ----------

/** Cánh phải (x dương), gốc cánh ở x = 0; y của Shape là hướng đầu bướm. */
function foreShape(k = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, 0.02 * k);
  s.bezierCurveTo(0.06 * k, 0.16 * k, 0.22 * k, 0.26 * k, 0.33 * k, 0.21 * k);
  s.bezierCurveTo(0.4 * k, 0.16 * k, 0.33 * k, 0.03 * k, 0.24 * k, -0.01 * k);
  s.bezierCurveTo(0.14 * k, -0.04 * k, 0.05 * k, -0.03 * k, 0, -0.01 * k);
  return s;
}

function hindShape(k = 1) {
  const s = new THREE.Shape();
  s.moveTo(0, -0.01 * k);
  s.bezierCurveTo(0.1 * k, -0.02 * k, 0.24 * k, -0.06 * k, 0.24 * k, -0.15 * k);
  s.bezierCurveTo(0.24 * k, -0.24 * k, 0.12 * k, -0.3 * k, 0.05 * k, -0.22 * k);
  s.bezierCurveTo(0.02 * k, -0.17 * k, 0, -0.1 * k, 0, -0.05 * k);
  return s;
}

/** Hình phẳng nằm trong mặt xz (y của Shape → +z). */
function flat(shape: THREE.Shape) {
  const g = new THREE.ShapeGeometry(shape, 12);
  g.rotateX(Math.PI / 2);
  // ShapeGeometry xoay +90° quanh x: y → +z nhưng mặt lật; giữ cả hai mặt bằng DoubleSide
  return g;
}

interface WingGeo {
  foreRim: THREE.BufferGeometry;
  fore: THREE.BufferGeometry;
  hindRim: THREE.BufferGeometry;
  hind: THREE.BufferGeometry;
}

let wingGeo: WingGeo | null = null;
function wings(): WingGeo {
  if (wingGeo) return wingGeo;
  // phần màu nhỏ hơn viền một chút, lệch về phía gốc cánh
  const inner = (s: THREE.Shape) => {
    const g = flat(s);
    g.scale(0.84, 1, 0.84);
    g.translate(0.015, 0, 0);
    return g;
  };
  wingGeo = { foreRim: flat(foreShape()), fore: inner(foreShape()), hindRim: flat(hindShape()), hind: inner(hindShape()) };
  return wingGeo;
}

const matCache = new Map<string, THREE.Material>();
function mat(color: string, emissive = 0) {
  const key = `${color}|${emissive}`;
  let m = matCache.get(key);
  if (!m) {
    m = new THREE.MeshStandardMaterial({ color, roughness: 0.65, side: THREE.DoubleSide, emissive: new THREE.Color(color), emissiveIntensity: emissive });
    matCache.set(key, m);
  }
  return m;
}

/** Màu viền sẫm cùng tông với màu cánh. */
function rimOf(color: string) {
  return '#' + new THREE.Color(color).lerp(new THREE.Color('#1d1328'), 0.5).getHexString();
}

/** Một bên cánh (side = 1 phải, −1 trái). Gốc nhóm là bản lề dọc thân. */
function Wing({ side, color }: { side: 1 | -1; color: string }) {
  const g = wings();
  const rim = rimOf(color);
  const light = '#' + new THREE.Color(color).lerp(new THREE.Color('#ffffff'), 0.35).getHexString();
  return (
    <group scale={[side, 1, 1]}>
      <mesh geometry={g.foreRim} material={mat(rim, 0.15)} />
      <mesh geometry={g.fore} material={mat(color, 0.35)} position-y={0.002} />
      <mesh geometry={g.hindRim} material={mat(rim, 0.15)} />
      <mesh geometry={g.hind} material={mat(light, 0.35)} position-y={0.002} />
      {/* chấm trắng gần mép cánh trước, chấm cam ở cánh sau */}
      {(
        [
          [0.27, 0.19, 0.022, '#ffffff'],
          [0.31, 0.12, 0.018, '#ffffff'],
          [0.17, -0.19, 0.03, '#ffb347'],
        ] as [number, number, number, string][]
      ).map(([x, z, r, c], i) => (
        <mesh key={i} position={[x, 0.004, z]} rotation-x={-Math.PI / 2} material={mat(c, 0.2)}>
          <circleGeometry args={[r, 10]} />
        </mesh>
      ))}
    </group>
  );
}

function Body() {
  const dark = mat('#2b1d2e');
  return (
    <group>
      <mesh material={dark} rotation-x={Math.PI / 2} scale={[1, 1, 1]}>
        <capsuleGeometry args={[0.022, 0.2, 4, 8]} />
      </mesh>
      <mesh material={dark} position={[0, 0.005, 0.14]}>
        <sphereGeometry args={[0.032, 10, 8]} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.012, 0.02, 0.16]} rotation={[-0.9, s * 0.35, 0]}>
          <mesh material={dark} position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.004, 0.004, 0.14, 4]} />
          </mesh>
          <mesh material={dark} position={[0, 0.145, 0]}>
            <sphereGeometry args={[0.013, 6, 5]} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// ---------- Bay ----------

export interface ButterflyProps {
  /** Chỗ neo: bướm bay quanh đây (hoặc đậu tại đây nếu `perch`). */
  anchor: V3;
  color?: string;
  seed?: number;
  /** Bán kính bay ngang quanh chỗ neo (m). */
  range?: number;
  /** Bay cao từ … tới … (m) so với mặt đất. */
  height?: [number, number];
  /** Độ cao mặt đất tại (x, z). */
  ground?: (x: number, z: number) => number;
  /** Đậu một chỗ (trên hoa), khép mở cánh. */
  perch?: boolean;
  /** Hướng đầu khi đậu (rad quanh trục y). */
  heading?: number;
  scale?: number;
}

export function Butterfly({ anchor, color = '#9b6bff', seed = 1, range = 2, height = [1, 2.6], ground = () => 0, perch = false, heading = 0, scale = 1 }: ButterflyProps) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const left = useRef<THREE.Group>(null);
  const right = useRef<THREE.Group>(null);
  const st = useMemo(() => {
    const r = rng(seed + 1);
    return {
      r,
      pos: new THREE.Vector3(anchor[0] + (r() - 0.5) * range, anchor[1] + height[0] + r() * (height[1] - height[0]), anchor[2] + (r() - 0.5) * range),
      vel: new THREE.Vector3(),
      target: new THREE.Vector3(),
      retarget: 0,
      flap: r() * 10,
      glide: 0,
      nextGlide: 1 + r() * 3,
      yaw: r() * Math.PI * 2,
      roll: 0,
      // bướm đậu: lúc vỗ nhanh vài cái
      burst: 0,
      nextBurst: 2 + r() * 4,
    };
  }, [anchor, range, height, seed]);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 15);
    const t = clock.elapsedTime;
    const s = st;
    let wing: number; // góc cánh so với mặt ngang (0 = xoè phẳng, ~1.5 = khép đứng)
    let bob = 0;

    if (perch) {
      // khép mở chậm, có lúc dừng; thỉnh thoảng vỗ nhanh 3–4 cái
      s.nextBurst -= dt;
      if (s.nextBurst <= 0) {
        s.burst = 0.45;
        s.nextBurst = 3 + s.r() * 5;
      }
      if (s.burst > 0) {
        s.burst -= dt;
        s.flap += dt * 9 * Math.PI * 2;
        wing = 0.55 + 0.75 * (0.5 + 0.5 * Math.sin(s.flap));
      } else {
        const slow = 0.5 + 0.5 * Math.sin(t * 1.1 + seed);
        wing = 0.15 + 1.25 * Math.pow(slow, 1.6);
      }
      root.current?.position.set(anchor[0], anchor[1], anchor[2]);
      if (root.current) root.current.rotation.set(0, heading, 0);
    } else {
      // chọn điểm đến mới khi gần tới hoặc hết giờ
      s.retarget -= dt;
      if (s.retarget <= 0 || s.pos.distanceTo(s.target) < 0.4) {
        const a = s.r() * Math.PI * 2;
        const d = range * Math.sqrt(s.r());
        const x = anchor[0] + Math.cos(a) * d;
        const z = anchor[2] + Math.sin(a) * d;
        s.target.set(x, ground(x, z) + height[0] + s.r() * (height[1] - height[0]), z);
        s.retarget = 2 + s.r() * 3;
      }
      // lái mềm tới điểm đến, cộng lắc ngang chập chờn
      const speed = 1.1;
      tmp.copy(s.target).sub(s.pos).normalize().multiplyScalar(speed);
      tmp.x += Math.sin(t * 2.3 + seed) * 0.5;
      tmp.z += Math.cos(t * 1.9 + seed * 2) * 0.5;
      tmp.y += Math.sin(t * 3.1 + seed) * 0.35;
      s.vel.lerp(tmp, Math.min(1, dt * 1.8));
      s.pos.addScaledVector(s.vel, dt);
      const floor = ground(s.pos.x, s.pos.z) + 0.4;
      if (s.pos.y < floor) s.pos.y = floor;

      // vỗ cánh ~8 lần/giây, xen lúc lướt giữ cánh hơi nâng
      s.nextGlide -= dt;
      if (s.nextGlide <= 0) {
        s.glide = 0.35 + s.r() * 0.4;
        s.nextGlide = 1.5 + s.r() * 3;
      }
      if (s.glide > 0) {
        s.glide -= dt;
        s.vel.y -= dt * 0.6; // lướt thì hơi hạ độ cao
        wing = 0.3 + Math.sin(t * 20) * 0.03;
      } else {
        s.flap += dt * 8 * Math.PI * 2;
        const ph = Math.sin(s.flap);
        // đập xuống nhanh, nâng lên chậm: lệch sóng cho tự nhiên
        wing = 0.55 + 0.85 * (ph > 0 ? ph : ph * 0.75);
        bob = -Math.cos(s.flap) * 0.035; // thân nhô lên khi cánh đập xuống
      }

      // quay đầu theo hướng bay, nghiêng khi rẽ
      const want = Math.atan2(s.vel.x, s.vel.z);
      let dy = want - s.yaw;
      dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      s.yaw += dy * Math.min(1, dt * 4);
      s.roll += (THREE.MathUtils.clamp(-dy * 1.2, -0.6, 0.6) - s.roll) * Math.min(1, dt * 4);
      const pitch = THREE.MathUtils.clamp(-s.vel.y * 0.4, -0.4, 0.4);
      if (root.current) {
        root.current.position.copy(s.pos);
        root.current.rotation.set(pitch, s.yaw, s.roll, 'YXZ');
      }
    }
    if (body.current) body.current.position.y = bob;
    // cánh trái/phải quay quanh trục thân (z): nâng lên là góc dương
    if (right.current) right.current.rotation.z = wing;
    if (left.current) left.current.rotation.z = -wing;
  });

  return (
    <group ref={root} scale={scale}>
      <group ref={body}>
        <Body />
        <group ref={right}>
          <Wing side={1} color={color} />
        </group>
        <group ref={left}>
          <Wing side={-1} color={color} />
        </group>
      </group>
    </group>
  );
}
