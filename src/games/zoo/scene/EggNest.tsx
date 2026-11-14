// Bến trứng: gà mái ngồi sau ổ rơm đan có 10 quả trứng, rào kẹo bao quanh, hoa hướng dương, bọ rùa, sỏi màu.
// Bấm "Nở" thì 3 quả nở ra gà con.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Blush, Cone, CuteEye, Tube, toon } from '../../../shared/3d/toon';
import { NEST, NEST_FENCE } from '../layout';
import { ACTIONS, useZoo } from '../store';
import { groundHeight } from '../world';
import { Fence } from './Structures';

type V3 = [number, number, number];

const EGGS = 10;
/** Quả nở: các quả giữa hàng trước (gần thuyền), cho dễ thấy. */
const HATCH = [1, 2, 3].slice(0, ACTIONS.egg.count);
const SCALE = 1.8;
/** Ổ hình bầu dục: tâm (theo z) và hai bán trục, tính trong khung đã phóng to SCALE. */
const NEST_Z = -0.7;
const RX = 2.7;
const RZ = 1.75;
const STRAW = ['#c98f2e', '#b57a1f', '#a86d18', '#d29a3a'];

/** Chỗ quả trứng thứ i trong ổ: 2 hàng 5 quả; hàng 0 ở trước (phía sông, −z). */
function eggSpot(i: number): V3 {
  const row = i < 5 ? 0 : 1;
  return [((i % 5) - 2) * 0.82, 0, row === 0 ? -1.15 : -0.3];
}

function Egg({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Ball p={[0, 0.46, 0]} s={[0.29, 0.37, 0.29]} c="#fffaf0" />
      {/* đốm bóng như vỏ trứng ngọc trai */}
      <mesh position={[-0.1, 0.6, -0.22]} scale={[0.06, 0.09, 0.04]}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

/** Gà con lông vàng, quay mặt ra sông (−z). */
function ChickBody() {
  return (
    <group rotation-y={Math.PI}>
      <Ball p={[0, 0.36, 0]} s={0.26} c="#ffd93b" />
      <Ball p={[0, 0.68, 0.02]} s={0.2} c="#ffe066" />
      <Ball p={[0, 0.9, 0]} s={[0.04, 0.07, 0.04]} c="#ffd93b" />
      <Cone p={[0, 0.65, 0.22]} s={[0.05, 0.1, 0.05]} r={[Math.PI / 2, 0, 0]} c="#f28a1b" />
      <CuteEye p={[-0.08, 0.73, 0.16]} size={0.05} />
      <CuteEye p={[0.08, 0.73, 0.16]} size={0.05} />
      <Blush p={[-0.13, 0.64, 0.15]} size={0.035} />
      <Blush p={[0.13, 0.64, 0.15]} size={0.035} />
      <Ball p={[-0.24, 0.4, 0]} s={[0.07, 0.14, 0.12]} r={[0, 0, 0.5]} c="#f5c518" />
      <Ball p={[0.24, 0.4, 0]} s={[0.07, 0.14, 0.12]} r={[0, 0, -0.5]} c="#f5c518" />
    </group>
  );
}

/** Vỏ trứng nứt đôi và gà con lớn dần lên từ trong vỏ. */
function Chick({ p }: { p: V3 }) {
  const g = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const s = g.current;
    if (!s) return;
    s.scale.setScalar(THREE.MathUtils.lerp(s.scale.x, 1, Math.min(1, dt * 4)));
  });
  return (
    <group position={p}>
      {/* nửa vỏ dưới và mảnh vỏ trên rơi bên cạnh */}
      <Ball p={[0, 0.16, 0]} s={[0.29, 0.16, 0.29]} c="#fffaf0" />
      <Ball p={[0.34, 0.12, 0.1]} s={[0.18, 0.09, 0.18]} r={[0.6, 0, 0.4]} c="#fffaf0" />
      <group ref={g} scale={0.01}>
        <ChickBody />
      </group>
    </group>
  );
}

