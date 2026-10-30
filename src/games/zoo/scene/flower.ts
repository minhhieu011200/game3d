import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

let petals: THREE.BufferGeometry | null = null;

/** Bông hoa 5 cánh xoè ngửa (gốc ở tâm bông, mặt hoa hướng lên); đường kính khoảng 2. Dùng chung, tạo một lần. */
export function petalsGeometry() {
  if (petals) return petals;
  const parts: THREE.BufferGeometry[] = [];
  for (let i = 0; i < 5; i++) {
    const g = new THREE.SphereGeometry(1, 10, 6);
    g.scale(0.42, 0.12, 0.26); // cánh dẹt, thuôn
    g.translate(0.5, 0.05, 0);
    g.rotateY((i / 5) * Math.PI * 2);
    parts.push(g);
  }
  petals = mergeGeometries(parts)!;
  return petals;
}
