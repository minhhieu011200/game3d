import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { TopBarRight } from '../app/TopBar';
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
