import { create } from 'zustand';
import * as T from './logic';

interface TourStore extends T.TourState {
  /** Số câu đúng của trò đang chơi từ cổng (đèn soát vé ở Cổng 1). */
  progress: number;
  /** Trò chơi của cổng đang mở đã kết thúc. */
  done: boolean;
  advance(): void;
  arrive(): void;
  enter(): void;
  pass(): void;
  leave(): void;
  jumpTo(at: number): void;
  reset(): void;
  setProgress(n: number): void;
  setDone(): void;
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
    advance: () => apply(T.advance),
    arrive: () => apply(T.arrive),
    enter: () => apply(T.enter, { progress: 0, done: false }),
    pass: () => apply(T.pass),
    leave: () => apply(T.leave),
    jumpTo: (at) => apply((s) => T.jumpTo(s, at)),
    reset: () => apply(T.reset, { progress: 0, done: false }),
    setProgress: (progress) => set({ progress }),
    setDone: () => set({ done: true }),
  };
});
