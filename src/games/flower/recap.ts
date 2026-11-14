// Bảng phép tính của Bài 1 (Cổng 1) dựng từ trạng thái trò chơi.
import type { RecapData } from '../../tour/recap';
import type { FlowerState } from './logic';
import type { Question } from './questions';

/** Câu đã xong: các câu trước câu hiện tại, cộng câu hiện tại nếu đã hiện kết quả; xong bài thì tất cả. */
export function flowerRecap(s: FlowerState, qs: readonly Question[]): RecapData {
  const doneUpTo = s.finished ? qs.length : s.index + (s.step === 3 ? 1 : 0);
  return { columns: [{ rows: qs.map((q, i) => ({ a: q.a, b: q.b, done: i < doneUpTo })) }] };
}
