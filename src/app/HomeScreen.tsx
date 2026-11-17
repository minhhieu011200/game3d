import { useEffect, useState } from 'react';
import { useApp } from './store';

// chỉ chiếu trang chào mừng một lần mỗi lần mở trò chơi (quay về màn chào thì không chiếu lại)
let welcomed = false;
/** Ảnh chào mừng và kích thước thật của nó (điểm ảnh). */
const WELCOME = { src: './images/chao-mung.webp', w: 1671, h: 941 };
/** Cho phóng ảnh to hơn cỡ thật tối đa 1,15 lần: gần như không thấy nhòe mà bớt lề hai bên. */
const UPSCALE = 1.15;
/** Clip hát múa "Kìa con bướm vàng" chiếu ngay sau trang chào mừng. */
const INTRO_VIDEO = './videos/kia-con-buom-vang.mp4';
const dpr = () => (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

/**
 * Màn chào: trước tiên là trang "Chào mừng các thầy cô…" như slide PowerPoint (bấm chuột hoặc phím → để qua),
 * sau đó mới hiện "Vườn Thú Số Vui"; bấm "Bắt đầu" là lên xe buýt vào vườn thú.
 */
export function HomeScreen() {
  const { start, go } = useApp();
  // on → leaving (ảnh mờ dần) → video (clip "Kìa con bướm vàng") → off (trang Vườn Thú Số Vui)
  const [welcome, setWelcome] = useState<'on' | 'leaving' | 'video' | 'off'>(welcomed ? 'off' : 'on');
  const next = () => {
    welcomed = true;
    setWelcome((w) => (w === 'on' ? 'leaving' : w === 'video' ? 'off' : w));
  };
  useEffect(() => {
    if (welcome !== 'on' && welcome !== 'video') return;
    const onKey = (e: KeyboardEvent) => {
      // bút trình chiếu: nút Next gửi PageDown / mũi tên phải (một số loại gửi MediaTrackNext);
      // khi đang chiếu clip thì Space để tạm dừng/phát tiếp, không dùng để qua trang
      const keys = ['ArrowRight', 'ArrowDown', 'PageDown', 'MediaTrackNext', 'Enter'];
      if (keys.includes(e.key) || (e.key === ' ' && welcome === 'on')) {
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
      {welcome === 'video' && (
        <div className="intro-video">
          {/* bấm qua trang chào là một thao tác của người dùng nên trình duyệt cho phát kèm tiếng */}
          <video src={INTRO_VIDEO} autoPlay controls playsInline onEnded={next} />
        </div>
      )}
      {(welcome === 'on' || welcome === 'leaving') && (
        <div
          className={`welcome ${welcome}`}
          onClick={next}
          // chỉ tính hiệu ứng mờ dần của chính trang chào (hiệu ứng của ảnh bên trong cũng nổi bọt lên đây)
          onAnimationEnd={(e) => e.target === e.currentTarget && welcome === 'leaving' && setWelcome('video')}
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
          />
        </div>
      )}
    </div>
  );
}
