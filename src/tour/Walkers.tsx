// Bạn học sinh chibi đi tham quan (Vẹt Xanh đậu trên vai): bước đi vung tay khi đang đi,
// dừng lại thì quay về phía lớp và vẫy chào.
// Mặt hướng về +z; nhóm được đặt sao cho +z cục bộ là hướng đi.
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ChibiHead, LifeVest, SKIN } from '../games/zoo/objects/Passengers';
import { ParrotModel } from './Parrot';
import { Ball, BlobShadow, Box, Capsule, Tube } from '../shared/3d/toon';

/** Tư thế: tốc độ bước (0 = đứng yên, 1 = đi bình thường) và thời gian đã đứng yên (giây; lâu thì quay lại vẫy tay). */
export interface Pose {
  speed: number;
  idle: number;
}

/** Tư thế của bạn học sinh trên màn đường đi, do camera cập nhật mỗi khung hình. */
export const walk: Pose & { /** vị trí trên đường (0 … 1) */ t: number } = { speed: 0, idle: 0, t: 0 };


interface Limbs {
  legL: React.RefObject<THREE.Group>;
  legR: React.RefObject<THREE.Group>;
  armL: React.RefObject<THREE.Group>;
  armR: React.RefObject<THREE.Group>;
  body: React.RefObject<THREE.Group>;
  head: React.RefObject<THREE.Group>;
  turn: React.RefObject<THREE.Group>;
}

function useLimbs(): Limbs {
  return {
    legL: useRef<THREE.Group>(null),
    legR: useRef<THREE.Group>(null),
    armL: useRef<THREE.Group>(null),
    armR: useRef<THREE.Group>(null),
    body: useRef<THREE.Group>(null),
    head: useRef<THREE.Group>(null),
    turn: useRef<THREE.Group>(null),
  };
}

/** Chu kỳ bước + quay mặt + vẫy tay, dùng chung cho mọi nhân vật. */
function useWalkCycle(l: Limbs, seed: number, waveArm: boolean, pose: Pose) {
  const phase = useRef(seed);
  useFrame((state, dt) => {
    const s = pose.speed;
    phase.current += dt * (2 + 7 * s);
    const ph = phase.current;
    const swing = Math.sin(ph) * 0.75 * s;
    if (l.legL.current) l.legL.current.rotation.x = swing;
    if (l.legR.current) l.legR.current.rotation.x = -swing;
    if (l.armL.current) l.armL.current.rotation.x = -swing * 0.9;
    // dừng lâu thì quay lại phía lớp; tay phải vẫy chào
    const facing = THREE.MathUtils.smoothstep(pose.idle, 0.3, 1.2);
    if (l.turn.current) l.turn.current.rotation.y = THREE.MathUtils.lerp(0, Math.PI * 0.85 * (seed % 2 ? 1 : -1), facing);
    if (l.armR.current) {
      const wave = waveArm ? facing : 0;
      l.armR.current.rotation.x = swing * 0.9 * (1 - wave);
      l.armR.current.rotation.z = -wave * (2.4 + Math.sin(state.clock.elapsedTime * 7 + seed) * 0.35);
    }
    if (l.body.current) l.body.current.position.y = Math.abs(Math.sin(ph)) * 0.035 * s + Math.sin(state.clock.elapsedTime * 2 + seed) * 0.006;
    if (l.head.current) {
      l.head.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + seed) * 0.08;
      // đang đi thì ngoái nhìn hai bên ngắm thú
      l.head.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.9 + seed * 2) * 0.9 * s;
    }
  });
}

function Leg({ r, x, color, shoe }: { r: React.RefObject<THREE.Group>; x: number; color: string; shoe: string }) {
  return (
    <group ref={r} position={[x, 0.2, 0]}>
      <Tube c={color} p={[0, -0.09, 0]} s={[0.042, 0.18, 0.042]} />
      <Ball c={shoe} p={[0, -0.19, 0.03]} s={[0.05, 0.035, 0.07]} />
    </group>
  );
}

