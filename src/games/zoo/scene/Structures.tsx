import { useMemo } from 'react';
import { Sign3D } from '../../../shared/3d/Sign3D';
import { Ball, Box, Cone, Tube, toon } from '../../../shared/3d/toon';
import { ZONES } from '../layout';
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
