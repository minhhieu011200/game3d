import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Blush, Capsule, Cone, CuteEye, SPHERE, Smile, toon, Tube } from '../../../shared/3d/toon';

// ---------- Ếch ----------

const GREEN = '#1fae4b';
const GREEN_DARK = '#137a35';
const BELLY = '#e8ff9e';

/** Ếch hoạt hình mắt lồi to, ngồi xổm, thỉnh thoảng phồng má. Dài khoảng 0,6 m. */
export function Frog({ seed = 0 }: { seed?: number }) {
  const throat = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + seed * 1.3;
    if (throat.current) {
      const puff = Math.max(0, Math.sin(t * 2.2)) ** 6;
      throat.current.scale.set(0.13 + puff * 0.06, 0.08 + puff * 0.05, 0.1 + puff * 0.05);
    }
    if (body.current) body.current.position.y = Math.max(0, Math.sin(t * 1.1)) ** 30 * 0.18; // thỉnh thoảng nhảy nhẹ
  });
  return (
    <group ref={body}>
      <Ball c={GREEN} p={[0, 0.2, -0.04]} s={[0.24, 0.19, 0.27]} />
      <Ball c={BELLY} p={[0, 0.15, 0.1]} s={[0.17, 0.12, 0.15]} shadow={false} />
      <mesh ref={throat} geometry={SPHERE} material={toon('#f5ffb8')} position={[0, 0.18, 0.2]} scale={[0.13, 0.08, 0.1]} />
      {/* đốm lưng */}
      <Ball c={GREEN_DARK} p={[0.09, 0.36, -0.08]} s={[0.05, 0.02, 0.05]} shadow={false} />
      <Ball c={GREEN_DARK} p={[-0.08, 0.35, -0.14]} s={[0.04, 0.02, 0.04]} shadow={false} />
      {/* mắt lồi to trên đỉnh đầu */}
      {[-0.11, 0.11].map((x) => (
        <group key={x} position={[x, 0.37, 0.12]}>
          <Ball c={GREEN} s={0.1} />
          <CuteEye p={[0, 0.01, 0.06]} size={0.075} />
        </group>
      ))}
      <Smile p={[0, 0.23, 0.26]} size={0.08} c="#2a6a2a" r={[-0.3, 0, 0]} />
      <Blush p={[-0.15, 0.25, 0.2]} size={0.04} />
      <Blush p={[0.15, 0.25, 0.2]} size={0.04} />
      {/* chân trước và chân sau gập */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Capsule c={GREEN} p={[s * 0.12, 0.07, 0.17]} s={[0.035, 0.05, 0.035]} />
          <Ball c={GREEN} p={[s * 0.14, 0.015, 0.23]} s={[0.06, 0.015, 0.05]} />
          <Ball c={GREEN} p={[s * 0.2, 0.1, -0.12]} s={[0.09, 0.08, 0.15]} r={[0, s * 0.5, 0]} />
          <Ball c={GREEN} p={[s * 0.24, 0.015, 0.02]} s={[0.08, 0.015, 0.06]} />
        </group>
      ))}
    </group>
  );
}

// ---------- Cò ----------

const WHITE = '#ffffff';
const BEAK = '#ff8a1f';
const WING_TIP = '#1c1c28';

function Wing({ side, open }: { side: 1 | -1; open: boolean }) {
  // cánh trắng, đầu cánh đen; gập sát thân khi đứng, xoè rộng khi bay
  return open ? (
    <group>
      <Ball c={WHITE} p={[side * 0.42, 0, 0]} s={[0.42, 0.04, 0.2]} />
      <Ball c={WING_TIP} p={[side * 0.82, 0, -0.03]} s={[0.15, 0.035, 0.15]} />
    </group>
  ) : (
    <group>
      <Ball c={WHITE} p={[side * 0.13, 0, -0.06]} s={[0.05, 0.13, 0.26]} r={[0.35, 0, 0]} />
      <Ball c={WING_TIP} p={[side * 0.12, -0.05, -0.3]} s={[0.04, 0.06, 0.1]} />
    </group>
  );
}

