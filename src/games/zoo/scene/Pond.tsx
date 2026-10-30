import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../../../shared/3d/quality';
import { Ball, Cone, CuteEye, Tube, toon } from '../../../shared/3d/toon';
import { WHEEL, ZONES } from '../layout';
import { groundHeight, riverCenterZ, RIVER_HALF_WIDTH, WATER_Y, WORLD_HALF } from '../world';
import { isReserved, rng } from './Vegetation';

// Cảnh ven sông cho sinh động: vịt con vàng bơi, lá súng, hoa sen, cỏ lau, đá cuội. Chỉ để trang trí, không bắt chuột.

const noRay = () => null;
type V3 = [number, number, number];

/** Vịt con vàng chibi, mỏ cam. Mặt hướng về +z. */
function Duck({ female = false }: { female?: boolean }) {
  const body = female ? '#ffe066' : '#ffd23f';
  return (
    <group>
      <Ball c={body} p={[0, 0.16, 0]} s={[0.24, 0.17, 0.34]} />
      {/* cánh và đuôi vàng đậm hơn một chút */}
      <Ball c="#ffc21a" p={[-0.17, 0.2, -0.02]} s={[0.06, 0.1, 0.2]} />
      <Ball c="#ffc21a" p={[0.17, 0.2, -0.02]} s={[0.06, 0.1, 0.2]} />
      <Cone c="#ffc21a" p={[0, 0.27, -0.33]} s={[0.1, 0.18, 0.06]} r={[-1.2, 0, 0]} />
      <Ball c={body} p={[0, 0.42, 0.2]} s={0.15} />
      <Ball c="#ff8a1e" p={[0, 0.39, 0.37]} s={[0.075, 0.035, 0.085]} />
      <CuteEye p={[-0.08, 0.46, 0.31]} size={0.038} />
      <CuteEye p={[0.08, 0.46, 0.31]} size={0.038} />
    </group>
  );
}

/** Mấy con vịt bơi vòng tròn chậm rãi sát bờ, đầu gật gù, có gợn nước. */
function SwimmingDuck({ center, r, speed, phase, female }: { center: [number, number]; r: number; speed: number; phase: number; female?: boolean }) {
  const ref = useRef<THREE.Group>(null);
  const ring = useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * speed + phase;
    const g = ref.current;
    if (!g) return;
    g.position.set(center[0] + Math.cos(t) * r, WATER_Y - 0.06 + Math.sin(t * 6) * 0.015, center[1] + Math.sin(t) * r * 0.55);
    // hướng theo tiếp tuyến của đường bơi
    g.rotation.y = Math.atan2(-Math.sin(t) * r, Math.cos(t) * r * 0.55) * (speed > 0 ? 1 : -1);
    g.rotation.z = Math.sin(t * 6) * 0.04;
    if (ring.current) {
      const k = (clock.elapsedTime * 0.8 + phase) % 1;
      ring.current.scale.setScalar(0.4 + k * 0.9);
      (ring.current.material as THREE.MeshBasicMaterial).opacity = 0.45 * (1 - k);
    }
  });
  return (
    <group ref={ref} scale={1.5} raycast={noRay}>
      <Duck female={female} />
      <mesh ref={ring} rotation-x={-Math.PI / 2} position-y={0.07} raycast={noRay}>
        <ringGeometry args={[0.36, 0.42, 28]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Lá súng tròn có khe, đôi chỗ có hoa sen hồng. */
function LilyPad({ p, s, rot, flower }: { p: V3; s: number; rot: number; flower: boolean }) {
  return (
    <group position={p} rotation-y={rot} scale={s} raycast={noRay}>
      <mesh rotation-x={-Math.PI / 2} material={toon('#3f8f3a', { side: THREE.DoubleSide })} raycast={noRay}>
        <circleGeometry args={[0.6, 20, 0.35, Math.PI * 2 - 0.7]} />
      </mesh>
      {flower && (
        // hoa sen: 2 lớp cánh nhọn hồng xoè dần ra ngoài, nhụy vàng ở giữa
        <group position={[0.1, 0.03, 0.05]}>
          {[
            { n: 8, tilt: 1.0, len: 0.24, c: '#ffb3d1', turn: 0 },
            { n: 6, tilt: 0.45, len: 0.22, c: '#ff7fb0', turn: 0.4 },
          ].flatMap((ring, r) =>
            Array.from({ length: ring.n }, (_, i) => (
              <group key={`${r}-${i}`} rotation-y={(i / ring.n) * Math.PI * 2 + ring.turn}>
                <Cone c={ring.c} p={[0, ring.len / 2, 0.05]} r={[ring.tilt, 0, 0]} s={[0.055, ring.len, 0.03]} shadow={false} />
              </group>
            )),
          )}
          <Ball c="#ffe066" p={[0, 0.05, 0]} s={[0.05, 0.03, 0.05]} shadow={false} />
        </group>
      )}
    </group>
  );
}

/** Cụm cỏ lau có bông nâu. */
function Reeds({ p, seed }: { p: V3; seed: number }) {
  const ref = useRef<THREE.Group>(null);
  const stems = useMemo(() => {
    const r = rng(seed);
    return Array.from({ length: 6 }, () => ({ x: (r() - 0.5) * 0.7, z: (r() - 0.5) * 0.7, h: 1.0 + r() * 0.8, cat: r() < 0.55 }));
  }, [seed]);
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = Math.sin(clock.elapsedTime * 1.2 + seed) * 0.05;
  });
  return (
    <group ref={ref} position={p} raycast={noRay}>
      {stems.map((s, i) => (
        <group key={i} position={[s.x, 0, s.z]}>
          <Tube c="#5f8f2e" p={[0, s.h / 2, 0]} s={[0.025, s.h, 0.025]} shadow={false} />
          {s.cat && <Tube c="#7a4a26" p={[0, s.h - 0.12, 0]} s={[0.06, 0.28, 0.06]} shadow={false} />}
        </group>
      ))}
    </group>
  );
}

