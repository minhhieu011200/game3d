import { SPIN, stepWheel, type WheelState } from './wheelRuntime';

const run = (s: WheelState, hold: boolean, seconds: number, onStep?: (s: WheelState) => void) => {
  for (let t = 0; t < seconds; t += 1 / 30) {
    s = stepWheel(s, 1 / 30, hold);
    onStep?.(s);
  }
  return s;
};

test.each([0.3 * Math.PI, 1.7 * Math.PI, 0.9 * Math.PI])('đang quay ở góc %f: dừng về góc "nhà" trong 4 giây', (a0) => {
  const s = run({ angle: a0, speed: SPIN }, true, 4);
  expect(Math.abs(Math.atan2(Math.sin(s.angle), Math.cos(s.angle)))).toBeLessThan(0.01);
  expect(Math.abs(s.speed)).toBeLessThan(0.02);
});

test('về nhà theo chiều ngắn hơn và không vượt quá đà', () => {
  // ở 1,7π thì gần góc 2π hơn: phải đi tiếp tới, không quay lùi gần 2 vòng
  const ahead = 1.7 * Math.PI;
  run({ angle: ahead, speed: 0 }, true, 4, (s) => {
    // góc đã được đưa về quanh 0 sau khi tới nhà; trước đó thì nằm trong [1,7π, 2π]
    const a = s.angle > Math.PI ? s.angle - Math.PI * 2 : s.angle;
    expect(a).toBeGreaterThanOrEqual(-0.3 * Math.PI - 1e-6);
    expect(a).toBeLessThanOrEqual(1e-6);
  });
  const behind = 0.3 * Math.PI;
  run({ angle: behind, speed: 0 }, true, 4, (s) => {
    expect(s.angle).toBeLessThanOrEqual(behind + 1e-6);
    expect(s.angle).toBeGreaterThanOrEqual(-1e-6);
  });
});

test('đứng yên ở nhà thì giữ nguyên', () => {
  const s = run({ angle: 0, speed: 0 }, true, 2);
  expect(s).toEqual({ angle: 0, speed: 0 });
});

test('hết giữ thì tăng tốc dần lại tới tốc độ quay chậm', () => {
  const s = run({ angle: 0, speed: 0 }, false, 8);
  expect(s.speed).toBeCloseTo(SPIN, 3);
  expect(s.angle).toBeGreaterThan(0);
});
