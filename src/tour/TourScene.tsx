// Cảnh đường đi của chuyến tham quan: con đường uốn qua 4 cổng tới Quảng Trường Huy Hiệu.
// Camera chỉ chạy trên đường (không có điều khiển chuột); Vẹt Xanh bay theo camera.
import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../shared/3d/quality';
import { Sign3D } from '../shared/3d/Sign3D';
import { Ball, toon } from '../shared/3d/toon';
import { cameraT, CLASS_NAME, isGate, isPassed, STATIONS, STOP_BEFORE_GATE } from './logic';
import { useTour } from './store';
import { CandyFences, FlowerBushes, Lamps, PawPrints, RoadsideAnimals, WelcomeArch, Balloons } from './Decor';
import { ARCH_T, BUS, BUS_T, CAM_BACK, CAM_H, CLASS_SIGN, GATE, plantTrees, toWorld } from './layout';
import { PATH } from './path';
import { walk, Walkers } from './Walkers';
import { Gate } from './Gates';
import { Square } from './Square';
import { cobbleMaterial, grassMaterial, ironMaterial, skyMaterial, solid } from './textures';

type V3 = [number, number, number];


// camera đứng sau lưng nhóm cô trò, hơi cao, nhìn về phía trước
const LOOK_FWD = 6;
// nhìn hơi chúc xuống qua đầu bạn nhỏ: bạn nhỏ chiếm phần dưới khung hình, không che nội dung trên cổng
const LOOK_H = 3.0;

/** Điểm và hướng trên đường; `yaw` quay trục +z cục bộ về phía người đi tới (ngược hướng đi). */
function frameAt(t: number) {
  const p = PATH.getPointAt(THREE.MathUtils.clamp(t, 0, 1));
  const d = PATH.getTangentAt(THREE.MathUtils.clamp(t, 0, 1));
  return { p, yaw: Math.atan2(-d.x, -d.z) };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

/** Chùm bóng bay bên trái (−1) / phải (+1) cổng, vị trí theo layout. */
function balloonAt(t: number, side: 1 | -1): V3 {
  const [x, z] = toWorld(t, side * GATE.balloons.x, GATE.balloons.z);
  return [x, 0, z];
}

function SkyDome() {
  const ref = useRef<THREE.Mesh>(null);
  const camera = useThree((s) => s.camera);
  useFrame(() => ref.current?.position.copy(camera.position));
  return (
    <mesh ref={ref} material={skyMaterial()} renderOrder={-1}>
      <sphereGeometry args={[250, 32, 16]} />
    </mesh>
  );
}

// ---------- Mặt đất, đường, cây ----------

function Road() {
  const geo = useMemo(() => {
    const n = 240;
    const half = 2.4;
    const pos: number[] = [];
    const uv: number[] = [];
    const idx: number[] = [];
    const up = new THREE.Vector3(0, 1, 0);
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const p = PATH.getPointAt(t);
      const side = new THREE.Vector3().crossVectors(PATH.getTangentAt(t), up).normalize().multiplyScalar(half);
      pos.push(p.x - side.x, 0.03, p.z - side.z, p.x + side.x, 0.03, p.z + side.z);
      uv.push(0, t, 1, t);
      if (i < n) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return <mesh geometry={geo} material={cobbleMaterial()} receiveShadow />;
}

function Ground() {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, 0, -60]} receiveShadow material={grassMaterial()}>
      <planeGeometry args={[260, 260]} />
    </mesh>
  );
}

const LEAVES = ['#3f6f2a', '#4d8233', '#5f9a3c', '#6fae45', '#38612a'];

