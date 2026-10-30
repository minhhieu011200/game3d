import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../../../shared/3d/quality';
import { Sign3D } from '../../../shared/3d/Sign3D';
import { Ball, Box, Cone, Tube, toon } from '../../../shared/3d/toon';
import { dockById } from '../boat';
import { boatRuntime } from '../boatRuntime';
import { CABIN_FRONT, cabinPos, WHEEL, ZONES } from '../layout';
import { useZoo } from '../store';
import { TASKS } from '../tasks';
import { stepWheel, wheelRuntime } from '../wheelRuntime';
import { groundHeight, riverCenterZ, riverHeading, RIVER_HALF_WIDTH } from '../world';

/** Hàng rào cọc tròn sơn màu kẹo từ a tới b. */
export function Fence({ a, b, h = 1, color = '#ffffff', cap = '#ff8fab' }: { a: [number, number]; b: [number, number]; h?: number; color?: string; cap?: string }) {
  const posts = useMemo(() => {
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(2, Math.round(len / 0.9) + 1);
    return Array.from({ length: n }, (_, i) => {
      const t = i / (n - 1);
      const x = a[0] + (b[0] - a[0]) * t;
      const z = a[1] + (b[1] - a[1]) * t;
      return [x, groundHeight(x, z), z] as const;
    });
  }, [a, b]);
  const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
  const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const y0 = groundHeight(mid[0], mid[1]);
  return (
    <group>
      {posts.map(([x, y, z], i) => (
        <group key={i} position={[x, y, z]}>
          <Tube c={color} p={[0, h / 2, 0]} s={[0.09, h, 0.09]} />
          <Ball c={i % 2 ? cap : '#ffd23f'} p={[0, h + 0.05, 0]} s={0.13} />
        </group>
      ))}
      <Box c={color} p={[mid[0], y0 + h * 0.6, mid[1]]} r={[0, -ang, 0]} s={[len, 0.1, 0.06]} />
    </group>
  );
}

const RAINBOW = ['#ff5a5f', '#ff9f1c', '#ffd23f', '#5fd068', '#3fa7ff', '#9b6bff'];

/** Cổng vườn thú bắc ngang sông: hai tháp kẹo sọc và cầu vồng, thuyền chạy qua bên dưới. */
export function Gate() {
  const x = ZONES.gate;
  const c = riverCenterZ(x);
  const span = RIVER_HALF_WIDTH + 1.6;
  const heading = riverHeading(x);
  return (
    // xoay để trục x cục bộ nằm vắt ngang dòng sông (vuông góc với hướng chảy)
    <group position={[x, 0, c]} rotation-y={heading}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * span, groundHeight(x, c + side * span), 0]}>
          {Array.from({ length: 6 }, (_, i) => (
            <Tube key={i} c={i % 2 ? '#ffffff' : '#ff6f91'} p={[0, 0.5 + i, 0]} s={[0.75, 1, 0.75]} />
          ))}
          <Cone c="#ffd23f" p={[0, 6.8, 0]} s={[1, 1.6, 1]} />
          <Ball c="#ff5a5f" p={[0, 7.75, 0]} s={0.28} />
        </group>
      ))}
      {/* cầu vồng nhiều sắc */}
      {/* cầu vồng hơi dẹt cho thấp xuống, để mới vào là thấy trọn cổng */}
      {RAINBOW.map((col, i) => (
        <mesh key={col} position={[0, 4.6, 0]} scale={[1, 0.78, 1]} material={toon(col)}>
          <torusGeometry args={[span - 0.2 - i * 0.32, 0.17, 10, 48, Math.PI]} />
        </mesh>
      ))}
      {/* biển gỗ treo giữa cầu vồng bằng hai sợi dây, đọc được từ cả hai phía sông */}
      {/* biển hạ thấp, nằm gọn trong lòng cầu vồng (không bị vòng cầu vồng che góc) */}
      <group position={[0, 6.4, 0]}>
        {[-2.6, 2.6].map((dx) => (
          <Tube key={dx} c="#8a5a2b" p={[dx, 2.0, 0]} s={[0.05, 3.0, 0.05]} shadow={false} />
        ))}
        <Box c="#ffd23f" p={[0, 0, 0]} s={[7.4, 2.3, 0.18]} />
        <Sign3D
          text="🐘 VƯỜN THÚ VUI VẺ 🐸"
          sub="Bé học phép trừ trong phạm vi 10"
          height={2.05}
          bg="#ff8a3d"
          border="#ffffff"
          billboard={false}
          twoSided
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}
        />
        {/* hoa trang trí hai góc biển */}
        {[-3.7, 3.7].map((dx) => (
          <group key={dx} position={[dx, 1.05, 0]}>
            {Array.from({ length: 5 }, (_, i) => {
              const a = (i / 5) * Math.PI * 2;
              return <Ball key={i} c="#ff6fa8" p={[Math.cos(a) * 0.22, Math.sin(a) * 0.22, 0]} s={[0.18, 0.18, 0.08]} shadow={false} />;
            })}
            <Ball c="#ffd23f" s={[0.16, 0.16, 0.12]} shadow={false} />
          </group>
        ))}
      </group>
    </group>
  );
}

