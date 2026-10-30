import { answer, canAnswer, initialState, next, toggleFlower, type FlowerState } from './logic';
import { QUESTIONS } from './questions';

const at = (index: number): FlowerState => ({ ...initialState(), index });
const pick = (s: FlowerState, ...ids: number[]) => ids.reduce((x, i) => toggleFlower(x, QUESTIONS, i).state, s);

test('bộ câu hỏi 6 − 1 … 6 − 5, câu đầu là mẫu', () => {
  expect(QUESTIONS.map((q) => `${q.a}-${q.b}`)).toEqual(['6-1', '6-2', '6-3', '6-4', '6-5']);
  expect(QUESTIONS.map((q) => !!q.sample)).toEqual([true, false, false, false, false]);
});

test('bấm đủ số bông thì các bông đó đỏ', () => {
  const s = pick(at(1), 4, 5); // 6 − 2
  expect(s.picked).toEqual([4, 5]);
  expect(canAnswer(s, QUESTIONS)).toBe(true);
});

test('bấm quá số bông thì bị chặn và có lời nhắc', () => {
  const s = pick(at(1), 4, 5);
  const r = toggleFlower(s, QUESTIONS, 0);
  expect(r.event).toBe('blocked');
  expect(r.state.picked).toEqual([4, 5]);
  expect(r.state.notice).toBe('enough');
});

test('bấm bông đỏ thì trả lại màu vàng', () => {
  const s = pick(at(1), 4, 5);
  const r = toggleFlower(s, QUESTIONS, 4);
  expect(r.event).toBe('unpicked');
  expect(r.state.picked).toEqual([5]);
  expect(canAnswer(r.state, QUESTIONS)).toBe(false);
});

test('chưa bớt đủ hoa thì không chốt đáp án', () => {
  const s = pick(at(3), 0, 1); // 6 − 4 mới bớt 2
  const r = answer(s, QUESTIONS, 2);
  expect(r.event).toBe('needmore');
  expect(r.state.notice).toBe('needmore');
  expect(r.state.feedback).toBeNull();
});

test('trả lời đúng ngay lần đầu', () => {
  const s = pick(at(3), 2, 3, 4, 5);
  const r = answer(s, QUESTIONS, 2);
  expect(r.event).toBe('correct');
  expect(r.state.firstTry).toBe(1);
  // đã đúng thì khóa: không bấm hoa, không trả lời nữa
  expect(toggleFlower(r.state, QUESTIONS, 0).event).toBe('ignored');
  expect(answer(r.state, QUESTIONS, 2).event).toBe('ignored');
});

test('trả lời sai rồi đúng thì không tính đúng lần đầu', () => {
  let s = pick(at(3), 2, 3, 4, 5);
  const w = answer(s, QUESTIONS, 3);
  expect(w.event).toBe('wrong');
  expect(w.state.wrongValue).toBe(3);
  expect(w.state.notice).toBeNull();
  expect(w.state.index).toBe(3);
  s = answer(w.state, QUESTIONS, 2).state;
  expect(s.feedback).toBe('correct');
  expect(s.firstTry).toBe(0);
});

test('làm hết 5 câu thì kết thúc và giữ các bông đã bớt', () => {
  let s = initialState();
  QUESTIONS.forEach((q, i) => {
    s = pick(s, ...Array.from({ length: q.b }, (_, k) => 5 - k));
    s = answer(s, QUESTIONS, q.a - q.b).state;
    s = next(s, QUESTIONS);
    expect(s.finished).toBe(i === QUESTIONS.length - 1);
  });
  expect(s.firstTry).toBe(5);
  expect(s.history.map((h) => h.length)).toEqual([1, 2, 3, 4, 5]);
});

test('next không chạy khi chưa trả lời đúng', () => {
  const s = at(2);
  expect(next(s, QUESTIONS)).toBe(s);
});
