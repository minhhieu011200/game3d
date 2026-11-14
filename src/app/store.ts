import { create } from 'zustand';
import type { GateId } from '../tour/logic';
import { loadQuality, saveQuality, type Quality } from './settings';

export type Screen = 'home' | 'tour' | 'flower' | 'bunny' | 'finger' | 'zoo' | 'about';

interface AppState {
  screen: Screen;
  /** Cổng tham quan đang mở trò chơi; `null` khi không chơi từ cổng nào. */
  gate: GateId | null;
  started: boolean;
  quality: Quality;
  go(screen: Screen): void;
  /** Mở trò chơi từ một cổng tham quan. */
  openGate(screen: Screen, gate: GateId): void;
  start(): void;
  setQuality(q: Quality): void;
}

export const useApp = create<AppState>((set) => ({
  screen: 'home',
  gate: null,
  started: false,
  quality: loadQuality(),
  go(screen) {
    set({ screen, gate: null });
  },
  openGate(screen, gate) {
    set({ screen, gate });
  },
  start() {
    set({ started: true });
  },
  setQuality(quality) {
    saveQuality(quality);
    set({ quality });
  },
}));
