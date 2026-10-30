// Cầu nối giữa trò chơi và cổng tham quan. Trò chơi chỉ cần báo tiến độ / đã xong và đặt nút "Qua cổng";
// mở riêng lẻ (không từ cổng nào) thì mọi thứ ở đây đều không làm gì.
import { audio } from '../audio/AudioManager';
import { useApp } from '../app/store';
import { current, isGate } from './logic';
import { useTour } from './store';

const fromGate = () => useApp.getState().gate !== null;

/** Số câu đã đúng (đèn soát vé ở Cổng 1). */
export function reportProgress(n: number) {
  if (fromGate()) useTour.getState().setProgress(n);
}

/** Trò chơi đã kết thúc. */
export function reportDone() {
  if (fromGate()) useTour.getState().setDone();
}

/** Vào trò chơi của cổng đang đứng trước. */
export function enterGate() {
  const st = current(useTour.getState());
  if (!isGate(st)) return;
  useTour.getState().enter();
  useApp.getState().openGate(st.screen, st.id);
}

export function passGate() {
  useTour.getState().pass();
  useApp.getState().go('tour');
  audio.stop();
}

export function leaveGate() {
  useTour.getState().leave();
  useApp.getState().go('tour');
}

/** Nút "Qua cổng" đặt trong màn kết thúc của trò chơi; chỉ hiện khi trò chơi được mở từ một cổng. */
export function PassGateButton() {
  const gate = useApp((s) => s.gate);
  if (gate === null) return null;
  return (
    <button className="btn btn-big btn-primary pass-gate" onClick={passGate}>
      🚪 Qua cổng
    </button>
  );
}
