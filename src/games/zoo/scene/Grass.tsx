import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../../../shared/3d/quality';
import { SPHERE_LOW, toon } from '../../../shared/3d/toon';
import { groundHeight, riverCenterZ, RIVER_HALF_WIDTH, WORLD_HALF } from '../world';
import { petalsGeometry } from './flower';
import { isReserved, rng } from './Vegetation';

// Thảm cỏ dày đung đưa trong gió và hoa dại lấm tấm, phủ khắp mặt đất (trừ lòng sông và bờ cát).

/** Một bụi cỏ: 5 lá mảnh xoè ra, gốc ở y = 0, cao khoảng 1 (thu nhỏ khi đặt). */
function tuftGeometry() {
  const pos: number[] = [];
  const blades = 5;
  for (let i = 0; i < blades; i++) {
    const a = (i / blades) * Math.PI * 2 + i * 0.7;
    const lean = 0.25 + (i % 3) * 0.12;
    const w = 0.07;
    const cx = Math.cos(a);
    const cz = Math.sin(a);
    const px = -cz * w;
    const pz = cx * w;
    const tipX = cx * lean;
    const tipZ = cz * lean;
    const h = 0.75 + (i % 2) * 0.35;
    pos.push(-px, 0, -pz, px, 0, pz, tipX, h, tipZ);
    pos.push(px, 0, pz, -px, 0, -pz, tipX, h, tipZ); // mặt sau
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

/** Đất có cỏ: ngoài lòng sông và dải cát ven bờ, không đè lên công trình. */
function grassy(x: number, z: number) {
  return Math.abs(z - riverCenterZ(x)) > RIVER_HALF_WIDTH + 2.6 && !isReserved(x, z);
}

function windMaterial(color: string) {
  const m = toon(color).clone();
  m.side = THREE.DoubleSide;
  const uTime = { value: 0 };
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uTime = uTime;
    sh.vertexShader = sh.vertexShader.replace('void main() {', 'uniform float uTime;\nvoid main() {').replace(
      '#include <begin_vertex>',
      `#include <begin_vertex>
       // ngọn cỏ lắc theo gió, gốc đứng yên
       vec4 wp = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
       float sway = sin(uTime * 1.8 + wp.x * 0.35 + wp.z * 0.21) * 0.18 * position.y;
       transformed.x += sway;
       transformed.z += sway * 0.5;`,
    );
  };
  m.customProgramCacheKey = () => 'grass-wind';
  return { m, uTime };
}

export function Grass() {
  const q = useQuality();
  const ref = useRef<THREE.InstancedMesh>(null);
  const geo = useMemo(tuftGeometry, []);
  const { m, uTime } = useMemo(() => windMaterial('#ffffff'), []);
  const count = q.grassCount;
  useLayoutEffect(() => {
    const mesh = ref.current!;
    const r = rng(42);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    const shades = ['#5f9e35', '#76b33f', '#4e8a2c', '#8cc24a', '#a7c94f'];
    let n = 0;
    for (let tries = 0; n < count && tries < count * 4; tries++) {
      const x = (r() * 2 - 1) * WORLD_HALF;
      const z = (r() * 2 - 1) * WORLD_HALF;
      if (!grassy(x, z)) continue;
      const s = 0.35 + r() * 0.4;
      o.position.set(x, groundHeight(x, z), z);
      o.rotation.set(0, r() * Math.PI * 2, 0);
      o.scale.set(s * 1.2, s, s * 1.2);
      o.updateMatrix();
      mesh.setMatrixAt(n, o.matrix);
      mesh.setColorAt(n, c.set(shades[Math.floor(r() * shades.length)]));
      n++;
    }
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count]);
  useFrame((_, dt) => {
    uTime.value += dt;
  });
  return <instancedMesh key={count} ref={ref} args={[geo, m, count]} receiveShadow raycast={() => null} />;
}

const WILD = ['#ff6fa8', '#ffd23f', '#ffffff', '#b38cff', '#ff8a3d', '#ff5a5f'];

function stemGeometry() {
  const g = new THREE.CylinderGeometry(0.06, 0.08, 1, 5);
  g.translate(0, -0.5, 0);
  return g;
}

/** Hoa dại 5 cánh có nhụy vàng và cuống xanh, lấm tấm trong cỏ. */
export function Wildflowers() {
  const q = useQuality();
  const petals = useRef<THREE.InstancedMesh>(null);
  const cores = useRef<THREE.InstancedMesh>(null);
  const stems = useRef<THREE.InstancedMesh>(null);
  const geos = useMemo(() => ({ petals: petalsGeometry(), stem: stemGeometry() }), []);
  const petalMat = useMemo(() => {
    const m = toon('#ffffff').clone();
    m.side = THREE.DoubleSide;
    return m;
  }, []);
  const count = Math.round(q.grassCount / 7);
  useLayoutEffect(() => {
    const r = rng(77);
    const o = new THREE.Object3D();
    const c = new THREE.Color();
    let n = 0;
    for (let tries = 0; n < count && tries < count * 4; tries++) {
      const x = (r() * 2 - 1) * WORLD_HALF;
      const z = (r() * 2 - 1) * WORLD_HALF;
      if (!grassy(x, z)) continue;
      const h = 0.35 + r() * 0.25;
      const s = 0.13 + r() * 0.07;
      const y = groundHeight(x, z) + h;
      // cánh và nhụy: nghiêng nhẹ cho tự nhiên
      o.position.set(x, y, z);
      o.rotation.set((r() - 0.5) * 0.5, r() * Math.PI * 2, (r() - 0.5) * 0.5);
      o.scale.setScalar(s);
      o.updateMatrix();
      petals.current!.setMatrixAt(n, o.matrix);
      petals.current!.setColorAt(n, c.set(WILD[Math.floor(r() * WILD.length)]));
      o.scale.set(s * 0.32, s * 0.2, s * 0.32);
      o.updateMatrix();
      cores.current!.setMatrixAt(n, o.matrix);
      o.rotation.set(0, 0, 0);
      o.scale.set(s * 0.5, h, s * 0.5);
      o.updateMatrix();
      stems.current!.setMatrixAt(n, o.matrix);
      n++;
    }
    for (const m of [petals.current!, cores.current!, stems.current!]) {
      m.count = n;
      m.instanceMatrix.needsUpdate = true;
      m.computeBoundingSphere();
    }
    if (petals.current!.instanceColor) petals.current!.instanceColor.needsUpdate = true;
  }, [count]);
  return (
    <group key={count}>
      <instancedMesh ref={petals} args={[geos.petals, petalMat, count]} raycast={() => null} />
      <instancedMesh ref={cores} args={[SPHERE_LOW, toon('#ffc21a'), count]} raycast={() => null} />
      <instancedMesh ref={stems} args={[geos.stem, toon('#4f8a2c'), count]} raycast={() => null} />
    </group>
  );
}
