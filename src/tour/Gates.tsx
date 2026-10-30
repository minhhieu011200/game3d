// Bốn cổng tham quan kiểu cổng vòm lớn: vòm đá, cột có đai màu, vòng hoa, biển gỗ, cánh cổng gỗ,
// hai cánh tường có vòm nhỏ và tấm bảng. Mỗi cổng có màu và đồ trang trí riêng theo chủ đề.
// Trục cục bộ: x ngang đường, +z hướng về phía người đi tới.
import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Sign3D } from '../shared/3d/Sign3D';
import { Ball, Capsule, Cone, CuteEye, Tube, toon } from '../shared/3d/toon';
import { gateNumber, isPassed, STATIONS, type GateId, type Station } from './logic';
import { PATH } from './path';
import { useTour } from './store';
import { ironMaterial, solid, stoneMaterial } from './textures';
import { walk } from './Walkers';
import { Butterfly } from '../shared/3d/Butterfly';
import { GATE, GATE_DECOR } from './layout';
import { GateConsole, HoloPortal, SecurityCamera, WallScreen } from './GateTech';
import { Candle, Frog, Stork } from '../games/zoo/objects/Models';

type V3 = [number, number, number];

interface DecorCtx {
  passed: boolean;
  /** Độ mở cánh cổng 0 … 1 (đọc trong useFrame). */
  open: { current: number };
}

interface Theme {
  band: string;
  door: string;
  flowers: string[];
  /** Dòng phụ thêm sau "Cổng N · Bài M" trên biển. */
  note?: string;
  decor: (ctx: DecorCtx) => ReactNode;
}

// ---------- Hình vòm ----------

/** Khung vòm (tường có lỗ vòm), đáy ở y = 0, dày `depth`, mặt trước ở z = depth / 2. */
function archGeometry(outer: number, hole: number, spring: number, depth: number) {
  const s = new THREE.Shape();
  s.moveTo(-outer, 0);
  s.lineTo(-hole, 0);
  s.lineTo(-hole, spring);
  s.absarc(0, spring, hole, Math.PI, 0, true);
  s.lineTo(hole, 0);
  s.lineTo(outer, 0);
  s.lineTo(outer, spring);
  s.absarc(0, spring, outer, 0, Math.PI, false);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04, bevelSegments: 2, curveSegments: 32 });
  g.translate(0, 0, -depth / 2);
  return g;
}

function Arch({ outer, hole, spring, depth, p = [0, 0, 0] }: { outer: number; hole: number; spring: number; depth: number; p?: V3 }) {
  const geo = useMemo(() => archGeometry(outer, hole, spring, depth), [outer, hole, spring, depth]);
  return <mesh geometry={geo} position={p} material={stoneMaterial()} castShadow receiveShadow />;
}

/** Cột tròn có chân, mũ, ba đai màu và quả cầu trên đỉnh. */
function Column({ x, h, r, band, z = 0 }: { x: number; h: number; r: number; band: string; z?: number }) {
  const STONE = '#ddd1ba';
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.25, 0]} material={solid(STONE, 0.85)} castShadow>
        <boxGeometry args={[r * 2.4, 0.5, r * 2.4]} />
      </mesh>
      <mesh position={[0, 0.5 + h / 2, 0]} material={solid(STONE, 0.85)} castShadow receiveShadow>
        <cylinderGeometry args={[r, r * 1.05, h, 20]} />
      </mesh>
      {[0.22, 0.55, 0.88].map((k) => (
        <mesh key={k} position={[0, 0.5 + h * k, 0]} material={solid(band, 0.5)}>
          <cylinderGeometry args={[r * 1.06, r * 1.06, 0.2, 20]} />
        </mesh>
      ))}
      <mesh position={[0, 0.5 + h + 0.15, 0]} material={solid(STONE, 0.85)} castShadow>
        <boxGeometry args={[r * 2.5, 0.3, r * 2.5]} />
      </mesh>
      <mesh position={[0, 0.5 + h + 0.55, 0]} material={solid(band, 0.4)} castShadow>
        <sphereGeometry args={[r * 0.75, 18, 12]} />
      </mesh>
    </group>
  );
}

