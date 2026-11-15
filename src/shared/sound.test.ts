import { BASS_EIGHTHS, MUSIC_EIGHTHS, sfx, unlockSound } from './sound';

test('giai điệu và bè trầm dài bằng nhau để vòng nhạc lặp khớp nhịp', () => {
  expect(MUSIC_EIGHTHS).toBe(BASS_EIGHTHS);
});

test('không có WebAudio (máy cũ, môi trường test) thì im lặng, không lỗi', () => {
  expect(() => unlockSound()).not.toThrow();
  expect(() => sfx('correct')).not.toThrow();
});
