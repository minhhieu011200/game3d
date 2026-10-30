import { INITIAL_PER_KIND, type ZooObject } from './logic';
import { groundHeight, riverCenterZ, RIVER_HALF_WIDTH } from './world';

// Mọi khu nằm sát hai bờ sông để ngồi trên thuyền vẫn nhìn thấy và kéo thả được.
// Bờ nam là phía z lớn hơn tâm sông (+), bờ bắc là phía z nhỏ hơn (−).

/** Mép nước + chừng này là chỗ đứng trên bờ. */
const ON_BANK = RIVER_HALF_WIDTH + 2.2;

/**
 * Khoảng x của từng khu dọc sông, theo thứ tự thuyền đi qua (cũng là thứ tự nhiệm vụ):
 * cổng → ếch → cò → chuồng thú → vòng quay nến ở cuối sông.
 */
export const ZONES = {
  gate: -35,
  frogs: { x0: -27, x1: -14 },
  storks: { x0: -8, x1: 4 },
  animals: { x0: 9, x1: 31 },
  candles: 37,
};

const wheelX = ZONES.candles;
/**
 * Vòng quay nến ở bờ nam, mặt song song với dòng sông (nhìn từ thuyền thấy thẳng mặt).
 * Cabin treo luôn thẳng đứng; `hang` là khoảng từ chốt treo trên vành xuống sàn cabin.
 */
export const WHEEL = {
  x: wheelX,
  z: riverCenterZ(wheelX) + RIVER_HALF_WIDTH + 3.2,
  hubY: 5.8,
  radius: 3.6,
  hang: 1.75,
  // bằng INITIAL_PER_KIND; viết số trực tiếp vì logic.ts cũng import file này
  slots: 10,
};
/** Cabin treo nhô ra trước mặt vòng quay (về phía sông) chừng này mét, để vành trước không che nến. */
export const CABIN_FRONT = 1.0;

const SLOT_STEP = (Math.PI * 2) / WHEEL.slots;
/** Góc của cabin 0 (cabin ngôi sao) khi vòng ở góc "nhà": thấp nhất, lệch nửa ô về bên trái khi nhìn từ sông (phía +x). */
const HOME_THETA = -Math.PI / 2 + SLOT_STEP / 2;

/** Chốt treo của cabin `slot` trên vành khi vòng quay đã quay góc `angle`. */
export function cabinPivot(slot: number, angle: number): [number, number, number] {
  const t = HOME_THETA + slot * SLOT_STEP + angle;
  return [WHEEL.x + WHEEL.radius * Math.cos(t), WHEEL.hubY + WHEEL.radius * Math.sin(t), WHEEL.z - CABIN_FRONT];
}

/** Tâm sàn cabin `slot` (chỗ đặt nến) khi vòng quay đã quay góc `angle`. */
export function cabinPos(slot: number, angle: number): [number, number, number] {
  const [x, y, z] = cabinPivot(slot, angle);
  return [x, y - WHEEL.hang, z];
}

/** Hộp bao vòng quay trên mặt đất (để không trồng cây chồng lên). */
export function nearWheel(x: number, z: number, pad = 0) {
  return Math.abs(x - WHEEL.x) < WHEEL.radius + 1.5 + pad && Math.abs(z - WHEEL.z) < 4 + pad;
}

/** Trạng thái ban đầu: 10 ếch trên bờ nam, 10 cò trên bờ bắc, 10 nến đang cháy, mỗi cabin vòng quay một ngọn. */
export function initialObjects(): ZooObject[] {
  const out: ZooObject[] = [];
  const { frogs, storks } = ZONES;
  for (let i = 0; i < INITIAL_PER_KIND; i++) {
    const x = frogs.x0 + (i * (frogs.x1 - frogs.x0)) / (INITIAL_PER_KIND - 1);
    const z = riverCenterZ(x) + ON_BANK - 0.6 + (i % 3) * 0.6;
    out.push({ id: `frog-${i}`, kind: 'frog', zone: 'ground', pos: [x, groundHeight(x, z), z], deleted: false, lit: true });
  }
  for (let i = 0; i < INITIAL_PER_KIND; i++) {
    const row = Math.floor(i / 5);
    const x = storks.x0 + (i % 5) * 2.4 + row * 1.2;
    const z = riverCenterZ(x) - ON_BANK - row * 2.2;
    out.push({ id: `stork-${i}`, kind: 'stork', zone: 'ground', pos: [x, groundHeight(x, z), z], deleted: false, lit: true });
  }
  for (let i = 0; i < INITIAL_PER_KIND; i++) {
    out.push({ id: `candle-${i}`, kind: 'candle', zone: 'wheel', slot: i, pos: cabinPos(i, 0), deleted: false, lit: true });
  }
  return out;
}