/** Vòng hoa lá chạy theo đường vòm. */
function Garland({ radius, spring, flowers, z }: { radius: number; spring: number; flowers: string[]; z: number }) {
  const items = useMemo(() => {
    const n = 34;
    return Array.from({ length: n + 1 }, (_, i) => {
      const a = (Math.PI * i) / n;
      return { p: [Math.cos(a) * radius, spring + Math.sin(a) * radius, z] as V3, flower: i % 2 === 0, c: flowers[i % flowers.length] };
    });
  }, [radius, spring, flowers, z]);
  return (
    <>
      {items.map((it, i) => (
        <mesh key={i} position={it.p} material={solid(it.flower ? it.c : i % 4 === 1 ? '#3f7f34' : '#56993f', 0.8)} scale={it.flower ? 0.15 : 0.2}>
          <icosahedronGeometry args={[1, 1]} />
        </mesh>
      ))}
    </>
  );
}

/** Lưới gỗ đan chéo (cửa nhỏ ở cánh tường). */
function Lattice({ w, h, color, p }: { w: number; h: number; color: string; p: V3 }) {
  const bars = useMemo(() => {
    const out: { x: number; y: number; len: number; a: number }[] = [];
    const step = 0.42;
    for (let k = -h; k < w + h; k += step) {
      // hai chiều chéo, cắt trong khung w × h
      for (const dir of [1, -1]) {
        const x0 = dir > 0 ? k : w - k;
        const pts: [number, number][] = [];
        for (let t = 0; t <= 1; t += 0.02) {
          const x = x0 + dir * t * h;
          const y = t * h;
          if (x >= 0 && x <= w) pts.push([x, y]);
        }
        if (pts.length < 2) continue;
        const [a, b] = [pts[0], pts[pts.length - 1]];
        out.push({ x: (a[0] + b[0]) / 2 - w / 2, y: (a[1] + b[1]) / 2, len: Math.hypot(b[0] - a[0], b[1] - a[1]), a: Math.atan2(b[1] - a[1], b[0] - a[0]) });
      }
    }
    return out;
  }, [w, h]);
  return (
    <group position={p}>
      {bars.map((b, i) => (
        <mesh key={i} position={[b.x, b.y, 0]} rotation-z={b.a} material={solid(color, 0.8)}>
          <boxGeometry args={[b.len, 0.05, 0.05]} />
        </mesh>
      ))}
      <mesh position={[0, h / 2, -0.04]} material={solid('#2d3b26', 0.95)}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  );
}

/** Một cánh cổng gỗ khung chấn song, bản lề ở mép vòm. */
function Door({ side, open, color, w, h }: { side: 1 | -1; open: { current: number }; color: string; w: number; h: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(() => {
    // cánh mở vào trong (xa người đi tới)
    if (ref.current) ref.current.rotation.y = side * open.current * 1.75;
  });
  const m = solid(color, 0.75);
  const cx = -side * (w / 2);
  return (
    <group ref={ref} position={[side * w, 0, 0]}>
      {/* khung */}
      {[0.12, h - 0.1, h * 0.45].map((y) => (
        <mesh key={y} position={[cx, y, 0]} material={m} castShadow>
          <boxGeometry args={[w, 0.16, 0.12]} />
        </mesh>
      ))}
      {[0.06, w - 0.06].map((dx) => (
        <mesh key={dx} position={[side * -dx, h / 2, 0]} material={m} castShadow>
          <boxGeometry args={[0.14, h, 0.12]} />
        </mesh>
      ))}
      {/* chấn song */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[side * -(0.2 + (i * (w - 0.4)) / 5), h / 2, 0]} material={m}>
          <boxGeometry args={[0.06, h - 0.2, 0.06]} />
        </mesh>
      ))}
      <mesh position={[cx, h * 0.72, 0.03]} material={solid('#d4a645', 0.35, 0.7)}>
        <torusGeometry args={[0.28, 0.03, 8, 24]} />
      </mesh>
    </group>
  );
}

