import { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useQuality } from '../../../shared/3d/quality';
import { WATER_Y, WORLD_HALF } from '../world';

// Nước hoạt hình: xanh ngọc, có vệt sóng trắng và đốm lấp lánh trôi chầm chậm.
const vertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vWorld;
  void main() {
    vUv = uv;
    vec4 w = modelMatrix * vec4(position, 1.0);
    vWorld = w.xyz;
    gl_Position = projectionMatrix * viewMatrix * w;
  }
`;

const fragment = /* glsl */ `
  uniform float uTime;
  uniform float uSparkle;
  varying vec2 vUv;
  varying vec3 vWorld;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  void main() {
    vec2 p = vWorld.xz;
    // nước sâu màu xanh lam sẫm; độ sáng đến từ bầu trời phản chiếu (fresnel)
    vec3 deep = vec3(0.07, 0.30, 0.44);
    vec3 light = vec3(0.16, 0.45, 0.58);
    float n = noise(p * 0.25 + vec2(uTime * 0.15, uTime * 0.05));
    vec3 col = mix(deep, light, smoothstep(0.35, 0.75, n));
    vec3 view = normalize(cameraPosition - vWorld);
    // tia phản xạ (gợn sóng làm lệch nhẹ) và màu trời theo độ cao của tia
    vec3 refl = normalize(vec3(-view.x + (n - 0.5) * 0.12, view.y, -view.z + (noise(p * 0.6 - uTime * 0.2) - 0.5) * 0.12));
    vec3 sky = mix(vec3(0.49, 0.77, 0.97), vec3(0.18, 0.56, 0.93), smoothstep(0.0, 0.55, refl.y));
    float fres = 0.22 + 0.78 * pow(1.0 - clamp(view.y, 0.0, 1.0), 2.5);
    col = mix(col, sky, fres);
    // vệt sóng trắng mảnh như nét vẽ
    float wave = noise(p * vec2(0.45, 1.3) + vec2(uTime * 0.5, 0.0));
    float wave2 = noise(p * vec2(0.45, 1.3) + vec2(uTime * 0.5, 0.0) + 0.07);
    // chỉ giữ viền mảnh của vệt sóng, như nét vẽ hoạt hình
    float line = smoothstep(0.84, 0.86, wave) * (1.0 - smoothstep(0.84, 0.86, wave2 + 0.025));
    col = mix(col, vec3(1.0), clamp(line, 0.0, 1.0) * 0.7);
    // đốm lấp lánh thưa
    float s = noise(p * 2.0 + uTime * 1.2);
    col += vec3(1.0) * smoothstep(0.965, 0.985, s) * uSparkle;
    gl_FragColor = vec4(col, 0.93);
    #include <colorspace_fragment>
  }
`;

/** Mặt nước phẳng nằm dưới mặt đất, chỉ lộ ra ở lòng sông. */
export function River() {
  const q = useQuality();
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uTime: { value: 0 }, uSparkle: { value: 1 } },
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
      }),
    [],
  );
  material.uniforms.uSparkle.value = q.shadows ? 1 : 0.6;
  useFrame((_, dt) => {
    material.uniforms.uTime.value += dt;
  });
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, WATER_Y, -9]} material={material} name="water">
      <planeGeometry args={[WORLD_HALF * 2 + 40, 34]} />
    </mesh>
  );
}