/** Cây nhiều tán: thân thuôn có hai nhánh, tán lá gồm nhiều chùm đậm nhạt. */
function Tree({ p, s, seed }: { p: V3; s: number; seed: number }) {
  const clumps = useMemo(() => {
    const r = rng(seed * 31 + 5);
    return Array.from({ length: 9 }, () => {
      const a = r() * Math.PI * 2;
      const rad = 0.4 + r() * 0.9;
      return { p: [Math.cos(a) * rad, 2.5 + r() * 1.6, Math.sin(a) * rad] as V3, s: 0.6 + r() * 0.55, c: LEAVES[Math.floor(r() * LEAVES.length)] };
    });
  }, [seed]);
  return (
    <group position={p} scale={s} rotation-y={seed}>
      <mesh position={[0, 1.2, 0]} material={solid('#6b4a2f', 0.95)} castShadow>
        <cylinderGeometry args={[0.13, 0.22, 2.4, 8]} />
      </mesh>
      <mesh position={[0.3, 2.2, 0]} rotation-z={-0.7} material={solid('#6b4a2f', 0.95)}>
        <cylinderGeometry args={[0.05, 0.09, 0.9, 6]} />
      </mesh>
      <mesh position={[-0.28, 2.4, 0.1]} rotation-z={0.8} material={solid('#6b4a2f', 0.95)}>
        <cylinderGeometry args={[0.05, 0.08, 0.8, 6]} />
      </mesh>
      {clumps.map((c, i) => (
        <mesh key={i} position={c.p} scale={c.s} material={solid(c.c, 0.9)} castShadow>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  );
}

function Trees() {
  const q = useQuality();
  // vị trí cây do layout chọn: không chồng lên vật nào, không chắn tầm nhìn ở các điểm dừng
  const trees = useMemo(() => plantTrees(q.shadows ? 70 : 36), [q.shadows]);
  return (
    <>
      {trees.map((t, i) => (
        <Tree key={i} p={[t.x, 0, t.z]} s={t.s} seed={i} />
      ))}
    </>
  );
}

/** Khối cầu mây tô sẵn màu theo độ cao: đỉnh trắng, đáy xanh xám nhạt — mọi đám mây trông như nhau, không theo hướng nắng. */
const CLOUD_GEO = (() => {
  const geo = new THREE.SphereGeometry(1, 20, 14);
  const n = geo.attributes.normal;
  const top = new THREE.Color('#ffffff');
  const bottom = new THREE.Color('#d4e2ee');
  const c = new THREE.Color();
  const colors = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) {
    c.copy(bottom).lerp(top, THREE.MathUtils.smoothstep(n.getY(i), -0.5, 0.4));
    c.toArray(colors, i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  return geo;
})();
const CLOUD_PUFFS: [V3, V3][] = [
  [[0, 0, 0], [4, 2.2, 2.5]],
  [[3, -0.4, 0], [3, 1.8, 2]],
  [[-3, -0.5, 0], [2.6, 1.6, 2]],
];
const cloudMaterial = new THREE.MeshBasicMaterial({ vertexColors: true });

function Clouds() {
  const clouds = useMemo(() => {
    const r = rng(3);
    return Array.from({ length: 10 }, () => [-60 + r() * 120, 22 + r() * 10, -10 - r() * 150] as V3);
  }, []);
  return (
    <>
      {clouds.map((p, i) => (
        <group key={i} position={p}>
          {CLOUD_PUFFS.map(([pp, s], j) => (
            <mesh key={j} geometry={CLOUD_GEO} material={cloudMaterial} position={pp} scale={s} />
          ))}
        </group>
      ))}
    </>
  );
}

// ---------- Xe buýt ----------

function Wheel({ p }: { p: V3 }) {
  return (
    <group position={p} rotation-x={Math.PI / 2}>
      <mesh material={solid('#1f1f1f', 0.9)} castShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.3, 20]} />
      </mesh>
      <mesh material={solid('#c9c9c9', 0.3, 0.8)}>
        <cylinderGeometry args={[0.2, 0.2, 0.32, 16]} />
      </mesh>
    </group>
  );
}

/** Xe buýt kiểu cổ màu kem, viền nâu, mũi xe dài (đầu xe hướng +x). */
function VintageBus() {
  const CREAM = '#ead7ad';
  const BROWN = '#8b5a2b';
  const GLASS = '#3d4f52';
  return (
    <group>
      {/* thân xe */}
      <mesh position={[-0.4, 1.35, 0]} material={solid(CREAM, 0.6)} castShadow receiveShadow>
        <boxGeometry args={[4.4, 1.9, 2.1]} />
      </mesh>
      {/* mui cong */}
      <mesh position={[-0.4, 2.3, 0]} rotation-z={Math.PI / 2} scale={[0.42, 1, 1]} material={solid(CREAM, 0.6)} castShadow>
        <cylinderGeometry args={[1.05, 1.05, 4.4, 24, 1, false, 0, Math.PI]} />
      </mesh>
      {/* sọc nâu ngang thân */}
      <mesh position={[-0.4, 0.75, 0]} material={solid(BROWN, 0.6)}>
        <boxGeometry args={[4.42, 0.35, 2.12]} />
      </mesh>
      {/* cửa sổ hai bên */}
      {[-1.9, -1.0, -0.1, 0.8].flatMap((x) =>
        [-1, 1].map((sd) => (
          <mesh key={`${x}${sd}`} position={[x, 1.75, sd * 1.06]} material={solid(GLASS, 0.15, 0.3)}>
            <boxGeometry args={[0.7, 0.75, 0.02]} />
          </mesh>
        )),
      )}
      {/* kính lái và cửa lên xuống */}
      <mesh position={[1.81, 1.75, 0]} material={solid(GLASS, 0.15, 0.3)}>
        <boxGeometry args={[0.02, 0.75, 1.8]} />
      </mesh>
      <mesh position={[1.45, 1.2, 1.06]} material={solid(BROWN, 0.6)}>
        <boxGeometry args={[0.6, 1.5, 0.02]} />
      </mesh>
      {/* mũi xe: nắp máy, lưới tản nhiệt, đèn, cản */}
      <mesh position={[2.35, 0.95, 0]} material={solid(CREAM, 0.6)} castShadow>
        <boxGeometry args={[1.1, 1.0, 1.7]} />
      </mesh>
      <mesh position={[2.92, 0.95, 0]} material={solid('#bdbdbd', 0.3, 0.8)}>
        <boxGeometry args={[0.05, 0.7, 0.9]} />
      </mesh>
      {[-0.62, 0.62].map((z) => (
        <mesh key={z} position={[2.9, 1.2, z]} rotation-z={Math.PI / 2} material={solid('#fff6d0', 0.2)}>
          <cylinderGeometry args={[0.15, 0.15, 0.1, 16]} />
        </mesh>
      ))}
      <mesh position={[2.98, 0.45, 0]} material={solid('#c9c9c9', 0.3, 0.8)}>
        <boxGeometry args={[0.12, 0.16, 2.1]} />
      </mesh>
      <Wheel p={[1.9, 0.42, 1.0]} />
      <Wheel p={[1.9, 0.42, -1.0]} />
      <Wheel p={[-1.6, 0.42, 1.0]} />
      <Wheel p={[-1.6, 0.42, -1.0]} />
    </group>
  );
}

const SIGN_WOOD = '#7a4e2a';
const GLOW = (c: string) => toon(c, { emissive: c });
const FLOWER_COLORS = ['#ff7aa8', '#ffd23f', '#9b7bff', '#ff8a3d', '#5bc0ff'];
const ORB_COLORS = ['#ffb3c7', '#fff2a8', '#ffffff', '#e6b3ff', '#fff2a8', '#ffffff', '#c9b3ff', '#ffb3c7'];
const BASE_COLORS = ['#e8443a', '#f39a2b', '#4caf50', '#2f8fd8', '#8a5cc9', '#e2559a'];

/** Dây leo xanh có đèn nháy vàng, chạy từ a tới b. */
function Vine({ a, b, n }: { a: V3; b: V3; n: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => {
        const k = (i + 0.5) / n;
        const p: V3 = [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k + 0.08];
        return i % 2 ? (
          <Ball key={i} p={p} s={0.045} c="#ffe27a" shadow={false} />
        ) : (
          <Ball key={i} p={p} s={[0.08, 0.05, 0.05]} r={[0, 0, i]} c="#4f9a3a" shadow={false} />
        );
      })}
    </>
  );
}

