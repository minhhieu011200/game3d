import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, BlobShadow, Blush, Capsule, CuteEye, Outlined, Smile, Tube } from '../../../shared/3d/toon';
import { ZONES } from '../layout';
import { groundHeight, riverCenterZ, RIVER_HALF_WIDTH } from '../world';
import { AreaSign, Fence } from './Structures';

// Các bạn thú chibi: đầu to, mắt long lanh, má hồng. Mặt hướng về +z.

export interface AnimalProps {
  at: [number, number];
  rot?: number;
  wander?: number;
  /** Độ cao mặt đất tại (x, z); mặc định là địa hình vườn thú Bài 4. */
  ground?: (x: number, z: number) => number;
}

/** Khung chung: nhún nhảy nhẹ, đi vòng quanh (nếu có), gọi `animate` để cử động riêng. */
function Critter({
  at,
  rot = 0,
  wander = 0,
  scale = 1,
  ground = groundHeight,
  animate,
  children,
}: AnimalProps & {
  scale?: number;
  animate?: (t: number, root: THREE.Group) => void;
  children: ReactNode;
}) {
  const root = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const ph = useMemo(() => Math.random() * 10, []);
  useFrame((state) => {
    const t = state.clock.elapsedTime + ph;
    const g = root.current;
    const b = body.current;
    if (!g || !b) return;
    if (wander) {
      const a = t * 0.18;
      const x = at[0] + Math.cos(a) * wander;
      const z = at[1] + Math.sin(a) * wander;
      g.position.set(x, ground(x, z), z);
      g.rotation.y = -a;
      b.position.y = Math.abs(Math.sin(t * 5)) * 0.08; // bước nhún
    } else {
      b.position.y = Math.sin(t * 2) * 0.03;
      b.scale.set(1, 1 + Math.sin(t * 2) * 0.02, 1);
    }
    animate?.(t, b);
  });
  return (
    // to hơn 1,4 lần để nhìn rõ từ thuyền giữa sông
    <group ref={root} position={[at[0], ground(at[0], at[1]), at[1]]} rotation-y={rot} scale={scale * 1.4}>
      <BlobShadow r={0.75} />
      <group ref={body}>{children}</group>
    </group>
  );
}

function Face({ y, z, eye = 0.11, gap = 0.17, blush = true }: { y: number; z: number; eye?: number; gap?: number; blush?: boolean }) {
  return (
    <>
      <CuteEye p={[-gap, y, z]} size={eye} />
      <CuteEye p={[gap, y, z]} size={eye} />
      {blush && <Blush p={[-gap - 0.1, y - 0.14, z - 0.02]} size={0.07} />}
      {blush && <Blush p={[gap + 0.1, y - 0.14, z - 0.02]} size={0.07} />}
    </>
  );
}

function Elephant(props: AnimalProps) {
  const C = '#a9b7d6';
  return (
    <Critter
      {...props}
      scale={1.3}
      animate={(t, b) => {
        const [earL, earR, trunk] = ['earL', 'earR', 'trunk'].map((n) => b.getObjectByName(n)!);
        earL.rotation.y = 0.3 + Math.sin(t * 3) * 0.25;
        earR.rotation.y = -0.3 - Math.sin(t * 3) * 0.25;
        trunk.rotation.x = 0.3 + Math.sin(t * 1.7) * 0.35;
      }}
    >
      <Ball c={C} p={[0, 0.85, -0.1]} s={[0.75, 0.62, 0.85]} />
      {[[-0.38, 0.35], [0.38, 0.35], [-0.38, -0.5], [0.38, -0.5]].map(([x, z]) => (
        <Tube key={`${x}${z}`} c={C} p={[x, 0.25, z]} s={[0.2, 0.5, 0.2]} />
      ))}
      <group position={[0, 1.35, 0.55]}>
        <Ball c={C} s={0.55} />
        <group name="earL" position={[-0.5, 0.05, -0.1]}>
          <Ball c={C} p={[-0.25, 0, 0]} s={[0.4, 0.45, 0.07]} />
          <Ball c="#ffc1d6" p={[-0.25, 0, 0.04]} s={[0.28, 0.32, 0.04]} />
        </group>
        <group name="earR" position={[0.5, 0.05, -0.1]}>
          <Ball c={C} p={[0.25, 0, 0]} s={[0.4, 0.45, 0.07]} />
          <Ball c="#ffc1d6" p={[0.25, 0, 0.04]} s={[0.28, 0.32, 0.04]} />
        </group>
        <group name="trunk" position={[0, -0.15, 0.45]}>
          <Capsule c={C} p={[0, -0.25, 0.05]} s={[0.12, 0.35, 0.12]} r={[0.25, 0, 0]} />
        </group>
        <Face y={0.12} z={0.44} eye={0.12} gap={0.2} />
      </group>
      <Tube c={C} p={[0, 0.8, -0.95]} s={[0.04, 0.4, 0.04]} r={[0.6, 0, 0]} />
    </Critter>
  );
}

