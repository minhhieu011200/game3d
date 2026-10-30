import { useMemo } from 'react';
import * as THREE from 'three';
import { ZONES } from '../layout';
import { groundHeight, riverCenterZ, RIVER_HALF_WIDTH, WORLD_HALF } from '../world';

/** Mặt đất hoạt hình: cỏ xanh dịu loang màu (để con vật nổi bật), bờ cát vàng, lòng sông lõm xuống. */
export function Terrain() {
  const size = WORLD_HALF * 2 + 40;

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(size, size, 240, 240);
    g.rotateX(-Math.PI / 2);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const colors = new Float32Array(pos.count * 3);
    // cùng tông cỏ và đường lát của màn đường đi
    // cỏ xanh tươi buổi sáng, bờ cát vàng nhạt, lòng sông xanh ngọc
    const grassA = new THREE.Color('#8cc653');
    const grassB = new THREE.Color('#6aae3f');
    const sand = new THREE.Color('#f2dba8');
    const bed = new THREE.Color('#2f7d96');
    const c = new THREE.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      pos.setY(i, groundHeight(x, z));
      const d = Math.abs(z - riverCenterZ(x));
      // cỏ loang hai sắc xanh như vẽ tay
      const patch = 0.5 + 0.5 * Math.sin(x * 0.35 + Math.sin(z * 0.27) * 2) * Math.cos(z * 0.31);
      c.copy(grassA).lerp(grassB, patch * 0.8);
      // khu ếch (bờ nam) có dải cát rộng hơn để ếch xanh đứng trên nền vàng nhạt
      const frogBank = z > riverCenterZ(x) && x > ZONES.frogs.x0 - 3 && x < ZONES.frogs.x1 + 3;
      const sandW = RIVER_HALF_WIDTH + (frogBank ? 3.8 : 2.2);
      if (d < sandW) c.lerp(sand, THREE.MathUtils.smoothstep(sandW - d, 0, 1.2));
      if (d < RIVER_HALF_WIDTH - 0.5) c.copy(bed);
      colors.set([c.r, c.g, c.b], i * 3);
    }
    g.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    g.computeVertexNormals();
    return g;
  }, [size]);

  const mat = useMemo(() => new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1 }), []);

  return <mesh geometry={geometry} material={mat} receiveShadow name="terrain" />;
}