/** Đám mây nhỏ trang trí góc biển. */
function Puff({ p, s = 1 }: { p: V3; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Ball p={[0, 0, 0]} s={[0.16, 0.1, 0.06]} c="#ffffff" shadow={false} />
      <Ball p={[-0.13, -0.02, 0]} s={[0.1, 0.07, 0.05]} c="#ffffff" shadow={false} />
      <Ball p={[0.13, -0.02, 0]} s={[0.1, 0.07, 0.05]} c="#ffffff" shadow={false} />
    </group>
  );
}

function Owl({ p, c }: { p: V3; c: string }) {
  return (
    <group position={p}>
      <Ball p={[0, 0, 0]} s={[0.13, 0.15, 0.1]} c={c} />
      <Ball p={[0, -0.02, 0.06]} s={[0.08, 0.09, 0.05]} c="#f2dcb4" shadow={false} />
      <Ball p={[-0.05, 0.06, 0.08]} s={0.035} c="#ffffff" shadow={false} />
      <Ball p={[0.05, 0.06, 0.08]} s={0.035} c="#ffffff" shadow={false} />
      <Ball p={[-0.05, 0.06, 0.105]} s={0.018} c="#2b1a10" shadow={false} />
      <Ball p={[0.05, 0.06, 0.105]} s={0.018} c="#2b1a10" shadow={false} />
    </group>
  );
}

