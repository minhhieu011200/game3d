// Bảng phép tính của Bài 2 (Cổng 2): cả 7 ô của mỗi làn, ô bằng mục tiêu tô nổi bật.
import type { RecapData } from '../../tour/recap';
import type { Level, Mode } from './levels';
import { TEAMS, type LaneState } from './logic';

export function bunnyRecap(levels: readonly Level[], lanes: readonly LaneState[], mode: Mode): RecapData {
  return {
    columns: levels.map((level, i) => ({
      title: mode === 'teams' ? TEAMS[i].name : undefined,
      target: level.target,
      rows: level.tiles.map((t, k) => {
        const mark = lanes[i]?.marks[k] ?? 'unknown';
        return { a: t.a, b: t.b, done: mark !== 'unknown', highlight: mark === 'correct' };
      }),
    })),
  };
}
