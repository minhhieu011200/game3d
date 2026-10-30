import { useEffect, useMemo, useState } from 'react';
import { Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  text: string;
  /** Dòng chữ nhỏ bên dưới (tuỳ chọn). */
  sub?: string;
  /** Chiều cao biển (mét); chiều rộng tự theo độ dài chữ. */
  height?: number;
  bg?: string;
  border?: string;
  color?: string;
  subColor?: string;
  /** Luôn quay mặt về camera. */
  billboard?: boolean;
  /** Vẽ cả hai mặt đọc xuôi (biển treo nhìn được từ hai phía). */
  twoSided?: boolean;
  /** Biển gỗ có vân và nẹp viền (bỏ qua `bg`). */
  wood?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

/**
 * Biển chữ 3D thật: vẽ chữ lên texture rồi dán lên tấm phẳng.
 * Khác nhãn HTML, biển này bị che khuất đúng cách và không hiện ra khi ở sau lưng camera.
 */
export function Sign3D({
  text,
  sub,
  height = 0.6,
  bg = '#8a5a2b',
  border = '#5e3b19',
  color = '#ffffff',
  subColor = '#fff3c4',
  billboard = true,
  twoSided = false,
  wood = false,
  position,
  rotation,
}: Props) {
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void document.fonts?.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  const { texture, aspect } = useMemo(() => {
    const px = 96; // cỡ chữ dòng chính trên texture
    const subPx = 54;
    const font = `800 ${px}px "Baloo 2", "Segoe UI Emoji", sans-serif`;
    const subFont = `700 ${subPx}px "Baloo 2", "Segoe UI Emoji", sans-serif`;
    const probe = document.createElement('canvas').getContext('2d')!;
    probe.font = font;
    let tw = probe.measureText(text).width;
    if (sub) {
      probe.font = subFont;
      tw = Math.max(tw, probe.measureText(sub).width);
    }
    const w = Math.ceil(tw + px * 1.1);
    const h = Math.ceil(px * 1.55 + (sub ? subPx * 1.25 : 0));
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const g = canvas.getContext('2d')!;
    const pad = 6;
    g.beginPath();
    g.roundRect(pad, pad, w - pad * 2, h - pad * 2, Math.min(h, px * 1.55) * 0.3);
    if (wood) {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#8a5a2e');
      grad.addColorStop(0.5, '#6e4322');
      grad.addColorStop(1, '#5a361b');
      g.fillStyle = grad;
      g.fill();
      // vân gỗ
      g.save();
      g.clip();
      for (let i = 0; i < 40; i++) {
        const y = ((i * 37) % 100) / 100 * h;
        g.strokeStyle = `rgba(40,20,8,${0.08 + ((i * 13) % 10) / 80})`;
        g.lineWidth = 2 + (i % 3);
        g.beginPath();
        g.moveTo(0, y);
        g.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 3);
        g.stroke();
      }
      g.restore();
      g.lineWidth = 14;
      g.strokeStyle = border;
      g.stroke();
      // đinh tán bốn góc
      g.fillStyle = '#d9b26a';
      for (const [x, y] of [[pad + 22, pad + 22], [w - pad - 22, pad + 22], [pad + 22, h - pad - 22], [w - pad - 22, h - pad - 22]]) {
        g.beginPath();
        g.arc(x, y, 7, 0, Math.PI * 2);
        g.fill();
      }
      g.shadowColor = 'rgba(0,0,0,0.55)';
      g.shadowOffsetY = 4;
      g.shadowBlur = 6;
    } else {
      g.fillStyle = bg;
      g.fill();
      g.lineWidth = 12;
      g.strokeStyle = border;
      g.stroke();
    }
    g.textAlign = 'center';
    g.textBaseline = 'middle';
    g.font = font;
    g.fillStyle = color;
    g.fillText(text, w / 2, px * 0.82);
    if (sub) {
      g.font = subFont;
      g.fillStyle = subColor;
      g.fillText(sub, w / 2, px * 1.55 + subPx * 0.45);
    }
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return { texture: t, aspect: w / h };
    // vẽ lại khi phông chữ đã tải xong
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, sub, bg, border, color, subColor, wood, fontsReady]);

  useEffect(() => () => texture.dispose(), [texture]);

  const face = (key: string, rotY: number, z: number) => (
    <mesh key={key} rotation-y={rotY} position-z={z}>
      <planeGeometry args={[height * aspect, height]} />
      <meshBasicMaterial map={texture} transparent side={twoSided ? THREE.FrontSide : THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
  // hai mặt đặt cách nhau 0,22 m để nằm ngoài tấm ván dày phía sau
  const planes = twoSided ? [face('front', 0, 0.11), face('back', Math.PI, -0.11)] : [face('front', 0, 0)];
  return billboard ? (
    <Billboard position={position}>{planes}</Billboard>
  ) : (
    <group position={position} rotation={rotation}>
      {planes}
    </group>
  );
}
