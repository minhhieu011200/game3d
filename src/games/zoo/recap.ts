// Bảng phép tính của Bài 4 (Cổng 4): ếch nhảy xuống hồ, cò bay lên trời.
import { KIND_ICON, type RecapData } from '../../tour/recap';
import { ACTIONS, type ActKind } from './store';

/** Mỗi bến một dòng 10 − n; xong khi giáo viên đã bấm "Đáp án" của bến đó. */
export function zooRecap(answered: Record<ActKind, boolean>): RecapData {
  return {
    columns: [{ rows: (Object.keys(ACTIONS) as ActKind[]).map((k) => ({ a: 10, b: ACTIONS[k].count, done: answered[k], icon: KIND_ICON[k] })) }],
  };
}
