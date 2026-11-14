import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useApp } from '../../app/store';
import { PassGateButton, reportDone, reportRecap } from '../../tour/gateBridge';
import { advance, answerOf, initialState, pickedOf, type FlowerState } from './logic';
import { QUESTIONS, type Question } from './questions';
import { flowerRecap } from './recap';


/** Bông hoa vẽ giống hình SGK: 8 cánh, nhụy có chấm. Vàng là còn lại, đỏ là đã bớt đi. */
export function Flower({ red }: { red: boolean }) {
  const petal = red ? '#ec5a4a' : '#ffd54a';
  const edge = red ? '#b33a2c' : '#d9a514';
  const core = red ? '#ff9b5e' : '#f7a823';
  return (
    <svg viewBox="-50 -50 100 100" className="b1-flower-svg" aria-hidden>
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={i} cx="0" cy="-27" rx="15" ry="21" fill={petal} stroke={edge} strokeWidth="3" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="19" fill={core} stroke={edge} strokeWidth="3" />
      {[
        [-7, -6],
        [6, -8],
        [0, 2],
        [-8, 7],
        [8, 6],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="2.4" fill={edge} />
      ))}
    </svg>
  );
}

function Butterfly() {
  return (
    <svg viewBox="-30 -24 60 48" className="b1-butterfly-svg" aria-hidden>
      <g className="b1-wing-l">
        <path d="M-2 -2 C -22 -26, -32 -6, -14 2 Z" fill="#8e5cf7" stroke="#4b2a99" strokeWidth="2" />
        <path d="M-2 2 C -20 6, -22 22, -6 14 Z" fill="#c39bff" stroke="#4b2a99" strokeWidth="2" />
      </g>
      <g className="b1-wing-r">
        <path d="M2 -2 C 22 -26, 32 -6, 14 2 Z" fill="#8e5cf7" stroke="#4b2a99" strokeWidth="2" />
        <path d="M2 2 C 20 6, 22 22, 6 14 Z" fill="#c39bff" stroke="#4b2a99" strokeWidth="2" />
      </g>
      <ellipse rx="3" ry="13" fill="#3a2366" />
      <path d="M-1 -12 Q -6 -20 -9 -21 M1 -12 Q 6 -20 9 -21" stroke="#3a2366" strokeWidth="1.6" fill="none" />
    </svg>
  );
}

/** Một dòng như trong sách: 6 bông hoa và phép tính; `answer` thay cho kết quả (ví dụ ô "?" trong popup). */
export function BookLine({ q, picked, small, answer }: { q: Question; picked: number[]; small?: boolean; answer?: ReactNode }) {
  return (
    <div className={`b1-line ${small ? 'small' : ''}`}>
      <span className="b1-line-flowers">
        {Array.from({ length: q.a }, (_, i) => (
          <Flower key={i} red={picked.includes(i)} />
        ))}
      </span>
      <span className="b1-line-eq">
        {q.a} − {q.b} = <b>{answer ?? answerOf(q)}</b>
      </span>
    </div>
  );
}

export default function FlowerGame() {
  const [s, setS] = useState<FlowerState>(initialState);
  const q = QUESTIONS[s.index];
  // bảng phép tính hiện trong popup khi qua cổng
  useEffect(() => reportRecap(flowerRecap(s, QUESTIONS)), [s]);

  // giáo viên bấm vào bất kỳ đâu trên màn chơi (hoặc phím Next như PowerPoint) để hiện bước tiếp theo
  const sRef = useRef(s);
  sRef.current = s;
  const onNext = useCallback(() => {
    const cur = sRef.current;
    const n = advance(cur, QUESTIONS);
    if (n === cur) return;
    sRef.current = n;
    setS(n);
    if (n.finished) reportDone();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // bỏ qua khi đang đứng ở một nút (Enter/Space để bấm chính nút đó)
      if (e.target instanceof HTMLElement && e.target.closest('button, input, textarea')) return;
      if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key)) {
        e.preventDefault();
        onNext();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onNext]);

  const fromGate = useApp((a) => a.gate !== null);
  const picked = s.step >= 1 ? pickedOf(q) : [];
  return (
    <div className="game b1 b1-click" onClick={onNext}>
      <div className="b1-head">
        <div className="b1-title wood-panel">
          <h1>🌼 VƯỜN HOA BƯỚM XINH 🦋</h1>
          <div className="b1-progress">
            Câu {s.index + 1} / {QUESTIONS.length}
            <span className="b3-dots">
              {QUESTIONS.map((_, i) => (
                <span key={i} className={i < s.index || (i === s.index && s.step === 3) ? 'done' : i === s.index ? 'cur' : ''} />
              ))}
            </span>
          </div>
        </div>
        <div className="b1-done-list">
          {QUESTIONS.slice(0, s.index).map((x, i) => (
            <BookLine key={i} q={x} picked={pickedOf(x)} small />
          ))}
        </div>
      </div>

      <div className="b1-garden">
        {Array.from({ length: q.a }, (_, i) => {
          const red = picked.includes(i);
          return (
            <span key={`${s.index}-${i}`} className={`b1-flower ${red ? 'red' : ''}`} aria-label={red ? `Bông hoa ${i + 1} đã bớt` : `Bông hoa ${i + 1}`}>
              <Flower red={red} />
              <span className={`b1-butterfly ${red ? 'on' : ''}`}>
                <Butterfly />
              </span>
            </span>
          );
        })}
      </div>

      {/* luôn giữ chỗ cho phép tính để hàng hoa không bị đẩy lên khi phép tính hiện ra */}
      <div className={`b1-row ${s.step >= 2 ? 'pop-in' : ''}`} style={{ visibility: s.step >= 2 ? 'visible' : 'hidden' }}>
        {q.sample && <span className="b1-sample">Mẫu</span>}
        <div className={`b1-eq wood-panel ${s.step === 3 ? 'correct pop-in' : ''}`}>
          {q.a} − {q.b} = <span className="b1-box">{s.step === 3 ? answerOf(q) : '?'}</span>
        </div>
      </div>

      {/* chơi từ cổng thì popup bảng phép tính (đã có dòng hoa như sách) thay cho bảng này, để không đè nhau */}
      {s.finished && !fromGate && (
        // bấm trong bảng tổng kết không tính là bấm "tiếp"
        <div className="overlay" onClick={(e) => e.stopPropagation()}>
          <div className="overlay-box wood-panel pop-in b1-summary">
            <h2>🎉 Hoàn thành Vườn Hoa!</h2>
            {QUESTIONS.map((x, i) => (
              <BookLine key={i} q={x} picked={pickedOf(x)} />
            ))}
            <div className="overlay-actions">
              <button className="btn btn-big" onClick={() => setS(initialState())}>
                🔁 Chơi lại
              </button>
              <PassGateButton />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
