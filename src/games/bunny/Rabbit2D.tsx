/** Thỏ trắng vẽ bằng SVG; hai đội chỉ khác màu mũ. */
export type Pose = 'stand' | 'jump' | 'hurt';

const HAT = {
  red: ['#e8414f', '#b52b38'],
  blue: ['#2f80ed', '#1f5fbf'],
} as const;

const FUR = '#ffffff';
const SHADE = '#f1ecf2';
const LINE = '#a99ca6';
const PINK = '#ffb3c6';
const CHEEK = '#ffc2d1';
const EYE = '#3a2a35';

export function Rabbit2D({ team, pose }: { team: keyof typeof HAT; pose: Pose }) {
  const [hat, brim] = HAT[team];
  const outline = { stroke: LINE, strokeWidth: 3, strokeLinejoin: 'round' as const };
  // tai dựng lên; lúc buồn thì cụp xuống hai bên
  const earTilt = pose === 'hurt' ? 62 : pose === 'jump' ? 6 : 12;
  return (
    <svg viewBox="0 0 120 180" className={`rabbit2d pose-${pose}`} role="img" aria-label={`Thỏ ${team === 'red' ? 'Đội Đỏ' : 'Đội Xanh'}`}>
      {/* tai */}
      {[-1, 1].map((side) => (
        <g key={side} transform={`rotate(${side * earTilt} ${60 + side * 14} 66)`}>
          <ellipse cx={60 + side * 15} cy={34} rx={11} ry={30} fill={FUR} {...outline} />
          <ellipse cx={60 + side * 15} cy={38} rx={5} ry={21} fill={PINK} />
        </g>
      ))}

      {/* thân và bụng */}
      <ellipse cx={60} cy={136} rx={31} ry={33} fill={FUR} {...outline} />
      <ellipse cx={60} cy={143} rx={18} ry={20} fill={SHADE} />

      {/* chân: nhảy thì duỗi xuống, dạng ra */}
      {pose === 'jump' ? (
        <>
          <ellipse cx={42} cy={171} rx={8} ry={10} transform="rotate(28 42 171)" fill={FUR} {...outline} />
          <ellipse cx={78} cy={171} rx={8} ry={10} transform="rotate(-28 78 171)" fill={FUR} {...outline} />
        </>
      ) : (
        <>
          <ellipse cx={45} cy={170} rx={13} ry={7} fill={FUR} {...outline} />
          <ellipse cx={75} cy={170} rx={13} ry={7} fill={FUR} {...outline} />
        </>
      )}

      {/* tay: nhảy thì giơ lên */}
      {pose === 'jump' ? (
        <>
          <ellipse cx={28} cy={114} rx={8} ry={14} transform="rotate(-40 28 114)" fill={FUR} {...outline} />
          <ellipse cx={92} cy={114} rx={8} ry={14} transform="rotate(40 92 114)" fill={FUR} {...outline} />
        </>
      ) : (
        <>
          <ellipse cx={34} cy={132} rx={8} ry={13} transform="rotate(18 34 132)" fill={FUR} {...outline} />
          <ellipse cx={86} cy={132} rx={8} ry={13} transform="rotate(-18 86 132)" fill={FUR} {...outline} />
        </>
      )}

      {/* đầu */}
      <circle cx={60} cy={88} r={34} fill={FUR} {...outline} />

      {/* mắt */}
      {pose === 'jump' ? (
        <g fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round">
          <path d="M42 95 Q48 87 54 95" />
          <path d="M66 95 Q72 87 78 95" />
        </g>
      ) : pose === 'hurt' ? (
        <g fill="none" stroke={EYE} strokeWidth={3.5} strokeLinecap="round">
          <path d="M42 92 Q48 97 54 93" />
          <path d="M66 93 Q72 97 78 92" />
        </g>
      ) : (
        <g>
          <ellipse cx={48} cy={93} rx={5} ry={6.5} fill={EYE} />
          <ellipse cx={72} cy={93} rx={5} ry={6.5} fill={EYE} />
          <circle cx={49.8} cy={90.5} r={1.8} fill="#fff" />
          <circle cx={73.8} cy={90.5} r={1.8} fill="#fff" />
        </g>
      )}
      {pose === 'hurt' && <path d="M80 99 Q77 106 80 108 Q83 106 80 99 Z" fill="#7cc7ff" />}

      {/* má, mũi, miệng */}
      <ellipse cx={39} cy={104} rx={7} ry={4.5} fill={CHEEK} />
      <ellipse cx={81} cy={104} rx={7} ry={4.5} fill={CHEEK} />
      <path d="M56 101 Q60 98 64 101 Q60 106 56 101 Z" fill="#ff8fab" />
      {pose === 'jump' ? (
        <path d="M53 107 Q60 117 67 107 Z" fill="#e0607e" stroke={EYE} strokeWidth={2} strokeLinejoin="round" />
      ) : pose === 'hurt' ? (
        <path d="M53 112 Q60 106 67 112" fill="none" stroke={EYE} strokeWidth={2.5} strokeLinecap="round" />
      ) : (
        <path d="M54 106 Q57 110 60 106 Q63 110 66 106" fill="none" stroke={EYE} strokeWidth={2.5} strokeLinecap="round" />
      )}

      {/* mũ lưỡi trai màu đội: tai chui qua mũ */}
      <path d="M27 76 C27 45 93 45 93 76 Z" fill={hat} stroke={brim} strokeWidth={2.5} strokeLinejoin="round" />
      <path d="M40 58 C46 52 54 50 60 50" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth={4} strokeLinecap="round" />
      <path d="M22 76 Q60 90 98 76 Q60 82 22 76 Z" fill={brim} stroke={brim} strokeWidth={2.5} strokeLinejoin="round" />
      <circle cx={60} cy={49} r={4.5} fill={brim} />
    </svg>
  );
}
