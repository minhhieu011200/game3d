// Vẹt Xanh, hướng dẫn viên: mô hình chibi vỗ cánh, đậu trên vai bạn học sinh.
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Ball, Capsule, Cone, CuteEye, Outlined } from '../shared/3d/toon';

type V3 = [number, number, number];

export function ParrotModel({ p, scale, outline = true }: { p: V3; scale: number; outline?: boolean }) {
  const body = useRef<THREE.Group>(null);
  const wingL = useRef<THREE.Group>(null);
  const wingR = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    // nhún nhẹ, nghiêng đầu, vỗ cánh khe khẽ
    if (body.current) {
      body.current.position.y = Math.abs(Math.sin(t * 2.2)) * 0.12;
      body.current.rotation.z = Math.sin(t * 1.3) * 0.12;
    }
    const flap = Math.sin(t * 9) * 0.35;
    if (wingL.current) wingL.current.rotation.z = 0.5 + flap;
    if (wingR.current) wingR.current.rotation.z = -0.5 - flap;
  });
  return (
    <group position={p} scale={scale}>
      <group ref={body}>
        <Outlined color="#14532d" outline={outline}>
          <Capsule p={[0, 0, 0]} s={[0.42, 0.45, 0.38]} c="#3cc04a" />
          <Ball p={[0, 0.72, 0.05]} s={0.42} c="#4fd15a" />
          <Ball p={[0, 0.2, 0.24]} s={[0.3, 0.38, 0.2]} c="#ffe066" />
          <Cone p={[0, -0.8, -0.25]} s={[0.22, 0.8, 0.12]} r={[Math.PI - 0.35, 0, 0]} c="#2a9d3a" />
          <Ball p={[0, 1.12, -0.05]} s={[0.12, 0.18, 0.12]} c="#e74c3c" />
        </Outlined>
        <Cone p={[0, 0.62, 0.48]} s={[0.12, 0.26, 0.12]} r={[Math.PI / 2 + 0.4, 0, 0]} c="#ff9f1a" />
        <CuteEye p={[-0.17, 0.8, 0.35]} size={0.09} />
        <CuteEye p={[0.17, 0.8, 0.35]} size={0.09} />
        <group ref={wingL} position={[-0.38, 0.25, 0]}>
          <Ball p={[-0.25, -0.1, 0]} s={[0.4, 0.16, 0.3]} c="#2a9d3a" />
        </group>
        <group ref={wingR} position={[0.38, 0.25, 0]}>
          <Ball p={[0.25, -0.1, 0]} s={[0.4, 0.16, 0.3]} c="#2a9d3a" />
        </group>
      </group>
    </group>
  );
}
