import { useRef, useState, type ReactNode } from 'react';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { useCursor } from '@react-three/drei';
import * as THREE from 'three';
import { CABIN_FRONT, cabinPos, WHEEL } from '../layout';
import { nearestFreeSlot, type ZooObject } from '../logic';
import { BlobShadow } from '../../../shared/3d/toon';
import { LAND, LIFT, stepSpring, type Spring } from '../squash';
import { useZoo } from '../store';
import { touchWheel, wheelRuntime } from '../wheelRuntime';
import { FLY_Y, SKY_Y, intersectSurface, surfaceHeight } from '../world';

/** Kéo con trỏ vào dải trên cùng của màn hình (bầu trời) thì vật được đưa lên trời. */
export const SKY_BAND = 0.18;
const CLICK_PX = 6;
/** Nến thả cách cabin trống chừng này (m) thì được hút vào cabin. */
const SNAP_DIST = 1.2;

interface Props {
  obj: ZooObject;
  /** Bán kính / chiều cao vùng bấm vô hình (to hơn mô hình để trẻ dễ bấm). */
  hit: [radius: number, height: number];
  onClick?: () => void;
  children: (state: { flying: boolean; inWater: boolean; highlight: boolean }) => ReactNode;
}

const ray = new THREE.Raycaster();
const tmp = new THREE.Vector3();

