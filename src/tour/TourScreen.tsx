import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { TopBarRight } from '../app/TopBar';
import { setInGame } from '../shared/sound';
import { useQuality } from '../shared/3d/quality';
import { enterGate } from './gateBridge';
import { canAdvance, current, isGate, SQUARE, STATIONS } from './logic';
import { useTour } from './store';
import { TourMap } from './TourMap';
import { TourScene } from './TourScene';

export default function TourScreen() {
  const s = useTour();
  const q = useQuality();
  const [mapOpen, setMapOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  // đang xem clip hướng dẫn thì nhạc nền nghỉ để nghe rõ tiếng trong clip
  useEffect(() => {
    if (!guideOpen) return;
    setInGame(true);
    return () => setInGame(false);
  }, [guideOpen]);
  const st = current(s);
  const atSquare = s.at === SQUARE && s.phase === 'atGate';

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

      <div className="tour-controls">
        {s.phase === 'moving' && <div className="tour-moving">🚶 Đang đi tới {STATIONS[s.at].title}…</div>}
        {s.phase === 'atGate' && isGate(st) && (
          <button className="btn btn-big btn-primary" onClick={enterGate}>
            🚪 Vào cổng
          </button>
        )}
        {s.phase === 'atGate' && st.id === 'ticket' && (
          <button className="btn btn-big" onClick={() => setGuideOpen(true)}>
            🎬 Xem hướng dẫn
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
      {guideOpen && (
        <div className="overlay" onClick={() => setGuideOpen(false)}>
          <div className="overlay-box wood-panel pop-in" onClick={(e) => e.stopPropagation()}>
            <video className="guide-video" src="./videos/huong-dan-cong3.mp4" controls autoPlay playsInline />
            <button className="btn" onClick={() => setGuideOpen(false)}>
              ✖ Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
