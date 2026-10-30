import { emitEffect, takeEffects } from './effects';
import { LAND, LIFT, stepSpring, type Spring } from './squash';
import { useZoo } from './store';
import { riverCenterZ, WATER_Y, FLY_Y } from './world';

vi.mock('../../audio/AudioManager', () => ({ audio: { say: vi.fn(), stop: vi.fn() }, sfx: vi.fn() }));

beforeEach(() => {
  useZoo.getState().reset();
  takeEffects();
});

test('phát hiệu ứng thì hàng đợi nhận đúng loại, vị trí; lấy ra rồi thì trống', () => {
  emitEffect('splash', [1, 2, 3]);
  emitEffect('feathers', [4, 5, 6]);
  expect(takeEffects()).toEqual([
    { kind: 'splash', pos: [1, 2, 3] },
    { kind: 'feathers', pos: [4, 5, 6] },
  ]);
  expect(takeEffects()).toEqual([]);
});

test('thả ếch xuống sông thì nước tóe tại chỗ thả', () => {
  const pos: [number, number, number] = [-20, WATER_Y, riverCenterZ(-20)];
  useZoo.getState().drop('frog-0', pos);
  expect(takeEffects()).toEqual([{ kind: 'splash', pos }]);
});

test('cò cất cánh lên trời thì lông bay ở chỗ cò vừa đứng; thả lên đất thì không có hạt', () => {
  const from = useZoo.getState().objects.find((o) => o.id === 'stork-0')!.pos;
  useZoo.getState().drop('stork-0', [5, FLY_Y, -20]);
  expect(takeEffects()).toEqual([{ kind: 'feathers', pos: from }]);
  useZoo.getState().drop('stork-1', [5, 0, 10]);
  expect(takeEffects()).toEqual([]);
});

describe('co giãn khi thả', () => {
  const run = (s: Spring, target: number, seconds: number, onStep?: (s: Spring) => void) => {
    for (let t = 0; t < seconds; t += 1 / 60) {
      s = stepSpring(s, target, 1 / 60);
      onStep?.(s);
    }
    return s;
  };

  test('chạm đất: dẹt rồi về dáng cũ trong khoảng 0,35 giây, nảy quá không quá 15%', () => {
    let maxOver = 0;
    const s = run({ x: LAND, v: 0 }, 1, 0.5, (st) => (maxOver = Math.max(maxOver, st.x - 1)));
    expect(Math.abs(s.x - 1)).toBeLessThan(0.02);
    expect(maxOver).toBeLessThan(0.15 * (1 - LAND));
  });

  test('nhấc lên thì kéo dài tới LIFT; khung hình chậm vẫn ổn định', () => {
    expect(run({ x: 1, v: 0 }, LIFT, 0.6).x).toBeCloseTo(LIFT, 2);
    let s: Spring = { x: LAND, v: 0 };
    for (let i = 0; i < 20; i++) s = stepSpring(s, 1, 0.1);
    expect(s.x).toBeCloseTo(1, 2);
  });
});
