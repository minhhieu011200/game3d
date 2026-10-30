// Bộ dựng hình hoạt hình dùng chung: vật liệu toon bóng mềm có ánh sáng viền ấm, viền đậm quanh
// nhân vật (<Outlined>), và vài khối cơ bản viết gọn để dựng con vật, cây cối.
import { forwardRef, useEffect, useRef, type ReactNode } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { mergeVertices } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let gradient: THREE.DataTexture | null = null;
function toonGradient() {
  if (gradient) return gradient;
  // 3 mảng sáng (tối – vừa – sáng) nối bằng smoothstep: vẫn ra mảng rõ như tô màu, nhưng mép chuyển mềm
  const N = 16;
  const data = new Uint8Array(N * 4);
  const step = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    const v = 0.45 + 0.27 * step(0.3, 0.45, u) + 0.28 * step(0.6, 0.75, u);
    data.set([v * 255, v * 255, v * 255, 255], i * 4);
  }
  gradient = new THREE.DataTexture(data, N, 1, THREE.RGBAFormat);
  gradient.minFilter = gradient.magFilter = THREE.LinearFilter;
  gradient.needsUpdate = true;
  return gradient;
}

/** Ánh sáng viền ấm (fresnel) dùng chung cho mọi vật liệu toon. */
const rimColor = { value: new THREE.Color('#fff1d0').multiplyScalar(0.35) };
function addRim(m: THREE.MeshToonMaterial) {
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uRim = rimColor;
    sh.fragmentShader = sh.fragmentShader
      .replace('void main() {', 'uniform vec3 uRim;\nvoid main() {')
      .replace(
        '#include <opaque_fragment>',
        'outgoingLight += uRim * pow(1.0 - saturate(dot(normal, normalize(vViewPosition))), 3.0);\n#include <opaque_fragment>',
      );
  };
  // mọi vật liệu toon cùng một chương trình shader
  m.customProgramCacheKey = () => 'toon-rim';
}

const cache = new Map<string, THREE.MeshToonMaterial>();

/** Vật liệu toon theo màu (dùng chung, không tạo lại mỗi lần vẽ). */
export function toon(color: string, opts: { emissive?: string; side?: THREE.Side } = {}) {
  const key = `${color}|${opts.emissive ?? ''}|${opts.side ?? 0}`;
  let m = cache.get(key);
  if (!m) {
    m = new THREE.MeshToonMaterial({ color, gradientMap: toonGradient(), side: opts.side ?? THREE.FrontSide });
    if (opts.emissive) m.emissive = new THREE.Color(opts.emissive);
    addRim(m);
    cache.set(key, m);
  }
  return m;
}

// ---------- Viền ----------

/** Kích thước vùng vẽ (px CSS), để viền dày đều bất kể xa gần. */
const outlineResolution = { value: new THREE.Vector2(1280, 720) };

const outlineVertex = /* glsl */ `
  uniform float uWidth;
  uniform vec2 uResolution;
  #include <fog_pars_vertex>
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    vec4 clip = projectionMatrix * mvPosition;
    // đẩy mặt sau ra ngoài theo pháp tuyến trên màn hình: dày uWidth px, không méo khi khối bị co giãn
    vec3 n = normalize(normalMatrix * normal);
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    if (len > 1e-5) clip.xy += dir / len * uWidth * 2.0 / uResolution * clip.w;
    gl_Position = clip;
    #include <fog_vertex>
  }
`;
const outlineFragment = /* glsl */ `
  uniform vec3 uColor;
  #include <fog_pars_fragment>
  void main() {
    gl_FragColor = vec4(uColor, 1.0);
    #include <colorspace_fragment>
    #include <fog_fragment>
  }
`;

const outlineCache = new Map<string, THREE.ShaderMaterial>();
function outlineMaterial(color: string, width: number) {
  const key = `${color}|${width}`;
  let m = outlineCache.get(key);
  if (!m) {
    m = new THREE.ShaderMaterial({
      uniforms: {
        ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog),
        uColor: { value: new THREE.Color(color) },
        uWidth: { value: width },
        uResolution: outlineResolution,
      },
      vertexShader: outlineVertex,
      fragmentShader: outlineFragment,
      side: THREE.BackSide,
      fog: true,
    });
    outlineCache.set(key, m);
  }
  return m;
}

/** Bản sao geometry có pháp tuyến làm mượt (gộp đỉnh trùng), để viền không hở ở góc hộp, mép trụ. */
const hullGeoCache = new WeakMap<THREE.BufferGeometry, THREE.BufferGeometry>();
function hullGeometry(g: THREE.BufferGeometry) {
  let h = hullGeoCache.get(g);
  if (!h) {
    const c = new THREE.BufferGeometry();
    c.setAttribute('position', g.getAttribute('position'));
    if (g.index) c.setIndex(g.index);
    h = mergeVertices(c);
    h.computeVertexNormals();
    hullGeoCache.set(g, h);
  }
  return h;
}