function Giraffe(props: AnimalProps) {
  const C = '#ffcf5c';
  const S = '#d9822b';
  return (
    <Critter
      {...props}
      scale={1.25}
      animate={(t, b) => {
        const neck = b.getObjectByName('neck')!;
        neck.rotation.x = Math.sin(t * 1.2) * 0.12;
        neck.rotation.z = Math.sin(t * 0.8) * 0.08;
      }}
    >
      <Ball c={C} p={[0, 1.1, 0]} s={[0.45, 0.4, 0.62]} />
      {[[-0.22, 0.3], [0.22, 0.3], [-0.22, -0.3], [0.22, -0.3]].map(([x, z]) => (
        <Tube key={`${x}${z}`} c={C} p={[x, 0.45, z]} s={[0.08, 0.9, 0.08]} />
      ))}
      {[[0.2, 1.3, 0.2], [-0.25, 1.2, -0.2], [0.3, 1.05, -0.3], [-0.1, 1.38, -0.05]].map((p, i) => (
        <Ball key={i} c={S} p={p as [number, number, number]} s={[0.12, 0.1, 0.12]} shadow={false} />
      ))}
      <group name="neck" position={[0, 1.3, 0.45]}>
        <Tube c={C} p={[0, 0.6, 0.12]} s={[0.12, 1.3, 0.12]} r={[0.2, 0, 0]} />
        <Ball c={S} p={[0, 0.5, 0.25]} s={0.07} shadow={false} />
        <Ball c={S} p={[0.05, 0.9, 0.2]} s={0.06} shadow={false} />
        <group position={[0, 1.35, 0.28]}>
          <Ball c={C} s={[0.3, 0.27, 0.36]} />
          <Ball c="#ffe3a3" p={[0, -0.07, 0.25]} s={[0.18, 0.13, 0.14]} />
          {[-0.11, 0.11].map((x) => (
            <group key={x}>
              <Tube c={S} p={[x, 0.32, -0.05]} s={[0.03, 0.2, 0.03]} />
              <Ball c={S} p={[x, 0.43, -0.05]} s={0.055} />
              <Ball c={C} p={[x * 2.4, 0.12, -0.08]} s={[0.12, 0.05, 0.07]} />
            </group>
          ))}
          <Face y={0.06} z={0.24} eye={0.08} gap={0.12} />
        </group>
      </group>
    </Critter>
  );
}

function Monkey(props: AnimalProps) {
  const C = '#a8693a';
  const F = '#ffd9b0';
  return (
    <Critter
      {...props}
      scale={1}
      animate={(t, b) => {
        b.position.y = Math.abs(Math.sin(t * 3)) * 0.35; // nhảy tưng tưng
        b.getObjectByName('tail')!.rotation.z = Math.sin(t * 4) * 0.5;
        b.getObjectByName('armL')!.rotation.z = 2.4 + Math.sin(t * 6) * 0.4; // vẫy tay chào
      }}
    >
      <Ball c={C} p={[0, 0.5, 0]} s={[0.3, 0.35, 0.28]} />
      <Ball c={F} p={[0, 0.48, 0.2]} s={[0.2, 0.24, 0.1]} />
      <Tube c={C} p={[-0.13, 0.12, 0.05]} s={[0.07, 0.25, 0.07]} />
      <Tube c={C} p={[0.13, 0.12, 0.05]} s={[0.07, 0.25, 0.07]} />
      <group name="armL" position={[-0.28, 0.62, 0]} rotation-z={2.4}>
        <Capsule c={C} p={[0, 0.2, 0]} s={[0.06, 0.2, 0.06]} />
      </group>
      <group position={[0.28, 0.62, 0]} rotation-z={-0.6}>
        <Capsule c={C} p={[0, -0.2, 0]} s={[0.06, 0.2, 0.06]} />
      </group>
      <group name="tail" position={[0, 0.35, -0.25]}>
        <mesh position={[0, 0.25, -0.15]} rotation-x={0.4}>
          <torusGeometry args={[0.2, 0.04, 8, 16, Math.PI * 1.4]} />
          <meshToonMaterial color={C} />
        </mesh>
      </group>
      <group position={[0, 1.05, 0.05]}>
        <Ball c={C} s={0.34} />
        <Ball c={F} p={[0, -0.05, 0.2]} s={[0.26, 0.22, 0.16]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Ball c={C} p={[s * 0.36, 0.02, 0]} s={[0.12, 0.14, 0.06]} />
            <Ball c={F} p={[s * 0.37, 0.02, 0.03]} s={[0.07, 0.09, 0.04]} />
          </group>
        ))}
        <Face y={0.05} z={0.3} eye={0.08} gap={0.1} />
        <Smile p={[0, -0.13, 0.35]} size={0.06} />
      </group>
    </Critter>
  );
}

