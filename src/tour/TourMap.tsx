import { gateNumber, isGate, SQUARE, STATIONS } from './logic';
import { useTour } from './store';

/** Bản đồ chuyến đi: nhảy thẳng tới cổng bất kỳ hoặc quảng trường. */
export function TourMap({ onClose }: { onClose(): void }) {
  const passed = useTour((s) => s.passed);
  const at = useTour((s) => s.at);
  const jumpTo = useTour((s) => s.jumpTo);
  const go = (i: number) => {
    onClose();
    if (i !== at || useTour.getState().phase === 'idle') jumpTo(i);
  };
  return (
    <div className="overlay" onClick={onClose}>
      <div className="overlay-box wood-panel pop-in tour-map" onClick={(e) => e.stopPropagation()}>
        <h2>🗺️ Bản đồ Vườn Thú Số Vui</h2>
        <ol className="tour-map-list">
          {STATIONS.map((st, i) => {
            if (!isGate(st) && i !== SQUARE) return null;
            const done = isGate(st) && passed.includes(st.id);
            return (
              <li key={st.id}>
                <button className={`tour-map-item ${done ? 'done' : ''} ${i === at ? 'here' : ''}`} style={{ borderColor: st.color }} onClick={() => go(i)}>
                  <span className="tour-map-emoji">{st.emoji}</span>
                  <span className="tour-map-text">
                    <small>{isGate(st) ? `Cổng ${gateNumber(st.id)}` : 'Điểm cuối'}</small>
                    {isGate(st) ? `Bài ${st.lesson}: ${st.title}` : st.title}
                  </span>
                  <span className="tour-map-check">{done ? '✓' : ''}</span>
                </button>
              </li>
            );
          })}
        </ol>
        <button className="btn" onClick={onClose}>
          ✖ Đóng
        </button>
      </div>
    </div>
  );
}
