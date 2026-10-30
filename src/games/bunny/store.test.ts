import type { Level } from './levels';
import { initialRace, requiredCount } from './logic';
import { useBunny } from './store';

const say = vi.hoisted(() => vi.fn());
vi.mock('../../audio/AudioManager', () => ({ audio: { say, stop: vi.fn() }, sfx: vi.fn() }));

// Làn Đỏ: 5−1 (đúng), 6−3 (sai). Làn Xanh: 7−3 (đúng), 9−5 (đúng).
const LEVELS: Level[] = [
  { target: 4, tiles: [{ id: 't0', a: 5, b: 1 }, { id: 't1', a: 6, b: 3 }] },
  { target: 4, tiles: [{ id: 't0', a: 7, b: 3 }, { id: 't1', a: 9, b: 5 }] },
];

/** Đặt màn hai đội cố định để biết trước đáp án. */
function fixedTeams() {
  useBunny.setState({ ...initialRace(LEVELS, 'teams'), levels: LEVELS, targets: [4, 4], startedAt: 0, times: [null, null] });
  say.mockClear();
}

const keys = () => say.mock.calls.map((c) => c[0]);

beforeEach(() => {
  useBunny.setState({ targets: [4, 4] });
  useBunny.getState().setMode('solo');
  say.mockClear();
});

describe('chế độ chơi', () => {
  test('vào bài lần đầu là chơi một mình, một làn', () => {
    const s = useBunny.getState();
    expect(s.mode).toBe('solo');
    expect(s.levels).toHaveLength(1);
    expect(s.lanes).toHaveLength(1);
  });

  test('Chuyển sang 2 đội: hai làn, cả hai thỏ cùng ở vạch xuất phát', () => {
    useBunny.getState().setMode('teams');
    const s = useBunny.getState();
    expect(s.mode).toBe('teams');
    expect(s.levels).toHaveLength(2);
    expect(s.lanes.map((l) => [l.pos, l.phase])).toEqual([
      [-1, 'idle'],
      [-1, 'idle'],
    ]);
    expect(keys()).toEqual(['b2.intro.4']);
  });

  test('mỗi đội chọn số riêng: cả hai cùng xuất phát lại, mỗi làn theo số của đội mình', () => {
    useBunny.getState().setMode('teams');
    fixedTeams();
    useBunny.getState().answer(0, true);
    useBunny.getState().landed(0);
    useBunny.getState().setTarget(1, 6);
    const s = useBunny.getState();
    expect(s.mode).toBe('teams');
    expect(s.targets).toEqual([4, 6]);
    expect(s.levels.map((lv) => lv.target)).toEqual([4, 6]);
    expect(s.lanes.map((l) => l.pos)).toEqual([-1, -1]);
    expect(s.times).toEqual([null, null]);
    // khác số thì không đọc đề chung
    expect(keys()).not.toContain('b2.intro.4');
  });

  test('Chơi lại: cùng chế độ, cùng mục tiêu, điểm về 0', () => {
    useBunny.getState().setTarget(0, 5);
    useBunny.getState().answer(0, true);
    useBunny.getState().landed(0);
    useBunny.getState().restart();
    const s = useBunny.getState();
    expect(s.mode).toBe('solo');
    expect(s.targets[0]).toBe(5);
    expect(s.levels[0].target).toBe(5);
    expect(s.lanes[0]).toMatchObject({ pos: -1, carrots: 0 });
    expect(s.lanes[0].marks.every((m) => m === 'unknown')).toBe(true);
    expect(requiredCount(s.levels[0])).toBeGreaterThan(0);
  });
});

describe('hai đội đua cùng lúc', () => {
  test('hai đội trả lời liền nhau, cả hai thỏ cùng nhảy', () => {
    fixedTeams();
    useBunny.getState().answer(0, true);
    useBunny.getState().answer(1, true);
    expect(useBunny.getState().lanes.map((l) => l.pos)).toEqual([0, 0]);
  });

  test('đội về nhất thì đọc tên đội, ghi thời gian; đội kia vẫn chơi tiếp', () => {
    fixedTeams();
    const { answer, landed } = useBunny.getState();
    answer(0, false); // Đỏ nhầm
    landed(0);
    answer(1, true); // Xanh 7−3
    landed(1);
    answer(1, true); // Xanh 9−5, ô cuối
    landed(1); // vào hàng rào
    say.mockClear();
    landed(1);
    const s = useBunny.getState();
    expect(s.winner).toBe(1);
    expect(keys()).toEqual(['b2.win.blue']);
    expect(s.times[1]).not.toBeNull();
    expect(s.times[0]).toBeNull();
    answer(0, true); // Đỏ vẫn chơi: 5−1
    expect(useBunny.getState().lanes[0].pos).toBe(0);
  });
});
