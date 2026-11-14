import { advance, answerOf, initialState, pickedOf } from './logic';
import { QUESTIONS } from './questions';

test('bộ câu hỏi 6 − 1 … 6 − 5, câu đầu là mẫu', () => {
  expect(QUESTIONS.map((q) => `${q.a}-${q.b}`)).toEqual(['6-1', '6-2', '6-3', '6-4', '6-5']);
  expect(QUESTIONS.map((q) => !!q.sample)).toEqual([true, false, false, false, false]);
});

test('mỗi lần bấm hiện một bước: hoa → bướm đậu → phép tính → kết quả → câu sau', () => {
  let s = initialState();
  expect(s).toEqual({ index: 0, step: 0, finished: false });
  s = advance(s, QUESTIONS);
  expect(s.step).toBe(1);
  s = advance(s, QUESTIONS);
  expect(s.step).toBe(2);
  s = advance(s, QUESTIONS);
  expect(s.step).toBe(3);
  s = advance(s, QUESTIONS);
  expect(s).toEqual({ index: 1, step: 0, finished: false });
});

test('hết 5 câu thì kết thúc, bấm thêm không đổi gì', () => {
  let s = initialState();
  for (let i = 0; i < 5 * 4; i++) s = advance(s, QUESTIONS);
  expect(s.finished).toBe(true);
  expect(advance(s, QUESTIONS)).toBe(s);
});

test('bướm đậu ở các bông cuối hàng, đúng số trừ', () => {
  expect(pickedOf(QUESTIONS[0])).toEqual([5]);
  expect(pickedOf(QUESTIONS[3])).toEqual([2, 3, 4, 5]);
  expect(answerOf(QUESTIONS[3])).toBe(2);
});
