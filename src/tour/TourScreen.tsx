import { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { audio, sfx } from '../audio/AudioManager';
import { TopBarRight } from '../app/TopBar';
import { useQuality } from '../shared/3d/quality';
import { enterGate } from './gateBridge';
import { canAdvance, current, isGate, SQUARE, STATIONS } from './logic';
import { useTour } from './store';
import { TourMap } from './TourMap';
import { TourScene } from './TourScene';

/** Lời Vẹt Xanh đang nói, theo trạm và việc đang làm. */
function speechOf(s: ReturnType<typeof useTour.getState>) {
  const st = current(s);
  return s.phase === 'moving' ? null : st.speech;
}

export default function TourScreen() {
  const s = useTour();
  const q = useQuality();
  const [mapOpen, setMapOpen] = useState(false);
  const st = current(s);
  const atSquare = s.at === SQUARE && s.phase === 'atGate';

  // Đọc lời dẫn khi vừa tới một trạm (không đọc lại khi quay về từ trò chơi).
  const prevPhase = useRef(s.phase);
  useEffect(() => {
    const prev = prevPhase.current;
    prevPhase.current = s.phase;
    if (s.phase === 'atGate' && prev === 'moving') {
      audio.say(st.voiceKey, { interrupt: true });
      if (s.at === SQUARE) sfx('win');
    }
  }, [s.phase, s.at, st.voiceKey]);

  useEffect(() => {
    const t = useTour.getState();
    if (t.at === 0 && t.phase === 'idle' && t.passed.length === 0) audio.say('tour.welcome', { interrupt: true });
    else if (t.phase === 'moving') sfx('whoosh'); // vừa qua cổng: cổng mở, cả nhóm đi tiếp
    return () => audio.stop();
  }, []);

  const speech = speechOf(s);
  return (
    <div className="game tour">
      <Canvas shadows={q.shadows} dpr={q.dpr} gl={{ antialias: q.antialias }} camera={{ fov: 50, near: 0.1, far: 300, position: [0, 2.4, 0] }}>
        <Suspense fallback={null}>
          <TourScene />
        </Suspense>
      </Canvas>

      <div className="topbar">
        <button className="btn btn-home" onClick={() => setMapOpen(true)}>
          🗺️ Bản đồ
        </button>
        <TopBarRight />
      </div>

      {speech && (
        <div className="tour-speech wood-panel pop-in" key={`${s.at}-${s.phase}`}>
          <b>🦜 Vẹt Xanh:</b> {speech}
        </div>
      )}

      <div className="tour-controls">
        {s.phase === 'moving' && <div className="tour-moving">🚶 Đang đi tới {STATIONS[s.at].title}…</div>}
        {s.phase === 'atGate' && isGate(st) && (
          <button className="btn btn-big btn-primary" onClick={enterGate}>
            🚪 Vào cổng
          </button>
        )}
        {canAdvance(s) && (
          <button className="btn btn-big" onClick={s.advance}>
            Đi tiếp ▶
          </button>
        )}
        {atSquare && (
          <button className="btn btn-big" onClick={s.reset}>
            🔁 Đi lại từ đầu
          </button>
        )}
      </div>

      {mapOpen && <TourMap onClose={() => setMapOpen(false)} />}
    </div>
  );
}