function Arm({ r, x, sleeve }: { r: React.RefObject<THREE.Group>; x: number; sleeve: string }) {
  return (
    <group ref={r} position={[x, 0.36, 0]}>
      <Capsule c={sleeve} p={[0, -0.05, 0]} s={[0.03, 0.045, 0.03]} />
      <Ball c={SKIN} p={[0, -0.12, 0]} s={0.032} />
    </group>
  );
}

/** Bạn học sinh đứng: áo trắng, khăn quàng đỏ, cặp sách sau lưng. */
export function WalkingKid({
  girl = false,
  bottom = '#2f5fb3',
  bag = '#ff8a3d',
  seed = 0,
  extra,
  pose = walk,
}: {
  girl?: boolean;
  bottom?: string;
  bag?: string;
  seed?: number;
  /** Thứ đi cùng thân (ví dụ chú vẹt đậu trên vai): nhún và quay theo bạn nhỏ. */
  extra?: ReactNode;
  /** Tư thế riêng (ví dụ đứng trên thuyền); mặc định theo màn đường đi. */
  pose?: Pose;
}) {
  const l = useLimbs();
  useWalkCycle(l, seed, true, pose);
  return (
    <group ref={l.turn}>
      <BlobShadow r={0.32} />
      <group ref={l.body}>
        <Leg r={l.legL} x={-0.055} color={girl ? SKIN : bottom} shoe="#ffffff" />
        <Leg r={l.legR} x={0.055} color={girl ? SKIN : bottom} shoe="#ffffff" />
        {girl ? (
          <Capsule c={bottom} p={[0, 0.24, 0]} s={[0.12, 0.04, 0.1]} />
        ) : (
          <Ball c={bottom} p={[0, 0.22, 0]} s={[0.1, 0.06, 0.08]} />
        )}
        <Ball c="#ffffff" p={[0, 0.31, 0]} s={[0.105, 0.11, 0.085]} />
        {/* khăn quàng đỏ */}
        <Ball c="#e8262c" p={[0, 0.4, 0.02]} s={[0.085, 0.025, 0.075]} shadow={false} />
        <Box c="#e8262c" p={[0.015, 0.35, 0.085]} s={[0.03, 0.07, 0.01]} r={[0, 0, 0.3]} shadow={false} />
        {/* cặp sách */}
        <Box c={bag} p={[0, 0.32, -0.11]} s={[0.15, 0.17, 0.07]} />
        <Box c="#ffffff" p={[0, 0.36, -0.148]} s={[0.1, 0.03, 0.01]} shadow={false} />
        <Arm r={l.armL} x={-0.12} sleeve="#ffffff" />
        <Arm r={l.armR} x={0.12} sleeve="#ffffff" />
        <group ref={l.head} position={[0, 0.66, 0]}>
          <ChibiHead girl={girl} />
        </group>
        {extra}
      </group>
    </group>
  );
}

/** Bạn học sinh của chuyến tham quan, Vẹt Xanh đậu cạnh vai trái (dùng ở màn đường đi và trên thuyền Bài 4). */
export function TourKid({ pose, outline, lifeVest = false }: { pose?: Pose; outline?: boolean; lifeVest?: boolean }) {
  return (
    <WalkingKid
      seed={1}
      bottom="#2f5fb3"
      bag="#3fa7ff"
      pose={pose}
      extra={
        <>
          <ParrotModel p={[-0.36, 0.5, -0.02]} scale={0.2} outline={outline} />
          {lifeVest && <LifeVest p={[0, 0.31, 0]} s={[0.128, 0.125, 0.108]} />}
        </>
      }
    />
  );
}

/** Bạn học sinh đi giữa đường. */
export function Walkers() {
  return (
    <group scale={2.1}>
      <TourKid />
    </group>
  );
}

// Cho script kiểm thử đọc vị trí / tốc độ đi khi chạy bản phát triển.
if (import.meta.env.DEV) (window as unknown as { __walk: typeof walk }).__walk = walk;