/** Mặt sàn bến gỗ (độ cao tuyệt đối), nhô ra mép nước. */
const DECK_Y = 0.1;

/** Ngôi sao 5 cánh dày 8 cm, nằm trong mặt phẳng xy. */
function starGeometry(r: number) {
  const shape = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + (i * Math.PI) / 5;
    const k = i % 2 ? r * 0.45 : r;
    if (i === 0) shape.moveTo(Math.cos(a) * k, Math.sin(a) * k);
    else shape.lineTo(Math.cos(a) * k, Math.sin(a) * k);
  }
  return new THREE.ExtrudeGeometry(shape, { depth: 0.08, bevelEnabled: false });
}

const CABIN_COLORS = ['#3fa7ff', '#ffd23f', '#5fd068', '#9b6bff', '#ff9f1c'];
const CABIN = { w: 1.05, d: 0.8, roofY: 1.42 };
const WICKER = '#b8874a';
const WICKER_DARK = '#7d5428';

/**
 * Cabin là giỏ mây treo: đáy, thành giỏ thấp (nến nhô cao hơn thành, nhìn rõ từ sông), vành giỏ màu,
 * quai cong lên chốt treo. Cabin 0 có vành đỏ và ngôi sao. Gốc ở tâm đáy.
 */
function Cabin({ index }: { index: number }) {
  const star = index === 0;
  const col = star ? '#ff4d5e' : CABIN_COLORS[(index - 1) % CABIN_COLORS.length];
  const starGeo = useMemo(() => (star ? starGeometry(0.26) : null), [star]);
  const { w, d } = CABIN;
  const wallH = 0.42;
  return (
    <group>
      <Box c={WICKER_DARK} p={[0, 0.04, 0]} s={[w, 0.08, d]} />
      {/* thành giỏ: hai lớp màu mây xen kẽ như đan */}
      <mesh position={[0, wallH / 2, 0]} scale={[w / 2, wallH, d / 2]} material={toon(WICKER)} castShadow>
        <cylinderGeometry args={[1.08, 0.92, 1, 20, 1, true]} />
      </mesh>
      {[0.12, 0.26].map((y) => (
        <mesh key={y} position={[0, y, 0]} scale={[w / 2 + 0.01, 0.035, d / 2 + 0.01]} material={toon(WICKER_DARK)}>
          <cylinderGeometry args={[1.02, 1.0, 1, 20, 1, true]} />
        </mesh>
      ))}
      {/* vành giỏ: màu mây, riêng cabin ngôi sao vành đỏ */}
      <mesh position={[0, wallH, 0]} scale={[w / 2 + 0.03, 1, d / 2 + 0.03]} rotation-x={Math.PI / 2} material={toon(star ? col : WICKER_DARK)} castShadow>
        <torusGeometry args={[1.05, 0.06, 6, 24]} />
      </mesh>
      {/* quai giỏ cong lên tới chốt treo */}
      <mesh position={[0, wallH, 0]} material={toon(WICKER_DARK)}>
        <torusGeometry args={[w / 2, 0.03, 6, 20, Math.PI]} />
      </mesh>
      <Tube c="#6b4423" p={[0, (wallH + w / 2 + WHEEL.hang) / 2, 0]} s={[0.03, WHEEL.hang - wallH - w / 2, 0.03]} />
      {starGeo && <mesh geometry={starGeo} material={toon('#ffd23f')} position={[0, wallH + 0.05, -d / 2 - 0.12]} castShadow />}
    </group>
  );
}

/** Góc của nan hoa / chốt treo thứ i trên vành (khớp với cabinPivot khi vòng ở góc 0). */
const spokeAngle = (i: number) => -Math.PI / 2 + Math.PI / WHEEL.slots + (i * Math.PI * 2) / WHEEL.slots;

/**
 * Vòng quay nến trên bến gỗ bờ nam: khung chữ A, hai vành, 10 nan, 10 cabin treo thẳng đứng.
 * Quay chậm khi rảnh; dừng ở góc "nhà" khi làm nhiệm vụ nến, khi thuyền đậu bến nến, hoặc vừa chạm nến.
 */