function Panda(props: AnimalProps) {
  return (
    <Critter
      {...props}
      scale={1.1}
      animate={(t, b) => {
        b.rotation.z = Math.sin(t * 1.5) * 0.08; // lắc lư
        b.getObjectByName('bamboo')!.rotation.x = -0.6 + Math.sin(t * 3) * 0.2;
      }}
    >
      <Ball c="#ffffff" p={[0, 0.55, 0]} s={[0.5, 0.55, 0.45]} />
      <Ball c="#2b2b3a" p={[-0.32, 0.18, 0.2]} s={[0.17, 0.15, 0.22]} />
      <Ball c="#2b2b3a" p={[0.32, 0.18, 0.2]} s={[0.17, 0.15, 0.22]} />
      <Ball c="#2b2b3a" p={[-0.4, 0.7, 0.15]} s={[0.14, 0.24, 0.14]} r={[0, 0, 0.5]} />
      <group name="bamboo" position={[0.38, 0.72, 0.2]}>
        <Ball c="#2b2b3a" s={[0.14, 0.24, 0.14]} r={[0, 0, -0.5]} />
        <Tube c="#6cc04a" p={[0.05, 0.35, 0.1]} s={[0.04, 0.8, 0.04]} />
        <Ball c="#4ea83a" p={[0.12, 0.7, 0.1]} s={[0.12, 0.03, 0.05]} />
      </group>
      <group position={[0, 1.25, 0.05]}>
        <Ball c="#ffffff" s={[0.42, 0.38, 0.38]} />
        <Ball c="#2b2b3a" p={[-0.3, 0.32, -0.05]} s={0.13} />
        <Ball c="#2b2b3a" p={[0.3, 0.32, -0.05]} s={0.13} />
        <Ball c="#2b2b3a" p={[-0.15, 0.03, 0.3]} s={[0.12, 0.14, 0.06]} r={[0, 0, 0.5]} shadow={false} />
        <Ball c="#2b2b3a" p={[0.15, 0.03, 0.3]} s={[0.12, 0.14, 0.06]} r={[0, 0, -0.5]} shadow={false} />
        <CuteEye p={[-0.15, 0.04, 0.33]} size={0.065} />
        <CuteEye p={[0.15, 0.04, 0.33]} size={0.065} />
        <Ball c="#2b2b3a" p={[0, -0.09, 0.37]} s={[0.05, 0.035, 0.03]} />
        <Blush p={[-0.25, -0.1, 0.3]} size={0.06} />
        <Blush p={[0.25, -0.1, 0.3]} size={0.06} />
      </group>
    </Critter>
  );
}

