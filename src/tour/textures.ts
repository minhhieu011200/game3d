// Chất liệu vẽ bằng code (canvas) cho màn đường đi: đá lát, gạch, cỏ, gỗ. Không cần file ảnh, chạy offline.
import * as THREE from 'three';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

function canvasTexture(size: number, draw: (g: CanvasRenderingContext2D, r: () => number) => void, seed: number, repeat: [number, number]) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d')!;
  draw(g, rng(seed));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(...repeat);
  t.anisotropy = 8;
  return t;
}

const cache = new Map<string, THREE.Material>();
function cached<T extends THREE.Material>(key: string, make: () => T): T {
  let m = cache.get(key) as T | undefined;
  if (!m) cache.set(key, (m = make()));
  return m;
}

/** Đường lát đá cuội tròn màu kem (u ngang đường, v dọc đường). */
export function cobbleMaterial() {
  return cached('cobble', () => {
    const map = canvasTexture(
      512,
      (g, r) => {
        g.fillStyle = '#8c7458';
        g.fillRect(0, 0, 512, 512);
        // các viên đá xếp so le, kích thước và màu lệch nhau một chút
        const rows = 9;
        const h = 512 / rows;
        for (let row = 0; row < rows; row++) {
          const w = h * (1.05 + r() * 0.2);
          const off = (row % 2) * w * 0.5;
          for (let x = -w; x < 512 + w; x += w) {
            const cx = x + off + (r() - 0.5) * 6;
            const cy = row * h + h / 2 + (r() - 0.5) * 6;
            const l = 62 + r() * 18;
            g.fillStyle = `hsl(${30 + r() * 12}, ${22 + r() * 14}%, ${l}%)`;
            g.beginPath();
            g.ellipse(cx, cy, w * 0.45, h * 0.42, (r() - 0.5) * 0.3, 0, Math.PI * 2);
            g.fill();
            // mặt đá sáng phía trên, tối phía dưới
            const grad = g.createLinearGradient(cx, cy - h * 0.4, cx, cy + h * 0.4);
            grad.addColorStop(0, 'rgba(255,255,255,0.25)');
            grad.addColorStop(1, 'rgba(0,0,0,0.18)');
            g.fillStyle = grad;
            g.fill();
          }
        }
      },
      5,
      [1, 40],
    );
    return new THREE.MeshStandardMaterial({ map, roughness: 0.95, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  });
}

/** Gạch đỏ của tháp cổng chào. */
export function brickMaterial() {
  return cached('brick', () => {
    const map = canvasTexture(
      256,
      (g, r) => {
        g.fillStyle = '#e8d8c4';
        g.fillRect(0, 0, 256, 256);
        const bh = 256 / 8;
        const bw = 256 / 4;
        for (let row = 0; row < 8; row++) {
          const off = (row % 2) * bw * 0.5;
          for (let x = -bw; x < 256 + bw; x += bw) {
            g.fillStyle = `hsl(${8 + r() * 8}, ${48 + r() * 12}%, ${38 + r() * 10}%)`;
            g.fillRect(x + off + 2, row * bh + 2, bw - 4, bh - 4);
          }
        }
      },
      9,
      [3, 1],
    );
    return new THREE.MeshStandardMaterial({ map, roughness: 0.9 });
  });
}

/** Đá xây khối màu kem cho vòm cổng (UV tính theo mét: một ô 2 m × 2 m). */
export function stoneMaterial() {
  return cached('stone', () => {
    const map = canvasTexture(
      256,
      (g, r) => {
        g.fillStyle = '#9d8f78';
        g.fillRect(0, 0, 256, 256);
        const bh = 256 / 4;
        const bw = 256 / 3;
        for (let row = 0; row < 4; row++) {
          const off = (row % 2) * bw * 0.5;
          for (let x = -bw; x < 256 + bw; x += bw) {
            const l = 74 + r() * 10;
            g.fillStyle = `hsl(${36 + r() * 8}, ${20 + r() * 10}%, ${l}%)`;
            g.fillRect(x + off + 3, row * bh + 3, bw - 6, bh - 6);
            const grad = g.createLinearGradient(0, row * bh, 0, row * bh + bh);
            grad.addColorStop(0, 'rgba(255,255,255,0.18)');
            grad.addColorStop(1, 'rgba(0,0,0,0.12)');
            g.fillStyle = grad;
            g.fillRect(x + off + 3, row * bh + 3, bw - 6, bh - 6);
          }
        }
      },
      13,
      [0.5, 0.5],
    );
    return new THREE.MeshStandardMaterial({ map, roughness: 0.9 });
  });
}

/** Thảm cỏ có lốm đốm đậm nhạt. */
export function grassMaterial() {
  return cached('grass', () => {
    const map = canvasTexture(
      256,
      (g, r) => {
        g.fillStyle = '#5c8a32';
        g.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2600; i++) {
          g.fillStyle = `hsla(${78 + r() * 30}, ${40 + r() * 25}%, ${22 + r() * 26}%, 0.55)`;
          g.fillRect(r() * 256, r() * 256, 2 + r() * 3, 4 + r() * 6);
        }
      },
      3,
      [60, 60],
    );
    return new THREE.MeshStandardMaterial({ map, roughness: 1 });
  });
}

/** Sắt uốn sơn đen bóng nhẹ. */
export function ironMaterial() {
  return cached('iron', () => new THREE.MeshStandardMaterial({ color: '#23211f', roughness: 0.45, metalness: 0.6 }));
}

/** Vật liệu thường (không toon) theo màu, cho các đồ vật kiểu "thật" như xe buýt, tường. */
export function solid(color: string, roughness = 0.7, metalness = 0) {
  return cached(`solid|${color}|${roughness}|${metalness}`, () => new THREE.MeshStandardMaterial({ color, roughness, metalness }));
}

/** Bầu trời buổi sáng: xanh trong ở đỉnh, nhạt dần sang trắng xanh ở chân trời. */
export function skyMaterial() {
  return cached(
    'sky',
    () =>
      new THREE.ShaderMaterial({
        side: THREE.BackSide,
        depthWrite: false,
        fog: false,
        uniforms: {
          top: { value: new THREE.Color('#4f9be0') },
          mid: { value: new THREE.Color('#a9d3f2') },
          horizon: { value: new THREE.Color('#e6f3fb') },
        },
        vertexShader: 'varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
        fragmentShader: `uniform vec3 top; uniform vec3 mid; uniform vec3 horizon; varying vec3 vP;
          void main(){ float h = clamp(vP.y, 0.0, 1.0);
            vec3 c = mix(horizon, mid, smoothstep(0.0, 0.18, h));
            c = mix(c, top, smoothstep(0.18, 0.7, h));
            gl_FragColor = vec4(c, 1.0); }`,
      }),
  );
}
