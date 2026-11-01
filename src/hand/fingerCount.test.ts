import { countFingers, countHand } from './fingerCount';
import { makeHand, POSES } from './testHands';

describe('đếm ngón trên một bàn tay', () => {
  test.each([0, 1, 2, 3, 4, 5])('tay phải giơ %i ngón', (n) => {
    expect(countHand(makeHand(POSES[n]))).toBe(n);
  });

  test.each([0, 1, 2, 3, 4, 5])('tay trái giơ %i ngón', (n) => {
    expect(countHand(makeHand({ ...POSES[n], mirror: true }))).toBe(n);
  });

  test.each([-30, 25])('tay nghiêng %i độ vẫn đếm đúng', (tiltDeg) => {
    expect(countHand(makeHand({ ...POSES[3], tiltDeg }))).toBe(3);
    expect(countHand(makeHand({ ...POSES[5], tiltDeg }))).toBe(5);
  });

  test('chỉ giơ ngón cái là 1', () => {
    expect(countHand(makeHand({ thumb: true }))).toBe(1);
  });

  test('ngón trỏ + ngón út là 2', () => {
    expect(countHand(makeHand({ index: true, pinky: true }))).toBe(2);
  });
});

describe('ngón tay chĩa thẳng vào camera', () => {
  const pitches = [60, 75, 85];
  const depths = [1, 0.5, 0.3];
  const cases = pitches.flatMap((pitchDeg) => depths.map((depthScale) => ({ pitchDeg, depthScale })));

  test.each(cases)('3 ngón, ngón cái đè lên ngón út vẫn là 3 ($pitchDeg độ, độ sâu x$depthScale)', (view) => {
    expect(countHand(makeHand({ ...POSES[3], thumbTucked: true, ...view }))).toBe(3);
    expect(countHand(makeHand({ ...POSES[3], thumbTucked: true, mirror: true, ...view }))).toBe(3);
  });

  test.each(cases)('các số khác vẫn đúng ($pitchDeg độ, độ sâu x$depthScale)', (view) => {
    for (const n of [1, 2, 3, 4, 5]) expect(countHand(makeHand({ ...POSES[n], ...view }))).toBe(n);
  });
});

describe('đếm trên hai bàn tay', () => {
  test('5 + 2 = 7', () => {
    expect(countFingers([makeHand(POSES[5]), makeHand({ ...POSES[2], mirror: true })])).toBe(7);
  });

  test('5 + 5 = 10', () => {
    expect(countFingers([makeHand(POSES[5]), makeHand({ ...POSES[5], mirror: true })])).toBe(10);
  });

  test('không có tay thì là null, không phải 0', () => {
    expect(countFingers([])).toBeNull();
  });

  test('nắm tay vẫn là 0', () => {
    expect(countFingers([makeHand(POSES[0])])).toBe(0);
  });
});