function PandaHead({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <Ball p={[0, 0, 0]} s={[0.15, 0.13, 0.11]} c="#ffffff" />
      <Ball p={[-0.11, 0.1, 0]} s={0.05} c="#222222" shadow={false} />
      <Ball p={[0.11, 0.1, 0]} s={0.05} c="#222222" shadow={false} />
      <Ball p={[-0.055, 0.01, 0.09]} s={[0.04, 0.03, 0.02]} c="#222222" shadow={false} />
      <Ball p={[0.055, 0.01, 0.09]} s={[0.04, 0.03, 0.02]} c="#222222" shadow={false} />
      <Ball p={[0, -0.04, 0.1]} s={0.02} c="#222222" shadow={false} />
    </group>
  );
}

/** Hoa nhỏ: cuống xanh, bông tròn. */
function Bloom({ p, c, h = 0.18 }: { p: V3; c: string; h?: number }) {
  return (
    <group position={p}>
      <mesh position={[0, h / 2, 0]} material={solid('#4f8a34', 0.8)}>
        <cylinderGeometry args={[0.012, 0.012, h, 5]} />
      </mesh>
      <Ball p={[0, h, 0]} s={[0.07, 0.07, 0.03]} c={c} shadow={false} />
      <Ball p={[0, h, 0.02]} s={0.025} c="#ffd23f" shadow={false} />
    </group>
  );
}

/**
 * Biển gỗ "Lớp …": hai cột có chóp vàng, thanh ngang treo biển, dây leo đèn nháy,
 * thú nhỏ trên biển, hộp hoa có hàng đèn cầu nhiều màu, bệ trắng ghi lời chào.
 */
function ClassSign() {
  return (
    <group>
      {/* bệ trắng ghi lời chào */}
      <mesh position={[0, 0.14, 0]} material={solid('#f4efe4', 0.9)} castShadow receiveShadow>
        <boxGeometry args={[3.7, 0.28, 0.7]} />
      </mesh>
      <Sign3D
        text="CÁNH CỬA ĐẾN THẾ GIỚI MỚI!"
        height={0.24}
        bg="#f4efe4"
        border="#f4efe4"
        rainbow={BASE_COLORS}
        billboard={false}
        position={[0, 0.14, 0.36]}
      />
      {/* hai cột gỗ có chóp vàng, quấn dây leo đèn nháy */}
      {[-1.65, 1.65].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.4, 0]} material={solid(SIGN_WOOD, 0.85)} castShadow>
            <cylinderGeometry args={[0.09, 0.11, 2.3, 12]} />
          </mesh>
          <mesh position={[0, 2.72, 0]} material={solid('#d4a645', 0.35, 0.7)} castShadow>
            <coneGeometry args={[0.14, 0.32, 12]} />
          </mesh>
          <Vine a={[0, 0.4, 0]} b={[0, 2.5, 0]} n={14} />
        </group>
      ))}
      {/* thanh ngang, dây leo và xích treo biển */}
      <mesh position={[0, 2.38, 0]} rotation-z={Math.PI / 2} material={solid(SIGN_WOOD, 0.85)} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 3.5, 10]} />
      </mesh>
      <Vine a={[-1.6, 2.42, 0]} b={[1.6, 2.42, 0]} n={22} />
      {[-0.8, 0.8].map((x) => (
        <mesh key={x} position={[x, 2.22, 0.06]} material={ironMaterial()}>
          <cylinderGeometry args={[0.015, 0.015, 0.3, 6]} />
        </mesh>
      ))}
      <Sign3D text={`🚌 Lớp ${CLASS_NAME}`} height={0.9} wood border="#3b2210" color="#f3d29a" billboard={false} position={[0, 1.66, 0.08]} />
      {/* thú nhỏ và mây trên biển */}
      <Owl p={[-0.55, 2.2, 0.12]} c="#8a5a33" />
      <Owl p={[-0.25, 2.2, 0.12]} c="#a8703f" />
      <PandaHead p={[1.3, 1.24, 0.18]} />
      <Puff p={[-1.2, 2.0, 0.16]} />
      <Puff p={[0.75, 2.12, 0.16]} s={1.2} />
      {/* hộp hoa: cỏ, hàng đèn cầu nhiều màu, cầu vồng nhỏ và hoa ở mặt trước */}
      <mesh position={[0, 0.5, 0.05]} material={solid('#8a5a2b', 0.9)} castShadow>
        <boxGeometry args={[2.3, 0.44, 0.46]} />
      </mesh>
      <mesh position={[0, 0.75, 0.05]} material={solid('#5aa03c', 0.95)}>
        <boxGeometry args={[2.3, 0.08, 0.46]} />
      </mesh>
      {ORB_COLORS.map((c, i) => (
        <mesh key={i} position={[-0.95 + i * 0.27, 0.88, 0.05]} material={GLOW(c)}>
          <sphereGeometry args={[0.085, 12, 8]} />
        </mesh>
      ))}
      {['#e8443a', '#f39a2b', '#f7d046', '#5cb85c', '#3d8fd6'].map((c, i) => (
        <mesh key={c} position={[0, 0.34, 0.29]} material={solid(c, 0.6)}>
          <torusGeometry args={[0.22 - i * 0.035, 0.018, 6, 24, Math.PI]} />
        </mesh>
      ))}
      {[-0.95, -0.75, -0.55, -0.35, 0.35, 0.55, 0.75, 0.95].map((x, i) => (
        <Bloom key={x} p={[x, 0.3, 0.29]} c={FLOWER_COLORS[i % FLOWER_COLORS.length]} h={0.14 + (i % 3) * 0.04} />
      ))}
    </group>
  );
}