const HIGHLIGHT = '#ffd23f';
/** Khối nhỏ hơn chừng này (bán kính, m) như mắt, miệng nến thì không viền, kẻo thành vệt đen. */
const MIN_HULL_RADIUS = 0.06;
const noRaycast = () => {};
const tmpScale = new THREE.Vector3();

/**
 * Viền đậm kiểu hoạt hình quanh mọi khối toon bên trong (bỏ qua chi tiết vật liệu basic như đốm sáng mắt,
 * má hồng, lửa, khói; mesh có `userData.noOutline`; và mesh quá nhỏ). `highlight`: viền vàng dày hơn,
 * báo vật kéo được đang được rê chuột / chọn. `outline={false}`: bình thường không viền, chỉ hiện viền vàng khi `highlight`.
 */
export function Outlined({ color = '#4a2c1d', width = 2.5, outline = true, highlight = false, children }: { color?: string; width?: number; outline?: boolean; highlight?: boolean; children: ReactNode }) {
  const root = useRef<THREE.Group>(null);
  const hulls = useRef<THREE.Mesh[]>([]);
  const size = useThree((s) => s.size);
  outlineResolution.value.set(size.width, size.height);
  const mat = highlight ? outlineMaterial(HIGHLIGHT, width + 1.5) : outlineMaterial(color, width);
  const tick = useRef(0);
  const apply = () => {
    for (const h of hulls.current) {
      h.material = mat;
      h.visible = outline || highlight;
    }
  };

  const scan = () => {
    const g = root.current;
    if (!g) return;
    // mọi mắt trong cùng một nhân vật chớp cùng nhịp (xem CuteEye)
    g.userData.blinkSeed ??= Math.random();
    g.updateWorldMatrix(true, true);
    hulls.current = hulls.current.filter((h) => h.parent);
    g.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh || mesh.userData.hull || mesh.userData.isHull || mesh.userData.noOutline) return;
      if (!(mesh.material as THREE.Material & { isMeshToonMaterial?: boolean }).isMeshToonMaterial) return;
      const geo = mesh.geometry;
      if (!geo.boundingSphere) geo.computeBoundingSphere();
      mesh.getWorldScale(tmpScale);
      if (geo.boundingSphere!.radius * Math.max(tmpScale.x, tmpScale.y, tmpScale.z) < MIN_HULL_RADIUS) {
        mesh.userData.hull = 'skip';
        return;
      }
      const h = new THREE.Mesh(hullGeometry(geo), mat);
      h.userData.isHull = true;
      h.raycast = noRaycast;
      mesh.add(h);
      mesh.userData.hull = h;
      hulls.current.push(h);
    });
  };

  useEffect(() => {
    scan();
    const list = hulls;
    return () => {
      for (const h of list.current) h.parent?.remove(h);
      list.current = [];
      root.current?.traverse((o) => delete o.userData.hull);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(apply, [mat, outline, highlight]); // eslint-disable-line react-hooks/exhaustive-deps

  // khối mới hiện ra sau (cánh xoè khi bay, mặt nến khi tắt…) cũng được thêm viền
  useFrame(() => {
    if (++tick.current % 20 === 0) {
      scan();
      apply();
    }
  });

  return <group ref={root}>{children}</group>;
}

export const SPHERE = new THREE.SphereGeometry(1, 24, 18);
export const SPHERE_LOW = new THREE.SphereGeometry(1, 12, 9);
export const CYL = new THREE.CylinderGeometry(1, 1, 1, 16);
export const CONE = new THREE.ConeGeometry(1, 1, 16);
export const BOX = new THREE.BoxGeometry(1, 1, 1);
export const CAPSULE = new THREE.CapsuleGeometry(1, 1, 6, 12);

type V3 = [number, number, number];
interface PartProps {
  p?: V3;
  s?: V3 | number;
  r?: V3;
  c: string;
  shadow?: boolean;
}

function scl(s: V3 | number | undefined): V3 {
  return s === undefined ? [1, 1, 1] : typeof s === 'number' ? [s, s, s] : s;
}

/** Quả cầu (co giãn thành hình bầu dục) tô màu toon. */
export const Ball = forwardRef<THREE.Mesh, PartProps & { low?: boolean }>(function Ball({ p, s, r, c, shadow = true, low }, ref) {
  return <mesh ref={ref} geometry={low ? SPHERE_LOW : SPHERE} material={toon(c)} position={p} scale={scl(s)} rotation={r} castShadow={shadow} />;
});

/** Hình trụ: s = [bán kính x, chiều cao, bán kính z]. */
export const Tube = forwardRef<THREE.Mesh, PartProps>(function Tube({ p, s, r, c, shadow = true }, ref) {
  return <mesh ref={ref} geometry={CYL} material={toon(c)} position={p} scale={scl(s)} rotation={r} castShadow={shadow} />;
});

export const Cone = forwardRef<THREE.Mesh, PartProps>(function Cone({ p, s, r, c, shadow = true }, ref) {
  return <mesh ref={ref} geometry={CONE} material={toon(c)} position={p} scale={scl(s)} rotation={r} castShadow={shadow} />;
});

export const Box = forwardRef<THREE.Mesh, PartProps>(function Box({ p, s, r, c, shadow = true }, ref) {
  return <mesh ref={ref} geometry={BOX} material={toon(c)} position={p} scale={scl(s)} rotation={r} castShadow={shadow} />;
});

export const Capsule = forwardRef<THREE.Mesh, PartProps>(function Capsule({ p, s, r, c, shadow = true }, ref) {
  return <mesh ref={ref} geometry={CAPSULE} material={toon(c)} position={p} scale={scl(s)} rotation={r} castShadow={shadow} />;
});

/** Đôi mắt to tròn long lanh kiểu hoạt hình: lòng trắng, con ngươi, hai đốm sáng. Thỉnh thoảng chớp mắt. */
export function CuteEye({ p, size = 0.1, look = [0, 0, 1] as V3 }: { p: V3; size?: number; look?: V3 }) {
  const k = size;
  const g = useRef<THREE.Group>(null);
  const seed = useRef<number | null>(null);
  useFrame((state) => {
    const eye = g.current;
    if (!eye) return;
    if (seed.current === null) {
      // lấy nhịp chớp của nhân vật (nhóm <Outlined> gần nhất) để hai mắt chớp cùng lúc
      let o: THREE.Object3D | null = eye.parent;
      while (o && o.userData.blinkSeed === undefined) o = o.parent;
      seed.current = (o?.userData.blinkSeed as number | undefined) ?? Math.random();
    }
    const period = 3 + seed.current * 3;
    const tt = (state.clock.elapsedTime + seed.current * 17) % period;
    eye.scale.y = tt < 0.12 ? 0.12 : 1;
  });
  return (
    <group ref={g} position={p}>
      <mesh geometry={SPHERE} material={toon('#ffffff')} scale={[k, k * 1.1, k * 0.7]} />
      <mesh geometry={SPHERE} material={toon('#1d1b2e')} position={[look[0] * k * 0.2, look[1] * k * 0.2, k * 0.45]} scale={[k * 0.62, k * 0.72, k * 0.4]} />
      <mesh geometry={SPHERE_LOW} position={[k * 0.22, k * 0.3, k * 0.75]} scale={k * 0.2}>
        <meshBasicMaterial color="white" />
      </mesh>
      <mesh geometry={SPHERE_LOW} position={[-k * 0.18, -k * 0.15, k * 0.74]} scale={k * 0.09}>
        <meshBasicMaterial color="white" />
      </mesh>
    </group>
  );
}

let blobTex: THREE.CanvasTexture | null = null;
function blobTexture() {
  if (blobTex) return blobTex;
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const gr = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(40,50,30,0.45)');
  gr.addColorStop(0.6, 'rgba(40,50,30,0.2)');
  gr.addColorStop(1, 'rgba(40,50,30,0)');
  ctx.fillStyle = gr;
  ctx.fillRect(0, 0, 64, 64);
  blobTex = new THREE.CanvasTexture(c);
  return blobTex;
}
let blobMat: THREE.MeshBasicMaterial | null = null;
const PLANE = new THREE.PlaneGeometry(2, 2);

/** Bóng tròn mờ dưới chân (rẻ hơn bóng đổ thật, giữ ở mọi mức chất lượng): vật như đang đứng hẳn trên đất. */
export function BlobShadow({ r = 0.5, y = 0.03 }: { r?: number; y?: number }) {
  blobMat ??= new THREE.MeshBasicMaterial({ map: blobTexture(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  return <mesh geometry={PLANE} material={blobMat} rotation-x={-Math.PI / 2} position={[0, y, 0]} scale={r} raycast={() => null} />;
}

/** Má hồng. */
export function Blush({ p, size = 0.06 }: { p: V3; size?: number }) {
  return (
    <mesh geometry={SPHERE_LOW} position={p} scale={[size, size * 0.6, size * 0.3]}>
      <meshBasicMaterial color="#ff9fb5" transparent opacity={0.85} />
    </mesh>
  );
}

/** Miệng cười (nửa vòng xuyến). */
export function Smile({ p, size = 0.05, c = '#5a2a2a', r = [0, 0, 0] as V3 }: { p: V3; size?: number; c?: string; r?: V3 }) {
  return (
    <mesh position={p} rotation={[r[0], r[1], Math.PI + r[2]]} material={toon(c)}>
      <torusGeometry args={[size, size * 0.22, 6, 16, Math.PI]} />
    </mesh>
  );
}