/** Đèn tròn trên vòm (Cổng 1: sáng khi đã soát vé xong). */
function ArchLights({ radius, spring, lit, z }: { radius: number; spring: number; lit: boolean; z: number }) {
  return (
    <>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (Math.PI * (i + 0.5)) / 8;
        return (
          <mesh key={i} position={[Math.cos(a) * radius, spring + Math.sin(a) * radius, z]} material={toon(lit ? '#ffe14d' : '#8c8c8c', { emissive: lit ? '#ffb800' : undefined })}>
            <sphereGeometry args={[0.13, 12, 8]} />
          </mesh>
        );
      })}
    </>
  );
}

// ---------- Trang trí theo chủ đề ----------

function FlowerPot({ p, c }: { p: V3; c: string }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.3, 0]} material={solid('#b9653a', 0.8)} castShadow>
        <cylinderGeometry args={[0.38, 0.28, 0.6, 16]} />
      </mesh>
      <Ball p={[0, 0.85, 0]} s={[0.5, 0.4, 0.5]} c="#4f8a34" />
      {[0, 1, 2, 3, 4].map((i) => (
        <Ball key={i} p={[Math.cos(i * 1.26) * 0.3, 1.05 + (i % 2) * 0.1, Math.sin(i * 1.26) * 0.3]} s={0.11} c={c} shadow={false} />
      ))}
    </group>
  );
}

function FlowerBed({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {Array.from({ length: 9 }, (_, i) => {
        const fx = (i % 3) * 0.7 - 0.7;
        const fz = Math.floor(i / 3) * 0.6 - 0.6;
        return (
          <group key={i} position={[fx, 0, fz]}>
            <Tube p={[0, 0.4, 0]} s={[0.04, 0.8, 0.04]} c="#3d9a3a" shadow={false} />
            {Array.from({ length: 6 }, (_, k) => (
              <Ball key={k} p={[Math.cos((k * Math.PI) / 3) * 0.17, 0.85, Math.sin((k * Math.PI) / 3) * 0.17]} s={0.12} c="#ffd54a" shadow={false} />
            ))}
            <Ball p={[0, 0.87, 0]} s={0.1} c="#f39c12" shadow={false} />
          </group>
        );
      })}
    </group>
  );
}

function CarrotPatch({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.06, 0]} material={solid('#6b4a2f', 1)} receiveShadow>
        <boxGeometry args={[2.6, 0.12, 1.4]} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <group key={i} position={[(i % 4) * 0.6 - 0.9, 0.1, Math.floor(i / 4) * 0.6 - 0.3]}>
          <Cone p={[0, 0.2, 0]} s={[0.13, 0.4, 0.13]} r={[Math.PI, 0, 0]} c="#ff7f2a" />
          <Cone p={[0, 0.55, 0]} s={[0.1, 0.32, 0.1]} c="#3d9a3a" shadow={false} />
        </group>
      ))}
      {[-0.75, 0.75].map((z) => (
        <mesh key={z} position={[0, 0.35, z]} material={solid('#c9955c', 0.8)}>
          <boxGeometry args={[2.8, 0.1, 0.06]} />
        </mesh>
      ))}
    </group>
  );
}

function BunnyStatue({ p }: { p: V3 }) {
  return (
    <group position={p} rotation-y={-0.4}>
      <mesh position={[0, 0.25, 0]} material={solid('#ddd1ba', 0.85)} castShadow>
        <cylinderGeometry args={[0.6, 0.7, 0.5, 18]} />
      </mesh>
      <group position={[0, 0.5, 0]}>
        <Ball p={[0, 0.55, 0]} s={[0.5, 0.55, 0.45]} c="#ffffff" />
        <Ball p={[0, 1.25, 0.1]} s={0.38} c="#ffffff" />
        <Capsule p={[-0.14, 1.85, 0.05]} s={[0.08, 0.32, 0.06]} r={[0, 0, 0.15]} c="#ffffff" />
        <Capsule p={[0.14, 1.85, 0.05]} s={[0.08, 0.32, 0.06]} r={[0, 0, -0.15]} c="#ffffff" />
        <Ball p={[-0.14, 1.85, 0.1]} s={[0.04, 0.22, 0.02]} r={[0, 0, 0.15]} c="#ffb3c6" shadow={false} />
        <Ball p={[0.14, 1.85, 0.1]} s={[0.04, 0.22, 0.02]} r={[0, 0, -0.15]} c="#ffb3c6" shadow={false} />
        <CuteEye p={[-0.13, 1.32, 0.42]} size={0.07} />
        <CuteEye p={[0.13, 1.32, 0.42]} size={0.07} />
        <Cone p={[0.42, 0.75, 0.25]} s={[0.1, 0.4, 0.1]} r={[0, 0, 2.2]} c="#ff7f2a" />
      </group>
    </group>
  );
}

