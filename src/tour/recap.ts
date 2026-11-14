// Bảng phép tính hiện trên đường đi ngay sau khi qua một cổng.
// Mỗi trò chơi tự dựng bảng từ trạng thái của nó (src/games/*/recap.ts) rồi báo về bằng `reportRecap`.
import { QUESTIONS as FINGER_QUESTIONS } from '../games/finger/questions';
import { QUESTIONS as FLOWER_QUESTIONS } from '../games/flower/questions';
import type { GateId } from './logic';

export interface RecapRow {
  a: number;
  b: number;
  /** Đã làm xong: ghi kết quả; chưa thì ghi "?" và làm mờ. */
  done: boolean;
  /** Bài 2 (thỏ): `true` – ô có kết quả bằng mục tiêu (tô nổi bật, có 🥕); `false` – ô khác mục tiêu (dấu ✘, không phải ✔). */
  highlight?: boolean;
  icon?: string;
}

export interface RecapColumn {
  /** Tên cột, ví dụ "Đội Đỏ" (chỉ khi chơi 2 đội). */
  title?: string;
  /** Bài 2 (thỏ): số cần tìm của làn. */
  target?: number;
  rows: RecapRow[];
  /** Ghi chú khi cột không có dòng nào. */
  note?: string;
}

export interface RecapData {
  columns: RecapColumn[];
}

export const KIND_ICON = { frog: '🐸', stork: '🕊️', candle: '🕯️' } as const;

/** Bảng toàn "?" từ bộ câu hỏi cố định của bài, dùng khi trò chơi chưa báo gì. */
export function defaultRecap(gate: GateId): RecapData {
  switch (gate) {
    case 'ticket':
      return { columns: [{ rows: FINGER_QUESTIONS.map((q) => ({ a: q.a, b: q.b, done: false })) }] };
    case 'flower':
      return { columns: [{ rows: FLOWER_QUESTIONS.map((q) => ({ a: q.a, b: q.b, done: false })) }] };
    case 'pond':
      return {
        columns: [
          {
            rows: [
              { a: 10, b: 5, done: false, icon: KIND_ICON.frog },
              { a: 10, b: 2, done: false, icon: KIND_ICON.stork },
            ],
          },
        ],
      };
    case 'bunny':
      return { columns: [{ rows: [], note: 'Chưa chơi' }] };
  }
}
