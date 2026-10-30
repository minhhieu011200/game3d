import { useApp } from '../../app/store';

export interface QualitySettings {
  shadows: boolean;
  /** Mặt nước phản chiếu thật (nặng) hay mặt phẳng có texture. */
  reflectiveWater: boolean;
  grassCount: number;
  dpr: [number, number];
  antialias: boolean;
  /** Hạt hiệu ứng (pháo hoa…). */
  particles: boolean;
}

const PRESETS: Record<'high' | 'low', QualitySettings> = {
  high: { shadows: true, reflectiveWater: true, grassCount: 6000, dpr: [1, 2], antialias: true, particles: true },
  low: { shadows: false, reflectiveWater: false, grassCount: 1200, dpr: [0.75, 1], antialias: false, particles: false },
};

export function useQuality(): QualitySettings {
  return PRESETS[useApp((s) => s.quality)];
}