export function FerrisWheel() {
  const q = useQuality();
  const rim = useRef<THREE.Group>(null);
  const cabins = useRef<Array<THREE.Group | null>>([]);
  const candleLook = dockById('candles').look!;

  // ưu tiên âm: chạy trước các vật khác để nến đọc được góc mới của khung hình này
  useFrame((_, dt) => {
    const st = useZoo.getState();
    const task = TASKS[st.student.taskIndex];
    const candleTask = st.student.phase !== 'done' && task?.kind === 'candle';
    const f = boatRuntime.focus;
    const docked = boatRuntime.target === null && f !== null && f[0] === candleLook[0] && f[1] === candleLook[1];
    const touched = performance.now() / 1000 < wheelRuntime.touchedUntil;
    const next = stepWheel(wheelRuntime, Math.min(dt, 0.1), candleTask || docked || touched);
    wheelRuntime.angle = next.angle;
    wheelRuntime.speed = next.speed;
    if (rim.current) rim.current.rotation.z = next.angle;
    cabins.current.forEach((c, i) => c?.position.set(...cabinPos(i, next.angle)));
  }, -1);

  const R = WHEEL.radius;
  const legFoot = 3.1;
  const legLen = Math.hypot(legFoot, WHEEL.hubY - DECK_Y);
  const legTilt = Math.atan2(legFoot, WHEEL.hubY - DECK_Y);
  return (
    <group>
      <group position={[WHEEL.x, 0, WHEEL.z]}>
        {/* sàn gỗ từng tấm nhô ra mép nước, cọc chống xuống nước */}
        {Array.from({ length: 10 }, (_, i) => (
          <Box key={i} c={i % 2 ? '#c98a4b' : '#b87a3f'} p={[-4.05 + i * 0.9, DECK_Y - 0.06, -1.3]} s={[0.86, 0.12, 5]} />
        ))}
        {[-4.3, 4.3].flatMap((x) =>
          [-3.4, -1.3, 0.8].map((z) => <Tube key={`${x}${z}`} c="#8a5a2b" p={[x, DECK_Y - 0.8, z]} s={[0.12, 1.6, 0.12]} />),
        )}
        {/* khung chữ A trước và sau mặt vòng quay */}
        {[-1, 1].map((sz) => (
          <group key={sz} position={[0, 0, sz * 0.95]}>
            {[-1, 1].map((sx) => (
              <Tube key={sx} c="#7a4f2a" p={[(sx * legFoot) / 2, (WHEEL.hubY + DECK_Y) / 2, 0]} r={[0, 0, sx * legTilt]} s={[0.14, legLen, 0.14]} />
            ))}
            <Box c="#8a5a2b" p={[0, DECK_Y + 0.15, 0]} s={[legFoot * 2 + 0.4, 0.3, 0.4]} />
          </group>
        ))}
        {/* trục giữa */}
        <Tube c="#6b4423" p={[0, WHEEL.hubY, 0]} r={[Math.PI / 2, 0, 0]} s={[0.34, 2.1, 0.34]} />
        {/* ánh nến ấm toả ra bến (chỉ ở chất lượng cao) */}
        {q.shadows && <pointLight position={[0, WHEEL.hubY, -1.6]} color="#ffb357" intensity={18} distance={14} decay={1.6} />}
        {/* phần quay: hai vành, nan hoa, bóng đèn, chốt treo */}
        <group ref={rim} position={[0, WHEEL.hubY, 0]}>
          {[-1, 1].map((sz) => (
            <group key={sz} position={[0, 0, sz * 0.6]}>
              <mesh material={toon('#7a4f2a')} castShadow>
                <torusGeometry args={[R, 0.12, 8, 64]} />
              </mesh>
              <mesh material={toon('#9a6b3c')}>
                <torusGeometry args={[R * 0.55, 0.07, 6, 48]} />
              </mesh>
              {Array.from({ length: WHEEL.slots }, (_, i) => {
                const a = spokeAngle(i);
                return (
                  <Tube key={i} c="#a87a48" p={[(Math.cos(a) * R) / 2, (Math.sin(a) * R) / 2, 0]} r={[0, 0, a - Math.PI / 2]} s={[0.05, R, 0.05]} shadow={false} />
                );
              })}
            </group>
          ))}
          {Array.from({ length: WHEEL.slots }, (_, i) => {
            const a = spokeAngle(i);
            // chốt treo nhô ra trước mặt vòng quay tới chỗ treo cabin
            const back = 0.6;
            return (
              <Tube key={i} c="#6b4423" p={[Math.cos(a) * R, Math.sin(a) * R, (back - CABIN_FRONT) / 2]} r={[Math.PI / 2, 0, 0]} s={[0.045, back + CABIN_FRONT + 0.05, 0.045]} shadow={false} />
            );
          })}
        </group>
      </group>
      {/* cabin đặt theo toạ độ thế giới, mỗi khung hình dời theo góc quay */}
      {Array.from({ length: WHEEL.slots }, (_, i) => (
        <group key={i} ref={(g) => (cabins.current[i] = g)} position={cabinPos(i, 0)}>
          <Cabin index={i} />
        </group>
      ))}
    </group>
  );
}

/** Biển gỗ hình đám mây chỉ tên khu vực. */
export function AreaSign({ at, text }: { at: [number, number]; text: string }) {
  const y = groundHeight(at[0], at[1]);
  return (
    <group position={[at[0], y, at[1]]}>
      <Tube c="#a86b3c" p={[0, 0.9, 0]} s={[0.07, 1.8, 0.07]} />
      <Sign3D text={text} height={0.7} position={[0, 2.1, 0]} />
    </group>
  );
}
