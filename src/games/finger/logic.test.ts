import { answer, answerOf, initialState, next, type FingerState } from './logic';
import { QUESTIONS } from './questions';

const Q = QUESTIONS;

test('bộ câu hỏi là 9 − 1 … 9 − 8', () => {
  expect(Q.map((q) => `${q.a}-${q.b}`)).toEqual(['9-1', '9-2', '9-3', '9-4', '9-5', '9-6', '9-7', '9-8']);
  expect(Q.map(answerOf)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
});

test('trả lời đúng 9 − 3 = 6 rồi chuyển sang 9 − 4', () => {
  let s: FingerState = { ...initialState(), index: 2 };
  const r = answer(s, Q, 6);
  expect(r.event).toBe('correct');
  expect(r.state.feedback).toBe('correct');
  s = next(r.state, Q);
  expect(Q[s.index]).toEqual({ a: 9, b: 4 });
});

test('trả lời sai thì giữ nguyên câu', () => {
  const s: FingerState = { ...initialState(), index: 2 };
  const r = answer(s, Q, 5);
  expect(r.event).toBe('wrong');
  expect(r.state.index).toBe(2);
  expect(next(r.state, Q).index).toBe(2);
});

test('trả lời bằng bàn phím: 9 − 7 bấm 2 là đúng', () => {
  const s: FingerState = { ...initialState(), index: 6 };
  expect(answer(s, Q, 2).event).toBe('correct');
});

test('đang hiện phép tính đúng thì bỏ qua đáp án mới', () => {
  const r = answer(initialState(), Q, 8);
  expect(answer(r.state, Q, 3).event).toBe('ignored');
});

test('hoàn thành 8 câu, đếm số câu đúng ngay lần đầu', () => {
  let s = initialState();
  Q.forEach((q, i) => {
    if (i === 1 || i === 5) s = answer(s, Q, 0).state; // sai một lần ở câu 2 và câu 6
    s = next(answer(s, Q, answerOf(q)).state, Q);
  });
  expect(s.finished).toBe(true);
  expect(s.firstTry).toBe(6);
});
