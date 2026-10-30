import { useLayoutEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { rng } from './Vegetation';

const TOP = '#2f8fec';
const HORIZON = '#7cc4f8';

/** Vòm trời xanh, không mặt trời; xanh đậm trên cao, nhạt nhẹ tới chân trời. */
function Dome() {
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(180, 32, 16);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const top = new THREE.Color(TOP);
    const horizon = new THREE.Color(HORIZON);
    const cols = new Float32Array(pos.count * 3);
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const t = THREE.MathUtils.clamp(pos.getY(i) / 180, 0, 1);
      c.copy(horizon).lerp(top, THREE.MathUtils.smoothstep(t, 0, 0.6));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);
  return (
    <mesh geometry={geo}>
      {/* tắt tone mapping để giữ nguyên màu xanh, không bị ngả xám */}
      <meshBasicMaterial vertexColors side={THREE.BackSide} fog={false} depthWrite={false} toneMapped={false} />
    </mesh>
  );
}

const CLOUD_COUNT = 16;
/** Các cục bông của một đám mây: [x, y, z] và [rộng, cao, sâu]; đám mây trải dài theo trục x. */
const CLOUD_PUFFS: [number, number, number, number, number, number][] = [
  [0, 1.5, 0, 9, 5.5, 6],
  [-7.5, 0.3, 0.5, 6.5, 4, 5],
  [7, 0.2, -0.5, 7, 4.2, 5],
  [-13, -0.6, 0, 4, 2.4, 3.5],
  [13, -0.7, 0.5, 4.5, 2.5, 3.5],
];

/**
 * Các đám mây bông xếp thành vòng quanh vườn, đủ xa để thuyền không chạm tới và đủ cao để nằm trên hàng cây.
 * Tô sẵn màu theo độ cao (đỉnh trắng, đáy xanh nhạt), không chịu sương để luôn trắng rõ trên nền trời.
 */
function Clouds() {
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(() => {
    const g = new THREE.SphereGeometry(1, 16, 12);
    const n = g.attributes.normal as THREE.BufferAttribute;
    const top = new THREE.Color('#ffffff');
    const bottom = new THREE.Color('#d4e2ee');
    const c = new THREE.Color();
    const cols = new Float32Array(n.count * 3);
    for (let i = 0; i < n.count; i++) {
      c.copy(bottom).lerp(top, THREE.MathUtils.smoothstep(n.getY(i), -0.5, 0.4));
      cols.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
    return g;
  }, []);
  useLayoutEffect(() => {
    const r = rng(11);
    const cloud = new THREE.Object3D();
    const puff = new THREE.Object3D();
    const m = new THREE.Matrix4();
    for (let i = 0; i < CLOUD_COUNT; i++) {
      const a = ((i + r() * 0.6) / CLOUD_COUNT) * Math.PI * 2;
      const dist = 95 + r() * 55;
      cloud.position.set(Math.cos(a) * dist, 28 + r() * 20, Math.sin(a) * dist);
      // quay phần dài của đám mây về phía giữa vườn, nghiêng lệch chút cho đỡ đều
      cloud.rotation.y = -a + Math.PI / 2 + (r() - 0.5) * 0.6;
      cloud.scale.setScalar(0.9 + r() * 0.8);
      cloud.updateMatrix();
      CLOUD_PUFFS.forEach(([x, y, z, sx, sy, sz], j) => {
        puff.position.set(x, y, z);
        puff.scale.set(sx, sy, sz);
        puff.updateMatrix();
        ref.current!.setMatrixAt(i * CLOUD_PUFFS.length + j, m.multiplyMatrices(cloud.matrix, puff.matrix));
      });
    }
    ref.current!.instanceMatrix.needsUpdate = true;
  }, []);
  return (
    <instancedMesh ref={ref} args={[geo, undefined, CLOUD_COUNT * CLOUD_PUFFS.length]} frustumCulled={false} raycast={() => null}>
      <meshBasicMaterial vertexColors fog={false} toneMapped={false} />
    </instancedMesh>
  );
}

/** Hướng chiếu của đèn chính (đèn dịu, không đổ bóng), để mặt các con vật không bị ngược sáng. */
export const LIGHT_DIR = new THREE.Vector3(0.45, 0.6, -0.66).normalize();

/**
 * Màu sương xa, trùng màu chân trời để cảnh xa tan vào trời.
 * Three.js trộn sương sau bước đổi hệ màu, nên phải đổi trước để ra đúng màu trên màn hình.
 */
export const FOG_COLOR = new THREE.Color(HORIZON).convertLinearToSRGB();

export function CartoonSky() {
  return (
    <>
      <Dome />
      <Clouds />
    </>
  );
}
