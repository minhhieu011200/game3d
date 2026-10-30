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

/** Nút chất lượng đồ họa (chỉ cho cảnh 3D) và bật/tắt tiếng. */
export function TopBarRight() {
  const { muted, toggleMute, quality, setQuality, screen } = useApp();
  return (
    <div className="topbar-right">
      {(screen === 'zoo' || screen === 'tour') && (
        <button className="btn btn-small" onClick={() => setQuality(quality === 'high' ? 'low' : 'high')} title="Chất lượng đồ họa">
          🎨 Chất lượng: {quality === 'high' ? 'Cao' : 'Thấp'}
        </button>
      )}
      <button className="btn btn-small" onClick={toggleMute} aria-label={muted ? 'Bật tiếng' : 'Tắt tiếng'}>
        {muted ? '🔇 Đang tắt tiếng' : '🔊 Đang bật tiếng'}
      </button>
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