function Pond({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh rotation-x={-Math.PI / 2} position-y={0.04} material={solid('#4aa3d8', 0.15, 0.1)}>
        <circleGeometry args={[1.7, 32]} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.035} material={solid('#bfae8e', 0.9)}>
        <ringGeometry args={[1.65, 1.95, 32]} />
      </mesh>
      {[
        [-0.6, 0.3],
        [0.5, -0.4],
        [0.2, 0.7],
      ].map(([x, z], i) => (
        <group key={i} position={[x, 0.05, z]}>
          <Ball p={[0, 0, 0]} s={[0.42, 0.03, 0.42]} c="#3d9a3a" shadow={false} />
          <Ball p={[0, 0.17, 0]} s={[0.22, 0.15, 0.2]} c="#5fd35f" />
          <CuteEye p={[-0.08, 0.3, 0.12]} size={0.05} />
          <CuteEye p={[0.08, 0.3, 0.12]} size={0.05} />
        </group>
      ))}
    </group>
  );
}

function MiniWheel({ p }: { p: V3 }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.z += dt * 0.4;
  });
  return (
    <group position={p}>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.5, 1.4, 0]} rotation-z={-s * 0.3} material={solid('#e05a3a', 0.6)} castShadow>
          <boxGeometry args={[0.15, 2.9, 0.15]} />
        </mesh>
      ))}
      <group ref={ref} position={[0, 2.7, 0.15]}>
        <mesh material={solid('#3498db', 0.5)}>
          <torusGeometry args={[1.5, 0.08, 8, 32]} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <group key={i}>
              <mesh position={[Math.cos(a) * 0.75, Math.sin(a) * 0.75, 0]} rotation-z={a} material={solid('#ffffff', 0.6)}>
                <boxGeometry args={[1.5, 0.05, 0.05]} />
              </mesh>
              <Ball p={[Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0.1]} s={0.2} c={i === 0 ? '#e74c3c' : '#ffe14d'} shadow={false} />
            </group>
          );
        })}
      </group>
    </group>
  );
}

/** Màn hologram, bục điều khiển và hai màn hình — cổng nào cũng có, nội dung theo trò chơi của cổng. */
function Tech({ kind, passed, open }: DecorCtx & { kind: GateId }) {
  return (
    <>
      <HoloPortal kind={kind} hole={HOLE} spring={SPRING} z={DEPTH / 2 - 0.08} passed={passed} open={open} />
      <GateConsole kind={kind} p={[GATE.console.x, 0, GATE.console.z]} rot={GATE.console.rot} />
      <WallScreen kind={kind} which="guide" p={[-5.55, 1.5, 0.28]} />
      <WallScreen kind={kind} which="status" p={[5.55, 1.5, 0.28]} />
    </>
  );
}

/** Hàng 6 bông hoa như hình SGK Bài 1: 4 bông vàng, 2 bông đỏ có bướm đậu. */
function SixFlowers({ p }: { p: V3 }) {
  return (
    <group position={p}>
      <mesh position={[0, 0.15, 0]} material={solid('#8a5a2b', 0.9)} receiveShadow>
        <boxGeometry args={[3.3, 0.3, 0.7]} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => {
        const red = i >= 4;
        const x = -1.35 + i * 0.54;
        return (
          <group key={i} position={[x, 0.3, 0]}>
            <Tube p={[0, 0.3, 0]} s={[0.035, 0.6, 0.035]} c="#3d9a3a" shadow={false} />
            {Array.from({ length: 8 }, (_, k) => (
              <Ball key={k} p={[Math.cos((k * Math.PI) / 4) * 0.15, 0.68 + Math.sin((k * Math.PI) / 4) * 0.15, 0.02]} s={[0.1, 0.1, 0.04]} c={red ? '#ff6b5a' : '#ffd84a'} shadow={false} />
            ))}
            <Ball p={[0, 0.68, 0.05]} s={[0.08, 0.08, 0.04]} c={red ? '#ffb07a' : '#f7a823'} shadow={false} />
            {red && <Butterfly anchor={[0, 0.86, 0.03]} perch heading={0.5 - i * 0.6} color="#9b6bff" seed={i} scale={0.75} />}
          </group>
        );
      })}
    </group>
  );
}

