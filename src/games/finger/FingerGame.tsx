import { useCallback, useEffect, useRef, useState } from 'react';
import { audio, sfx } from '../../audio/AudioManager';
import { randomPraise, randomRetry } from '../../audio/voiceLines';
import { CameraView } from '../../hand/CameraView';
import { useHandTracker } from '../../hand/useHandTracker';
import { PassGateButton, reportDone, reportProgress } from '../../tour/gateBridge';
import { answer, answerOf, initialState, next, type FingerState } from './logic';
import { QUESTIONS } from './questions';

const NEXT_DELAY_MS = 2400;

export default function FingerGame() {
  const [s, setS] = useState<FingerState>(initialState);
  const sRef = useRef(s);
  sRef.current = s;
  const [shake, setShake] = useState(0);
  const q = QUESTIONS[s.index];

  const submit = useCallback((value: number) => {
    const r = answer(sRef.current, QUESTIONS, value);
    if (r.event === 'ignored') return;
    sRef.current = r.state;
    setS(r.state);
    const cur = QUESTIONS[r.state.index];
    if (r.event === 'correct') {
      sfx('correct');
      reportProgress(r.state.index + 1);
      audio.say([randomPraise(), `b3.a.${cur.a}-${cur.b}`], { interrupt: true });
      window.setTimeout(() => {
        const n = next(sRef.current, QUESTIONS);
        sRef.current = n;
        setS(n);
        if (n.finished) {
          sfx('win');
          audio.say('finish');
          reportDone();
        } else {
          const nq = QUESTIONS[n.index];
          audio.say(`b3.q.${nq.a}-${nq.b}`);
        }
      }, NEXT_DELAY_MS);
    } else {
      sfx('wrong');
      setShake((k) => k + 1);
      audio.say(randomRetry(), { interrupt: true });
    }
  }, []);

  const tracker = useHandTracker({ onCommit: submit });
  const cameraOk = tracker.status === 'ready' || tracker.status === 'loading';

  useEffect(() => {
    audio.say(['b3.intro', `b3.q.${QUESTIONS[0].a}-${QUESTIONS[0].b}`], { interrupt: true });
    return () => audio.stop();
  }, []);

  const restart = () => {
    const n = initialState();
    sRef.current = n;
    setS(n);
    tracker.resetHold();
    audio.say(`b3.q.${QUESTIONS[0].a}-${QUESTIONS[0].b}`, { interrupt: true });
  };

  return (
    <div className="game b3">
      <div className="b3-main">
        <div className="b3-left">
          <div className="b3-progress">
            Câu {s.index + 1} / {QUESTIONS.length}
            <div className="b3-dots">
              {QUESTIONS.map((_, i) => (
                <span key={i} className={i < s.index || (i === s.index && s.feedback === 'correct') ? 'done' : i === s.index ? 'cur' : ''} />
              ))}
            </div>
          </div>
          <div key={shake} className={`b3-question wood-panel ${s.feedback === 'wrong' ? 'shake wrong' : ''} ${s.feedback === 'correct' ? 'correct pop-in' : ''}`}>
            {q.a} − {q.b} = <span className="b3-answer">{s.feedback === 'correct' ? answerOf(q) : '?'}</span>
          </div>
          <div className="b3-feedback">
            {s.feedback === 'correct' && <span className="ok">🎉 Đúng rồi!</span>}
            {s.feedback === 'wrong' && <span className="bad">Chưa đúng, thử lại nhé!</span>}
          </div>
          <div className="b3-seeing">
            {tracker.status !== 'ready'
              ? 'Hãy bấm số ở dưới để trả lời'
              : tracker.count === null
                ? '✋ Giơ tay trước camera nhé!'
                : (
                  <>
                    Bạn đang giơ: <b>{tracker.count}</b> ngón
                  </>
                )}
          </div>
          {tracker.status === 'ready' && (
            <div className="b3-hold" aria-label="Giữ yên tay">
              <div className="b3-hold-fill" style={{ width: `${(tracker.count === null ? 0 : tracker.progress) * 100}%` }} />
              <span>Giữ yên tay để chọn</span>
            </div>
          )}
        </div>
        <div className="b3-right">
          <div className="b3-cam-fit">
            <div className="b3-cam-box">
              <CameraView tracker={tracker} />
              <p className="b3-tip">Giơ ngón tay bằng kết quả. Cần nhiều hơn 5 thì dùng cả hai tay.</p>
            </div>
          </div>
        </div>
      </div>
      <div className={`b3-keypad ${cameraOk ? '' : 'emphasis'}`}>
        {Array.from({ length: 11 }, (_, n) => (
          <button key={n} className="btn key" onClick={() => submit(n)}>
            {n}
          </button>
        ))}
      </div>
      {s.finished && (
        <div className="overlay">
          <div className="overlay-box wood-panel pop-in">
            <h2>🎉 Hoàn thành!</h2>
            <div className="b3-summary">
              {QUESTIONS.map((x) => (
                <div key={x.b}>
                  {x.a} − {x.b} = <b>{answerOf(x)}</b>
                </div>
              ))}
            </div>
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
