import { useCallback, useEffect, useRef, useState } from 'react';
import { audio, sfx } from '../../audio/AudioManager';
import { randomPraise, randomRetry } from '../../audio/voiceLines';
import { PassGateButton, reportDone } from '../../tour/gateBridge';
import { answer, answerOf, canAnswer, initialState, next, toggleFlower, type FlowerState } from './logic';
import { QUESTIONS, type Question } from './questions';

const NEXT_DELAY_MS = 2600;
const STONES = [0, 1, 2, 3, 4, 5, 6];

const qKey = (q: Question) => `${q.a}-${q.b}`;

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

/** Một dòng như trong sách: 6 bông hoa và phép tính. */
function BookLine({ q, picked, small }: { q: Question; picked: number[]; small?: boolean }) {
  return (
    <div className={`b1-line ${small ? 'small' : ''}`}>
      <span className="b1-line-flowers">
        {Array.from({ length: q.a }, (_, i) => (
          <Flower key={i} red={picked.includes(i)} />
        ))}
      </span>
      <span className="b1-line-eq">
        {q.a} − {q.b} = <b>{answerOf(q)}</b>
      </span>
    </div>
  );
}

export default function FlowerGame() {
  const [s, setS] = useState<FlowerState>(initialState);
  const sRef = useRef(s);
  sRef.current = s;
  const [shake, setShake] = useState(0);
  const q = QUESTIONS[s.index];
  const timer = useRef<number>();

  const update = (n: FlowerState) => {
    sRef.current = n;
    setS(n);
  };

  const onFlower = useCallback((i: number) => {
    const r = toggleFlower(sRef.current, QUESTIONS, i);
    if (r.event === 'ignored') return;
    update(r.state);
    if (r.event === 'picked') sfx('pop');
    else if (r.event === 'unpicked') sfx('whoosh');
    else {
      sfx('wrong');
      audio.say('b1.enough', { interrupt: true });
    }
  }, []);

  const onStone = useCallback((value: number) => {
    const r = answer(sRef.current, QUESTIONS, value);
    if (r.event === 'ignored') return;
    update(r.state);
    const cur = QUESTIONS[r.state.index];
    if (r.event === 'needmore') {
      sfx('wrong');
      audio.say('b1.needmore', { interrupt: true });
    } else if (r.event === 'correct') {
      sfx('correct');
      audio.say([randomPraise(), `b1.a.${qKey(cur)}`], { interrupt: true });
      timer.current = window.setTimeout(() => {
        const n = next(sRef.current, QUESTIONS);
        update(n);
        if (n.finished) {
          sfx('win');
          audio.say('finish');
          reportDone();
        } else {
          audio.say(`b1.q.${qKey(QUESTIONS[n.index])}`);
        }
      }, NEXT_DELAY_MS);
    } else {
      sfx('wrong');
      setShake((k) => k + 1);
      audio.say(randomRetry(), { interrupt: true });
    }
  }, []);

  useEffect(() => {
    audio.say(['b1.intro', `b1.q.${qKey(QUESTIONS[0])}`], { interrupt: true });
    return () => {
      window.clearTimeout(timer.current);
      audio.stop();
    };
  }, []);

  const restart = () => {
    window.clearTimeout(timer.current);
    update(initialState());
    audio.say(`b1.q.${qKey(QUESTIONS[0])}`, { interrupt: true });
  };

  const ready = canAnswer(s, QUESTIONS);
  const hint =
    s.notice === 'enough'
      ? `Đã bớt đủ ${q.b} bông rồi!`
      : s.notice === 'needmore'
        ? `Hãy bớt đủ ${q.b} bông trước nhé!`
        : s.feedback === 'correct'
          ? '🎉 Đúng rồi!'
          : s.feedback === 'wrong'
            ? 'Chưa đúng, đếm lại hoa vàng nhé!'
            : ready
              ? 'Còn lại mấy bông hoa vàng? Bấm viên đá số nhé!'
              : `Bấm vào ${q.b - s.picked.length} bông hoa để bướm bay tới hút mật`;

  return (
    <div className="game b1">
      <div className="b1-head">
        <div className="b1-title wood-panel">
          <h1>🌼 VƯỜN HOA BƯỚM XINH 🦋</h1>
          <div className="b1-progress">
            Câu {s.index + 1} / {QUESTIONS.length}
            <span className="b3-dots">
              {QUESTIONS.map((_, i) => (
                <span key={i} className={i < s.index || (i === s.index && s.feedback === 'correct') ? 'done' : i === s.index ? 'cur' : ''} />
              ))}
            </span>
          </div>
        </div>
        <div className="b1-done-list">
          {s.history.map((p, i) => (
            <BookLine key={i} q={QUESTIONS[i]} picked={p} small />
          ))}
        </div>
      </div>

      <div className="b1-garden">
        {Array.from({ length: q.a }, (_, i) => {
          const red = s.picked.includes(i);
          return (
            <button
              key={`${s.index}-${i}`}
              className={`b1-flower ${red ? 'red' : ''}`}
              onClick={() => onFlower(i)}
              aria-label={red ? `Bông hoa ${i + 1} đã bớt` : `Bông hoa ${i + 1}`}
              aria-pressed={red}
            >
              <Flower red={red} />
              <span className={`b1-butterfly ${red ? 'on' : ''}`}>
                <Butterfly />
              </span>
            </button>
          );
        })}
      </div>

      <div className="b1-row">
        {q.sample && <span className="b1-sample">Mẫu</span>}
        <div className={`b1-eq wood-panel ${s.feedback === 'correct' ? 'correct pop-in' : ''}`}>
          {q.a} − {q.b} = <span className="b1-box">{s.feedback === 'correct' ? answerOf(q) : '?'}</span>
        </div>
      </div>

      <div className={`b1-hint ${s.notice ? 'warn' : ''} ${s.feedback === 'correct' ? 'ok' : ''}`}>{hint}</div>

      <div className="b1-stones">
        {STONES.map((n) => (
          <button
            key={n}
            className={`b1-stone ${ready ? '' : 'locked'} ${s.wrongValue === n && s.feedback === 'wrong' ? 'wrong' : ''} ${
              s.wrongValue === n ? `shake-${shake % 2}` : ''
            }`}
            onClick={() => onStone(n)}
          >
            {n}
          </button>
        ))}
      </div>

      {s.finished && (
        <div className="overlay">
          <div className="overlay-box wood-panel pop-in b1-summary">
            <h2>🎉 Hoàn thành Vườn Hoa!</h2>
            {QUESTIONS.map((x, i) => (
              <BookLine key={i} q={x} picked={s.history[i] ?? []} />
            ))}
            <p>
              Đúng ngay lần đầu: <b>{s.firstTry}</b> / {QUESTIONS.length} câu
            </p>
            <div className="overlay-actions">
              <button className="btn btn-big" onClick={restart}>
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
