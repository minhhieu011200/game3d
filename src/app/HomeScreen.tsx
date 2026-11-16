import { useEffect, useState } from 'react';
import { useApp } from './store';

// chỉ chiếu trang chào mừng một lần mỗi lần mở trò chơi (quay về màn chào thì không chiếu lại)
let welcomed = false;
/** Ảnh chào mừng và kích thước thật của nó (điểm ảnh). */
const WELCOME = { src: './images/chao-mung.webp', w: 1671, h: 941 };
/** Cho phóng ảnh to hơn cỡ thật tối đa 1,15 lần: gần như không thấy nhòe mà bớt lề hai bên. */
const UPSCALE = 1.15;
const dpr = () => (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

/**
 * Màn chào: trước tiên là trang "Chào mừng các thầy cô…" như slide PowerPoint (bấm chuột hoặc phím → để qua),
 * sau đó mới hiện "Vườn Thú Số Vui"; bấm "Bắt đầu" là lên xe buýt vào vườn thú.
 */
export function HomeScreen() {
  const { start, go } = useApp();
  const [welcome, setWelcome] = useState<'on' | 'leaving' | 'off'>(welcomed ? 'off' : 'on');
  const next = () => {
    welcomed = true;
    setWelcome((w) => (w === 'on' ? 'leaving' : w));
  };
  useEffect(() => {
    if (welcome !== 'on') return;
    const onKey = (e: KeyboardEvent) => {
      // bút trình chiếu: nút Next gửi PageDown / mũi tên phải (một số loại gửi MediaTrackNext)
      if (['ArrowRight', 'ArrowDown', 'PageDown', 'MediaTrackNext', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        next();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [welcome]);

  return (
    <div className="home">
      <h1 className="home-title">🦜 Vườn Thú Số Vui</h1>
      <p className="home-sub">Toán 1 · Bài 11: Phép trừ trong phạm vi 10 (Luyện tập)</p>
      <button
        className="btn btn-big"
        onClick={() => {
          start();
          go('tour');
        }}
      >
        ▶ Bắt đầu
      </button>
      <button className="btn btn-link" onClick={() => go('about')}>
        ℹ️ Giới thiệu
      </button>
      {welcome !== 'off' && (
        <div
          className={`welcome ${welcome}`}
          onClick={next}
          // chỉ tính hiệu ứng mờ dần của chính trang chào (hiệu ứng của ảnh bên trong cũng nổi bọt lên đây)
          onAnimationEnd={(e) => e.target === e.currentTarget && welcome === 'leaving' && setWelcome('off')}
        >
          {/* nền: chính ảnh này phóng to và làm mờ, phủ kín phần màn hình còn trống */}
          <div className="welcome-bg" style={{ backgroundImage: `url(${WELCOME.src})` }} />
          <img
            src={WELCOME.src}
            alt="Chào mừng các thầy cô tham dự tiết học chuyên đề của lớp Một 7"
            // không phóng ảnh to hơn 1,15 lần số điểm ảnh thật (tính theo độ phóng của màn hình) để chữ không bị nhòe/vỡ
            style={{
              maxWidth: `min(${(WELCOME.w * UPSCALE) / dpr()}px, calc(100vw - 16px))`,
              maxHeight: `min(${(WELCOME.h * UPSCALE) / dpr()}px, calc(100vh - 16px))`,
            }}
          />        </div>
      )}
    </div>
  );
}