function Lion(props: AnimalProps) {
  const C = '#ffc145';
  const M = '#e07b24';
  return (
    <Critter
      {...props}
      scale={1.15}
      animate={(t, b) => {
        b.getObjectByName('tail')!.rotation.x = 0.8 + Math.sin(t * 3) * 0.4;
        b.getObjectByName('head')!.rotation.z = Math.sin(t * 1.3) * 0.12;
      }}
    >
      <Ball c={C} p={[0, 0.55, -0.1]} s={[0.4, 0.38, 0.55]} />
      {[[-0.22, 0.25], [0.22, 0.25], [-0.22, -0.4], [0.22, -0.4]].map(([x, z]) => (
        <Tube key={`${x}${z}`} c={C} p={[x, 0.2, z]} s={[0.1, 0.4, 0.1]} />
      ))}
      <group name="tail" position={[0, 0.6, -0.6]}>
        <Tube c={C} p={[0, 0, -0.25]} s={[0.04, 0.5, 0.04]} r={[Math.PI / 2, 0, 0]} />
        <Ball c={M} p={[0, 0, -0.52]} s={0.09} />
      </group>
      <group name="head" position={[0, 0.95, 0.35]}>
        {/* bờm xoè như bông hoa */}
        {Array.from({ length: 10 }, (_, i) => {
          const a = (i / 10) * Math.PI * 2;
          return <Ball key={i} c={i % 2 ? M : '#f0962e'} p={[Math.cos(a) * 0.38, Math.sin(a) * 0.38, -0.08]} s={0.17} />;
        })}
        <Ball c={C} s={[0.36, 0.33, 0.3]} />
        <Ball c="#fff0c2" p={[0, -0.1, 0.22]} s={[0.17, 0.12, 0.1]} />
        <Ball c="#6b3a1e" p={[0, -0.03, 0.31]} s={[0.05, 0.035, 0.03]} />
        <Face y={0.07} z={0.25} eye={0.075} gap={0.13} />
        <Ball c={C} p={[-0.25, 0.27, 0]} s={0.08} />
        <Ball c={C} p={[0.25, 0.27, 0]} s={0.08} />
      </group>
    </Critter>
  );
}

function Tiger(props: AnimalProps) {
  const C = '#ff9a2e';
  const K = '#2b2b3a';
  const W = '#fff6e8';
  return (
    <Critter
      {...props}
      scale={1.15}
      animate={(t, b) => {
        b.getObjectByName('tail')!.rotation.z = Math.sin(t * 2.5) * 0.5;
        b.getObjectByName('head')!.rotation.y = Math.sin(t * 0.9) * 0.25;
      }}
    >
      <Ball c={C} p={[0, 0.5, -0.1]} s={[0.36, 0.34, 0.52]} />
      <Ball c={W} p={[0, 0.4, 0.05]} s={[0.24, 0.2, 0.34]} shadow={false} />
      {/* sọc đen trên lưng */}
      {[-0.3, -0.1, 0.1, 0.3].map((z) => (
        <Ball key={z} c={K} p={[0, 0.8, z - 0.1]} s={[0.3, 0.05, 0.04]} r={[0, 0, 0]} shadow={false} />
      ))}
      {[[-0.2, 0.22], [0.2, 0.22], [-0.2, -0.38], [0.2, -0.38]].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <Tube c={C} p={[x, 0.18, z]} s={[0.1, 0.36, 0.1]} />
          <Ball c={W} p={[x, 0.03, z + 0.04]} s={[0.1, 0.05, 0.12]} />
        </group>
      ))}
      <group name="tail" position={[0, 0.6, -0.6]}>
        {Array.from({ length: 5 }, (_, i) => (
          <Ball key={i} c={i % 2 ? K : C} p={[Math.sin(i * 0.5) * 0.08, 0.06 * i, -0.08 * i]} s={0.06} shadow={false} />
        ))}
      </group>
      <group name="head" position={[0, 0.88, 0.35]}>
        <Ball c={C} s={[0.36, 0.32, 0.3]} />
        <Ball c={W} p={[-0.1, -0.1, 0.22]} s={[0.12, 0.1, 0.09]} shadow={false} />
        <Ball c={W} p={[0.1, -0.1, 0.22]} s={[0.12, 0.1, 0.09]} shadow={false} />
        <Ball c="#ff8fab" p={[0, -0.04, 0.3]} s={[0.05, 0.035, 0.03]} />
        {/* chữ "Vương" sọc trên trán và sọc má */}
        {[0.2, 0.25, 0.3].map((y, i) => (
          <Ball key={y} c={K} p={[0, y - 0.05, 0.2 - i * 0.03]} s={[0.09 - i * 0.015, 0.012, 0.02]} shadow={false} />
        ))}
        {[-1, 1].map((s) => (
          <group key={s}>
            <Ball c={K} p={[s * 0.33, 0, 0.05]} s={[0.04, 0.015, 0.08]} shadow={false} />
            <Ball c={C} p={[s * 0.24, 0.27, 0]} s={[0.1, 0.1, 0.06]} />
            <Ball c={W} p={[s * 0.24, 0.27, 0.03]} s={[0.055, 0.055, 0.04]} shadow={false} />
          </group>
        ))}
        <Face y={0.06} z={0.24} eye={0.08} gap={0.13} />
      </group>
    </Critter>
  );
}