const xz = ([x, z]: [number, number]): V3 => [x, 0, z];

const THEMES: Record<GateId, Theme> = {
  ticket: {
    band: '#2e9e57',
    door: '#7a4e2a',
    flowers: ['#ff8fb1', '#ffffff', '#c39bff', '#ffd23f'],
    note: 'Yêu cầu: Giơ đúng số ngón tay',
    // trạm soát vé công nghệ (Bài 3: giơ ngón tay trước camera), camera an ninh
    decor: (ctx) => (
      <>
        <Tech kind="ticket" {...ctx} />
        <SecurityCamera p={[-5.55, 3.6, 0.1]} side={-1} />
        <SecurityCamera p={[5.55, 3.6, 0.1]} side={1} />
        <FlowerPot p={xz(GATE_DECOR.ticket.pot)} c="#ff8fb1" />
      </>
    ),
  },
  flower: {
    band: '#f5b700',
    door: '#f2ece0',
    flowers: ['#ffd54a', '#ff8fb1', '#ffffff', '#ffb347'],
    note: '6 − ? = ?',
    // Bài 1: 6 bông hoa, bướm đậu làm bông hoa đỏ (bớt đi), chọn đá số
    decor: (ctx) => (
      <>
        <Tech kind="flower" {...ctx} />
        <SixFlowers p={xz(GATE_DECOR.flower.sixFlowers)} />
        <FlowerBed p={xz(GATE_DECOR.flower.bed)} />
        <Butterfly anchor={[-4.4, 0, 2.2]} range={1.8} height={[1.4, 3.4]} color="#9b6bff" seed={1} scale={1.5} />
        <Butterfly anchor={[4.4, 0, 2.2]} range={1.8} height={[1.4, 3.4]} color="#ff7ab6" seed={2} scale={1.5} />
        <Butterfly anchor={[0, 0, 2.6]} range={2.4} height={[4.2, 5.6]} color="#3fa7ff" seed={3} scale={1.5} />
      </>
    ),
  },
  bunny: {
    band: '#ff7f2a',
    door: '#b07a45',
    flowers: ['#ff7f2a', '#ffffff', '#ffd23f', '#5fd068'],
    note: 'Tìm phép trừ bằng 4',
    // Bài 2: thỏ nhảy trên ô bàn chân, bấm Đúng / Sai, về vườn cà rốt
    decor: (ctx) => (
      <>
        <Tech kind="bunny" {...ctx} />
        <CarrotPatch p={xz(GATE_DECOR.bunny.carrots)} />
        <BunnyStatue p={xz(GATE_DECOR.bunny.statue)} />
        <CarrotPatch p={xz(GATE_DECOR.bunny.carrots2)} />
      </>
    ),
  },
  pond: {
    band: '#3498db',
    door: '#2f6f9f',
    flowers: ['#7fc8ff', '#ffffff', '#c39bff', '#5fd068'],
    note: 'Ếch · Cò · Nến',
    // Bài 4: ếch xuống sông, cò bay lên trời, thổi tắt nến trên vòng quay
    decor: (ctx) => (
      <>
        <Tech kind="pond" {...ctx} />
        <Pond p={xz(GATE_DECOR.pond.pond)} />
        <group position={xz(GATE_DECOR.pond.frog)} scale={1.8}>
          <Frog seed={3} />
        </group>
        <group position={xz(GATE_DECOR.pond.stork)} scale={1.7} rotation-y={0.6}>
          <Stork flying={false} seed={2} />
        </group>
        <group position={xz(GATE_DECOR.pond.candle)}>
          <mesh position={[0, 0.35, 0]} material={solid('#ddd1ba', 0.85)} castShadow>
            <cylinderGeometry args={[0.35, 0.4, 0.7, 16]} />
          </mesh>
          <group position={[0, 0.7, 0]} scale={2.2}>
            <Candle lit seed={1} />
          </group>
        </group>
        <MiniWheel p={xz(GATE_DECOR.pond.wheel)} />
      </>
    ),
  },
};

