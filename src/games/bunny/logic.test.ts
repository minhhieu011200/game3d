import { correctCount, generateLevel, generateRace, TARGETS, type Level } from './levels';
import { allArrived, answer, initialRace, landed, nextIndex, requiredCount, result, validateLevel, type RaceState } from './logic';

// Màn cố định để test (mục tiêu 4): ô 0 đúng, ô 1 sai, ô 2 đúng.
const RED: Level = {
  target: 4,
  tiles: [
    { id: 't0', a: 5, b: 1 },
    { id: 't1', a: 6, b: 3 },
    { id: 't2', a: 8, b: 4 },
  ],
};
// Làn Đội Xanh: ô 0 đúng, ô 1 đúng, ô 2 sai.
const BLUE: Level = {
  target: 4,
  tiles: [
    { id: 't0', a: 7, b: 3 },
    { id: 't1', a: 9, b: 5 },
    { id: 't2', a: 9, b: 6 },
  ],
};
const SOLO = [RED];
const TEAMS = [RED, BLUE];

/** Trả lời rồi cho hoạt ảnh nhảy của làn đó kết thúc. */
function step(s: RaceState, levels: Level[], lane: number, saysEqual: boolean) {
  const r = answer(s, levels, lane, saysEqual);
  return r.event === 'ignored' ? s : landed(r.state, levels, lane);
}

describe('bộ sinh phép tính', () => {
  test.each(TARGETS)('mục tiêu %i: 7 ô, đúng phạm vi 10, ô đầu đúng', (target) => {
    for (let seed = 1; seed <= 40; seed++) {
      const lv = generateLevel(target, seed);
      expect(lv.tiles).toHaveLength(7);
      expect(() => validateLevel(lv)).not.toThrow();
      expect(requiredCount(lv)).toBe(correctCount(target));
      const ok = lv.tiles.map((t) => result(t.a, t.b) === target);
      expect(ok[0]).toBe(true);
      // đủ 4 ô đúng thì không bao giờ có 3 ô sai liền nhau
      if (correctCount(target) === 4) for (let i = 2; i < ok.length; i++) expect(ok[i] || ok[i - 1] || ok[i - 2]).toBe(true);
      for (const t of lv.tiles) {
        expect(t.b).toBeGreaterThanOrEqual(1);
        expect(t.a).toBeLessThanOrEqual(10);
        if (result(t.a, t.b) !== target) expect(Math.abs(result(t.a, t.b) - target)).toBeLessThanOrEqual(2);
      }
    }
  });

  test.each([2, 4, 6, 7, 8])('mục tiêu %i: các phép đúng không lặp lại', (target) => {
    for (let seed = 1; seed <= 40; seed++) {
      const lv = generateLevel(target, seed);
      const right = lv.tiles.filter((t) => result(t.a, t.b) === target).map((t) => `${t.a}-${t.b}`);
      expect(new Set(right).size).toBe(right.length);
    }
  });

  test('số ô đúng theo mục tiêu', () => {
    expect([2, 4, 6, 7, 8, 9].map(correctCount)).toEqual([4, 4, 4, 3, 2, 2]);
  });

  test('cùng seed thì cùng màn, khác seed thì thường khác', () => {
    expect(generateLevel(4, 3)).toEqual(generateLevel(4, 3));
    expect(generateLevel(4, 3)).not.toEqual(generateLevel(4, 4));
  });
});

describe('hai làn của màn hai đội', () => {
  test.each(TARGETS)('mục tiêu %i: cân bằng nhưng khác nhau', (target) => {
    const seq = (lv: Level) => lv.tiles.map((t) => `${t.a}-${t.b}`).join(',');
    for (let seed = 1; seed <= 40; seed++) {
      const [a, b] = generateRace([target, target], seed);
      expect(a.target).toBe(target);
      expect(b.target).toBe(target);
      expect(b.tiles).toHaveLength(a.tiles.length);
      expect(requiredCount(b)).toBe(requiredCount(a));
      expect(seq(a)).not.toBe(seq(b));
    }
  });

  test('chơi một mình chỉ có một làn', () => {
    expect(generateRace([4], 1)).toHaveLength(1);
  });

  test('hai đội chọn số khác nhau: mỗi làn theo số của đội mình', () => {
    const [a, b] = generateRace([4, 7], 3);
    expect(a.target).toBe(4);
    expect(b.target).toBe(7);
    expect(() => [a, b].forEach(validateLevel)).not.toThrow();
  });
});

