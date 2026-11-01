import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Box, Capsule, Cone, Outlined, Tube, toon } from '../../../shared/3d/toon';
import { autopilot, stepBoat } from '../boat';
import { boatRuntime } from '../boatRuntime';
import { WATER_Y } from '../world';
import { TourKid, type Pose } from '../../../tour/Walkers';
import { AO_DAI, ChibiHead, LifeVest, SKIN } from './Passengers';

/** Bạn nhỏ trên thuyền không bước chân; chỉ quay lại vẫy tay khi thuyền đậu. */
const kidPose: Pose = { speed: 0, idle: 0 };

// ---------- Thuyền gỗ ghép ván ----------

const HULL_L = 4.4;
const HULL_W = 0.95; // nửa bề ngang chỗ rộng nhất
const HULL_D = 0.62; // sâu từ mép mạn xuống sống thuyền
const GUNWALE_Y = 0.48;

/** Nửa bề ngang và độ cao mép mạn tại vị trí dọc thân z (mũi +z, đuôi −z): hai đầu nhọn và vểnh lên. */
function hullAt(z: number) {
  const t = THREE.MathUtils.clamp(z / (HULL_L / 2), -1, 1);
  const halfW = HULL_W * Math.pow(Math.max(0, 1 - Math.pow(Math.abs(t), 2.4)), 0.65);
  const top = GUNWALE_Y + 0.2 * t * t;
  const depth = HULL_D * (1 - 0.45 * t * t);
  return { halfW, top, depth };
}

const PLANK_A = new THREE.Color('#a86a3a');
const PLANK_B = new THREE.Color('#8e5530');
const STRIPE = new THREE.Color('#2f86c9');