interface Pen {
  name: string;
  /** Bờ đặt chuồng: bắc (bên trái khi thuyền đi vào) hay nam (bên phải). */
  side: 'north' | 'south';
  x0: number;
  x1: number;
  depth: number;
  animals: Array<{ kind: 'elephant' | 'giraffe' | 'monkey' | 'panda' | 'lion' | 'tiger'; dx: number; dz: number; rot?: number; wander?: number }>;
}

// Mỗi bạn thú một chuồng riêng, chia đều hai bờ. dz tính từ mép bờ, càng lớn càng xa sông.
const PEN_W = 6;
const PEN_GAP = 0.9;
const penX = (i: number) => ZONES.animals.x0 + i * (PEN_W + PEN_GAP);
const PENS: Pen[] = [
  { name: '🐘 Voi', side: 'north', x0: penX(0), x1: penX(0) + PEN_W, depth: 7, animals: [{ kind: 'elephant', dx: 3, dz: 3.4, rot: 0.2 }] },
  { name: '🦒 Hươu cao cổ', side: 'north', x0: penX(1), x1: penX(1) + PEN_W, depth: 7, animals: [{ kind: 'giraffe', dx: 3, dz: 3.6, wander: 1.2 }] },
  { name: '🐯 Hổ', side: 'north', x0: penX(2), x1: penX(2) + PEN_W, depth: 7, animals: [{ kind: 'tiger', dx: 3, dz: 3.2, wander: 1.3 }] },
  { name: '🐒 Khỉ', side: 'south', x0: penX(0) + 2, x1: penX(0) + 2 + PEN_W, depth: 7, animals: [{ kind: 'monkey', dx: 3, dz: 3 }] },
  { name: '🐼 Gấu trúc', side: 'south', x0: penX(1) + 2, x1: penX(1) + 2 + PEN_W, depth: 7, animals: [{ kind: 'panda', dx: 3, dz: 3.2, rot: -0.2 }] },
  { name: '🦁 Sư tử', side: 'south', x0: penX(2) + 2, x1: penX(2) + 2 + PEN_W, depth: 7, animals: [{ kind: 'lion', dx: 3, dz: 3.2, rot: 0.3 }] },
];

export type AnimalKind = Pen['animals'][number]['kind'];

export function Animal(props: AnimalProps & { kind: AnimalKind }) {
  return (
    <Outlined outline={false}>
      <AnimalModel {...props} />
    </Outlined>
  );
}

function AnimalModel({ kind, ...p }: AnimalProps & { kind: AnimalKind }) {
  switch (kind) {
    case 'elephant':
      return <Elephant {...p} />;
    case 'giraffe':
      return <Giraffe {...p} />;
    case 'monkey':
      return <Monkey {...p} />;
    case 'panda':
      return <Panda {...p} />;
    case 'lion':
      return <Lion {...p} />;
    case 'tiger':
      return <Tiger {...p} />;
  }
}

/** Mép bờ (cách mép nước 2,5 m) ở phía bắc (−1) hoặc nam (+1). */
function bankEdgeZ(x: number, sign: 1 | -1) {
  return riverCenterZ(x) + sign * (RIVER_HALF_WIDTH + 2.5);
}

export function AnimalPens() {
  return (
    <>
      {PENS.map((p) => {
        const sign = p.side === 'south' ? 1 : -1;
        const zf0 = bankEdgeZ(p.x0, sign);
        const zf1 = bankEdgeZ(p.x1, sign);
        const back = sign * p.depth;
        return (
          <group key={p.name}>
            {/* mặt trước để thấp cho trẻ nhìn rõ từ thuyền */}
            <Fence a={[p.x0, zf0]} b={[p.x1, zf1]} h={0.7} cap="#ff8fab" />
            <Fence a={[p.x1, zf1]} b={[p.x1, zf1 + back]} cap="#7ad7ff" />
            <Fence a={[p.x1, zf1 + back]} b={[p.x0, zf0 + back]} cap="#7ad7ff" />
            <Fence a={[p.x0, zf0 + back]} b={[p.x0, zf0]} cap="#7ad7ff" />
            <AreaSign at={[p.x0 + 0.6, zf0 - sign * 0.6]} text={p.name} />
            {p.animals.map((a, i) => {
              const x = p.x0 + a.dx;
              // quay mặt ra sông: bờ bắc nhìn về +z, bờ nam nhìn về −z
              const face = sign > 0 ? Math.PI : 0;
              return <Animal key={i} kind={a.kind} at={[x, bankEdgeZ(x, sign) + sign * a.dz]} rot={face + (a.rot ?? 0)} wander={a.wander} />;
            })}
          </group>
        );
      })}
    </>
  );
}