/** Cò trắng hoạt hình: đứng chân dài; khi bay thì duỗi chân, sải cánh vỗ. Cao khoảng 1,1 m. */
export function Stork({ flying, seed = 0 }: { flying: boolean; seed?: number }) {
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  useFrame((state) => {
    const t = state.clock.elapsedTime + seed;
    if (flying) {
      const f = Math.sin(t * 7) * 0.6;
      if (wingL.current) wingL.current.rotation.z = f;
      if (wingR.current) wingR.current.rotation.z = -f;
    } else if (head.current) {
      // gật gù, thỉnh thoảng cúi mỏ mổ cá, nghiêng đầu ngó nghiêng
      head.current.rotation.x = Math.max(0, Math.sin(t * 0.7)) ** 8 * 0.9;
      head.current.rotation.z = Math.sin(t * 0.9) ** 3 * 0.25;
    }
  });
  const neck = useMemo(
    () =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0.15, 0.06),
        new THREE.Vector3(0, 0.28, -0.02),
        new THREE.Vector3(0, 0.36, 0.05),
      ]),
    [],
  );
  return (
    <group rotation-x={flying ? 0.15 : 0}>
      {/* chân đứng, hoặc duỗi ra sau khi bay */}
      {[-0.06, 0.06].map((x) => (
        <Tube key={x} c={BEAK} p={flying ? [x, 0.72, -0.5] : [x, 0.3, 0]} s={[0.018, flying ? 0.45 : 0.6, 0.018]} r={flying ? [Math.PI / 2, 0, 0] : [0, 0, 0]} />
      ))}
      <group position={[0, 0.72, 0]}>
        <Ball c={WHITE} s={[0.17, 0.16, 0.3]} r={[flying ? 0 : 0.3, 0, 0]} />
        <Cone c={WING_TIP} p={[0, 0.02, -0.33]} s={[0.07, 0.15, 0.04]} r={[-Math.PI / 2 - 0.4, 0, 0]} />
        <group ref={wingL} position={[0.08, 0.05, 0]}>
          <Wing side={1} open={flying} />
        </group>
        <group ref={wingR} position={[-0.08, 0.05, 0]}>
          <Wing side={-1} open={flying} />
        </group>
        <group position={[0, 0.08, flying ? 0.28 : 0.15]} rotation-x={flying ? -1.2 : 0}>
          <mesh material={toon(WHITE)} castShadow>
            <tubeGeometry args={[neck, 12, 0.04, 8, false]} />
          </mesh>
          <group ref={head} position={[0, 0.4, 0.06]}>
            <Ball c={WHITE} s={[0.08, 0.075, 0.09]} />
            <Ball c="#ff5a5f" p={[0, 0.07, -0.02]} s={[0.04, 0.02, 0.05]} shadow={false} />
            <CuteEye p={[-0.045, 0.02, 0.06]} size={0.035} />
            <CuteEye p={[0.045, 0.02, 0.06]} size={0.035} />
            <Cone c={BEAK} p={[0, -0.01, 0.17]} s={[0.025, 0.2, 0.025]} r={[Math.PI / 2, 0, 0]} />
            <Blush p={[-0.06, -0.02, 0.05]} size={0.02} />
            <Blush p={[0.06, -0.02, 0.05]} size={0.02} />
          </group>
        </group>
      </group>
    </group>
  );
}

// ---------- Nến ----------

const CANDLE_COLORS = ['#ff6b9a', '#4fb3ff', '#ffc93c', '#5fd068', '#a77bff'];
const flameMat = new THREE.MeshBasicMaterial({ color: '#ffb52e', transparent: true, opacity: 0.95, depthWrite: false });
const flameCoreMat = new THREE.MeshBasicMaterial({ color: '#fff3b0', transparent: true, opacity: 0.95, depthWrite: false });
const glowMat = new THREE.MeshBasicMaterial({ color: '#ffcf66', transparent: true, opacity: 0.3, depthWrite: false, blending: THREE.AdditiveBlending });

