import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Blush, Box, Capsule, CuteEye, Smile, Tube, toon } from '../../../shared/3d/toon';

// Người kiểu chibi: đầu to tròn (gần bằng thân), thân và tay chân nhỏ, mắt to long lanh. Mặt hướng về +z.

export const SKIN = '#ffc9a0';
const HAIR = '#2b1d16';

/** Đầu chibi bán kính khoảng 0,26 m. Gốc toạ độ ở tâm đầu. */
export function ChibiHead({
  girl = false,
  bun = false,
  glasses = false,
  hairColor = HAIR,
}: {
  girl?: boolean;
  bun?: boolean;
  glasses?: boolean;
  hairColor?: string;
}) {
  return (
    <group>
      <Ball c={SKIN} s={[0.27, 0.25, 0.25]} />
      {/* tóc: trùm đỉnh và sau đầu, chừa mặt; mái ngố phía trước */}
      <Ball c={hairColor} p={[0, 0.06, -0.04]} s={[0.285, 0.26, 0.25]} />
      <Ball c={SKIN} p={[0, -0.03, 0.07]} s={[0.24, 0.2, 0.2]} />
      <Ball c={hairColor} p={[0, 0.15, 0.15]} s={[0.2, 0.07, 0.09]} shadow={false} />
      {girl && !bun && (
        // hai bím tóc buộc nơ hồng
        <>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.27, -0.04, -0.06]}>
              <Ball c={hairColor} s={[0.08, 0.13, 0.08]} />
              <Ball c="#ff6fa8" p={[0, 0.1, 0]} s={[0.07, 0.04, 0.04]} shadow={false} />
            </group>
          ))}
        </>
      )}
      {bun && <Ball c={hairColor} p={[0, 0.2, -0.2]} s={0.12} />}
      <CuteEye p={[-0.1, -0.01, 0.21]} size={0.07} />
      <CuteEye p={[0.1, -0.01, 0.21]} size={0.07} />
      {glasses && (
        // kính gọng tròn màu nâu
        <group position={[0, -0.01, 0.26]}>
          {[-0.1, 0.1].map((x) => (
            <mesh key={x} position={[x, 0, 0]} material={toon('#6b3a1e')}>
              <torusGeometry args={[0.075, 0.012, 8, 24]} />
            </mesh>
          ))}
          <Box c="#6b3a1e" p={[0, 0.01, 0]} s={[0.05, 0.015, 0.015]} shadow={false} />
          {[-1, 1].map((s) => (
            <Box key={s} c="#6b3a1e" p={[s * 0.2, 0.01, -0.09]} s={[0.012, 0.015, 0.18]} shadow={false} />
          ))}
        </group>
      )}
      <Smile p={[0, -0.12, 0.23]} size={0.045} />
      <Blush p={[-0.17, -0.09, 0.17]} size={0.045} />
      <Blush p={[0.17, -0.09, 0.17]} size={0.045} />
    </group>
  );
}

/** Áo phao cam: thân phồng, 2 sọc phản quang, khóa cài đen, cổ áo dày. Đơn vị gốc là thân tròn bán kính 1; `s` là kích thước thân. */
export function LifeVest({ p, s, r }: { p: [number, number, number]; s: [number, number, number]; r?: [number, number, number] }) {
  return (
    <group position={p} rotation={r} scale={s}>
      <Ball c="#ff7a1a" s={1} />
      {[0.3, -0.3].map((y) => (
        <group key={y}>
          <Ball c="#f4f6f8" p={[0, y, 0]} s={[1.02, 0.11, 1.03]} shadow={false} />
          <Box c="#23262e" p={[0, y, 1.0]} s={[0.26, 0.16, 0.1]} shadow={false} />
        </group>
      ))}
      <Box c="#c9520c" p={[0, 0, 0.98]} s={[0.07, 1.3, 0.06]} shadow={false} />
      <mesh position={[0, 0.82, 0]} rotation-x={Math.PI / 2} material={toon('#f2640f')}>
        <torusGeometry args={[0.58, 0.2, 8, 20]} />
      </mesh>
    </group>
  );
}

