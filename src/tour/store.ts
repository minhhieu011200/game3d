import { create } from 'zustand';
import * as T from './logic';
import { defaultRecap, type RecapData } from './recap';

interface TourStore extends T.TourState {
  /** Số câu đúng của trò đang chơi từ cổng (đèn soát vé ở Bài 3). */
  progress: number;
  /** Trò chơi của cổng đang mở đã kết thúc. */
  done: boolean;
  /** Bảng phép tính của cổng đang mở; `null` khi trò chưa báo gì. */
  recap: RecapData | null;
  /** Popup bảng phép tính đang hiện: tự mở khi chơi xong, hoặc khi giáo viên bấm "Qua cổng" ở dải cổng. */
  recapOpen: boolean;
  /** Bảng phép tính của từng cổng đã qua, lưu lúc qua cổng (hiện lại trên bảng gỗ ở Quảng Trường). */
  recaps: Partial<Record<T.GateId, RecapData>>;
  advance(): void;
  arrive(): void;
  enter(): void;
  pass(): void;
  leave(): void;
  jumpTo(at: number): void;
  reset(): void;
  setProgress(n: number): void;
  setDone(): void;
  setRecap(r: RecapData): void;
  setRecapOpen(open: boolean): void;
}

export const useTour = create<TourStore>()((set, get) => {
  const apply = (f: (s: T.TourState) => T.TourState, extra: Partial<TourStore> = {}) => {
    const { at, phase, passed } = get();
    set({ ...f({ at, phase, passed }), ...extra });
  };
  return {
    ...T.initialTour(),
    progress: 0,
    done: false,
    recap: null,
    recapOpen: false,
    recaps: {},
    advance: () => apply(T.advance),
    arrive: () => apply(T.arrive),
    enter: () => apply(T.enter, { progress: 0, done: false, recap: null, recapOpen: false }),
    pass: () => {
      const st = T.current(get());
      const recaps = T.isGate(st) ? { ...get().recaps, [st.id]: get().recap ?? defaultRecap(st.id) } : get().recaps;
      apply(T.pass, { recaps });
    },
    leave: () => apply(T.leave),
    jumpTo: (at) => apply((s) => T.jumpTo(s, at)),
    reset: () => apply(T.reset, { progress: 0, done: false, recap: null, recapOpen: false, recaps: {} }),
    setProgress: (progress) => set({ progress }),
    setDone: () => set({ done: true, recapOpen: true }),
    setRecap: (recap) => set({ recap }),
    setRecapOpen: (recapOpen) => set({ recapOpen }),
  };
});
