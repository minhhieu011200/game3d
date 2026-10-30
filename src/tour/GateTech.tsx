// Đồ "công nghệ" của các cổng tham quan, mỗi cổng theo đúng trò chơi của nó:
// màn hologram trong lòng vòm, bục điều khiển, màn hình hướng dẫn / nhiệm vụ trên cánh tường, camera an ninh.
// Chữ và hình vẽ bằng canvas (chạy offline).
import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GateId } from './logic';
import { solid } from './textures';

type V3 = [number, number, number];
const FONT = '"Baloo 2", "Segoe UI Emoji", sans-serif';

/** Vẽ lại khi phông chữ đã tải xong (giống Sign3D). */
function useFontsReady() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void document.fonts?.ready.then(() => alive && setReady(true));
    return () => {
      alive = false;
    };
  }, []);
  return ready;
}

function makeTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d')!);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

function useCanvasTexture(w: number, h: number, draw: (g: CanvasRenderingContext2D) => void, deps: unknown[]) {
  const fonts = useFontsReady();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const tex = useMemo(() => makeTexture(w, h, draw), [...deps, fonts]);
  useEffect(() => () => tex.dispose(), [tex]);
  return tex;
}

function glowText(g: CanvasRenderingContext2D, text: string, x: number, y: number, px: number, color: string, weight = 800) {
  g.font = `${weight} ${px}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.shadowColor = color;
  g.shadowBlur = px * 0.5;
  g.fillStyle = color;
  g.fillText(text, x, y);
  g.shadowBlur = 0;
}

function emoji(g: CanvasRenderingContext2D, e: string, x: number, y: number, px: number) {
  g.font = `${px}px "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(e, x, y);
}

