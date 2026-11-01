import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FACE_CENTER, FACE_PATCH, FACE_RADIUS, faceMaterials, type FaceKind } from '../../../shared/3d/chibiFace';
import { Ball, Box, Capsule, Tube, toon } from '../../../shared/3d/toon';

// Người kiểu chibi hoạt hình 3D: đầu to tròn, thân và tay chân nhỏ, mắt to long lanh. Mặt hướng về +z.

export const SKIN = '#ffcda6';
/** Màu áo dài của cô giáo. */
export const AO_DAI = '#3f97e8';
const HAIR = '#5b3a26';
const TEACHER_HAIR = '#553524';

type V3 = [number, number, number];
const FACE_SCALE: V3 = [FACE_RADIUS[0] * 1.012, FACE_RADIUS[1] * 1.012, FACE_RADIUS[2] * 1.012];

/** Khối đầu và tóc chia lưới mịn: đường chân tóc là chỗ hai khối cắt nhau, lưới thưa sẽ bị răng cưa. */
const HEAD_SPHERE = new THREE.SphereGeometry(1, 64, 48);
function HeadBall({ c, p, s }: { c: string; p: V3; s: V3 }) {
  return <mesh geometry={HEAD_SPHERE} material={toon(c)} position={p} scale={s} castShadow />;
}

/** Nét mặt vẽ sẵn dán lên khối mặt, thỉnh thoảng chớp mắt. */
function Face({ kind }: { kind: FaceKind }) {
  const mesh = useRef<THREE.Mesh>(null);
  const seed = useRef(Math.random());
  const mats = faceMaterials(kind);
  useFrame((state) => {
    if (!mesh.current || !mats) return;
    const period = 3 + seed.current * 3;
    const tt = (state.clock.elapsedTime + seed.current * 17) % period;
    mesh.current.material = tt < 0.13 ? mats.closed : mats.open;
  });
  if (!mats) return null;
  return <mesh ref={mesh} geometry={FACE_PATCH} material={mats.open} position={FACE_CENTER} scale={FACE_SCALE} raycast={() => null} renderOrder={1} />;
}

/** Tóc ngắn tròn của bạn học sinh, để lộ tai. */
function KidHair({ girl, color }: { girl: boolean; color: string }) {
  return (
    <>
      <HeadBall c={color} p={[0, 0.05, -0.035]} s={[0.282, 0.27, 0.265]} />
      {girl &&
        [-1, 1].map((s) => (
          // hai búi tóc buộc nơ hồng
          <group key={s} position={[s * 0.3, 0.02, -0.04]}>
            <Ball c={color} s={[0.1, 0.11, 0.1]} />
            <Ball c="#ff6fa8" p={[-s * 0.06, 0.05, 0.03]} s={[0.04, 0.03, 0.03]} shadow={false} />
          </group>
        ))}
    </>
  );
}

/** Khoảng chừa phía trước mặt và ngực của mảng tóc xõa (rad, mỗi bên): mép tóc nằm sau má, không che mặt. */
const HAIR_FALL_GAP = 1.45;
/** Mảng tóc xõa: tiện quanh trục dọc, bỏ phần phía trước; miệng trên khớp với khối tóc đỉnh đầu. */
const TEACHER_HAIR_FALL = new THREE.LatheGeometry(
  [
    [0, -0.46],
    [0.12, -0.457],
    [0.19, -0.447],
    [0.232, -0.428],
    [0.254, -0.395],
    [0.262, -0.35],
    [0.266, -0.28],
    [0.278, -0.1],
    [0.29, 0.03],
    [0.295, 0.085],
  ].map(([r, y]) => new THREE.Vector2(r, y)),
  48,
  HAIR_FALL_GAP,
  Math.PI * 2 - HAIR_FALL_GAP * 2,
);

/** Tóc dài xõa thẳng của cô giáo: chân tóc cao để lộ lông mày, hai bên không ôm vào mặt. */
function TeacherHair() {
  const c = TEACHER_HAIR;
  return (
    <>
      <HeadBall c={c} p={[0, 0.085, -0.05]} s={[0.295, 0.27, 0.27]} />
      <mesh geometry={TEACHER_HAIR_FALL} material={toon(c, { side: THREE.DoubleSide })} position={[0, 0, -0.05]} scale={[1, 1, 0.915]} castShadow />
    </>
  );
}

/** Kính gọng đen tròn dày của cô giáo. */
function TeacherGlasses() {
  const c = '#1b1a20';
  return (
    <group position={[0, -0.025, 0.262]}>
      {[-0.09, 0.09].map((x) => (
        <mesh key={x} position={[x, 0, -0.005]} rotation={[0, x > 0 ? 0.32 : -0.32, 0]} material={toon(c)}>
          <torusGeometry args={[0.076, 0.0105, 10, 32]} />
        </mesh>
      ))}
      <Box c={c} p={[0, 0.012, 0.006]} s={[0.04, 0.011, 0.011]} shadow={false} />
      {[-1, 1].map((s) => (
        <Box key={s} c={c} p={[s * 0.205, 0.015, -0.12]} s={[0.012, 0.016, 0.21]} r={[0, s * -0.22, 0]} shadow={false} />
      ))}
    </group>
  );
}

/** Đầu chibi kiểu hoạt hình 3D, bán kính khoảng 0,27 m. Gốc toạ độ ở tâm đầu. */
export function ChibiHead({ girl = false, teacher = false }: { girl?: boolean; teacher?: boolean }) {
  return (
    <group>
      <HeadBall c={SKIN} p={FACE_CENTER} s={FACE_RADIUS} />
      {/* tai (tóc cô giáo xõa che tai) */}
      {!teacher &&
        [-1, 1].map((s) => <Ball key={s} c={SKIN} p={[s * 0.25, -0.05, 0.03]} s={[0.04, 0.055, 0.035]} shadow={false} />)}
      <Face kind={teacher ? 'teacher' : girl ? 'girl' : 'boy'} />
      {teacher ? (
        <>
          <TeacherHair />
          <TeacherGlasses />
        </>
      ) : (
        <KidHair girl={girl} color={HAIR} />
      )}
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

/** Cô giáo chibi mặc áo dài xanh, tóc dài, đeo kính; ngồi đầu thuyền chỉ tay về phía bờ. */
export function Teacher() {
  const arm = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (arm.current) arm.current.rotation.x = -1.2 + Math.sin(t * 1.3) * 0.25;
    if (head.current) head.current.rotation.y = Math.sin(t * 0.6) * 0.35;
  });
  return (
    <group>
      {/* quần trắng, tà áo dài phủ lên đùi */}
      {[-0.06, 0.06].map((x) => (
        <group key={x}>
          <Tube c="#ffffff" p={[x, 0.04, 0.08]} s={[0.045, 0.16, 0.045]} r={[Math.PI / 2, 0, 0]} />
          <Ball c="#23242b" p={[x, 0.03, 0.17]} s={[0.035, 0.03, 0.05]} />
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
        <ChibiHead teacher />
      </group>
    </group>
  );
}
