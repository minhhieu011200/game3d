// Trang trí dọc đường tham quan: cổng chào, hàng rào kẹo, đèn lồng, bóng bay, bụi hoa và các bạn thú.
import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Animal } from '../games/zoo/scene/Animals';
import { useQuality } from '../shared/3d/quality';
import { Sign3D } from '../shared/3d/Sign3D';
import { Ball, BOX, CYL, SPHERE_LOW, Tube, toon } from '../shared/3d/toon';
import { brickMaterial, ironMaterial, solid } from './textures';
import { CLASS_NAME } from './logic';
import { ARCH, ARCH_T, bushSpots, FENCE_SIDE, fenced, lampSpots, ROADSIDE_ANIMALS } from './layout';
import { PATH } from './path';

type V3 = [number, number, number];

const UP = new THREE.Vector3(0, 1, 0);

/** Điểm trên đường lệch sang trái (−) / phải (+) một đoạn `side` mét. */
export function sidePoint(t: number, side: number) {
  const p = PATH.getPointAt(t);
  const n = new THREE.Vector3().crossVectors(PATH.getTangentAt(t), UP).normalize();
  return new THREE.Vector3(p.x + n.x * side, 0, p.z + n.z * side);
}

/** Góc quay để +z cục bộ nhìn từ chỗ đứng về phía đường. */
function faceRoad(t: number, side: number) {
  const n = new THREE.Vector3().crossVectors(PATH.getTangentAt(t), UP).normalize();
  return Math.atan2(-n.x * Math.sign(side), -n.z * Math.sign(side));
}

/** Đoạn đường không có hàng rào: trước cổng chào, quanh các cổng, quảng trường. */

// ---------- Cổng chào ----------

const RAINBOW = ['#e8443a', '#f39a2b', '#f7d046', '#5cb85c', '#3d8fd6', '#7b5cc9'];

