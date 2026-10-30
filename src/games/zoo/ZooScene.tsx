import { useThree } from '@react-three/fiber';
import { boatRuntime } from './boatRuntime';
import { ZooControls } from './controls/ZooControls';
import { cabinPos, WHEEL, ZONES } from './layout';
import { Boat } from './objects/Boat';
import { Outlined } from '../../shared/3d/toon';
import { Candle, Frog, Stork } from './objects/Models';
import { Draggable } from './objects/Draggable';
import { AnimalPens } from './scene/Animals';
import { River } from './scene/River';
import { Effects } from './scene/Effects';
import { CartoonSky, FOG_COLOR, LIGHT_DIR } from './scene/Sky';
import { Grass, Wildflowers } from './scene/Grass';
import { Pond } from './scene/Pond';
import { AreaSign, FerrisWheel, Gate } from './scene/Structures';
import { Terrain } from './scene/Terrain';
import { Bushes, Butterflies, Trees } from './scene/Vegetation';
import { useZoo } from './store';
import { wheelRuntime } from './wheelRuntime';
import { riverCenterZ, RIVER_HALF_WIDTH } from './world';

function Countables() {
  const objects = useZoo((s) => s.objects);
  const toggle = useZoo((s) => s.toggleCandle);
  return (
    <>
      {objects
        .filter((o) => !o.deleted)
        .map((o) => {
          const n = Number(o.id.split('-')[1]);
          if (o.kind === 'frog')
            return (
              <Draggable key={o.id} obj={o} hit={[0.6, 0.75]}>
                {({ highlight }) => (
                  // quay mặt ra sông: ếch bên bờ nam (z lớn hơn tâm sông) nhìn về phía −z, bờ bắc nhìn về +z
                  <group scale={1.8} rotation-y={o.pos[2] > riverCenterZ(o.pos[0]) ? Math.PI : 0}>
                    <Outlined outline={false} highlight={highlight}>
                      <Frog seed={n} />
                    </Outlined>
                  </group>
                )}
              </Draggable>
            );
          if (o.kind === 'stork')
            return (
              <Draggable key={o.id} obj={o} hit={[0.55, 1.5]}>
                {({ flying, highlight }) => (
                  <group scale={1.4}>
                    <Outlined outline={false} highlight={highlight}>
                      <Stork flying={flying} seed={n} />
                    </Outlined>
                  </group>
                )}
              </Draggable>
            );
          return (
            <Draggable key={o.id} obj={o} hit={[0.45, 1.35]} onClick={() => toggle(o.id)}>
              {({ highlight }) => (
                // nến to (cao gần 1 m kể cả ngọn lửa), quay mặt ra sông như các bạn ếch
                <group scale={3.6} rotation-y={o.pos[2] > riverCenterZ(o.pos[0]) ? Math.PI : 0}>
                  <Outlined outline={false} highlight={highlight}>
                    <Candle lit={o.lit} seed={n} />
                  </Outlined>
                </group>
              )}
            </Draggable>
          );
        })}
    </>
  );
}

export function ZooScene() {
  const three = useThree();
  // Cho phép script kiểm thử đọc trạng thái khi chạy bản phát triển.
  if (import.meta.env.DEV) Object.assign(window, { __three: three, __boat: boatRuntime, __wheel: wheelRuntime, __zoo: useZoo, __cabinPos: cabinPos });
  const south = (x: number, d: number) => riverCenterZ(x) + RIVER_HALF_WIDTH + d;
  const north = (x: number, d: number) => riverCenterZ(x) - RIVER_HALF_WIDTH - d;
  return (
    <>
      <CartoonSky />
      <fog attach="fog" args={[FOG_COLOR, 100, 220]} />
      {/* trời xanh không nắng: ánh sáng trắng dịu đều khắp cảnh, không đổ bóng */}
      <hemisphereLight args={['#e8f5ff', '#6f9a3c', 1.6]} />
      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight position={LIGHT_DIR.clone().multiplyScalar(60).toArray()} color="#ffffff" intensity={1.6} />
      <Terrain />
      <River />
      <Grass />
      <Wildflowers />
      <Pond />
      <Trees />
      <Bushes />
      <Butterflies />
      <Gate />
      <FerrisWheel />
      <AnimalPens />
      <AreaSign at={[ZONES.frogs.x0 - 1.5, south(ZONES.frogs.x0 - 1.5, 2.6)]} text="🐸 Khu ếch" />
      <AreaSign at={[ZONES.storks.x0 - 1.8, north(ZONES.storks.x0 - 1.8, 2.4)]} text="🕊️ Khu cò" />
      <AreaSign at={[WHEEL.x + WHEEL.radius + 2.6, WHEEL.z - 2.4]} text="🎡 Vòng quay" />
      <Countables />
      <Boat />
      <Effects />
      <ZooControls />
    </>
  );
}
