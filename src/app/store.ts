import { create } from 'zustand';
import { audio, setSfxMuted } from '../audio/AudioManager';
import type { GateId } from '../tour/logic';
import { loadQuality, saveQuality, type Quality } from './settings';

export type Screen = 'home' | 'tour' | 'flower' | 'bunny' | 'finger' | 'zoo' | 'about';

interface AppState {
  screen: Screen;
  /** Cổng tham quan đang mở trò chơi; `null` khi không chơi từ cổng nào. */
  gate: GateId | null;
  started: boolean;
  muted: boolean;
  quality: Quality;
  go(screen: Screen): void;
  /** Mở trò chơi từ một cổng tham quan. */
  openGate(screen: Screen, gate: GateId): void;
  start(): void;
  toggleMute(): void;
  setQuality(q: Quality): void;
}

export const useApp = create<AppState>((set, get) => ({
  screen: 'home',
  gate: null,
  started: false,
  muted: false,
  quality: loadQuality(),
  go(screen) {
    audio.stop();
    set({ screen, gate: null });
  },
  openGate(screen, gate) {
    audio.stop();
    set({ screen, gate });
  },
  start() {
    set({ started: true });
  },
  toggleMute() {
    const muted = !get().muted;
    audio.setMuted(muted);
    setSfxMuted(muted);
    set({ muted });
  },
  setQuality(quality) {
    saveQuality(quality);
    set({ quality });
  },
}));
