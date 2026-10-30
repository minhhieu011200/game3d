import { autopilot, boatAt, DOCKS, MAX_SPEED, stepBoat, type BoatState } from './boat';
import { initialObjects, WHEEL } from './layout';
import { BOAT_X_RANGE, isInRiver, riverCenterZ, riverHeading, RIVER_HALF_WIDTH } from './world';

const NONE = { forward: false, back: false, left: false, right: false };
const run = (b: BoatState, input: typeof NONE, seconds: number) => {
  for (let t = 0; t < seconds; t += 1 / 30) b = stepBoat(b, input, 1 / 30);
  return b;
};

test('bấm tiến: thuyền tăng tốc nhưng không vượt tốc độ tối đa', () => {
  const b = run(boatAt(-20), { ...NONE, forward: true }, 6);
  expect(b.speed).toBeGreaterThan(3);
  expect(b.speed).toBeLessThanOrEqual(MAX_SPEED);
  expect(b.x).toBeGreaterThan(-20);
});

test('thả tay: thuyền chậm dần rồi dừng', () => {
  let b = run(boatAt(-20), { ...NONE, forward: true }, 3);
  b = run(b, NONE, 6);
  expect(Math.abs(b.speed)).toBeLessThan(0.1);
});

test('chạm bờ không bị kẹt: thuyền tự xoay theo dòng và đi tiếp', () => {
  // mũi chĩa chéo vào bờ, hơi xuôi dòng
  const b = run({ ...boatAt(-20), heading: 0.5 }, { ...NONE, forward: true }, 8);
  expect(b.x).toBeGreaterThan(-10);
  expect(isInRiver(b.x, b.z)).toBe(true);
});

test('lái đâm vào bờ: thuyền vẫn ở trên mặt nước', () => {
  const b = run(boatAt(0), { ...NONE, forward: true, left: true }, 20);
  expect(isInRiver(b.x, b.z)).toBe(true);
  expect(Math.abs(b.z - riverCenterZ(b.x))).toBeLessThan(RIVER_HALF_WIDTH);
});

test('chạy mãi về một đầu: dừng ở cuối sông', () => {
  const b = run(boatAt(30), { ...NONE, forward: true }, 30);
  expect(b.x).toBeLessThanOrEqual(BOAT_X_RANGE[1]);
});

test.each(DOCKS.map((d) => [d.id, d.x]))('tự chạy tới %s rồi dừng', (_, x) => {
  let b = boatAt(-30);
  let arrived = false;
  for (let i = 0; i < 30 * 60 && !arrived; i++) ({ boat: b, arrived } = autopilot(b, x as number, 1 / 30));
  expect(arrived).toBe(true);
  expect(Math.abs(b.x - (x as number))).toBeLessThan(0.5);
  expect(isInRiver(b.x, b.z)).toBe(true);
});

test('tự chạy xuôi dòng tới bến: mũi thuyền vẫn hướng xuôi dòng khi dừng', () => {
  let b = boatAt(-39);
  let arrived = false;
  for (let i = 0; i < 30 * 60 && !arrived; i++) ({ boat: b, arrived } = autopilot(b, -20.5, 1 / 30));
  expect(Math.cos(b.heading - riverHeading(b.x))).toBeGreaterThan(0.9);
});

test('các khu đều ở sát bờ: từ giữa dòng nhìn ra không quá 14 m', () => {
  const near = (x: number, z: number) => Math.abs(z - riverCenterZ(x)) < 14;
  for (const o of initialObjects()) expect(near(o.pos[0], o.pos[2])).toBe(true);
  expect(near(WHEEL.x, WHEEL.z)).toBe(true);
});
