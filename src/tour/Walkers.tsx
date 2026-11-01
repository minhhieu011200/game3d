// Bạn học sinh chibi đi tham quan (Vẹt Xanh đậu trên vai): bước đi vung tay khi đang đi,
// dừng lại thì quay về phía lớp và vẫy chào.
// Mặt hướng về +z; nhóm được đặt sao cho +z cục bộ là hướng đi.
import { useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ChibiHead, LifeVest, SKIN } from '../games/zoo/objects/Passengers';
import { ParrotModel } from './Parrot';
import { Ball, BlobShadow, Box, Capsule, Cone, Tube } from '../shared/3d/toon';

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
      {/* quần ngắn, chân trần, tất trắng và giày thể thao đế trắng */}
      <Tube c={color} p={[0, -0.035, 0]} s={[0.052, 0.07, 0.052]} />
      <Tube c={SKIN} p={[0, -0.095, 0]} s={[0.04, 0.09, 0.04]} />
      <Tube c="#ffffff" p={[0, -0.15, 0]} s={[0.043, 0.04, 0.043]} shadow={false} />
      <Ball c={shoe} p={[0, -0.176, 0.024]} s={[0.058, 0.034, 0.078]} />
      <Ball c="#ffffff" p={[0, -0.194, 0.024]} s={[0.06, 0.012, 0.08]} shadow={false} />
    </group>
  );
}

function Arm({ r, x, sleeve }: { r: React.RefObject<THREE.Group>; x: number; sleeve: string }) {
  return (
    <group ref={r} position={[x, 0.37, 0]}>
      <Ball c={sleeve} p={[0, -0.018, 0]} s={[0.04, 0.045, 0.04]} />
      <Capsule c={SKIN} p={[0, -0.07, 0]} s={[0.027, 0.035, 0.027]} />
      <Ball c={SKIN} p={[0, -0.125, 0.004]} s={0.036} />
    </group>
  );
}

/** Bạn học sinh đứng: áo trắng cổ bẻ, khăn quàng đỏ, quần ngắn, giày thể thao, cặp sách có quai đeo. */
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
        <Leg r={l.legL} x={-0.058} color={girl ? SKIN : bottom} shoe={girl ? '#ff7fb0' : '#3f8ce8'} />
        <Leg r={l.legR} x={0.058} color={girl ? SKIN : bottom} shoe={girl ? '#ff7fb0' : '#3f8ce8'} />
        {girl ? (
          <Capsule c={bottom} p={[0, 0.235, 0]} s={[0.125, 0.04, 0.105]} />
        ) : (
          <Ball c={bottom} p={[0, 0.215, 0]} s={[0.108, 0.065, 0.088]} />
        )}
        <Ball c="#ffffff" p={[0, 0.31, 0]} s={[0.112, 0.112, 0.09]} />
        {/* cổ áo */}
        {[-1, 1].map((s) => (
          <Box key={s} c="#f1f3f7" p={[s * 0.035, 0.39, 0.068]} s={[0.05, 0.022, 0.03]} r={[0.35, 0, s * -0.4]} shadow={false} />
        ))}
        {/* khăn quàng đỏ */}
        <Ball c="#e8262c" p={[0, 0.402, 0.018]} s={[0.078, 0.022, 0.07]} shadow={false} />
        <Cone c="#e8262c" p={[-0.018, 0.345, 0.092]} s={[0.026, 0.095, 0.01]} r={[0, 0, Math.PI + 0.22]} shadow={false} />
        <Cone c="#d81f27" p={[0.018, 0.345, 0.092]} s={[0.026, 0.095, 0.01]} r={[0, 0, Math.PI - 0.22]} shadow={false} />
        {/* cặp sách và quai đeo */}
        <Capsule c={bag} p={[0, 0.335, -0.118]} s={[0.1, 0.06, 0.058]} />
        <Capsule c="#ffffff" p={[0, 0.3, -0.17]} s={[0.012, 0.05, 0.012]} r={[0, 0, Math.PI / 2]} shadow={false} />
        <Ball c="#ffd23f" p={[0, 0.385, -0.172]} s={0.014} shadow={false} />
        {[-1, 1].map((s) => (
          <Box key={s} c={bag} p={[s * 0.074, 0.335, 0.066]} s={[0.018, 0.13, 0.012]} r={[-0.2, 0, s * 0.08]} shadow={false} />
        ))}
        <Arm r={l.armL} x={-0.128} sleeve="#ffffff" />
        <Arm r={l.armR} x={0.128} sleeve="#ffffff" />
        <group ref={l.head} position={[0, 0.685, 0]} scale={1.1}>
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