/** Gà mái ngồi ấp sau ổ, quay mặt ra sông (−z): mình nâu, ngực nâu đậm như đuôi, cánh và đuôi nâu đậm, mào đỏ. */
function Hen({ p }: { p: V3 }) {
  return (
    <group position={p} rotation-y={Math.PI}>
      <Ball p={[0, 0.62, 0]} s={[0.72, 0.6, 0.66]} c="#d9925a" />
      <Ball p={[0, 0.66, 0.24]} s={[0.5, 0.44, 0.44]} c="#a65a2c" />
      {/* cánh hai bên */}
      <Ball p={[-0.66, 0.7, -0.05]} s={[0.18, 0.36, 0.48]} r={[0.2, 0, 0.25]} c="#b8693a" />
      <Ball p={[0.66, 0.7, -0.05]} s={[0.18, 0.36, 0.48]} r={[0.2, 0, -0.25]} c="#b8693a" />
      {/* đuôi xòe */}
      <Cone p={[0, 1.05, -0.6]} s={[0.2, 0.55, 0.2]} r={[-0.7, 0, 0]} c="#8a4a22" />
      <Cone p={[-0.22, 0.98, -0.58]} s={[0.17, 0.48, 0.17]} r={[-0.8, 0, 0.35]} c="#a65a2c" />
      <Cone p={[0.22, 0.98, -0.58]} s={[0.17, 0.48, 0.17]} r={[-0.8, 0, -0.35]} c="#a65a2c" />
      {/* đầu */}
      <Ball p={[0, 1.3, 0.42]} s={0.36} c="#f0bf86" />
      <Ball p={[0, 1.72, 0.42]} s={0.1} c="#e3342f" />
      <Ball p={[0, 1.68, 0.56]} s={0.08} c="#e3342f" />
      <Ball p={[0, 1.68, 0.28]} s={0.08} c="#e3342f" />
      <Cone p={[0, 1.24, 0.82]} s={[0.09, 0.18, 0.09]} r={[Math.PI / 2, 0, 0]} c="#f2b21b" />
      <Ball p={[0, 1.08, 0.74]} s={[0.06, 0.1, 0.05]} c="#e3342f" />
      <CuteEye p={[-0.15, 1.38, 0.7]} size={0.09} />
      <CuteEye p={[0.15, 1.38, 0.7]} size={0.09} />
      <Blush p={[-0.25, 1.22, 0.67]} size={0.06} />
      <Blush p={[0.25, 1.22, 0.67]} size={0.06} />
    </group>
  );
}

/** Ổ rơm đan: lòng ổ, ba vòng rơm chồng lên nhau và các cọng rơm chĩa ra quanh vành. */
function StrawNest() {
  const sticks = Array.from({ length: 56 }, (_, i) => {
    const a = (i / 56) * Math.PI * 2 + Math.sin(i * 7.3) * 0.05;
    const tilt = 0.9 + Math.sin(i * 3.1) * 0.35;
    return { a, tilt, y: 0.18 + (i % 3) * 0.12, c: STRAW[i % STRAW.length] };
  });
  return (
    <group position={[0, 0, NEST_Z]}>
      <mesh position={[0, 0.08, 0]} scale={[RX, 1, RZ]} material={toon('#c08423')} receiveShadow>
        <cylinderGeometry args={[1, 1.04, 0.18, 32]} />
      </mesh>
      {[0.14, 0.3, 0.44].map((y, k) => (
        <mesh key={k} position={[0, y, 0]} scale={[RX - k * 0.04, RZ - k * 0.03, 1]} rotation-x={-Math.PI / 2} material={toon(STRAW[k + 1])} castShadow>
          <torusGeometry args={[1, 0.085, 8, 40]} />
        </mesh>
      ))}
      {sticks.map((s, i) => (
        <group key={i} position={[Math.cos(s.a) * RX, s.y, Math.sin(s.a) * RZ]} rotation-y={-s.a}>
          <Tube p={[0.1, 0, 0]} s={[0.025, 0.7, 0.025]} r={[0, 0, s.tilt]} c={s.c} shadow={false} />
        </group>
      ))}
    </group>
  );
}

