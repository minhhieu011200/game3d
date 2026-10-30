export interface Question {
  a: number;
  b: number;
}

/** Bài 3 (SGK tr.73): 9 − 1 … 9 − 8. */
export const QUESTIONS: Question[] = [1, 2, 3, 4, 5, 6, 7, 8].map((b) => ({ a: 9, b }));