/** Xe buýt của lớp đậu bên trái; cột biển "Lớp …" đứng cạnh đuôi xe, phía cổng chào (không che xe). */
function Bus() {
  const { p, yaw } = frameAt(BUS_T);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={yaw}>
      <group position={[BUS.x, 0, BUS.z]} rotation-y={BUS.rot}>
        <VintageBus />
      </group>
      <group position={[CLASS_SIGN.x, 0, CLASS_SIGN.z]} rotation-y={CLASS_SIGN.rot} scale={1.4}>
        <ClassSign />
      </group>
    </group>
  );
}

// ---------- Camera chạy trên đường ----------

/** Bước tích phân tối đa (giây): chia nhỏ để bạn nhỏ tăng tốc êm. */
const SUBSTEP = 1 / 60;
/** Một khung hình dài hơn thế này (máy khựng) chỉ tính bấy nhiêu: bạn nhỏ dừng chút, không nhảy cóc. */
const MAX_FRAME = 1 / 15;

function Rig({ startT }: { startT: number }) {
  const camera = useThree((s) => s.camera);
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  // Cảnh vừa dựng lại (ví dụ vừa bấm "Qua cổng"): mấy khung hình đầu rất chậm vì máy đang chuẩn bị đồ họa.
  // Chờ khung hình chạy đều rồi mới cho bạn nhỏ đi, để không khựng rồi giật.
  const warm = useRef({ good: 0, time: 0 });
  useEffect(() => {
    gl.compile(scene, camera);
  }, [gl, scene, camera]);
  const group = useRef<THREE.Group>(null);
  const t = useRef(startT);
  const v = useRef(0);
  // mở màn (hoặc quay về từ trò chơi) khi đang đứng yên: cả nhóm quay mặt ra phía lớp ngay
  useMemo(() => {
    walk.idle = useTour.getState().phase === 'moving' ? 0 : 5;
  }, []);
  const tmp = useMemo(() => ({ look: new THREE.Vector3(), d: new THREE.Vector3() }), []);
  useFrame((_, rawDt) => {
    const w0 = warm.current;
    w0.time += rawDt;
    w0.good = rawDt < 0.05 ? w0.good + 1 : 0;
    // máy chậm không bao giờ đạt 20 khung/giây thì vẫn cho đi sau 1,5 giây
    const ready = w0.good >= 5 || w0.time > 1.5;
    const dt = ready ? Math.min(rawDt, MAX_FRAME) : 0;
    const s = useTour.getState();
    const target = cameraT(s);
    // lò xo giảm chấn tới hạn (khởi động êm, dừng êm), tính theo bước nhỏ
    const w = 1.6;
    for (let rem = dt; rem > 1e-6; rem -= SUBSTEP) {
      const h = Math.min(rem, SUBSTEP);
      v.current += (w * w * (target - t.current) - 2 * w * v.current) * h;
      t.current += v.current * h;
    }
    if (ready && Math.abs(target - t.current) < 0.0015 && Math.abs(v.current) < 0.01) {
      t.current = target;
      v.current = 0;
      if (s.phase === 'moving') s.arrive();
    }
    // tốc độ bước chân theo vận tốc thật (m/s), dừng lâu thì quay lại vẫy chào
    const mps = Math.abs(v.current) * PATH.getLength();
    // bước chân nhanh dần theo vận tốc, không bật ngay lên tối đa
    walk.speed += (THREE.MathUtils.clamp(mps / 4, 0, 1) - walk.speed) * Math.min(1, dt * 6);
    walk.idle = mps < 0.3 ? walk.idle + dt : 0;
    walk.t = t.current;

    const tc = THREE.MathUtils.clamp(t.current, 0, 1);
    const p = PATH.getPointAt(tc);
    const d = tmp.d.copy(PATH.getTangentAt(tc));
    const g = group.current;
    if (g) {
      g.position.set(p.x, 0, p.z);
      g.rotation.y = Math.atan2(d.x, d.z);
    }
    camera.position.set(p.x - d.x * CAM_BACK, CAM_H, p.z - d.z * CAM_BACK);
    camera.lookAt(tmp.look.set(p.x + d.x * LOOK_FWD, LOOK_H, p.z + d.z * LOOK_FWD));
  });
  return (
    <group ref={group}>
      <Walkers />
    </group>
  );
}