// ---------- Cổng vòm lớn ----------

const HOLE = 1.9; // nửa bề rộng lối vào
const SPRING = 3.1; // độ cao chân vòm
const OUTER = 2.7;
const DEPTH = 0.9;

function frameAt(t: number) {
  const p = PATH.getPointAt(t);
  const d = PATH.getTangentAt(t);
  return { p, yaw: Math.atan2(-d.x, -d.z) };
}

/** Cánh tường hai bên: vòm nhỏ có cửa lưới gỗ (màn hình đặt phía trước), cột nhỏ ở đầu. */
function Wing({ side, theme }: { side: 1 | -1; theme: Theme }) {
  const cx = side * 5.55;
  return (
    <group>
      <Arch outer={1.75} hole={1.05} spring={1.9} depth={0.6} p={[cx, 0, -0.1]} />
      <Lattice w={2.1} h={2.85} color={theme.door} p={[cx, 0, -0.1]} />
      <Column x={side * 7.6} h={2.9} r={0.3} band={theme.band} z={-0.1} />
    </group>
  );
}

export function Gate({ st, startOpen }: { st: Station & { id: GateId }; startOpen: boolean }) {
  const passed = useTour((s) => isPassed(s, st.id));
  const open = useRef(startOpen ? 1 : 0);
  useFrame((_, dt) => {
    // cổng chưa qua vẫn mở tạm khi nhóm cô trò đi ngang (nhảy bằng bản đồ), đi qua rồi thì đóng lại
    // chỉ mở tạm khi đi xuyên qua cổng tới trạm khác; đi tới đứng trước chính cổng này thì cổng vẫn đóng
    const s = useTour.getState();
    const crossing = s.phase === 'moving' && STATIONS[s.at].id !== st.id && Math.abs(walk.t - st.t) < 0.05;
    const target = passed || crossing ? 1 : 0;
    const rate = crossing ? 2.5 : 0.8;
    open.current += THREE.MathUtils.clamp(target - open.current, -dt * rate, dt * rate);
  });
  const theme = THEMES[st.id];
  const { p, yaw } = frameAt(st.t);
  return (
    <group position={[p.x, 0, p.z]} rotation-y={yaw}>
      <Arch outer={OUTER} hole={HOLE} spring={SPRING} depth={DEPTH} />
      {/* viên đá khóa đỉnh vòm */}
      <mesh position={[0, SPRING + OUTER - 0.25, DEPTH / 2 + 0.05]} material={solid(theme.band, 0.5)} castShadow>
        <boxGeometry args={[0.6, 0.75, 0.3]} />
      </mesh>
      <Column x={-3.25} h={4.6} r={0.42} band={theme.band} />
      <Column x={3.25} h={4.6} r={0.42} band={theme.band} />
      <Garland radius={OUTER + 0.08} spring={SPRING} flowers={theme.flowers} z={DEPTH / 2 + 0.12} />
      {st.id === 'ticket' && <ArchLights radius={(OUTER + HOLE) / 2} spring={SPRING} lit={passed} z={DEPTH / 2 + 0.08} />}
      <Door side={-1} open={open} color={theme.door} w={HOLE} h={SPRING} />
      <Door side={1} open={open} color={theme.door} w={HOLE} h={SPRING} />
      {/* biển gỗ trên đỉnh, đỡ bằng hai thanh sắt */}
      {[-1.6, 1.6].map((x) => (
        <mesh key={x} position={[x, SPRING + OUTER + 0.3, 0]} material={ironMaterial()}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 6]} />
        </mesh>
      ))}
      <Sign3D
        text={`${st.emoji} ${st.title}`}
        sub={`Cổng ${gateNumber(st.id)} · Bài ${st.lesson}${theme.note ? ` · ${theme.note}` : ''}`}
        height={1.15}
        wood
        border="#3b2210"
        color="#fff3d6"
        subColor="#ffe08a"
        billboard={false}
        position={[0, SPRING + OUTER + 0.95, 0.2]}
      />
      <Wing side={-1} theme={theme} />
      <Wing side={1} theme={theme} />
      {theme.decor({ passed, open })}
    </group>
  );
}