const ROCK = new THREE.DodecahedronGeometry(1, 0);

export function Pond() {
  const q = useQuality();
  const decor = useMemo(() => {
    const r = rng(2024);
    const pads: { p: V3; s: number; rot: number; flower: boolean }[] = [];
    const reeds: V3[] = [];
    const rocks: { p: V3; s: number; c: string }[] = [];
    // vùng ếch cần mặt nước trống để thả ếch: lá súng chỉ ở ngoài khu đó
    const clearOfFrogs = (x: number) => x < ZONES.frogs.x0 - 4 || x > ZONES.frogs.x1 + 4;
    for (let i = 0; i < 70 && pads.length < (q.shadows ? 26 : 14); i++) {
      const x = (r() * 2 - 1) * (WORLD_HALF - 4);
      if (!clearOfFrogs(x)) continue;
      const side = r() < 0.5 ? -1 : 1;
      const z = riverCenterZ(x) + side * (RIVER_HALF_WIDTH - 1.2 - r() * 1.6);
      pads.push({ p: [x, WATER_Y + 0.02, z], s: 0.8 + r() * 0.6, rot: r() * Math.PI * 2, flower: r() < 0.3 });
    }
    for (let i = 0; i < (q.shadows ? 30 : 16); i++) {
      const x = (r() * 2 - 1) * (WORLD_HALF - 3);
      if (!clearOfFrogs(x)) continue;
      const side = r() < 0.5 ? -1 : 1;
      const z = riverCenterZ(x) + side * (RIVER_HALF_WIDTH + 0.4 + r() * 1.2);
      if (isReserved(x, z)) continue; // không mọc trên bến gỗ, cổng
      reeds.push([x, groundHeight(x, z), z]);
    }
    const rockCols = ['#9a958c', '#b3ada2', '#7f7a72'];
    for (let i = 0; i < (q.shadows ? 60 : 30); i++) {
      const x = (r() * 2 - 1) * (WORLD_HALF - 2);
      const side = r() < 0.5 ? -1 : 1;
      const z = riverCenterZ(x) + side * (RIVER_HALF_WIDTH + 0.6 + r() * 2.2);
      if (isReserved(x, z)) continue;
      rocks.push({ p: [x, groundHeight(x, z) + 0.05, z], s: 0.15 + r() * 0.35, c: rockCols[i % 3] });
    }
    return { pads, reeds, rocks };
  }, [q.shadows]);

  // vịt bơi gần bến vòng quay và đoạn sông đầu vườn
  const ducks = useMemo(() => {
    const at = (x: number, d: number): [number, number] => [x, riverCenterZ(x) + d];
    return [
      // trước bến vòng quay (x ≈ 37, bờ nam), như ảnh mẫu
      { center: at(WHEEL.x - 5, RIVER_HALF_WIDTH - 2.4), r: 1.6, speed: 0.25, phase: 0 },
      { center: at(WHEEL.x - 3.5, RIVER_HALF_WIDTH - 2.0), r: 1.2, speed: 0.3, phase: 2, female: true },
      { center: at(WHEEL.x - 7, RIVER_HALF_WIDTH - 2.2), r: 1.0, speed: -0.28, phase: 4 },
      { center: at(WHEEL.x + 5, RIVER_HALF_WIDTH - 2.2), r: 1.1, speed: 0.24, phase: 5, female: true },
      // đoạn sông khu thú, bờ bắc
      { center: at(14, -RIVER_HALF_WIDTH + 2.2), r: 1.5, speed: 0.22, phase: 1, female: true },
      { center: at(16, -RIVER_HALF_WIDTH + 2.0), r: 1.1, speed: -0.26, phase: 3 },
    ];
  }, []);

  return (
    <group>
      {ducks.map((d, i) => (
        <SwimmingDuck key={i} {...d} />
      ))}
      {decor.pads.map((p, i) => (
        <LilyPad key={i} {...p} />
      ))}
      {decor.reeds.map((p, i) => (
        <Reeds key={i} p={p} seed={i + 1} />
      ))}
      {decor.rocks.map((k, i) => (
        <mesh key={i} geometry={ROCK} material={toon(k.c)} position={k.p} scale={[k.s * 1.3, k.s * 0.7, k.s]} rotation-y={i} castShadow receiveShadow raycast={noRay} />
      ))}
    </group>
  );
}