export function TourScene() {
  const q = useQuality();
  // Lúc dựng lại cảnh (vừa chơi xong một cổng): camera đứng ngay tại trạm, không bay lại từ đầu.
  // Vừa qua cổng thì bắt đầu từ trước cổng, để thấy cổng mở và camera đi qua.
  const init = useMemo(() => {
    const s = useTour.getState();
    // vừa bấm "Qua cổng": nhóm đang đi tới trạm kế, xuất phát từ trước cổng vừa qua (cổng mở ra rồi mới đi qua)
    const prev = STATIONS[s.at - 1];
    const justPassed = s.phase === 'moving' && prev !== undefined && isGate(prev) && isPassed(s, prev.id);
    return { t: justPassed ? prev.t - STOP_BEFORE_GATE : cameraT(s), closedGate: justPassed ? prev.id : null };
  }, []);
  const passedAtMount = useMemo(() => useTour.getState().passed, []);
  return (
    <>
      {/* nắng sáng trong trẻo, mặt trời lên cao, sương xanh nhạt phía xa */}
      <SkyDome />
      <fog attach="fog" args={['#d6eaf5', 50, 180]} />
      <hemisphereLight args={['#e8f4ff', '#5a7a34', 1.05]} />
      <ambientLight intensity={0.3} color="#f4f9ff" />
      <directionalLight
        position={[45, 55, -20]}
        color="#ffe9b8"
        intensity={3.1}
        shadow-bias={-0.0004}
        castShadow={q.shadows}
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
        shadow-camera-far={200}
      />
      <Rig startT={init.t} />
      <Ground />
      <Road />
      <Trees />
      <Clouds />
      <Bus />
      <WelcomeArch />
      <PawPrints from={0.02} to={ARCH_T - 0.004} />
      <CandyFences />
      <Lamps />
      <FlowerBushes />
      <RoadsideAnimals />
      {STATIONS.filter(isGate).flatMap((st, i) => [
        <Balloons key={`${st.id}-l`} p={balloonAt(st.t, -1)} seed={i * 2} count={4} />,
        <Balloons key={`${st.id}-r`} p={balloonAt(st.t, 1)} seed={i * 2 + 1} count={4} />,
      ])}
      {STATIONS.filter(isGate).map((st) => (
        <Gate key={st.id} st={st} startOpen={passedAtMount.includes(st.id) && init.closedGate !== st.id} />
      ))}
      <Square />
    </>
  );
}