/** Cây nến màu kẹo có khuôn mặt: cháy thì mở mắt cười, tắt thì nhắm mắt ngủ và bốc khói. */
export function Candle({ lit, seed }: { lit: boolean; seed: number }) {
  const body = useRef<THREE.Group>(null);
  const flame = useRef<THREE.Group>(null);
  const smoke = useRef<THREE.Group>(null);
  const offAt = useRef(-100);
  const wasLit = useRef(lit);
  const color = CANDLE_COLORS[seed % CANDLE_COLORS.length];

  useEffect(() => {
    if (wasLit.current && !lit) offAt.current = performance.now() / 1000;
    wasLit.current = lit;
  }, [lit]);

  useFrame((state) => {
    const t = state.clock.elapsedTime + seed * 1.7;
    // lắc lư nhẹ như đang nhún theo nhạc
    if (body.current) body.current.rotation.z = Math.sin(t * 1.4) * 0.05;
    if (flame.current) {
      flame.current.visible = lit;
      const f = 1 + Math.sin(t * 13) * 0.08 + Math.sin(t * 7.3) * 0.06;
      flame.current.scale.set(1, f, 1);
      flame.current.rotation.z = Math.sin(t * 3.1) * 0.1;
    }
    if (smoke.current) {
      const age = performance.now() / 1000 - offAt.current;
      smoke.current.visible = !lit && age < 2.5;
      // khói xoắn ốc, bốc lên chậm và trôi ra phía trước (mặt cabin để trống, không bị mái che), nở dần rồi tan
      smoke.current.children.forEach((c, i) => {
        const a = Math.max(0, age - i * 0.18);
        const r = 0.015 + a * 0.03;
        // dưới mái cabin thì trôi ngang ra trước, ra khỏi cabin rồi mới bốc cao
        const up = 0.32 + a * 0.05 + Math.max(0, a - 0.6) ** 2 * 0.5;
        c.position.set(Math.cos(a * 5 + i * 1.3) * r, up, 0.03 + a * 0.32 + Math.sin(a * 5 + i * 1.3) * r);
        c.scale.setScalar(0.025 + a * 0.045);
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = a > 0 ? Math.max(0, 0.6 - a * 0.24) : 0;
      });
    }
  });

  return (
    <group>
      <group ref={body}>
        <Tube c={color} p={[0, 0.12, 0]} s={[0.055, 0.24, 0.055]} />
        {/* sọc xoắn như kẹo */}
        {[0.05, 0.13, 0.21].map((y) => (
          <Tube key={y} c="#ffffff" p={[0, y, 0]} s={[0.057, 0.02, 0.057]} shadow={false} />
        ))}
        <Ball c={color} p={[0, 0.245, 0]} s={[0.055, 0.02, 0.055]} shadow={false} />
        <Tube c="#3a3a3a" p={[0, 0.27, 0]} s={[0.005, 0.035, 0.005]} shadow={false} />
        {/* khuôn mặt */}
        <group position={[0, 0.15, 0.055]}>
          {lit ? (
            <>
              <Ball c="#2b2b3a" p={[-0.02, 0.02, 0]} s={[0.008, 0.011, 0.004]} shadow={false} />
              <Ball c="#2b2b3a" p={[0.02, 0.02, 0]} s={[0.008, 0.011, 0.004]} shadow={false} />
              <Smile p={[0, -0.005, 0]} size={0.012} />
            </>
          ) : (
            <>
              {/* mắt nhắm ngủ: hai vạch cong */}
              <Smile p={[-0.02, 0.025, 0]} size={0.009} r={[0, 0, Math.PI]} />
              <Smile p={[0.02, 0.025, 0]} size={0.009} r={[0, 0, Math.PI]} />
              <Ball c="#2b2b3a" p={[0, -0.005, 0]} s={[0.005, 0.006, 0.003]} shadow={false} />
            </>
          )}
          <Blush p={[-0.035, 0.005, -0.003]} size={0.01} />
          <Blush p={[0.035, 0.005, -0.003]} size={0.01} />
        </group>
        <group ref={flame} position={[0, 0.29, 0]}>
          <mesh position={[0, 0.04, 0]} scale={[0.028, 0.06, 0.028]} material={flameMat} geometry={SPHERE} />
          <mesh position={[0, 0.028, 0]} scale={[0.014, 0.03, 0.014]} material={flameCoreMat} geometry={SPHERE} />
          <mesh position={[0, 0.04, 0]} scale={[0.08, 0.11, 0.08]} material={glowMat} geometry={SPHERE} />
        </group>
      </group>
      <group ref={smoke} visible={false}>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} geometry={SPHERE}>
            <meshBasicMaterial color="#8f8fa3" transparent opacity={0} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
