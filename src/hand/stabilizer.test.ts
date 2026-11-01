import { FingerStabilizer } from './stabilizer';

const FRAME = 33; // ~30 khung hình/giây

/** Đưa một chuỗi giá trị thô vào, trả về mọi lần chốt và trạng thái cuối. */
function feed(s: FingerStabilizer, values: Array<number | null>, start = 0) {
  const commits: number[] = [];
  let last = s.update(values[0], start);
  if (last.committed !== null) commits.push(last.committed);
  values.slice(1).forEach((v, i) => {
    last = s.update(v, start + (i + 1) * FRAME);
    if (last.committed !== null) commits.push(last.committed);
  });
  return { commits, last, end: start + values.length * FRAME };
}

const repeat = (v: number | null, n: number) => Array<number | null>(n).fill(v);

test('tay rung nhẹ: vài khung hình lẻ không làm đổi kết quả', () => {
  const s = new FingerStabilizer();
  const noisy = [...repeat(6, 10), 5, 6, 6, 5, 6, 6, 6, 7, 6, 6];
  const { last } = feed(s, noisy);
  expect(last.stable).toBe(6);
  // tiến độ vẫn tăng liên tục từ khi bắt đầu thấy 6
  expect(last.progress).toBeGreaterThan(0.3);
});

test('giữ đủ 0,7 giây thì chốt đúng một lần', () => {
  const s = new FingerStabilizer();
  const { commits } = feed(s, repeat(6, Math.ceil(1200 / FRAME)));
  expect(commits).toEqual([6]);
});

test('chưa đủ thời gian thì chưa chốt', () => {
  const s = new FingerStabilizer();
  const { commits, last } = feed(s, repeat(6, Math.floor(500 / FRAME)));
  expect(commits).toEqual([]);
  expect(last.progress).toBeLessThan(1);
});

test('không chốt lặp lại khi vẫn giữ nguyên số ngón', () => {
  const s = new FingerStabilizer();
  const first = feed(s, repeat(5, 60));
  expect(first.commits).toEqual([5]);
  const again = feed(s, repeat(5, 120), first.end);
  expect(again.commits).toEqual([]);
});

test('đổi số ngón thì chốt được giá trị mới', () => {
  const s = new FingerStabilizer();
  const a = feed(s, repeat(5, 60));
  const b = feed(s, repeat(6, 70), a.end);
  expect([...a.commits, ...b.commits]).toEqual([5, 6]);
});

test('rời tay khỏi khung hình rồi giơ lại thì chốt lại được', () => {
  const s = new FingerStabilizer();
  const a = feed(s, repeat(5, 60));
  const gone = feed(s, repeat(null, 15), a.end);
  expect(gone.last.stable).toBeNull();
  const b = feed(s, repeat(5, 60), gone.end);
  expect([...a.commits, ...b.commits]).toEqual([5, 5]);
});

test('không thấy tay thì báo null', () => {
  const s = new FingerStabilizer();
  const { last, commits } = feed(s, repeat(null, 80));
  expect(last.stable).toBeNull();
  expect(commits).toEqual([]);
});
