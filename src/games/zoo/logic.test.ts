import { cabinPos, initialObjects, WHEEL } from './layout';
import {
  attachToSlot,
  countKind,
  countLine,
  deleteObject,
  equationFor,
  formatEquation,
  freeSlots,
  moveObject,
  nearestFreeSlot,
  toggleCandle,
  zoneAt,
  type ZooObject,
} from './logic';
import { chooseAnswer, initialStudent, onSceneChange, TASKS, type StudentState } from './tasks';
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

test('ban đầu: 10 ếch trên bờ, 10 cò trên đất, 10 nến đang cháy', () => {
  const o = initialObjects();
  expect(countKind(o, 'frog')).toMatchObject({ total: 10, stay: 10, away: 0 });
  expect(countKind(o, 'stork')).toMatchObject({ total: 10, stay: 10, away: 0 });
  expect(countKind(o, 'candle')).toMatchObject({ total: 10, stay: 10, away: 0 });
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

describe('vòng quay nến', () => {
  test('10 cabin cách đều nhau, cabin thấp nhất vẫn ở trên mặt đất', () => {
    const ps = Array.from({ length: WHEEL.slots }, (_, i) => cabinPos(i, 0));
    for (let i = 0; i < ps.length; i++) {
      const a = ps[i];
      const b = ps[(i + 1) % ps.length];
      expect(Math.hypot(a[0] - b[0], a[1] - b[1])).toBeCloseTo((2 * Math.PI * WHEEL.radius) / WHEEL.slots, 1);
      expect(a[1]).toBeGreaterThan(groundHeight(a[0], a[2]) + 0.3);
    }
  });

  test('quay trọn 1 vòng thì cabin về đúng chỗ cũ; cabin ngôi sao thấp nhất và lệch về phía +x', () => {
    for (let i = 0; i < WHEEL.slots; i++) {
      const a = cabinPos(i, 0);
      const b = cabinPos(i, Math.PI * 2);
      a.forEach((v, k) => expect(b[k]).toBeCloseTo(v, 6));
    }
    const star = cabinPos(0, 0);
    const lowest = Math.min(...Array.from({ length: WHEEL.slots }, (_, i) => cabinPos(i, 0)[1]));
    expect(star[1]).toBeCloseTo(lowest, 6);
    expect(star[0]).toBeGreaterThan(WHEEL.x);
  });

  test('ban đầu: mỗi cabin đúng 1 nến đang cháy', () => {
    const c = initialObjects().filter((o) => o.kind === 'candle');
    expect(c.every((o) => o.zone === 'wheel' && o.lit)).toBe(true);
    expect(new Set(c.map((o) => o.slot))).toEqual(new Set(Array.from({ length: 10 }, (_, i) => i)));
    expect(freeSlots(initialObjects())).toEqual([]);
  });

  test('kéo nến ra đất thì cabin trống; thả gần cabin trống thì gắn lại', () => {
    let o = moveObject(initialObjects(), 'candle-3', [0, groundHeight(0, 10), 10], 'ground');
    expect(o.find((x) => x.id === 'candle-3')!.slot).toBeUndefined();
    expect(freeSlots(o)).toEqual([3]);
    expect(countKind(o, 'candle')).toMatchObject({ total: 10, stay: 10 });
    const near = cabinPos(3, 0.4);
    const slot = nearestFreeSlot(o, [near[0] + 0.3, near[1] + 0.6, near[2]], 0.4);
    expect(slot).toBe(3);
    o = attachToSlot(o, 'candle-3', slot!);
    expect(o.find((x) => x.id === 'candle-3')).toMatchObject({ zone: 'wheel', slot: 3 });
    expect(freeSlots(o)).toEqual([]);
  });

  test('cabin đã có nến thì không nhận; ở xa mọi cabin trống thì không gắn', () => {
    const o = moveObject(initialObjects(), 'candle-3', [0, groundHeight(0, 10), 10], 'ground');
    const full = cabinPos(7, 0);
    expect(nearestFreeSlot(o, [full[0], full[1] + 0.5, full[2]], 0)).toBeNull();
  });

  test('đang kéo nến khỏi cabin của nó: cabin đó được coi là trống', () => {
    const p = cabinPos(4, 0);
    expect(nearestFreeSlot(initialObjects(), [p[0], p[1] + 0.5, p[2]], 0, 1.2, 'candle-4')).toBe(4);
  });
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

test('tắt 3 ngọn nến: 7 đang cháy, 3 đã tắt; bấm lại thì cháy lại', () => {
  let o = initialObjects();
  for (const id of ids(o, 'candle').slice(0, 3)) o = toggleCandle(o, id);
  expect(countKind(o, 'candle')).toMatchObject({ stay: 7, away: 3 });
  expect(countLine('candle', countKind(o, 'candle'))).toBe('Đang cháy: 7 · Đã tắt: 3 · Tất cả: 10');
  o = toggleCandle(o, 'candle-0');
  expect(countKind(o, 'candle').away).toBe(2);
});

test('đặt lại cảnh: về đủ 10 mỗi loại', () => {
  expect(initialObjects()).toEqual(initialObjects());
});

describe('chế độ học sinh', () => {
  test('nhiệm vụ ếch: kéo đúng 2 con thì hỏi và có lựa chọn 10 − 2 = 8', () => {
    let s = initialStudent();
    expect(TASKS[0].prompt).toBe('Hãy cho 2 bạn ếch nhảy xuống sông');
    const o = frogsToRiver(initialObjects(), 2);
    s = onSceneChange(s, o);
    expect(s.phase).toBe('question');
    expect(s.choices).toHaveLength(3);
    expect(s.choices).toContain('10 − 2 = 8');
  });

  test('chọn sai thì cho chọn lại; chọn đúng thì sang nhiệm vụ kế', () => {
    const o = frogsToRiver(initialObjects(), 2);
    let s = onSceneChange(initialStudent(), o);
    const wrong = s.choices.find((c) => c !== '10 − 2 = 8')!;
    let r = chooseAnswer(s, o, wrong);
    expect(r.correct).toBe(false);
    expect(r.state.phase).toBe('question');
    s = r.state;
    r = chooseAnswer(s, o, '10 − 2 = 8');
    expect(r.correct).toBe(true);
    expect(r.state.taskIndex).toBe(1);
    expect(r.state.phase).toBe('doing');
  });

  test('làm thừa: kéo 3 ếch thì chưa hỏi, kéo bớt 1 thì mới hỏi', () => {
    let o = frogsToRiver(initialObjects(), 3);
    let s: StudentState = onSceneChange(initialStudent(), o);
    expect(s.phase).toBe('doing');
    o = moveObject(o, ids(o, 'frog')[2], [0, groundHeight(0, 10), 10], 'ground');
    s = onSceneChange(s, o);
    expect(s.phase).toBe('question');
  });

  test('làm hết 3 nhiệm vụ ếch, cò, nến thì hoàn thành', () => {
    let o = initialObjects();
    let s = initialStudent();
    o = frogsToRiver(o, 2);
    s = onSceneChange(s, o);
    s = chooseAnswer(s, o, '10 − 2 = 8').state;
    for (const id of ids(o, 'stork').slice(0, 5)) o = moveObject(o, id, [10, FLY_Y, 10], 'sky');
    s = onSceneChange(s, o);
    s = chooseAnswer(s, o, '10 − 5 = 5').state;
    for (const id of ids(o, 'candle').slice(0, 3)) o = toggleCandle(o, id);
    s = onSceneChange(s, o);
    const r = chooseAnswer(s, o, '10 − 3 = 7');
    expect(r.correct).toBe(true);
    expect(r.state.phase).toBe('done');
  });
});
