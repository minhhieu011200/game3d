import { cabinPos, initialObjects } from './layout';
import {
  countKind,
  countLine,
  deleteObject,
  equationFor,
  formatEquation,
  moveObject,
  zoneAt,
  type ZooObject,
} from './logic';
import { FLY_Y, groundHeight, intersectSurface, isInRiver, riverCenterZ, SKY_Y, WATER_Y } from './world';

const ids = (objs: ZooObject[], kind: string) => objs.filter((o) => o.kind === kind).map((o) => o.id);
const riverPos = (x: number): [number, number, number] => [x, WATER_Y, riverCenterZ(x)];

function frogsToRiver(objs: ZooObject[], n: number) {
  ids(objs, 'frog')
    .slice(0, n)
    .forEach((id, i) => (objs = moveObject(objs, id, riverPos(-10 + i), 'river')));
  return objs;
}

test('tia nhìn xuống chạm đất, tia nhìn lên trời thì không chạm', () => {
  const hit = intersectSurface({ x: 0, y: 10, z: 20 }, { x: 0, y: -1, z: 0 });
  expect(hit).not.toBeNull();
  expect(hit![1]).toBeCloseTo(groundHeight(0, 20), 2);
  expect(intersectSurface({ x: 0, y: 2, z: 20 }, { x: 0, y: 0.5, z: -0.866 })).toBeNull();
  const water = intersectSurface({ x: 0, y: 10, z: riverCenterZ(0) }, { x: 0, y: -1, z: 0 });
  expect(water![1]).toBeCloseTo(WATER_Y, 5);
});

test('ban đầu: 10 ếch trên bờ, 10 cò trên đất, không còn nến (bến trứng thay vòng quay)', () => {
  const o = initialObjects();
  expect(countKind(o, 'frog')).toMatchObject({ total: 10, stay: 10, away: 0 });
  expect(countKind(o, 'stork')).toMatchObject({ total: 10, stay: 10, away: 0 });
  expect(countKind(o, 'candle').total).toBe(0);
  // ếch ban đầu đứng trên bờ, không nằm trong sông
  for (const f of o.filter((x) => x.kind === 'frog')) expect(isInRiver(f.pos[0], f.pos[2])).toBe(false);
});

test('vùng thả: trên trời, dưới sông, trên đất', () => {
  expect(zoneAt('stork', [10, FLY_Y, 10])).toBe('sky');
  expect(zoneAt('frog', riverPos(0))).toBe('river');
  expect(zoneAt('frog', [0, groundHeight(0, 10), 10])).toBe('ground');
  expect(zoneAt('candle', [0, 0.8, 0], true)).toBe('wheel');
});

test('nến ở cabin đỉnh vòng quay vẫn là "trên vòng quay", không phải trên trời', () => {
  const top = cabinPos(5, 0);
  expect(top[1]).toBeGreaterThan(SKY_Y);
  expect(zoneAt('candle', top, true)).toBe('wheel');
});

test('ếch thả xuống sông: trên bờ giảm 1, dưới sông tăng 1', () => {
  const o = frogsToRiver(initialObjects(), 1);
  expect(countKind(o, 'frog')).toMatchObject({ stay: 9, away: 1, total: 10 });
});

test('kéo ếch từ sông lên bờ thì đếm lại vào trên bờ', () => {
  let o = frogsToRiver(initialObjects(), 1);
  const id = ids(o, 'frog')[0];
  o = moveObject(o, id, [0, groundHeight(0, 10), 10], 'ground');
  expect(countKind(o, 'frog').stay).toBe(10);
});

test('2 ếch dưới sông: bảng đếm và phép tính 10 − 2 = 8', () => {
  const c = countKind(frogsToRiver(initialObjects(), 2), 'frog');
  expect(countLine('frog', c)).toBe('Trên bờ: 8 · Dưới sông: 2 · Tất cả: 10');
  expect(formatEquation(equationFor(c))).toBe('10 − 2 = 8');
});

test('cò kéo lên trời thì được đếm là bay đi', () => {
  let o = initialObjects();
  o = moveObject(o, ids(o, 'stork')[0], [10, FLY_Y, 10], 'sky');
  expect(countKind(o, 'stork')).toMatchObject({ stay: 9, away: 1 });
});

test('xóa một con ếch thì tổng giảm 1', () => {
  const o = deleteObject(initialObjects(), 'frog-3');
  expect(countKind(o, 'frog').total).toBe(9);
});

test('đặt lại cảnh: về đủ 10 mỗi loại', () => {
  expect(initialObjects()).toEqual(initialObjects());
});

