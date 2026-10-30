import { unlockAudio } from '../audio/AudioManager';
import { useApp } from './store';

/** Màn chào: bấm "Bắt đầu" là lên xe buýt vào Vườn Thú Số Vui. */
export function HomeScreen() {
  const { start, go } = useApp();
  return (
    <div className="home">
      <h1 className="home-title">🦜 Vườn Thú Số Vui</h1>
      <p className="home-sub">Toán 1 · Bài 11: Phép trừ trong phạm vi 10 (Luyện tập)</p>
      <button
        className="btn btn-big"
        onClick={() => {
          unlockAudio();
          start();
          go('tour');
        }}
      >
        ▶ Bắt đầu
      </button>
      <button className="btn btn-link" onClick={() => go('about')}>
        ℹ️ Giới thiệu
      </button>
    </div>
  );
}