function Sunflower({ p, h = 0.9 }: { p: V3; h?: number }) {
  return (
    <group position={p}>
      <Tube p={[0, h / 2, 0]} s={[0.03, h, 0.03]} c="#4f9a3a" shadow={false} />
      <Ball p={[0.1, h * 0.45, 0]} s={[0.12, 0.03, 0.06]} r={[0, 0, 0.5]} c="#5fb04a" shadow={false} />
      <group position={[0, h, 0]} rotation-x={-1.2}>
        {Array.from({ length: 10 }, (_, i) => (
          <Ball key={i} p={[Math.cos((i / 10) * Math.PI * 2) * 0.15, Math.sin((i / 10) * Math.PI * 2) * 0.15, 0]} s={[0.08, 0.08, 0.03]} c="#ffc21a" shadow={false} />
        ))}
        <Ball p={[0, 0, 0.02]} s={[0.1, 0.1, 0.05]} c="#6b3d1a" shadow={false} />
      </group>
    </group>
  );
}

function Ladybug({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Ball p={[0, 0.06, 0]} s={[0.1, 0.07, 0.12]} c="#e3242b" shadow={false} />
      <Ball p={[0, 0.06, -0.11]} s={0.055} c="#1d1b2e" shadow={false} />
      <Ball p={[0.05, 0.11, 0.02]} s={0.022} c="#1d1b2e" shadow={false} />
      <Ball p={[-0.05, 0.11, 0.04]} s={0.022} c="#1d1b2e" shadow={false} />
    </group>
  );
}

const PEBBLES = ['#c98fa8', '#9b8fd1', '#e0a77a', '#8fb6d9', '#c7b28f'];

export function EggNest() {
  const hatched = useZoo((s) => s.acted.egg);
  const gy = groundHeight(NEST.x, NEST.z);
  // hàng rào như chuồng thú, bao quanh ổ (đã phóng to SCALE) và gà mái
  const x0 = NEST.x - NEST_FENCE.half;
  const x1 = NEST.x + NEST_FENCE.half;
  const z0 = NEST.z + NEST_FENCE.front;
  const z1 = NEST.z + NEST_FENCE.back;
  const at = (x: number, z: number): V3 => [x, groundHeight(x, z), z];
  // hoa, bọ rùa, sỏi đặt theo toạ độ thật trong rào, giữ cách xa ổ để không che trứng
  const flowers: V3[] = [at(x0 + 0.8, z0 + 1.0), at(x0 + 0.7, z1 - 1.2), at(x1 - 0.8, z1 - 1.0), at(x1 - 0.7, z0 + 1.6), at(x0 + 1.5, z1 - 0.6)];
  const bugs: V3[] = [at(NEST.x - 2.2, z0), at(NEST.x + 1.4, z0), at(NEST.x + 3.4, z0)];
  return (
    <>
      {/* mặt trước (phía sông) để thấp cho trẻ nhìn rõ trứng từ thuyền */}
      <Fence a={[x0, z0]} b={[x1, z0]} h={0.7} cap="#ff8fab" />
      <Fence a={[x1, z0]} b={[x1, z1]} cap="#7ad7ff" />
      <Fence a={[x1, z1]} b={[x0, z1]} cap="#7ad7ff" />
      <Fence a={[x0, z1]} b={[x0, z0]} cap="#7ad7ff" />
      {bugs.map((b, i) => (
        // bọ rùa đậu trên thanh ngang rào trước
        <Ladybug key={i} p={[b[0], b[1] + 0.47, b[2]]} />
      ))}
      {flowers.map((f, i) => (
        <Sunflower key={i} p={f} h={0.8 + (i % 2) * 0.25} />
      ))}
      {PEBBLES.map((c, i) => {
        const p = at(x1 - 1.2 - (i % 3) * 0.45, z0 + 0.6 + Math.floor(i / 3) * 0.4);
        return <Ball key={i} p={[p[0], p[1] + 0.04, p[2]]} s={[0.17, 0.07, 0.13]} c={c} shadow={false} />;
      })}
      {/* phóng to cho cả lớp đếm được từng quả trên màn chiếu */}
      <group position={[NEST.x, gy, NEST.z]} scale={SCALE}>
        <StrawNest />
        <Hen p={[0, 0.1, 0.75]} />
        {Array.from({ length: EGGS }, (_, i) => {
          const p = eggSpot(i);
          return hatched && HATCH.includes(i) ? <Chick key={i} p={p} /> : <Egg key={i} p={p} />;
        })}
      </group>
    </>
  );
}