export function Draggable({ obj, hit, onClick, children }: Props) {
  const group = useRef<THREE.Group>(null);
  const { camera, gl } = useThree();
  const controls = useThree((s) => s.controls) as { enabled: boolean } | null;
  const select = useZoo((s) => s.select);
  const setDragging = useZoo((s) => s.setDragging);
  const drop = useZoo((s) => s.drop);
  const dropOnWheel = useZoo((s) => s.dropOnWheel);
  const selected = useZoo((s) => s.selected === obj.id);
  const [hover, setHover] = useState(false);
  const [dragSky, setDragSky] = useState(false);
  useCursor(hover, 'grab');

  const press = useRef<{ x: number; y: number; moved: boolean; skyDist: number } | null>(null);
  const dragPos = useRef(new THREE.Vector3());
  /** Cabin trống mà nến đang kéo sẽ gắn vào nếu thả lúc này. */
  const dragSlot = useRef<number | null>(null);
  const squashG = useRef<THREE.Group>(null);
  const spring = useRef<Spring>({ x: 1, v: 0 });
  const flying = obj.zone === 'sky';
  const inWater = obj.zone === 'river';

  /**
   * Nến: chỗ tia cắt mặt vòng quay. `slot` là cabin trống gần đó (nếu có); `onFace` cho biết tia
   * chỉ vào mặt vòng quay, để thả vào cabin đã có nến thì nến rơi xuống ngay bên dưới chứ không bay lên trời.
   */
  function wheelUnderRay(): { slot: number | null; onFace: boolean; x: number } {
    const none = { slot: null, onFace: false, x: 0 };
    if (obj.kind !== 'candle') return none;
    const { origin: o, direction: d } = ray.ray;
    if (Math.abs(d.z) < 1e-6) return none;
    // mặt phẳng các cabin (nhô ra trước vòng quay)
    const planeZ = WHEEL.z - CABIN_FRONT;
    const t = (planeZ - o.z) / d.z;
    if (t <= 0) return none;
    const p: [number, number, number] = [o.x + d.x * t, o.y + d.y * t, planeZ];
    const onFace = Math.hypot(p[0] - WHEEL.x, p[1] - WHEEL.hubY) < WHEEL.radius + 0.8;
    const slot = nearestFreeSlot(useZoo.getState().objects, p, wheelRuntime.angle, SNAP_DIST, obj.id);
    return { slot, onFace, x: p[0] };
  }

  function pointerToWorld(e: ThreeEvent<PointerEvent>): { pos: THREE.Vector3; sky: boolean; slot: number | null } {
    const rect = gl.domElement.getBoundingClientRect();
    const ndc = new THREE.Vector2(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    ray.setFromCamera(ndc, camera);
    // cabin trống được ưu tiên hơn dải trời: cabin cao có thể nằm trong dải đó
    const w = wheelUnderRay();
    if (w.slot !== null) return { pos: new THREE.Vector3(...cabinPos(w.slot, wheelRuntime.angle)), sky: false, slot: w.slot };
    if (w.onFace) {
      // ngay trước mặt vòng quay, trên sàn bến
      const z = WHEEL.z - CABIN_FRONT - 1.0;
      return { pos: new THREE.Vector3(w.x, surfaceHeight(w.x, z) + 0.35, z), sky: false, slot: null };
    }
    const inBand = (e.clientY - rect.top) / rect.height < SKY_BAND;
    const hitP = inBand ? null : intersectSurface(ray.ray.origin, ray.ray.direction);
    if (hitP) {
      const [x, y, z] = hitP;
      return { pos: new THREE.Vector3(x, y + 0.35, z), sky: false, slot: null };
    }
    // không chạm đất: vật treo lơ lửng dọc theo tia, cao trên mức bầu trời
    const p = ray.ray.at(press.current?.skyDist ?? 12, new THREE.Vector3());
    p.y = Math.max(p.y, SKY_Y + 0.8);
    return { pos: p, sky: true, slot: null };
  }

  const onPointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const dist = camera.position.distanceTo(group.current!.position);
    // vật đưa lên trời bay xa hơn chỗ cũ một chút, không sà sát camera
    press.current = { x: e.clientX, y: e.clientY, moved: false, skyDist: Math.max(14, dist + 4) };
    // Tắt xoay camera ngay trong sự kiện này (không đợi React vẽ lại), nếu không camera sẽ xoay theo tay.
    if (controls) controls.enabled = false;
    // chạm vào nến thì vòng quay dừng lại ngay
    if (obj.kind === 'candle') touchWheel(performance.now() / 1000);
    setDragging(obj.id);
  };

  const onPointerMove = (e: ThreeEvent<PointerEvent>) => {
    const p = press.current;
    if (!p) return;
    e.stopPropagation();
    if (!p.moved && Math.hypot(e.clientX - p.x, e.clientY - p.y) < CLICK_PX) return;
    p.moved = true;
    const { pos, sky, slot } = pointerToWorld(e);
    dragPos.current.copy(pos);
    dragSlot.current = slot;
    if (sky !== dragSky) setDragSky(sky);
  };

  const onPointerUp = (e: ThreeEvent<PointerEvent>) => {
    const p = press.current;
    if (!p) return;
    e.stopPropagation();
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    press.current = null;
    // Bật lại trước khi camera-controls nhận pointerup ở document, để nó kết thúc lượt kéo của nó.
    if (controls) controls.enabled = true;
    setDragging(null);
    setDragSky(false);
    if (!p.moved) {
      select(obj.id);
      onClick?.();
      return;
    }
    // vừa chạm chỗ mới: dẹt xuống rồi nảy về dáng cũ
    spring.current = { x: LAND, v: 0 };
    const d = dragPos.current;
    const slot = dragSlot.current;
    dragSlot.current = null;
    if (slot !== null) {
      dropOnWheel(obj.id, slot);
    } else if (d.y > SKY_Y) {
      drop(obj.id, [d.x, FLY_Y + (obj.id.charCodeAt(obj.id.length - 1) % 4) * 0.35, d.z]);
    } else {
      drop(obj.id, [d.x, surfaceHeight(d.x, d.z), d.z]);
    }
    select(obj.id);
  };

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    const dragging = press.current?.moved;
    const onWheel = !dragging && obj.zone === 'wheel' && obj.slot !== undefined;
    // nến trong cabin đi theo vòng quay; đang kéo gần cabin trống thì hút vào cabin đó
    const slot = onWheel ? obj.slot! : dragging ? dragSlot.current : null;
    const target = slot !== null ? tmp.set(...cabinPos(slot, wheelRuntime.angle)) : dragging ? dragPos.current : tmp.set(...obj.pos);
    // nhẹ nhàng trôi tới chỗ mới (bay lên trời thì chậm hơn); đã ở sát cabin thì bám khít
    const k = dragging ? 1 - Math.exp(-dt * 25) : 1 - Math.exp(-dt * (flying ? 2.2 : 7));
    if (onWheel && g.position.distanceTo(target) < 0.6) g.position.copy(target);
    else g.position.lerp(target, k);
    spring.current = stepSpring(spring.current, dragging ? LIFT : 1, dt);
    const sq = squashG.current;
    if (sq) {
      const y = spring.current.x;
      sq.scale.set(1 / Math.sqrt(y), y, 1 / Math.sqrt(y));
    }
    const t = state.clock.elapsedTime + obj.id.length + obj.id.charCodeAt(obj.id.length - 1);
    if (!dragging && flying) {
      g.position.y += Math.sin(t * 1.3) * 0.01; // lượn nhẹ
      g.rotation.y += dt * 0.3;
    } else if (!dragging && inWater) {
      g.position.y = THREE.MathUtils.lerp(g.position.y, obj.pos[1] - 0.12 + Math.sin(t * 2) * 0.03, k);
    }
  });

  const showRing = (selected || hover) && !flying;
  const dragFlying = dragSky || flying;

  return (
    <group ref={group} position={obj.pos}>
      <group ref={squashG}>{children({ flying: dragFlying, inWater, highlight: hover || selected || dragSky })}</group>
      {obj.zone === 'ground' && !press.current?.moved && <BlobShadow r={hit[0] * 0.9} />}
      {/* vùng bấm vô hình */}
      <mesh
        position={[0, hit[1] / 2, 0]}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHover(true);
        }}
        onPointerOut={() => setHover(false)}
      >
        <cylinderGeometry args={[hit[0], hit[0], hit[1], 12]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
      {showRing && (
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]}>
          <ringGeometry args={[hit[0] * 0.95, hit[0] * 1.15, 32]} />
          <meshBasicMaterial color={selected ? '#ffcc00' : '#ffffff'} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
}