/** Vỏ thuyền hình chữ U thuôn hai đầu, tô sọc từng tấm ván, có một dải sơn xanh sát mép. */
function hullGeometry() {
  const NZ = 48;
  const NA = 14;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= NZ; i++) {
    const z = -HULL_L / 2 + (HULL_L * i) / NZ;
    const { halfW, top, depth } = hullAt(z);
    for (let j = 0; j <= NA; j++) {
      const th = -Math.PI / 2 + (Math.PI * j) / NA;
      const y = top - depth * Math.cos(th);
      pos.push(halfW * Math.sin(th), y, z);
      const fromTop = top - y;
      const c = fromTop < 0.07 ? STRIPE : Math.floor(fromTop / 0.12) % 2 ? PLANK_B : PLANK_A;
      col.push(c.r, c.g, c.b);
      if (i < NZ && j < NA) {
        const k = i * (NA + 1) + j;
        idx.push(k, k + NA + 1, k + 1, k + 1, k + NA + 1, k + NA + 2);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

const FLOOR_Y = 0.1;
const FLOOR_PLANKS = ['#c8935a', '#b98250', '#c08a52', '#b47d4b'];

/** Sàn gỗ liền phủ kín lòng thuyền: các tấm ván dọc nằm sát nhau, bề ngang bám theo đúng dáng thân tại độ cao sàn. */
function floorGeometry() {
  const halfAt = (z: number) => {
    const { halfW, top, depth } = hullAt(z);
    const c = (top - FLOOR_Y) / depth;
    return c >= 1 ? 0 : halfW * Math.sqrt(1 - c * c);
  };
  const pos: number[] = [];
  const col: number[] = [];
  const NZ = 40;
  const PLANKS = 7;
  const c = new THREE.Color();
  for (let i = 0; i < NZ; i++) {
    const z0 = -HULL_L / 2 + (HULL_L * i) / NZ;
    const z1 = -HULL_L / 2 + (HULL_L * (i + 1)) / NZ;
    const h0 = halfAt(z0);
    const h1 = halfAt(z1);
    if (h0 === 0 && h1 === 0) continue;
    for (let k = 0; k < PLANKS; k++) {
      const u0 = -1 + (2 * k) / PLANKS;
      const u1 = -1 + (2 * (k + 1)) / PLANKS;
      c.set(FLOOR_PLANKS[k % FLOOR_PLANKS.length]);
      const quad = [
        [u0 * h0, z0], [u0 * h1, z1], [u1 * h1, z1],
        [u0 * h0, z0], [u1 * h1, z1], [u1 * h0, z0],
      ];
      for (const [x, z] of quad) {
        pos.push(x, FLOOR_Y, z);
        col.push(c.r, c.g, c.b);
      }
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

/** Thanh gỗ chạy dọc mép mạn một bên (s = −1 trái, +1 phải). */
function gunwaleGeometry(s: number) {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 24; i++) {
    const z = -HULL_L / 2 + 0.02 + ((HULL_L - 0.04) * i) / 24;
    const { halfW, top } = hullAt(z);
    pts.push(new THREE.Vector3(s * halfW, top, z));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 48, 0.05, 6, false);
}

const hullGeo = hullGeometry();
const hullMat = new THREE.MeshToonMaterial({ vertexColors: true, side: THREE.DoubleSide });
const railGeos = [gunwaleGeometry(-1), gunwaleGeometry(1)];
const floorGeo = floorGeometry();

/** Ghế ngang (băng gỗ) tại z, vừa khít bề ngang thân. */
function Thwart({ z, h = 0.18 }: { z: number; h?: number }) {
  const { halfW, top } = hullAt(z);
  return <Box c="#c08a52" p={[0, top - h, z]} s={[halfW * 2 - 0.08, 0.07, 0.3]} />;
}

function Hull() {
  return (
    <group>
      <mesh geometry={hullGeo} material={hullMat} castShadow receiveShadow />
      {railGeos.map((g, i) => (
        <mesh key={i} geometry={g} material={toon('#6b4423')} castShadow />
      ))}
      {/* sàn gỗ liền dưới chân, che kín lòng thuyền */}
      <mesh geometry={floorGeo} material={hullMat} receiveShadow userData={{ noOutline: true }} />
      {/* áo phao dự phòng đặt trên ghế đuôi thuyền */}
      <LifeVest p={[0, hullAt(-1.55).top - 0.03, -1.55]} s={[0.24, 0.26, 0.09]} r={[-Math.PI / 2 + 0.1, 0, 0]} />
      <Thwart z={-0.45} />
      <Thwart z={0.75} />
      <Thwart z={-1.55} h={0.12} />
      {/* sống mũi và cờ nhỏ */}
      <Box c="#6b4423" p={[0, GUNWALE_Y + 0.2, HULL_L / 2 - 0.04]} s={[0.08, 0.16, 0.1]} />
      <Tube c="#ffffff" p={[0, 1.15, 1.75]} s={[0.022, 1.0, 0.022]} />
      <Cone c="#ff5a5f" p={[0.18, 1.5, 1.75]} s={[0.13, 0.34, 0.03]} r={[0, 0, -Math.PI / 2]} />
    </group>
  );
}

// ---------- Mái chèo ----------

/** Cọc chèo ở trước mặt cô giáo (phía đuôi thuyền, vì người chèo ngồi quay mặt về đuôi). */
const OARLOCK_Z = -1.0;
const OAR_OUT = 2.0; // phần mái chèo ra ngoài mạn
const OAR_IN = 0.75; // phần cán vào trong thuyền
const OAR_TILT = 0.36; // độ chúc xuống nước khi đang khua

/** Một mái chèo gắn ở cọc chèo bên `s`; `yaw` (quét dọc thân) và `tilt` (chúc) được đặt mỗi khung hình. */
function Oar({ s, yaw, tilt }: { s: number; yaw: React.RefObject<THREE.Group>; tilt: React.RefObject<THREE.Group> }) {
  const { halfW, top } = hullAt(OARLOCK_Z);
  const len = OAR_OUT + OAR_IN;
  return (
    <group position={[s * halfW, top + 0.06, OARLOCK_Z]}>
      {/* cọc chèo */}
      <Tube c="#4a4f57" p={[0, 0.04, 0]} s={[0.03, 0.14, 0.03]} shadow={false} />
      <group ref={yaw}>
        <group ref={tilt}>
          <Tube c="#d9a86a" p={[(s * (OAR_OUT - OAR_IN)) / 2, 0, 0]} r={[0, 0, Math.PI / 2]} s={[0.035, len, 0.035]} />
          {/* bản chèo dẹt đứng */}
          <Box c="#c48a4e" p={[s * (OAR_OUT - 0.25), 0, 0]} s={[0.55, 0.2, 0.035]} />
          {/* tay cầm */}
          <Tube c="#6b4423" p={[-s * (OAR_IN - 0.1), 0, 0]} r={[0, 0, Math.PI / 2]} s={[0.045, 0.22, 0.045]} />
        </group>
      </group>
    </group>
  );
}

// ---------- Cô giáo chèo thuyền ----------

/** Cô giáo chibi (tóc dài, kính đen, áo dài xanh, áo phao) ngồi ghế giữa, quay mặt về đuôi thuyền, hai tay cầm cán chèo. */
function RowingTeacher({ body, arms }: { body: React.RefObject<THREE.Group>; arms: React.RefObject<THREE.Group> }) {
  return (
    <group>
      {/* chân co, duỗi về phía trước mặt (đuôi thuyền) */}
      {[-0.08, 0.08].map((x) => (
        <group key={x}>
          <Tube c="#ffffff" p={[x, 0.02, 0.14]} s={[0.055, 0.28, 0.055]} r={[Math.PI / 2, 0, 0]} />
          <Tube c="#ffffff" p={[x, -0.12, 0.28]} s={[0.05, 0.22, 0.05]} />
          <Ball c="#23242b" p={[x, -0.23, 0.32]} s={[0.05, 0.035, 0.07]} />
        </group>
      ))}
      <group ref={body}>
        {/* vạt áo dài phủ lên đùi */}
        <Box c={AO_DAI} p={[0, 0.03, 0.15]} s={[0.2, 0.012, 0.22]} shadow={false} />
        <Ball c={AO_DAI} p={[0, 0.22, 0]} s={[0.15, 0.2, 0.12]} />
        <LifeVest p={[0, 0.22, 0]} s={[0.172, 0.19, 0.142]} />
        <group ref={arms} position={[0, 0.3, 0.02]}>
          {[-1, 1].map((sx) => (
            <group key={sx}>
              <Capsule c={AO_DAI} p={[sx * 0.15, -0.02, 0.12]} s={[0.035, 0.09, 0.035]} r={[1.25, 0, sx * -0.35]} />
              <Ball c={SKIN} p={[sx * 0.12, -0.05, 0.26]} s={0.038} />
            </group>
          ))}
        </group>
        <group position={[0, 0.62, 0]} scale={1.15}>
          <ChibiHead teacher />
        </group>
      </group>
    </group>
  );
}

/** Thuyền trên sông: đọc phím/nút lái, tự lái khi bấm bến, nhấp nhô theo sóng. */
export function Boat() {
  const group = useRef<THREE.Group>(null);
  const oarYaw = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const oarTilt = [useRef<THREE.Group>(null), useRef<THREE.Group>(null)];
  const rower = useRef<THREE.Group>(null);
  const arms = useRef<THREE.Group>(null);
  const stroke = useRef(0);
  const wake = useRef<THREE.Group>(null);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const rt = boatRuntime;
    const manual = rt.input.forward || rt.input.back || rt.input.left || rt.input.right;
    if (manual) {
      // lái tay thì thôi tự lái và camera lại nhìn theo thuyền
      rt.target = null;
      rt.focus = null;
    }
    if (rt.target !== null) {
      const r = autopilot(rt.boat, rt.target, dt);
      rt.boat = r.boat;
      if (r.arrived) rt.target = null;
    } else {
      rt.boat = stepBoat(rt.boat, rt.input, dt);
    }
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const b = rt.boat;
    kidPose.idle = Math.abs(b.speed) < 0.3 ? kidPose.idle + Math.min(rawDt, 0.1) : 0;
    g.position.set(b.x, WATER_Y + Math.sin(t * 1.6) * 0.05, b.z);
    g.rotation.set(Math.sin(t * 1.3) * 0.03, b.heading, Math.sin(t * 1.1) * 0.04 - (rt.input.left ? 0.06 : 0) + (rt.input.right ? 0.06 : 0));
    // nhịp chèo: thuyền chạy thì khua mạnh và nhanh, đứng yên thì khua nhẹ giữ thuyền
    const moving = Math.min(1, Math.abs(b.speed) / 3);
    stroke.current += Math.min(rawDt, 0.1) * (1.4 + 2.2 * moving);
    const ph = stroke.current;
    const sweep = Math.sin(ph) * (0.18 + 0.32 * moving);
    // nửa vòng kéo: bản chèo dưới nước; nửa vòng về: nhấc bản chèo lên khỏi mặt nước
    const lift = Math.max(0, Math.cos(ph)) * (0.1 + 0.18 * moving);
    [-1, 1].forEach((side, i) => {
      oarYaw[i].current?.rotation.set(0, side * sweep, 0);
      oarTilt[i].current?.rotation.set(0, 0, -side * (OAR_TILT - lift));
    });
    // cô ngả người theo nhịp kéo, hai tay đưa theo cán chèo
    if (rower.current) rower.current.rotation.x = -Math.sin(ph) * (0.12 + 0.12 * moving);
    if (arms.current) arms.current.position.z = 0.02 + Math.sin(ph) * (0.04 + 0.05 * moving);
    if (wake.current) {
      wake.current.visible = Math.abs(b.speed) > 0.5;
      wake.current.children.forEach((c, i) => {
        const k = ((t * 1.2 + i / 4) % 1);
        c.position.set(Math.sin(i * 2.1) * 0.3, 0.06, -2.4 - k * 2.5);
        c.scale.setScalar(0.25 + k * 0.6);
        ((c as THREE.Mesh).material as THREE.MeshBasicMaterial).opacity = 0.7 * (1 - k);
      });
    }
  });

  return (
    <group ref={group}>
      <Outlined outline={false}>
        <Hull />
        {/* bạn học sinh (Vẹt Xanh trên vai) đứng phía mũi thuyền:
            thuyền chạy thì nhìn về phía trước, thuyền đậu thì quay lại vẫy tay */}
        <group position={[0, FLOOR_Y, 1.2]} scale={1.35}>
          <TourKid pose={kidPose} outline={false} lifeVest />
        </group>
        {/* cô giáo ngồi ghế giữa chèo thuyền, quay mặt về đuôi (về phía camera) */}
        <group position={[0, hullAt(-0.45).top - 0.1, -0.45]} rotation-y={Math.PI} scale={1.3}>
          <RowingTeacher body={rower} arms={arms} />
        </group>
        <Oar s={-1} yaw={oarYaw[0]} tilt={oarTilt[0]} />
        <Oar s={1} yaw={oarYaw[1]} tilt={oarTilt[1]} />
      </Outlined>
      {/* vệt bọt trắng sau đuôi thuyền */}
      <group ref={wake}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} rotation-x={-Math.PI / 2}>
            <ringGeometry args={[0.6, 1, 20]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.6} depthWrite={false} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
