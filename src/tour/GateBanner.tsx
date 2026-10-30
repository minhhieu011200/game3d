import { BackButton, TopBarRight } from '../app/TopBar';
import { gateNumber, STATIONS, type GateId } from './logic';
import { passGate } from './gateBridge';
import { useTour } from './store';

export const TICKET_LIGHTS = 8;

/** Dải cổng phía trên trò chơi: tên cổng, nút "Qua cổng"; Cổng 1 có thêm thanh chắn và 8 đèn soát vé. */
export function GateBanner({ gate }: { gate: GateId }) {
  const progress = useTour((s) => s.progress);
  const done = useTour((s) => s.done);
  const st = STATIONS.find((s) => s.id === gate)!;
  return (
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
        <button className={`btn btn-small btn-primary gate-pass ${done ? 'ready' : ''}`} onClick={passGate}>
          🚪 Qua cổng
        </button>
      </div>
      <TopBarRight />
    </header>
  );
}
