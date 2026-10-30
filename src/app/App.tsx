import { lazy, Suspense } from 'react';
import { GateBanner } from '../tour/GateBanner';
import { useApp } from './store';
import { HomeScreen } from './HomeScreen';
import { AboutScreen } from './AboutScreen';
import { TopBar } from './TopBar';

const TourScreen = lazy(() => import('../tour/TourScreen'));
const FlowerGame = lazy(() => import('../games/flower/FlowerGame'));
const BunnyGame = lazy(() => import('../games/bunny/BunnyGame'));
const FingerGame = lazy(() => import('../games/finger/FingerGame'));
const ZooGame = lazy(() => import('../games/zoo/ZooGame'));

export function App() {
  const screen = useApp((s) => s.screen);
  const gate = useApp((s) => s.gate);
  const content = (
    <Suspense fallback={<div className="loading">Đang tải…</div>}>
      {screen === 'home' && <HomeScreen />}
      {screen === 'about' && <AboutScreen />}
      {screen === 'tour' && <TourScreen />}
      {screen === 'flower' && <FlowerGame />}
      {screen === 'bunny' && <BunnyGame />}
      {screen === 'finger' && <FingerGame />}
      {screen === 'zoo' && <ZooGame />}
    </Suspense>
  );

  // Chơi từ một cổng: dải cổng nằm trên cùng (có luôn các nút của thanh trên), trò chơi ở phần còn lại.
  if (gate !== null) {
    return (
      <div className="app in-gate">
        <GateBanner gate={gate} />
        <div className="gate-body">{content}</div>
      </div>
    );
  }
  return (
    <div className="app">
      {screen !== 'home' && screen !== 'tour' && <TopBar />}
      {content}
    </div>
  );
}