describe('trả lời Đúng / Sai (một mình)', () => {
  test('ban đầu chỉ ô đầu tiên được hỏi', () => {
    expect(nextIndex(initialRace(SOLO, 'solo').lanes[0])).toBe(0);
  });

  test('Chọn 8−4: bấm Đúng ở ô bằng mục tiêu thì nhảy lên, được cà rốt', () => {
    let s = step(initialRace(SOLO, 'solo'), SOLO, 0, true);
    s = step(s, SOLO, 0, false);
    const r = answer(s, SOLO, 0, true);
    expect(r.event).toBe('correct');
    expect(r.state.lanes[0].phase).toBe('hopping');
    expect(r.state.lanes[0].pos).toBe(2);
    expect(r.state.lanes[0].marks[2]).toBe('correct');
    expect(r.state.lanes[0].carrots).toBe(2);
  });

  test('Bấm Sai ở ô 6−3: nhảy lên, đánh dấu đã qua, cà rốt không đổi', () => {
    const s = step(initialRace(SOLO, 'solo'), SOLO, 0, true);
    const r = answer(s, SOLO, 0, false);
    expect(r.event).toBe('skipped');
    expect(r.state.lanes[0].pos).toBe(1);
    expect(r.state.lanes[0].marks[1]).toBe('skipped');
    expect(r.state.lanes[0].carrots).toBe(1);
  });

  test('Chọn 6−3 sau khi đã tìm: bấm Đúng ở ô khác mục tiêu thì về vạch xuất phát', () => {
    const s = step(initialRace(SOLO, 'solo'), SOLO, 0, true);
    const r = answer(s, SOLO, 0, true);
    expect(r.event).toBe('wrong');
    const lane = r.state.lanes[0];
    expect(lane.phase).toBe('returning');
    expect(lane.wrongId).toBe('t1');
    expect(lane.pos).toBe(-1);
    expect(lane.carrots).toBe(0);
    expect(lane.marks).toEqual(['unknown', 'unknown', 'unknown']);
    expect(lane.mistakes).toBe(1);
  });

  test('Bấm Sai ở ô bằng mục tiêu cũng là nhầm', () => {
    const r = answer(initialRace(SOLO, 'solo'), SOLO, 0, false);
    expect(r.event).toBe('wrong');
    expect(r.state.lanes[0].wrongId).toBe('t0');
  });

  test('Chọn đúng sau khi sai: thỏ đi lại từ ô đầu', () => {
    const s = step(initialRace(SOLO, 'solo'), SOLO, 0, false);
    expect(s.lanes[0].phase).toBe('idle');
    expect(s.lanes[0].wrongId).toBeNull();
    const r = answer(s, SOLO, 0, true);
    expect(r.event).toBe('correct');
    expect(r.state.lanes[0].pos).toBe(0);
    expect(landed(r.state, SOLO, 0).lanes[0].mistakes).toBe(1);
  });

  test('Bấm liên tục: đang nhảy thì bỏ qua mọi thao tác của làn đó', () => {
    const first = answer(initialRace(SOLO, 'solo'), SOLO, 0, true);
    expect(answer(first.state, SOLO, 0, false).event).toBe('ignored');
    expect(answer(first.state, SOLO, 0, true).event).toBe('ignored');
  });

  test('Tìm đủ ô: đi hết làn thì vào hàng rào cà rốt rồi kết thúc', () => {
    let s = step(initialRace(SOLO, 'solo'), SOLO, 0, true);
    s = step(s, SOLO, 0, false);
    s = step(s, SOLO, 0, true);
    expect(s.lanes[0].phase).toBe('toGarden');
    expect(s.lanes[0].pos).toBe(3);
    expect(s.winner).toBeNull();
    s = landed(s, SOLO, 0);
    expect(s.lanes[0].phase).toBe('arrived');
    expect(s.winner).toBe(0);
    expect(s.lanes[0].carrots).toBe(2);
    expect(answer(s, SOLO, 0, true).event).toBe('ignored');
  });
});