/** Tháp tròn: gạch đỏ xen sọc trắng, mái nhọn màu be, quả cầu đỏ và lá cờ. */
function BrickTower({ x, flag }: { x: number; flag: string }) {
  const bands = 4;
  return (
    <group position={[x, 0, 0]}>
      {Array.from({ length: bands }, (_, i) => (
        <group key={i}>
          <mesh position={[0, 0.45 + i * 1.4, 0]} material={brickMaterial()} castShadow receiveShadow>
            <cylinderGeometry args={[0.78, 0.78, 0.9, 24]} />
          </mesh>
          <mesh position={[0, 1.15 + i * 1.4, 0]} material={solid('#f1ebe0', 0.8)} castShadow>
            <cylinderGeometry args={[0.8, 0.8, 0.5, 24]} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, bands * 1.4 + 0.12, 0]} material={solid('#f1ebe0', 0.8)} castShadow>
        <cylinderGeometry args={[0.95, 0.85, 0.25, 24]} />
      </mesh>
      <mesh position={[0, bands * 1.4 + 0.95, 0]} material={solid('#e2bf8c', 0.85)} castShadow>
        <coneGeometry args={[0.98, 1.45, 24]} />
      </mesh>
      <mesh position={[0, bands * 1.4 + 1.8, 0]} material={solid('#d63b2f', 0.4)}>
        <sphereGeometry args={[0.2, 16, 12]} />
      </mesh>
      <mesh position={[0, bands * 1.4 + 2.35, 0]} material={ironMaterial()}>
        <cylinderGeometry args={[0.03, 0.03, 1.0, 6]} />
      </mesh>
      <Sign3D text={flag} height={0.42} bg={x < 0 ? '#2f6fc0' : '#3f9a4b'} border="#ffffff" billboard={false} twoSided position={[0.38, bands * 1.4 + 2.62, 0]} />
    </group>
  );
}

/** Hàng song sắt từ x0 tới x1 (trục x cục bộ), chân đặt ở độ cao y0. */
function IronBars({ x0, x1, y0, h, z = 0 }: { x0: number; x1: number; y0: number; h: number; z?: number }) {
  const n = Math.max(2, Math.round(Math.abs(x1 - x0) / 0.2));
  return (
    <group position={[0, y0, z]}>
      {Array.from({ length: n + 1 }, (_, i) => {
        const x = x0 + ((x1 - x0) * i) / n;
        return (
          <group key={i}>
            <mesh position={[x, h / 2, 0]} material={ironMaterial()} castShadow>
              <cylinderGeometry args={[0.025, 0.025, h, 6]} />
            </mesh>
            <mesh position={[x, h + 0.06, 0]} material={ironMaterial()}>
              <coneGeometry args={[0.05, 0.14, 6]} />
            </mesh>
          </group>
        );
      })}
      {[0.12, h - 0.1].map((y) => (
        <mesh key={y} position={[(x0 + x1) / 2, y, 0]} material={ironMaterial()}>
          <boxGeometry args={[Math.abs(x1 - x0), 0.05, 0.05]} />
        </mesh>
      ))}
    </group>
  );
}

/** Tường gạch thấp có hàng rào sắt phía trên, chạy từ chân tháp ra hai bên. */
function BrickWall({ x0, x1 }: { x0: number; x1: number }) {
  return (
    <group>
      <mesh position={[(x0 + x1) / 2, 0.4, 0]} material={brickMaterial()} castShadow receiveShadow>
        <boxGeometry args={[Math.abs(x1 - x0), 0.8, 0.45]} />
      </mesh>
      <mesh position={[(x0 + x1) / 2, 0.84, 0]} material={solid('#efe6d6', 0.8)}>
        <boxGeometry args={[Math.abs(x1 - x0) + 0.05, 0.1, 0.55]} />
      </mesh>
      <IronBars x0={x0} x1={x1} y0={0.89} h={1.3} />
    </group>
  );
}

/** Một cánh cổng sắt (bản lề ở x = 0), mở hé vào trong. */
function IronLeaf({ side }: { side: 1 | -1 }) {
  const w = 1.7;
  return (
    <group position={[side * 3.85, 0, 0]} rotation-y={side * -1.15}>
      <IronBars x0={0} x1={-side * w} y0={0.05} h={2.6} />
      <mesh position={[-side * w * 0.5, 2.0, 0]} material={ironMaterial()}>
        <torusGeometry args={[0.32, 0.03, 6, 20]} />
      </mesh>
    </group>
  );
}

/**
 * Thân cổng lớn: hai tháp gạch, cầu vồng trong vòm sắt, cánh cổng sắt, tường gạch hai bên, biển gỗ.
 * Dùng cho cổng chào (đầu đường) và cổng chúc mừng (quảng trường). Gốc toạ độ ở giữa lối vào.
 */
export function ArchBody({ title, sub, flags, wallTo }: { title: string; sub: string; flags: [string, string]; wallTo: number }) {
  const span = ARCH.span;
  const archY = 2.9;
  return (
    <>
      <BrickTower x={-span} flag={flags[0]} />
      <BrickTower x={span} flag={flags[1]} />
      {/* cầu vồng ôm trong vòm sắt */}
      {RAINBOW.map((col, i) => (
        <mesh key={col} position={[0, archY, 0]} material={solid(col, 0.55)} castShadow>
          <torusGeometry args={[3.6 - i * 0.24, 0.13, 10, 56, Math.PI]} />
        </mesh>
      ))}
      <mesh position={[0, archY, 0]} material={ironMaterial()}>
        <torusGeometry args={[3.82, 0.06, 8, 56, Math.PI]} />
      </mesh>
      <mesh position={[0, archY, 0]} material={ironMaterial()}>
        <torusGeometry args={[4.15, 0.05, 8, 56, Math.PI]} />
      </mesh>
      {/* hoa văn sắt uốn giữa hai vòm */}
      {Array.from({ length: 9 }, (_, i) => {
        const a = (Math.PI * (i + 0.5)) / 9;
        return (
          <mesh key={i} position={[Math.cos(a) * 3.98, archY + Math.sin(a) * 3.98, 0]} material={ironMaterial()}>
            <torusGeometry args={[0.13, 0.022, 6, 16]} />
          </mesh>
        );
      })}
      <IronLeaf side={-1} />
      <IronLeaf side={1} />
      <BrickWall x0={-span - 0.8} x1={-wallTo} />
      <BrickWall x0={span + 0.8} x1={wallTo} />
      {/* biển gỗ trên đỉnh vòm, treo bằng hai cột sắt */}
      {[-2.4, 2.4].map((x) => (
        <mesh key={x} position={[x, archY + 4.6, 0]} material={ironMaterial()}>
          <cylinderGeometry args={[0.05, 0.05, 1.9, 6]} />
        </mesh>
      ))}
      <Sign3D
        text={title}
        sub={sub}
        height={1.9}
        wood
        border="#3b2210"
        color="#fff3d6"
        subColor="#ffe08a"
        billboard={false}
        twoSided
        position={[0, archY + 5.6, 0.25]}
      />
    </>
  );
}

/** Cổng chào lớn ở đầu đường: "KHU VUI CHƠI SỞ THÚ" và lời chào lớp. */
export function WelcomeArch() {
  const p = PATH.getPointAt(ARCH_T);
  const d = PATH.getTangentAt(ARCH_T);
  const yaw = Math.atan2(-d.x, -d.z);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={yaw}>
      <ArchBody
        title="🐻 KHU VUI CHƠI SỞ THÚ 🐘"
        sub={`Chào mừng thầy cô và các em học sinh lớp ${CLASS_NAME}!`}
        flags={['🦁', '🐘']}
        wallTo={ARCH.wallTo}
      />
      <Balloons p={[ARCH.balloons.x, 0, ARCH.balloons.z]} seed={2} />
      <Animal kind="giraffe" at={[ARCH.giraffe.x, ARCH.giraffe.z]} rot={ARCH.giraffe.rot} ground={() => 0} />
      <Animal kind="elephant" at={[ARCH.elephant.x, ARCH.elephant.z]} rot={ARCH.elephant.rot} ground={() => 0} />
    </group>
  );
}

