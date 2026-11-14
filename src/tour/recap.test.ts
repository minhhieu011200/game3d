import { bunnyRecap } from '../games/bunny/recap';
import { initialLane, type LaneState } from '../games/bunny/logic';
import type { Level } from '../games/bunny/levels';
import { fingerRecap } from '../games/finger/recap';
import { initialState as fingerInit } from '../games/finger/logic';
import { QUESTIONS as FINGER_QS } from '../games/finger/questions';
import { flowerRecap } from '../games/flower/recap';
import { initialState as flowerInit } from '../games/flower/logic';
import { QUESTIONS as FLOWER_QS } from '../games/flower/questions';
import { zooRecap } from '../games/zoo/recap';
import { defaultRecap, type RecapData } from './recap';

const rows = (r: RecapData, col = 0) => r.columns[col].rows;
/** "9-1" khi đã xong, "9-1?" khi chưa làm. */
const eqs = (r: RecapData, col = 0) => rows(r, col).map((x) => `${x.a}-${x.b}${x.done ? '' : '?'}`);

describe('bảng mặc định (chưa chơi)', () => {
  test('Cổng 1: 8 phép 9 − 1 … 9 − 8, đều chưa làm', () => {
    expect(eqs(defaultRecap('ticket'))).toEqual(['9-1?', '9-2?', '9-3?', '9-4?', '9-5?', '9-6?', '9-7?', '9-8?']);
  });
  test('Cổng 2: 5 phép 6 − 1 … 6 − 5', () => {
    expect(eqs(defaultRecap('flower'))).toEqual(['6-1?', '6-2?', '6-3?', '6-4?', '6-5?']);
  });
  test('Bài 4: hai dòng 🐸 10 − 5 và 🕊️ 10 − 2, chưa làm', () => {
    const r = defaultRecap('pond');
    expect(eqs(r)).toEqual(['10-5?', '10-2?']);
    expect(rows(r).map((x) => x.icon)).toEqual(['🐸', '🕊️']);
  });
  test('Cổng 3: chưa có ô nào thì ghi "Chưa chơi"', () => {
    expect(defaultRecap('bunny').columns[0]).toEqual({ rows: [], note: 'Chưa chơi' });
  });
});

describe('Bài 3 và Bài 1', () => {
  test('đúng 2 câu thì 2 dòng đầu xong', () => {
    expect(eqs(fingerRecap({ ...fingerInit(), index: 2 }, FINGER_QS)).slice(0, 3)).toEqual(['9-1', '9-2', '9-3?']);
  });
  test('câu hiện tại vừa đúng thì tính là xong', () => {
    expect(eqs(fingerRecap({ ...fingerInit(), index: 1, feedback: 'correct' }, FINGER_QS)).slice(0, 3)).toEqual([
      '9-1',
      '9-2',
      '9-3?',
    ]);
    expect(eqs(flowerRecap({ ...flowerInit(), step: 3 }, FLOWER_QS)).slice(0, 2)).toEqual(['6-1', '6-2?']);
  });
  test('xong bài thì mọi dòng xong', () => {
    expect(rows(fingerRecap({ ...fingerInit(), index: 7, finished: true }, FINGER_QS)).every((x) => x.done)).toBe(true);
    const s = { ...flowerInit(), index: 4, step: 3 as const, finished: true };
    expect(rows(flowerRecap(s, FLOWER_QS)).every((x) => x.done)).toBe(true);
  });
  test('Bài 1 chưa làm câu nào thì toàn "?"', () => {
    expect(eqs(flowerRecap(flowerInit(), FLOWER_QS))).toEqual(['6-1?', '6-2?', '6-3?', '6-4?', '6-5?']);
  });
});

describe('Bài 2 (thỏ)', () => {
  const level = (target: number, ...tiles: [number, number][]): Level => ({
    target,
    tiles: tiles.map(([a, b], i) => ({ id: `t${i}`, a, b })),
  });
  const RED = level(4, [5, 1], [9, 6], [6, 3], [8, 4], [7, 2], [7, 3], [9, 5]);
  const BLUE = level(3, [6, 3], [7, 5], [5, 2], [9, 7], [8, 5], [4, 2], [10, 7]);
  /** Làn đã qua `n` ô đầu (đánh dấu đúng theo kết quả). */
  const withMarks = (lv: Level, n: number): LaneState => {
    const lane = initialLane(lv);
    lv.tiles.slice(0, n).forEach((t, i) => (lane.marks[i] = t.a - t.b === lv.target ? 'correct' : 'skipped'));
    return { ...lane, pos: n - 1 };
  };

  test('1 người: 1 cột không tiêu đề, có số mục tiêu và đủ 7 ô', () => {
    const r = bunnyRecap([RED], [withMarks(RED, 7)], 'solo');
    expect(r.columns).toHaveLength(1);
    expect(r.columns[0].title).toBeUndefined();
    expect(r.columns[0].target).toBe(4);
    expect(rows(r)).toHaveLength(7);
    expect(rows(r).every((x) => x.done)).toBe(true);
    expect(rows(r).filter((x) => x.highlight).map((x) => `${x.a}-${x.b}`)).toEqual(['5-1', '8-4', '7-3', '9-5']);
  });

  test('2 đội: 2 cột Đội Đỏ / Đội Xanh, mỗi cột số mục tiêu riêng; đội chưa về đích còn "?"', () => {
    const r = bunnyRecap([RED, BLUE], [withMarks(RED, 7), withMarks(BLUE, 3)], 'teams');
    expect(r.columns.map((c) => [c.title, c.target])).toEqual([
      ['Đội Đỏ', 4],
      ['Đội Xanh', 3],
    ]);
    expect(rows(r, 1).map((x) => x.done)).toEqual([true, true, true, false, false, false, false]);
  });

  test('vừa trả lời nhầm ở ô thứ 3: 2 ô đầu xong, ô 3 trở đi còn "?"', () => {
    const lane = { ...withMarks(RED, 2), mistakes: 1, wrongId: 't2' };
    expect(eqs(bunnyRecap([RED], [lane], 'solo')).slice(0, 4)).toEqual(['5-1', '9-6', '6-3?', '8-4?']);
  });
});

describe('Bài 4 (vườn thú)', () => {
  test('hai dòng 🐸 10 − 5 và 🕊️ 10 − 2: mỗi dòng xong khi đã bấm Đáp án của bến đó', () => {
    expect(eqs(zooRecap({ frog: false, stork: false }))).toEqual(['10-5?', '10-2?']);
    expect(eqs(zooRecap({ frog: true, stork: false }))).toEqual(['10-5', '10-2?']);
    expect(rows(zooRecap({ frog: true, stork: true })).map((x) => x.icon)).toEqual(['🐸', '🕊️']);
  });
});
