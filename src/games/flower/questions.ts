export interface Question {
  a: number;
  b: number;
  /** Câu mẫu: giáo viên làm cho cả lớp xem. */
  sample?: boolean;
}

/** Bài 1 (SGK tr.72, "Số?"): 6 − 1 … 6 − 5, câu đầu là câu mẫu. */
export const QUESTIONS: Question[] = [1, 2, 3, 4, 5].map((b) => ({ a: 6, b, sample: b === 1 }));
