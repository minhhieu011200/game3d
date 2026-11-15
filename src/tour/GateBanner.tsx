import { useState } from 'react';
import { BackButton, TopBarRight } from '../app/TopBar';
import { gateNumber, STATIONS, type GateId } from './logic';
import { defaultRecap } from './recap';
import { MatchLines } from './RecapPopup';
import { useTour } from './store';

export const TICKET_LIGHTS = 8;

/** Phiếu bài tập in cho học sinh, theo từng cổng (cổng chưa có phiếu thì không hiện nút). */
export const WORKSHEETS: Partial<Record<GateId, { title: string; src: string }>> = {
  bunny: {
    title: 'Phiếu bài tập số 1',
    src: './images/phieu-bai-tap-so-1.png',
  },
  ticket: { title: 'Phiếu bài tập số 2', src: './images/phieu-bai-tap-so-2.png' },
  pond: { title: 'Phiếu bài tập số 3', src: './images/phieu-bai-tap-so-3.png' },
};

/** Dải cổng phía trên trò chơi: tên cổng, nút "Qua cổng"; trạm soát vé (Bài 3) có thêm thanh chắn và 8 đèn soát vé. */
export function GateBanner({ gate }: { gate: GateId }) {
  const progress = useTour((s) => s.progress);
  const done = useTour((s) => s.done);
  const openRecap = () => useTour.getState().setRecapOpen(true);
  const st = STATIONS.find((s) => s.id === gate)!;
  const sheet = WORKSHEETS[gate];
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <>
      <header className="gate-banner" style={{ ['--gate-color' as string]: st.color }}>
        <BackButton />
        <div className="gate-banner-mid">
          <span className="gate-banner-title">
            <span className="gate-banner-no">Cổng {gateNumber(gate)}</span>
            {st.emoji} {st.title}
            <span className="gate-banner-lesson">Bài {st.lesson}</span>
          </span>
          {gate === 'ticket' && (
            <span className={`gate-barrier ${progress >= TICKET_LIGHTS ? 'open' : ''}`} aria-label={`${progress} / ${TICKET_LIGHTS} đèn sáng`}>
              <span className="gate-barrier-arm" />
              {Array.from({ length: TICKET_LIGHTS }, (_, i) => (
                <span key={i} className={`gate-light ${i < progress ? 'on' : ''}`} />
              ))}
            </span>
          )}
          <button className={`btn btn-small btn-primary gate-pass ${done ? 'ready' : ''}`} onClick={openRecap}>
            🚪 Qua cổng
          </button>
          {sheet && (
            <button className="btn btn-small" onClick={() => setSheetOpen(true)}>
              📝 Phiếu bài tập
            </button>
          )}
        </div>
        <TopBarRight />
      </header>
      {sheet && sheetOpen && gate === 'pond' && (
        // Bài 4: vẽ phiếu trực tiếp giống bảng tổng kết (to, rõ hơn ảnh A4 thu nhỏ); ảnh A4 vẫn dùng để in
        <div className="overlay worksheet-overlay" onClick={() => setSheetOpen(false)}>
          <div
            className="rp-box pop-in"
            role="dialog"
            aria-label={sheet.title}
            style={{ ['--gate-color' as string]: st.color }}
            onClick={(e) => e.stopPropagation()}
          >
            <header className="rp-head">
              <div className="rp-title">📝 {sheet.title}</div>
              <div className="rp-sub">Em hãy nối mỗi phép tính với hình thích hợp.</div>
            </header>
            <div className="ws-name">
              <span>Họ và tên:</span>
              <span className="cls">Lớp:</span>
            </div>
            <div className="rp-cols">
              <MatchLines rows={defaultRecap('pond').columns[0].rows} sheet />
            </div>
            <div className="overlay-actions rp-actions">
              <button className="btn" onClick={() => setSheetOpen(false)}>
                ✖ Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      {sheet && sheetOpen && gate !== 'pond' && (
        <div className="overlay worksheet-overlay" onClick={() => setSheetOpen(false)}>
          <div className="worksheet-box wood-panel pop-in" onClick={(e) => e.stopPropagation()}>
            <img className="worksheet-img" src={sheet.src} alt={sheet.title} />
            <button className="btn btn-small worksheet-close" onClick={() => setSheetOpen(false)}>
              ✖ Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
