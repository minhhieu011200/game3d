import { useLayoutEffect, useMemo, useRef } from 'react';
import { Butterfly } from '../../../shared/3d/Butterfly';
import * as THREE from 'three';
import { petalsGeometry } from './flower';
import { useQuality } from '../../../shared/3d/quality';
import { CONE, CYL, SPHERE, SPHERE_LOW, toon } from '../../../shared/3d/toon';
import { nearWheel, ZONES } from '../layout';
import { groundHeight, riverCenterZ, RIVER_HALF_WIDTH, WORLD_HALF } from '../world';

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Chỗ dành cho sông, bờ, các khu và chuồng thú: không trồng cây vào đó. */
export function isReserved(x: number, z: number) {
  const d = z - riverCenterZ(x);
  if (Math.abs(d) < RIVER_HALF_WIDTH + 5) return true;
  const south = d > 0;
  if (south && x > ZONES.frogs.x0 - 2 && x < ZONES.frogs.x1 + 2 && d < RIVER_HALF_WIDTH + 10) return true;
  if (nearWheel(x, z, 2)) return true;
  if (!south && x > ZONES.storks.x0 - 2 && x < ZONES.storks.x1 + 3 && -d < RIVER_HALF_WIDTH + 12) return true;
  // chuồng thú ở cả hai bờ
  if (x > ZONES.animals.x0 - 2 && x < ZONES.animals.x1 + 2 && Math.abs(d) < RIVER_HALF_WIDTH + 24) return true;
  if (Math.abs(x - ZONES.gate) < 6) return true;
  return false;
}

function scatter(count: number, seed: number, ok: (x: number, z: number) => boolean, ring = false) {
  const r = rng(seed);
  const out: Array<[number, number, number]> = [];
  let guard = 0;
  while (out.length < count && guard++ < count * 60) {
    let x: number;
    let z: number;
    if (ring) {
      const a = r() * Math.PI * 2;
      const rad = WORLD_HALF * (0.78 + r() * 0.35);
      x = Math.cos(a) * rad;
      z = Math.sin(a) * rad;
    } else {
      x = (r() * 2 - 1) * (WORLD_HALF + 6);
      z = (r() * 2 - 1) * (WORLD_HALF + 6);
    }
    if (!ok(x, z)) continue;
    out.push([x, z, r()]);
  }
  return out;
}

// bảng màu lá sáng, tán cây không bị sẫm thành mảng đen
const CROWN_COLORS = ['#5a9a3e', '#4d8233', '#5f9a3c', '#6fae45', '#528f3a'];
const FRUIT_COLORS = ['#ff5a5f', '#ffb3c1', '#ffd23f'];

/** Cây hoạt hình vẽ instanced: cây tán tròn (có quả đỏ, hoa hồng) và cây thông nhiều tầng. */
export function Trees() {
  const q = useQuality();
  const spots = useMemo(() => {
    const ok = (x: number, z: number) => !isReserved(x, z);
    return [...scatter(q.shadows ? 70 : 40, 11, ok, true), ...scatter(q.shadows ? 36 : 18, 12, ok)];
  }, [q.shadows]);
  const round = spots.filter((_, i) => i % 3 !== 0);
  const pines = spots.filter((_, i) => i % 3 === 0);

  const trunk = useRef<THREE.InstancedMesh>(null);
  const crown = useRef<THREE.InstancedMesh>(null);
  const fruit = useRef<THREE.InstancedMesh>(null);
  const pineT = useRef<THREE.InstancedMesh>(null);
  const pineC = useRef<THREE.InstancedMesh>(null);
  const FRUITS = 5;
  const TIERS = 3;

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const qn = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    const r = rng(99);
    round.forEach(([x, z, k], i) => {
      const y = groundHeight(x, z);
      const h = 2.2 + k * 1.6;
      const rad = 1.7 + k * 1.1;
      m.compose(p.set(x, y + h / 2, z), qn.identity(), s.set(0.35, h, 0.35));
      trunk.current!.setMatrixAt(i, m);
      m.compose(p.set(x, y + h + rad * 0.7, z), qn.identity(), s.set(rad, rad * 0.92, rad));
      crown.current!.setMatrixAt(i, m);
      crown.current!.setColorAt(i, col.set(CROWN_COLORS[i % CROWN_COLORS.length]));
      for (let j = 0; j < FRUITS; j++) {
        const a = r() * Math.PI * 2;
        const b = 0.2 + r() * 1.0;
        const fx = Math.cos(a) * Math.sin(b) * rad * 0.95;
        const fz = Math.sin(a) * Math.sin(b) * rad * 0.95;
        const fy = Math.cos(b) * rad * 0.85;
        m.compose(p.set(x + fx, y + h + rad * 0.7 + fy * 0.6, z + fz), qn.identity(), s.setScalar(0.17));
        fruit.current!.setMatrixAt(i * FRUITS + j, m);
        fruit.current!.setColorAt(i * FRUITS + j, col.set(FRUIT_COLORS[i % FRUIT_COLORS.length]));
      }
    });
    pines.forEach(([x, z, k], i) => {
      const y = groundHeight(x, z);
      const h = 1.2 + k;
      m.compose(p.set(x, y + h / 2, z), qn.identity(), s.set(0.3, h, 0.3));
      pineT.current!.setMatrixAt(i, m);
      for (let t = 0; t < TIERS; t++) {
        const w = (1.9 - t * 0.45) * (0.85 + k * 0.4);
        m.compose(p.set(x, y + h + 0.6 + t * 1.15, z), qn.identity(), s.set(w, 1.8, w));
        pineC.current!.setMatrixAt(i * TIERS + t, m);
        pineC.current!.setColorAt(i * TIERS + t, col.set(t % 2 ? '#2e9e5b' : '#27874f'));
      }
    });
    for (const ref of [trunk, crown, fruit, pineT, pineC]) {
      ref.current!.instanceMatrix.needsUpdate = true;
      if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
    }
  }, [round, pines]);

  return (
    <>
      <instancedMesh ref={trunk} args={[CYL, toon('#9b6a3c'), round.length]} castShadow />
      <instancedMesh ref={crown} args={[SPHERE, toon('#ffffff'), round.length]} castShadow receiveShadow />
      <instancedMesh ref={fruit} args={[SPHERE_LOW, toon('#ffffff'), round.length * FRUITS]} />
      <instancedMesh ref={pineT} args={[CYL, toon('#8a5a32'), pines.length]} castShadow />
      <instancedMesh ref={pineC} args={[CONE, toon('#ffffff'), pines.length * TIERS]} castShadow receiveShadow />
    </>
  );
}