/** Bông hoa 8 cánh như trong SGK. */
function drawFlower(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, red: boolean) {
  g.save();
  g.translate(cx, cy);
  g.fillStyle = red ? '#ff6b5a' : '#ffd84a';
  g.strokeStyle = red ? '#b33a2c' : '#c99410';
  g.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    g.beginPath();
    g.ellipse(Math.cos((i * Math.PI) / 4) * r * 0.55, Math.sin((i * Math.PI) / 4) * r * 0.55, r * 0.32, r * 0.42, (i * Math.PI) / 4 + Math.PI / 2, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  g.fillStyle = red ? '#ffb07a' : '#f7a823';
  g.beginPath();
  g.arc(0, 0, r * 0.35, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.restore();
}

/** Dấu bàn chân thỏ (ô trong Bài 2) có ghi phép tính. */
function drawPaw(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, text: string, color: string) {
  g.save();
  g.fillStyle = 'rgba(255,240,215,0.95)';
  g.strokeStyle = color;
  g.lineWidth = 5;
  g.beginPath();
  g.ellipse(cx, cy, r, r * 0.8, 0, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  for (const dx of [-0.6, 0, 0.6]) {
    g.beginPath();
    g.arc(cx + dx * r, cy - r * 1.05 + Math.abs(dx) * r * 0.25, r * 0.24, 0, Math.PI * 2);
    g.fill();
    g.stroke();
  }
  g.fillStyle = '#23324a';
  g.font = `800 ${r * 0.62}px ${FONT}`;
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(text, cx, cy + r * 0.05);
  g.restore();
}

// ---------- Màn hologram trong lòng vòm ----------

interface PortalStyle {
  /** Màu chữ, khung. */
  accent: string;
  /** Nền trên / giữa (rgba). */
  bg: [string, string];
  title: string;
  line: string;
  draw: (g: CanvasRenderingContext2D, accent: string) => void;
}

const PORTALS: Record<GateId, PortalStyle> = {
  ticket: {
    accent: '#5ff4ff',
    bg: ['rgba(40,170,240,0.85)', 'rgba(15,100,190,0.6)'],
    title: 'GIƠ NGÓN TAY',
    line: 'ĐỂ SOÁT VÉ',
    draw: (g) => {
      emoji(g, '🖐️', 256, 440, 150);
      glowText(g, '9 − ? = ?', 256, 590, 64, '#ffffff');
      glowText(g, 'Giữ yên tay nhé!', 256, 670, 34, '#ffffff', 700);
    },
  },
  flower: {
    accent: '#fff3a0',
    bg: ['rgba(240,160,40,0.85)', 'rgba(200,90,120,0.6)'],
    title: 'VƯỜN HOA',
    line: '6 − ? = ?',
    draw: (g) => {
      // 6 bông hoa, 2 bông đỏ có bướm đậu (giống hình SGK)
      [0, 1, 2, 3, 4, 5].forEach((i) => {
        const x = 150 + (i % 3) * 106;
        const y = 410 + Math.floor(i / 3) * 120;
        drawFlower(g, x, y, 46, i >= 4);
        if (i >= 4) emoji(g, '🦋', x + 10, y - 40, 44);
      });
      glowText(g, 'Còn lại mấy bông vàng?', 256, 660, 34, '#ffffff', 700);
    },
  },
  bunny: {
    accent: '#ffe0b0',
    bg: ['rgba(240,120,30,0.85)', 'rgba(170,80,20,0.6)'],
    title: 'THỎ NHẢY',
    line: 'BẰNG 4?',
    draw: (g, a) => {
      drawPaw(g, 160, 560, 62, '7 − 3', a);
      drawPaw(g, 352, 470, 62, '9 − 5', a);
      emoji(g, '🐰', 130, 420, 80);
      emoji(g, '🥕', 400, 610, 70);
      glowText(g, 'Đúng hay Sai?', 256, 680, 36, '#ffffff', 700);
    },
  },
  pond: {
    accent: '#c8f2ff',
    bg: ['rgba(40,140,230,0.85)', 'rgba(20,90,160,0.6)'],
    title: 'ĐẾM VÀ TÍNH',
    line: 'TÌM PHÉP TRỪ',
    draw: (g) => {
      [
        ['🐸', '10 − 2'],
        ['🕊️', '10 − 5'],
        ['🕯️', '10 − 3'],
      ].forEach(([e, eq], i) => {
        const y = 400 + i * 95;
        emoji(g, e, 150, y, 66);
        glowText(g, `${eq} = ?`, 320, y, 50, '#ffffff');
      });
    },
  },
};

function portalDraw(kind: GateId, done: boolean) {
  const st = PORTALS[kind];
  return (g: CanvasRenderingContext2D) => {
    const accent = done ? '#7dffa8' : st.accent;
    const grad = g.createLinearGradient(0, 0, 0, 768);
    const [top, mid] = done ? ['rgba(40,200,100,0.85)', 'rgba(20,130,70,0.6)'] : st.bg;
    grad.addColorStop(0, top);
    grad.addColorStop(0.5, mid);
    grad.addColorStop(1, top);
    g.fillStyle = grad;
    g.fillRect(0, 0, 512, 768);
    g.fillStyle = 'rgba(255,255,255,0.07)';
    for (let y = 0; y < 768; y += 6) g.fillRect(0, y, 512, 2);
    g.strokeStyle = accent;
    g.lineWidth = 6;
    for (const [x, y, dx, dy] of [
      [60, 345, 1, 1],
      [452, 345, -1, 1],
      [60, 720, 1, -1],
      [452, 720, -1, -1],
    ]) {
      g.beginPath();
      g.moveTo(x, y + dy * 50);
      g.lineTo(x, y);
      g.lineTo(x + dx * 50, y);
      g.stroke();
    }
    if (done) {
      glowText(g, '✓', 256, 500, 220, '#ffffff');
    } else {
      st.draw(g, accent);
    }
    // hai dòng chữ đều ở nửa trên: nửa dưới thường bị nhóm cô trò che
    glowText(g, done ? 'HOÀN THÀNH!' : st.title, 256, 215, 64, '#ffffff');
    glowText(g, done ? 'MỜI QUA CỔNG' : st.line, 256, 285, 52, accent);
  };
}

/** Màn hologram lấp lòng vòm (rộng 2·hole, chân vòm ở `spring`), mờ dần khi cổng mở. */
export function HoloPortal({ kind, hole, spring, z, passed, open }: { kind: GateId; hole: number; spring: number; z: number; passed: boolean; open: { current: number } }) {
  const geo = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-hole, 0);
    s.lineTo(-hole, spring);
    s.absarc(0, spring, hole, Math.PI, 0, true);
    s.lineTo(hole, 0);
    s.closePath();
    const g = new THREE.ShapeGeometry(s, 32);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) + hole) / (2 * hole), pos.getY(i) / (spring + hole));
    return g;
  }, [hole, spring]);
  const tex = useCanvasTexture(512, 768, portalDraw(kind, passed), [kind, passed]);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const bar = useRef<THREE.Mesh>(null);
  const barMat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    const fade = 1 - open.current;
    const t = clock.elapsedTime;
    if (mat.current) mat.current.opacity = (0.9 + Math.sin(t * 3) * 0.06) * fade;
    if (bar.current) bar.current.position.y = 0.3 + ((Math.sin(t * 1.6) + 1) / 2) * (spring + hole * 0.7 - 0.3);
    if (barMat.current) barMat.current.opacity = passed ? 0 : 0.85 * fade;
  });
  return (
    <group position={[0, 0, z]}>
      <mesh geometry={geo} renderOrder={2}>
        <meshBasicMaterial ref={mat} map={tex} transparent depthWrite={false} toneMapped={false} side={THREE.DoubleSide} />
      </mesh>
      <mesh ref={bar} position={[0, 1, 0.02]} renderOrder={3}>
        <planeGeometry args={[hole * 1.9, 0.07]} />
        <meshBasicMaterial ref={barMat} color={PORTALS[kind].accent} transparent depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------- Bục điều khiển ----------

const CONSOLE_GLOW: Record<GateId, string> = { ticket: '#5ff4ff', flower: '#ffd84a', bunny: '#ffb15c', pond: '#7fd4ff' };

function consoleDraw(kind: GateId) {
  return (g: CanvasRenderingContext2D) => {
    const glow = CONSOLE_GLOW[kind];
    g.fillStyle = '#0b2533';
    g.fillRect(0, 0, 256, 256);
    switch (kind) {
      case 'ticket':
        emoji(g, '✋', 128, 105, 110);
        glowText(g, 'GIƠ TAY TRƯỚC', 128, 196, 24, glow);
        glowText(g, 'CAMERA', 128, 228, 24, glow);
        break;
      case 'flower':
        // 7 viên đá số 0 … 6
        for (let n = 0; n <= 6; n++) {
          const x = 36 + (n % 4) * 61 + (n >= 4 ? 30 : 0);
          const y = n < 4 ? 80 : 160;
          g.fillStyle = '#cfd6dc';
          g.beginPath();
          g.ellipse(x, y, 26, 22, 0, 0, Math.PI * 2);
          g.fill();
          g.fillStyle = '#23324a';
          g.font = `800 30px ${FONT}`;
          g.textAlign = 'center';
          g.textBaseline = 'middle';
          g.fillText(String(n), x, y + 1);
        }
        glowText(g, 'CHỌN ĐÁ SỐ', 128, 228, 26, glow);
        break;
      case 'bunny':
        g.fillStyle = '#2ecc71';
        g.beginPath();
        g.arc(72, 110, 52, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = '#e74c3c';
        g.beginPath();
        g.arc(184, 110, 52, 0, Math.PI * 2);
        g.fill();
        glowText(g, '✓', 72, 110, 64, '#ffffff');
        glowText(g, '✗', 184, 110, 64, '#ffffff');
        glowText(g, 'ĐÚNG · SAI', 128, 210, 30, glow);
        break;
      case 'pond':
        ['10 − 2', '10 − 5', '10 − 3'].forEach((eq, i) => {
          g.fillStyle = 'rgba(127,212,255,0.18)';
          g.fillRect(30, 30 + i * 62, 196, 50);
          g.strokeStyle = glow;
          g.lineWidth = 3;
          g.strokeRect(30, 30 + i * 62, 196, 50);
          glowText(g, eq, 128, 56 + i * 62, 32, '#ffffff');
        });
        glowText(g, 'CHỌN PHÉP TÍNH', 128, 232, 24, glow);
        break;
    }
  };
}

/** Bục điều khiển có mặt nghiêng phát sáng (máy soát vé giơ tay, bàn chọn đá số, nút Đúng/Sai, thẻ phép tính). */
export function GateConsole({ kind, p, rot = 0 }: { kind: GateId; p: V3; rot?: number }) {
  const tex = useCanvasTexture(256, 256, consoleDraw(kind), [kind]);
  const glow = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.opacity = 0.25 + (Math.sin(clock.elapsedTime * 3) + 1) * 0.18;
  });
  return (
    <group position={p} rotation-y={rot}>
      <mesh position={[0, 0.05, 0]} material={solid('#cfd6dc', 0.4, 0.3)} receiveShadow>
        <cylinderGeometry args={[0.5, 0.55, 0.1, 24]} />
      </mesh>
      <mesh position={[0, 0.55, 0]} material={solid('#e9eef2', 0.35, 0.2)} castShadow>
        <boxGeometry args={[0.46, 1.0, 0.34]} />
      </mesh>
      {/* mặt nghiêng về phía người đứng */}
      <group position={[0, 1.12, 0.05]} rotation-x={-0.6}>
        <mesh material={solid('#9aa5ae', 0.3, 0.6)} castShadow>
          <boxGeometry args={[0.72, 0.6, 0.08]} />
        </mesh>
        <mesh position={[0, 0, 0.045]}>
          <planeGeometry args={[0.62, 0.52]} />
          <meshBasicMaterial map={tex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <planeGeometry args={[0.68, 0.58]} />
          <meshBasicMaterial ref={glow} color={CONSOLE_GLOW[kind]} transparent depthWrite={false} toneMapped={false} blending={THREE.AdditiveBlending} />
        </mesh>
      </group>
      <mesh position={[0, 0.85, 0.175]}>
        <planeGeometry args={[0.3, 0.06]} />
        <meshBasicMaterial color={CONSOLE_GLOW[kind]} toneMapped={false} />
      </mesh>
    </group>
  );
}

// ---------- Camera an ninh ----------

export function SecurityCamera({ p, side }: { p: V3; side: 1 | -1 }) {
  const head = useRef<THREE.Group>(null);
  const led = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (head.current) head.current.rotation.y = side * 0.4 + Math.sin(clock.elapsedTime * 0.6 + side) * 0.5;
    if (led.current) led.current.color.set(Math.sin(clock.elapsedTime * 4) > 0 ? '#ff3b3b' : '#5a1010');
  });
  return (
    <group position={p}>
      <mesh position={[0, 0.15, 0]} material={solid('#d9dde0', 0.4, 0.4)}>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
      </mesh>
      <group ref={head} position={[0, 0.35, 0]}>
        <mesh position={[0, 0, 0.12]} material={solid('#eef1f3', 0.35, 0.3)} castShadow>
          <boxGeometry args={[0.3, 0.24, 0.5]} />
        </mesh>
        <mesh position={[0, 0, 0.38]} rotation-x={Math.PI / 2} material={solid('#1d2328', 0.2, 0.6)}>
          <cylinderGeometry args={[0.09, 0.09, 0.06, 16]} />
        </mesh>
        <mesh position={[0.1, 0.08, 0.38]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial ref={led} color="#ff3b3b" toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

// ---------- Màn hình trên cánh tường ----------

interface ScreenContent {
  title: string;
  head: string;
  headColor?: string;
  /** Hình giữa màn hình. */
  icon: (g: CanvasRenderingContext2D, accent: string) => void;
  lines: string[];
  /** Căn trái (danh sách bước) hay giữa. */
  left?: boolean;
}

const SCREENS: Record<GateId, { accent: string; bg: string; guide: ScreenContent; status: ScreenContent }> = {
  ticket: {
    accent: '#5ff4ff',
    bg: '#0a2f3c',
    guide: {
      title: 'HƯỚNG DẪN',
      head: 'GIƠ NGÓN TAY',
      icon: (g) => emoji(g, '🖐️ ✌️', 192, 222, 64),
      lines: ['1. Xem phép tính 9 − ?', '2. Giơ số ngón = kết quả', '3. Giữ yên tay một chút', '4. Đúng: đèn sáng 💡'],
      left: true,
    },
    status: {
      title: 'HỆ THỐNG',
      head: '● HOẠT ĐỘNG',
      headColor: '#3dff8a',
      icon: (g) => glowText(g, 'Yêu cầu:', 192, 215, 40, '#ffe08a'),
      lines: ['Giơ đúng số ngón tay.', 'Hơn 5 thì dùng 2 tay.', 'Sáng đủ 8 đèn', 'là cổng mở!'],
    },
  },
  flower: {
    accent: '#ffd84a',
    bg: '#3a2a0a',
    guide: {
      title: 'HƯỚNG DẪN',
      head: 'VƯỜN HOA',
      icon: (g) => {
        drawFlower(g, 150, 225, 38, false);
        drawFlower(g, 234, 225, 38, true);
        emoji(g, '🦋', 244, 190, 36);
      },
      lines: ['1. Bấm hoa: bướm đậu', '2. Hoa đỏ: đã bớt', '3. Đếm hoa vàng', '4. Chọn đá số'],
      left: true,
    },
    status: {
      title: 'NHIỆM VỤ',
      head: '6 bông hoa vàng',
      headColor: '#ffd84a',
      icon: (g) => emoji(g, '🌼🦋', 192, 215, 60),
      lines: ['6 − 1, 6 − 2, 6 − 3,', '6 − 4, 6 − 5', 'Còn lại mấy bông?', 'Câu 6 − 1 là mẫu'],
    },
  },
  bunny: {
    accent: '#ffb15c',
    bg: '#3a1f0a',
    guide: {
      title: 'HƯỚNG DẪN',
      head: 'THỎ NHẢY',
      icon: (g, a) => drawPaw(g, 192, 235, 46, '8 − 4', a),
      lines: ['1. Xem ô trước thỏ', '2. Bằng 4: bấm Đúng', '3. Khác 4: bấm Sai', '4. Về vườn cà rốt'],
      left: true,
    },
    status: {
      title: 'MỤC TIÊU',
      head: 'Tìm phép trừ',
      headColor: '#ffe0b0',
      icon: (g) => glowText(g, '= 4', 192, 230, 96, '#ffffff'),
      lines: ['Có kết quả bằng 4!', 'Chơi 1 người', 'hoặc 2 đội', '🥕 🐰 🥕'],
    },
  },
  pond: {
    accent: '#7fd4ff',
    bg: '#0a2440',
    guide: {
      title: 'HƯỚNG DẪN',
      head: 'HỒ ẾCH',
      icon: (g) => emoji(g, '🐸 🕊️ 🕯️', 192, 220, 52),
      lines: ['1. Ếch xuống sông', '2. Cò bay lên trời', '3. Thổi tắt nến', '4. Chọn phép tính'],
      left: true,
    },
    status: {
      title: 'NHIỆM VỤ',
      head: 'Mỗi khu có 10',
      headColor: '#c8f2ff',
      icon: (g) => glowText(g, '10 − ?', 192, 220, 64, '#ffffff'),
      lines: ['🐸 10 − 2', '🕊️ 10 − 5', '🕯️ 10 − 3', 'Đếm thật giỏi nhé!'],
    },
  },
};

function screenDraw(kind: GateId, which: 'guide' | 'status') {
  return (g: CanvasRenderingContext2D) => {
    const { accent, bg } = SCREENS[kind];
    const c = SCREENS[kind][which];
    const w = 384;
    const h = 512;
    g.fillStyle = bg;
    g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(255,255,255,0.05)';
    for (let y = 0; y < h; y += 8) g.fillRect(0, y, w, 3);
    g.strokeStyle = accent;
    g.lineWidth = 6;
    g.strokeRect(12, 12, w - 24, h - 24);
    g.globalAlpha = 0.22;
    g.fillStyle = accent;
    g.fillRect(12, 12, w - 24, 78);
    g.globalAlpha = 1;
    glowText(g, c.title, w / 2, 52, 34, '#ffffff');
    glowText(g, c.head, w / 2, 128, 30, c.headColor ?? accent);
    c.icon(g, accent);
    c.lines.forEach((s, i) => {
      g.font = `700 29px ${FONT}`;
      g.textAlign = c.left ? 'left' : 'center';
      g.textBaseline = 'middle';
      g.fillStyle = '#f4fbff';
      g.fillText(s, c.left ? 46 : w / 2, 318 + i * 44);
    });
  };
}

/** Màn hình kỹ thuật số viền vàng, đặt trong vòm nhỏ ở cánh tường. */
export function WallScreen({ kind, which, p }: { kind: GateId; which: 'guide' | 'status'; p: V3 }) {
  const tex = useCanvasTexture(384, 512, screenDraw(kind, which), [kind, which]);
  return (
    <group position={p}>
      <mesh material={solid('#c9a24a', 0.35, 0.7)} castShadow>
        <boxGeometry args={[1.62, 2.12, 0.08]} />
      </mesh>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[1.5, 2.0]} />
        <meshBasicMaterial map={tex} toneMapped={false} />
      </mesh>
    </group>
  );
}
