import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../../../shared/3d/quality';
import { SPHERE_LOW, toon } from '../../../shared/3d/toon';
import { takeEffects, type EffectKind } from '../effects';

const POOL = 64;
const GRAVITY = 9;

interface Particle {
  kind: EffectKind;
  life: number;
  max: number;
  p: THREE.Vector3;
  v: THREE.Vector3;
  spin: number;
}

// giọt trắng để nổi trên nền nước xanh nhạt
const splashMat = new THREE.MeshBasicMaterial({ color: '#ffffff' });
const m = new THREE.Matrix4();
const q = new THREE.Quaternion();
const e = new THREE.Euler();
const s = new THREE.Vector3();

/** Hạt hiệu ứng dùng chung một pool: giọt nước tóe lên rồi rơi, lông cò rơi lắc lư. */
export function Effects() {
  const quality = useQuality();
  const drops = useRef<THREE.InstancedMesh>(null);
  const feathers = useRef<THREE.InstancedMesh>(null);
  const parts = useMemo<Particle[]>(
    () => Array.from({ length: POOL }, () => ({ kind: 'splash', life: 0, max: 1, p: new THREE.Vector3(), v: new THREE.Vector3(), spin: 0 })),
    [],
  );

  useFrame((state, dtRaw) => {
    const dt = Math.min(dtRaw, 0.05);
    for (const ev of takeEffects()) {
      const n = ev.kind === 'splash' ? 16 : 8;
      for (let k = 0, i = 0; k < n && i < POOL; i++) {
        const pt = parts[i];
        if (pt.life > 0) continue;
        const a = Math.random() * Math.PI * 2;
        pt.kind = ev.kind;
        pt.p.set(ev.pos[0], ev.pos[1] + (ev.kind === 'splash' ? 0.1 : 0.6), ev.pos[2]);
        if (ev.kind === 'splash') {
          // tóe thành vòng quanh con vật (không bị thân nó che mất)
          pt.p.x += Math.cos(a) * 0.45;
          pt.p.z += Math.sin(a) * 0.45;
          const r = 1.6 + Math.random() * 1.6;
          pt.v.set(Math.cos(a) * r, 3 + Math.random() * 1.6, Math.sin(a) * r);
          pt.max = pt.life = 0.75;
        } else {
          pt.v.set(Math.cos(a) * 0.8, 0.6 + Math.random() * 0.6, Math.sin(a) * 0.8);
          pt.max = pt.life = 1.8;
        }
        pt.spin = Math.random() * 6;
        k++;
      }
    }

    const t = state.clock.elapsedTime;
    let nd = 0;
    let nf = 0;
    for (const pt of parts) {
      if (pt.life <= 0) continue;
      pt.life -= dt;
      const k = Math.max(0, pt.life / pt.max);
      if (pt.kind === 'splash') {
        pt.v.y -= GRAVITY * dt;
        pt.p.addScaledVector(pt.v, dt);
        s.setScalar(0.2 * (0.5 + k * 0.5));
        m.compose(pt.p, q.identity(), s);
        drops.current?.setMatrixAt(nd++, m);
      } else {
        // lông rơi chậm, lắc qua lại
        pt.v.y = Math.max(pt.v.y - 2.5 * dt, -0.5);
        pt.v.x *= 1 - dt;
        pt.v.z *= 1 - dt;
        pt.p.addScaledVector(pt.v, dt);
        pt.p.x += Math.sin(t * 4 + pt.spin) * 0.01;
        e.set(Math.sin(t * 5 + pt.spin) * 0.8, pt.spin + t, 0);
        s.set(0.12, 0.02, 0.06).multiplyScalar(0.6 + k * 0.4);
        m.compose(pt.p, q.setFromEuler(e), s);
        feathers.current?.setMatrixAt(nf++, m);
      }
    }
    for (const [mesh, n] of [
      [drops.current, nd],
      [feathers.current, nf],
    ] as const) {
      if (!mesh) continue;
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
    }
  });

  if (!quality.particles) return null;
  return (
    <>
      <instancedMesh ref={drops} args={[SPHERE_LOW, splashMat, POOL]} frustumCulled={false} />
      <instancedMesh ref={feathers} args={[SPHERE_LOW, toon('#ffffff'), POOL]} frustumCulled={false} />
    </>
  );
}