describe('hai đội đua cùng lúc', () => {
  test('hai đội đều trả lời được ngay từ đầu, không chờ lượt', () => {
    const s = initialRace(TEAMS, 'teams');
    expect(answer(s, TEAMS, 0, true).event).toBe('correct');
    expect(answer(s, TEAMS, 1, true).event).toBe('correct');
  });

  test('thỏ đỏ đang nhảy thì đội xanh vẫn trả lời được', () => {
    const red = answer(initialRace(TEAMS, 'teams'), TEAMS, 0, true).state;
    const both = answer(red, TEAMS, 1, true);
    expect(both.event).toBe('correct');
    expect(both.state.lanes.map((l) => l.phase)).toEqual(['hopping', 'hopping']);
    // mỗi thỏ chạm đất riêng
    const s = landed(both.state, TEAMS, 1);
    expect(s.lanes.map((l) => l.phase)).toEqual(['hopping', 'idle']);
    expect(answer(s, TEAMS, 0, true).event).toBe('ignored');
    expect(answer(s, TEAMS, 1, true).event).toBe('correct');
  });

  test('một đội nhầm thì chỉ thỏ đội đó về vạch xuất phát', () => {
    let s = step(initialRace(TEAMS, 'teams'), TEAMS, 0, true);
    s = step(s, TEAMS, 1, true);
    s = step(s, TEAMS, 1, false); // Xanh nhầm ở 9−5
    expect(s.lanes[1].pos).toBe(-1);
    expect(s.lanes[1].mistakes).toBe(1);
    expect(s.lanes[0].pos).toBe(0);
  });

  test('Đội Xanh về đích trước thì về nhất, Đội Đỏ vẫn chơi tiếp tới đích', () => {
    let s = initialRace(TEAMS, 'teams');
    s = step(s, TEAMS, 0, false); // Đỏ nhầm ở 5−1
    s = step(s, TEAMS, 1, true); // Xanh: 7−3
    s = step(s, TEAMS, 1, true); // Xanh: 9−5
    s = step(s, TEAMS, 0, true); // Đỏ: 5−1
    s = step(s, TEAMS, 1, false); // Xanh: 9−6, ô cuối
    expect(s.lanes[1].phase).toBe('toGarden');
    s = landed(s, TEAMS, 1);
    expect(s.winner).toBe(1);
    expect(allArrived(s)).toBe(false);
    expect(s.lanes[0].pos).toBe(0);
    // Đội Đỏ chưa về: vẫn trả lời được; thỏ xanh đã về thì làn xanh dừng
    expect(answer(s, TEAMS, 1, true).event).toBe('ignored');
    s = step(s, TEAMS, 0, false); // Đỏ: 6−3
    s = step(s, TEAMS, 0, true); // Đỏ: 8−4, ô cuối
    s = landed(s, TEAMS, 0);
    expect(allArrived(s)).toBe(true);
    expect(s.winner).toBe(1);
  });

  test('đội về sau không giành được phần thắng', () => {
    let s = initialRace(TEAMS, 'teams');
    for (const [lane, eq] of [[0, true], [1, true], [0, false], [1, true], [0, true]] as const) s = step(s, TEAMS, lane, eq);
    // Đỏ đã vào hàng rào (đang toGarden); Xanh vừa nhảy ô cuối cũng đang toGarden
    s = step(s, TEAMS, 1, false);
    s = landed(s, TEAMS, 0);
    expect(s.winner).toBe(0);
    s = landed(s, TEAMS, 1);
    expect(s.winner).toBe(0);
  });
});