const FLOWER_COLORS = ['#ff6fa8', '#ffd23f', '#ffffff', '#b38cff', '#ff8a3d'];

/** Bụi cây tròn, hoa nhiều màu và nấm đốm đỏ rải trên cỏ. */
export function Bushes() {
  const q = useQuality();
  const bush = useRef<THREE.InstancedMesh>(null);
  const petal = useRef<THREE.InstancedMesh>(null);
  const core = useRef<THREE.InstancedMesh>(null);
  const stem = useRef<THREE.InstancedMesh>(null);
  const petalMat = useMemo(() => {
    const m = toon('#ffffff').clone();
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  const bushes = useMemo(() => scatter(q.shadows ? 60 : 30, 31, (x, z) => !isReserved(x, z)), [q.shadows]);
  const flowers = useMemo(() => scatter(q.shadows ? 420 : 180, 32, (x, z) => Math.abs(z - riverCenterZ(x)) > RIVER_HALF_WIDTH + 1.5 && !nearWheel(x, z)), [q.shadows]);

  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const qn = new THREE.Quaternion();
    const s = new THREE.Vector3();
    const p = new THREE.Vector3();
    const col = new THREE.Color();
    bushes.forEach(([x, z, k], i) => {
      const r0 = 0.7 + k * 0.7;
      m.compose(p.set(x, groundHeight(x, z) + r0 * 0.45, z), qn.identity(), s.set(r0 * 1.3, r0, r0 * 1.1));
      bush.current!.setMatrixAt(i, m);
      bush.current!.setColorAt(i, col.set(k > 0.5 ? '#45b649' : '#5ccb5f'));
    });
    flowers.forEach(([x, z, k], i) => {
      const y = groundHeight(x, z);
      m.compose(p.set(x, y + 0.18, z), qn.identity(), s.set(0.025, 0.36, 0.025));
      stem.current!.setMatrixAt(i, m);
      // bông 5 cánh xoay ngẫu nhiên, nhụy vàng ở giữa
      qn.setFromAxisAngle(p.set(0, 1, 0), k * 40);
      m.compose(p.set(x, y + 0.38, z), qn, s.set(0.17, 0.17, 0.17));
      petal.current!.setMatrixAt(i, m);
      m.compose(p.set(x, y + 0.4, z), qn.identity(), s.set(0.055, 0.035, 0.055));
      core.current!.setMatrixAt(i, m);
      petal.current!.setColorAt(i, col.set(FLOWER_COLORS[Math.floor(k * FLOWER_COLORS.length)]));
    });
    for (const ref of [bush, petal, core, stem]) {
      ref.current!.instanceMatrix.needsUpdate = true;
      if (ref.current!.instanceColor) ref.current!.instanceColor.needsUpdate = true;
    }
  }, [bushes, flowers]);

  return (
    <>
      <instancedMesh ref={bush} args={[SPHERE, toon('#ffffff'), bushes.length]} castShadow receiveShadow />
      <instancedMesh ref={stem} args={[CYL, toon('#3d9b3a'), flowers.length]} />
      <instancedMesh ref={petal} args={[petalsGeometry(), petalMat, flowers.length]} />
      <instancedMesh ref={core} args={[SPHERE_LOW, toon('#ffc21a'), flowers.length]} />
    </>
  );
}

/** Bướm bay lượn quanh các khu. */
export function Butterflies() {
  const list = useMemo(() => {
    const r = rng(77);
    return Array.from({ length: 14 }, () => {
      const cx = -30 + r() * 65;
      const off = (r() > 0.5 ? 1 : -1) * (RIVER_HALF_WIDTH + 3 + r() * 6);
      return {
        anchor: [cx, 0, riverCenterZ(cx) + off] as [number, number, number],
        range: 1.5 + r() * 2.5,
        color: ['#ff7ab6', '#ffd23f', '#7ad7ff', '#b38cff'][Math.floor(r() * 4)],
      };
    });
  }, []);
  return (
    <>
      {list.map((b, i) => (
        <Butterfly key={i} anchor={b.anchor} range={b.range} height={[0.8, 2]} ground={groundHeight} color={b.color} seed={i + 11} scale={0.6} />
      ))}
    </>
  );
}