/** Bạn học sinh chibi ngồi trên ghế: áo trắng, khăn quàng đỏ, quần/váy màu; một tay vẫy chào. */
export function Student({ girl = false, bottom = '#2f5fb3', seed = 0 }: { girl?: boolean; bottom?: string; seed?: number }) {
  const arm = useRef<THREE.Group>(null);
  const body = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + seed * 1.9;
    if (arm.current) arm.current.rotation.z = 2.5 + Math.sin(t * 6) * 0.35;
    if (body.current) body.current.rotation.y = Math.sin(t * 0.7) * 0.25; // ngó nghiêng hai bên bờ
    if (head.current) head.current.rotation.z = Math.sin(t * 1.6) * 0.1; // nghiêng đầu dễ thương
  });
  return (
    <group ref={body}>
      {/* chân ngắn duỗi ra trước */}
      {[-0.05, 0.05].map((x) => (
        <group key={x}>
          <Tube c={bottom} p={[x, 0.03, 0.06]} s={[0.04, 0.12, 0.04]} r={[Math.PI / 2, 0, 0]} />
          <Ball c="#ffffff" p={[x, 0.02, 0.14]} s={[0.035, 0.035, 0.045]} />
        </group>
      ))}
      {girl && <Ball c={bottom} p={[0, 0.05, 0]} s={[0.11, 0.06, 0.1]} />}
      <Ball c="#ffffff" p={[0, 0.13, 0]} s={[0.1, 0.11, 0.08]} />
      {/* khăn quàng đỏ */}
      <Ball c="#e8262c" p={[0, 0.22, 0.02]} s={[0.08, 0.025, 0.07]} shadow={false} />
      <Box c="#e8262c" p={[0.01, 0.17, 0.08]} s={[0.03, 0.07, 0.01]} r={[0, 0, 0.3]} shadow={false} />
      <group ref={arm} position={[0.09, 0.19, 0]} rotation-z={2.5}>
        <Capsule c={SKIN} p={[0, 0.07, 0]} s={[0.025, 0.05, 0.025]} />
      </group>
      <Capsule c={SKIN} p={[-0.1, 0.12, 0.03]} s={[0.025, 0.05, 0.025]} r={[0.6, 0, 0.3]} />
      <group ref={head} position={[0, 0.44, 0]}>
        <ChibiHead girl={girl} />
      </group>
    </group>
  );
}

/** Cô giáo chibi mặc áo dài, tóc búi, đeo kính; ngồi đầu thuyền chỉ tay về phía bờ. */
export function Teacher() {
  const arm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (arm.current) arm.current.rotation.x = -1.2 + Math.sin(t * 1.3) * 0.25;
    if (head.current) head.current.rotation.y = Math.sin(t * 0.6) * 0.35;
  });
  const AO_DAI = '#9b6bff';
  return (
    <group>
      {/* quần trắng, tà áo dài phủ lên đùi */}
      {[-0.06, 0.06].map((x) => (
        <group key={x}>
          <Tube c="#ffffff" p={[x, 0.04, 0.08]} s={[0.045, 0.16, 0.045]} r={[Math.PI / 2, 0, 0]} />
          <Ball c="#ff8fab" p={[x, 0.03, 0.17]} s={[0.035, 0.03, 0.05]} />
        </group>
      ))}
      <Box c={AO_DAI} p={[0, 0.06, 0.11]} s={[0.18, 0.015, 0.2]} shadow={false} />
      <Ball c={AO_DAI} p={[0, 0.17, 0]} s={[0.11, 0.15, 0.085]} />
      <Capsule c={AO_DAI} p={[-0.11, 0.17, 0.04]} s={[0.026, 0.06, 0.026]} r={[0.5, 0, 0.2]} />
      {/* tay chỉ về phía bờ */}
      <group ref={arm} position={[0.11, 0.24, 0]} rotation-x={-1.2}>
        <Capsule c={AO_DAI} p={[0, -0.07, 0]} s={[0.026, 0.06, 0.026]} />
        <Ball c={SKIN} p={[0, -0.16, 0]} s={0.028} />
      </group>
      <group ref={head} position={[0, 0.52, 0]}>
        <ChibiHead girl bun glasses />
      </group>
    </group>
  );
}
