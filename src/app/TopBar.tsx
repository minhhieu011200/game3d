import { useState } from 'react';
import { setMusicOn, setSfxOn, soundPrefs } from '../shared/sound';
import { leaveGate } from '../tour/gateBridge';
import { useApp } from './store';

/** Nút về đường đi: rời cổng (không tính là đã qua), hoặc về màn chào khi chưa bắt đầu. */
export function BackButton() {
  const { go, gate, started } = useApp();
  return (
    <button className="btn btn-home" onClick={() => (gate !== null ? leaveGate() : go(started ? 'tour' : 'home'))}>
      {started ? '🛣️ Về đường đi' : '🏠 Về trang chủ'}
    </button>
  );
}

/** Hai nút bật/tắt: nhạc nền và hiệu ứng âm thanh (trình duyệt nhớ lựa chọn). */
function SoundButtons() {
  const [p, setP] = useState(soundPrefs);
  return (
    <>
      <button
        className="btn btn-small"
        aria-pressed={p.music}
        onClick={() => {
          setMusicOn(!p.music);
          setP(soundPrefs());
        }}
        title={p.music ? 'Nhạc nền đang bật – bấm để tắt' : 'Nhạc nền đang tắt – bấm để bật'}
        aria-label="Nhạc nền"
      >
        {p.music ? '🎵' : '🔇'}
      </button>
      <button
        className="btn btn-small"
        aria-pressed={p.sfx}
        onClick={() => {
          setSfxOn(!p.sfx);
          setP(soundPrefs());
        }}
        title={p.sfx ? 'Hiệu ứng âm thanh đang bật – bấm để tắt' : 'Hiệu ứng âm thanh đang tắt – bấm để bật'}
        aria-label="Hiệu ứng âm thanh"
      >
        {p.sfx ? '🔔' : '🔕'}
      </button>
    </>
  );
}

/** Nút âm thanh và nút chất lượng đồ họa (chỉ cho cảnh 3D). */
export function TopBarRight() {
  const { quality, setQuality, screen } = useApp();
  return (
    <div className="topbar-right">
      <SoundButtons />
      {(screen === 'zoo' || screen === 'tour') && (
        <button className="btn btn-small" onClick={() => setQuality(quality === 'high' ? 'low' : 'high')} title="Chất lượng đồ họa">
          🎨 Chất lượng: {quality === 'high' ? 'Cao' : 'Thấp'}
        </button>
      )}
    </div>
  );
}

export function TopBar() {
  return (
    <div className="topbar">
      <BackButton />
      <TopBarRight />
    </div>
  );
}
