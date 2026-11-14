// Bảng phép tính của Bài 3 (Cổng 3) dựng từ trạng thái trò chơi.
import type { RecapData } from '../../tour/recap';
import type { FingerState } from './logic';
import type { Question } from './questions';

/** Câu đã xong: các câu trước câu hiện tại, cộng câu hiện tại nếu vừa trả lời đúng; xong bài thì tất cả. */
export function fingerRecap(s: FingerState, qs: readonly Question[]): RecapData {
  const doneUpTo = s.finished ? qs.length : s.index + (s.feedback === 'correct' ? 1 : 0);
  return { columns: [{ rows: qs.map((q, i) => ({ a: q.a, b: q.b, done: i < doneUpTo })) }] };
}