// ---------- Bóng bay ----------

const BALLOON_COLORS = ['#ff5a5f', '#ffd23f', '#3fa7ff', '#5fd068', '#ff6fa8', '#9b6bff'];

export function Balloons({ p, seed = 0, count = 5 }: { p: V3; seed?: number; count?: number }) {
  const ref = useRef<THREE.Group>(null);
  const items = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const a = (i / count) * Math.PI * 2 + seed;
        return { x: Math.cos(a) * 0.45, z: Math.sin(a) * 0.45, h: 3.2 + ((i * 37 + seed * 11) % 7) * 0.12, c: BALLOON_COLORS[(i + seed) % BALLOON_COLORS.length] };
      }),
    [count, seed],
  );
  useFrame(({ clock }) => {
    const g = ref.current;
    if (!g) return;
    g.children.forEach((b, i) => {
      b.rotation.z = Math.sin(clock.elapsedTime * 1.3 + i + seed) * 0.08;
      b.rotation.x = Math.cos(clock.elapsedTime * 1.1 + i * 2) * 0.06;
    });
  });
  return (
    <group position={p}>
      <BalloonWeight />
      <group ref={ref}>
        {items.map((b, i) => (
          <group key={i}>
            <Tube c="#ffffff" p={[b.x / 2, b.h / 2, b.z / 2]} s={[0.012, b.h, 0.012]} r={[b.z * 0.4, 0, -b.x * 0.4]} shadow={false} />
            <Ball c={b.c} p={[b.x, b.h + 0.35, b.z]} s={[0.36, 0.44, 0.36]} />
            <Ball c="#ffffff" p={[b.x - 0.1, b.h + 0.48, b.z + 0.27]} s={0.06} shadow={false} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Quả nặng giữ chùm bóng. */
function BalloonWeight() {
  return <Tube c="#8a5a2b" p={[0, 0.15, 0]} s={[0.18, 0.3, 0.18]} />;
}

// ---------- Hàng rào kẹo (instanced) ----------

export function CandyFences() {
  const posts = useRef<THREE.InstancedMesh>(null);
  const caps = useRef<THREE.InstancedMesh>(null);
  const rails = useRef<THREE.InstancedMesh>(null);
  const data = useMemo(() => {
    const len = PATH.getLength();
    const step = 1.5 / len;
    const out: { side: number; pts: THREE.Vector3[] }[] = [];
    for (const side of [-FENCE_SIDE, FENCE_SIDE]) {
      let run: THREE.Vector3[] = [];
      for (let t = 0; t <= 1; t += step) {
        if (fenced(t)) run.push(sidePoint(t, side));
        else if (run.length) {
          out.push({ side, pts: run });
          run = [];
        }
      }
      if (run.length) out.push({ side, pts: run });
    }
    const all = out.flatMap((r) => r.pts);
    const segs = out.flatMap((r) => r.pts.slice(1).map((b, i) => [r.pts[i], b] as const));
    return { all, segs };
  }, []);

  useLayoutEffect(() => {
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    data.all.forEach((p, i) => {
      o.position.set(p.x, 0.5, p.z);
      o.scale.set(0.05, 1, 0.05);
      o.rotation.set(0, 0, 0);
      o.updateMatrix();
      posts.current!.setMatrixAt(i, o.matrix);
      o.position.set(p.x, 1.05, p.z);
      o.scale.setScalar(0.09);
      o.updateMatrix();
      caps.current!.setMatrixAt(i, o.matrix);
      caps.current!.setColorAt(i, c.set('#d4a645'));
    });
    data.segs.forEach(([a, b], i) => {
      o.position.set((a.x + b.x) / 2, 0.62, (a.z + b.z) / 2);
      o.scale.set(a.distanceTo(b), 0.1, 0.06);
      o.rotation.set(0, -Math.atan2(b.z - a.z, b.x - a.x), 0);
      o.updateMatrix();
      rails.current!.setMatrixAt(i, o.matrix);
    });
    [posts, caps, rails].forEach((r) => {
      r.current!.instanceMatrix.needsUpdate = true;
      r.current!.computeBoundingSphere();
    });
    caps.current!.instanceColor!.needsUpdate = true;
  }, [data]);

  return (
    <>
      <instancedMesh ref={posts} args={[CYL, ironMaterial(), data.all.length]} castShadow />
      <instancedMesh ref={caps} args={[SPHERE_LOW, solid('#ffffff', 0.4, 0.5), data.all.length]} />
      <instancedMesh ref={rails} args={[BOX, ironMaterial(), data.segs.length]} />
    </>
  );
}

// ---------- Đèn lồng, bụi hoa ----------

function Lamp({ t, side }: { t: number; side: number }) {
  const p = sidePoint(t, side);
  return (
    <group position={[p.x, 0, p.z]}>
      <Tube c="#3c4650" p={[0, 1.4, 0]} s={[0.07, 2.8, 0.07]} />
      <Ball c="#ff5a5f" p={[0, 3.0, 0]} s={[0.26, 0.3, 0.26]} />
      <mesh position={[0, 2.95, 0]} material={toon('#ffe9a8', { emissive: '#ffb347' })}>
        <sphereGeometry args={[0.17, 12, 8]} />
      </mesh>
    </group>
  );
}

export function Lamps() {
  const lamps = useMemo(() => lampSpots(), []);
  return (
    <>
      {lamps.map((l, i) => (
        <Lamp key={i} {...l} />
      ))}
    </>
  );
}

const FLOWER_COLORS = ['#ff6fa8', '#ffd23f', '#ff5a5f', '#ffffff', '#9b6bff'];

export function FlowerBushes() {
  const q = useQuality();
  const bushes = useMemo(
    () =>
      bushSpots(q.shadows).map((b, i) => {
        const p = sidePoint(b.t, b.side);
        return { p: [p.x, 0, p.z] as V3, c: FLOWER_COLORS[i % FLOWER_COLORS.length] };
      }),
    [q.shadows],
  );
  return (
    <>
      {bushes.map((b, i) => (
        <group key={i} position={b.p}>
          <Ball c="#4fb34a" p={[0, 0.35, 0]} s={[0.7, 0.45, 0.6]} />
          <Ball c={b.c} p={[0.25, 0.7, 0.2]} s={0.12} shadow={false} />
          <Ball c={b.c} p={[-0.3, 0.62, 0.1]} s={0.12} shadow={false} />
          <Ball c={b.c} p={[0, 0.78, -0.2]} s={0.12} shadow={false} />
        </group>
      ))}
    </>
  );
}

// ---------- Các bạn thú dọc đường ----------

export function RoadsideAnimals() {
  return (
    <>
      {ROADSIDE_ANIMALS.map((a, i) => {
        const p = sidePoint(a.t, a.side);
        return <Animal key={i} kind={a.kind} at={[p.x, p.z]} rot={faceRoad(a.t, a.side)} wander={a.wander} ground={() => 0} />;
      })}
    </>
  );
}
