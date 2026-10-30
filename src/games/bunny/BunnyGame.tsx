import { useEffect } from 'react';
import { audio } from '../../audio/AudioManager';
import { BunnyBoard, formatTime } from './BunnyBoard';
import { TARGETS } from './levels';
import { allArrived, TEAMS } from './logic';
import { useBunny } from './store';
import { PassGateButton } from '../../tour/gateBridge';

/** Hiện khi mọi thỏ đã vào hàng rào: hai đội thì xếp hạng theo thời gian về đích. */
function FinishOverlay() {
  const s = useBunny();
  if (!allArrived(s) || s.winner === null) return null;
  const lane = s.lanes[0];
  const order = s.lanes.map((_, i) => i).sort((a, b) => (s.times[a] ?? Infinity) - (s.times[b] ?? Infinity));
  return (
    <div className="overlay">
      <div className="overlay-box wood-panel pop-in">
        {s.mode === 'teams' ? (
          <>
            <h2 className={`b2-winner team-${TEAMS[s.winner].key}`}>🏆 {TEAMS[s.winner].name} thắng!</h2>
            <table className="b2-results">
              <tbody>
                {order.map((i, rank) => (
                  <tr key={i} className={`team-${TEAMS[i].key}`}>
                    <td>{rank === 0 ? '🥇' : '🥈'}</td>
                    <td className="b2-results-team">{TEAMS[i].name}</td>
                    <td>
                      bằng <span className="hl-target small">{s.levels[i].target}</span>
                    </td>
                    <td>⏱ {formatTime(s.times[i] ?? 0)}</td>
                    <td>nhầm {s.lanes[i].mistakes} lần</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ) : (
          <>
            <h2>🎉 Hoan hô! 🥕</h2>
            <p>Thỏ đã tới hàng rào cà rốt!</p>
            <p>
              Nhặt được {lane.carrots} củ cà rốt có kết quả bằng <span className="hl-target">{s.levels[0].target}</span>
              {lane.mistakes ? ` · nhầm ${lane.mistakes} lần` : ' · không nhầm lần nào'}
            </p>
            <p>⏱ Thời gian: {formatTime(s.times[0] ?? 0)}</p>
          </>
        )}
        <div className="overlay-actions">
          <button className="btn btn-big" onClick={() => s.newLevel()}>
            🔁 Chơi màn mới
          </button>
          <PassGateButton />
        </div>
      </div>
    </div>
  );
}

export function Hud() {
  const mode = useBunny((s) => s.mode);
  const targets = useBunny((s) => s.targets);
  const setMode = useBunny((s) => s.setMode);
  const setTarget = useBunny((s) => s.setTarget);
  const newLevel = useBunny((s) => s.newLevel);
  return (
    <>
      <div className="b2-mode wood-panel">
        <div>Chế độ:</div>
        <div className="b2-mode-btns">
          <button className={`btn btn-small ${mode === 'solo' ? 'active' : ''}`} onClick={() => setMode('solo')}>
            👤 1 người
          </button>
          <button className={`btn btn-small ${mode === 'teams' ? 'active' : ''}`} onClick={() => setMode('teams')}>
            👥 2 đội
          </button>
        </div>
      </div>
      <div className="b2-title wood-panel">
        <h1>
          <span className="o">THỎ NHẢY</span> <span className="g">TÌM CÀ RỐT</span> 🥕
        </h1>
        {mode === 'solo' ? (
          <p>
            Tìm phép trừ có kết quả bằng <span className="hl-target big">{targets[0]}</span>
          </p>
        ) : (
          <p className="b2-title-teams">
            <span className="b2-title-team team-red">
              Đội Đỏ tìm bằng <span className="hl-target big">{targets[0]}</span>
            </span>
            <span className="b2-title-team team-blue">
              Đội Xanh tìm bằng <span className="hl-target big">{targets[1]}</span>
            </span>
          </p>
        )}
      </div>
      <div className="b2-target wood-panel">
        {mode === 'solo' && (
          <>
            <div>Chọn số:</div>
            <div className="b2-target-btns">
              {TARGETS.map((n) => (
                <button key={n} className={`btn btn-small ${n === targets[0] ? 'active' : ''}`} onClick={() => setTarget(0, n)}>
                  {n}
                </button>
              ))}
            </div>
          </>
        )}
        <button className="btn btn-small" onClick={() => newLevel()}>
          🔀 Màn mới
        </button>
      </div>
      <FinishOverlay />
    </>
  );
}

export default function BunnyGame() {
  const restart = useBunny((s) => s.restart);
  useEffect(() => {
    restart();
    return () => audio.stop();
  }, [restart]);

  const mode = useBunny((s) => s.mode);
  return (
    <div className={`game b2 b2-${mode}`}>
      <BunnyBoard />
      <Hud />
    </div>
  );
}
