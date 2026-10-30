import { useEffect, useLayoutEffect, useReducer, useRef } from 'react';
import { TARGETS, type Mode } from './levels';
import { nextIndex, requiredCount, result, TEAMS } from './logic';
import { Rabbit2D, type Pose } from './Rabbit2D';
import { now, useBunny } from './store';

interface Spot {
  /** % chiều rộng bảng chơi. */
  x: number;
  /** Lệch dọc so với giữa làn, tính bằng cỡ ô. */
  y: number;
}

/**
 * Vị trí của vạch xuất phát (pos = -1), các ô và hàng rào cà rốt (pos = n).
 * Một mình: một làn ngang từ trái sang phải, cà rốt ở bên phải.
 * Hai đội: Đội Đỏ ở nửa trái nhảy sang phải, Đội Xanh ở nửa phải nhảy sang trái;
 * cà rốt ở giữa. Ô xếp zíc zắc lên xuống để vừa nửa màn hình mà vẫn to.
 */
export function spot(mode: Mode, lane: number, pos: number, n: number): Spot {
  if (mode === 'solo') {
    if (pos < 0) return { x: 9, y: 0 };
    if (pos >= n) return { x: 91, y: 0 };
    return { x: 9 + ((pos + 1) * (79 - 9)) / n, y: 0 };
  }
  let s: Spot;
  if (pos < 0) s = { x: 5, y: 0 };
  else if (pos >= n) s = { x: 47.5, y: 0 };
  else s = { x: 12 + (pos * (41 - 12)) / Math.max(1, n - 1), y: pos % 2 === 0 ? -0.55 : 0.55 };
  return lane === 0 ? s : { x: 100 - s.x, y: s.y };
}

const place = (s: Spot) => ({ left: `${s.x}%`, top: `calc(50% + ${s.y} * var(--tile))` });

/** Cú nhảy vòng cung từ chỗ cũ (lệch dx, dy px) về chỗ mới: co lại khi bật, duỗi khi bay, nén khi chạm đất. */
function hopFrames(dx: number, dy: number, h: number): Keyframe[] {
  return [
    { transform: `translate(${dx}px, ${dy}px) scale(1, 1)`, offset: 0 },
    { transform: `translate(${dx}px, ${dy}px) scale(1.1, 0.84)`, offset: 0.14, easing: 'ease-out' },
    { transform: `translate(${dx / 2}px, ${dy / 2 - h}px) scale(0.94, 1.08)`, offset: 0.52, easing: 'ease-in' },
    { transform: 'translate(0, 0) scale(1.12, 0.86)', offset: 0.88 },
    { transform: 'translate(0, 0) scale(1, 1)', offset: 1 },
  ];
}

/** Nhầm: rung tại chỗ rồi nhảy một mạch về vạch xuất phát. */
function returnFrames(dx: number, dy: number, h: number): Keyframe[] {
  return [
    { transform: `translate(${dx}px, ${dy}px)`, offset: 0 },
    { transform: `translate(${dx - 12}px, ${dy}px)`, offset: 0.08 },
    { transform: `translate(${dx + 12}px, ${dy}px)`, offset: 0.16 },
    { transform: `translate(${dx - 7}px, ${dy}px)`, offset: 0.24 },
    { transform: `translate(${dx}px, ${dy}px) scale(1.1, 0.84)`, offset: 0.34, easing: 'ease-out' },
    { transform: `translate(${dx / 2}px, ${dy / 2 - h}px) scale(0.94, 1.08)`, offset: 0.66, easing: 'ease-in' },
    { transform: 'translate(0, 0) scale(1.12, 0.86)', offset: 0.92 },
    { transform: 'translate(0, 0) scale(1, 1)', offset: 1 },
  ];
}

/** Thỏ của một làn. Khi thỏ làn này chuyển động thì chạy hoạt ảnh, xong thì báo `landed`. */
function LaneRabbit({ lane }: { lane: number }) {
  const mode = useBunny((s) => s.mode);
  const pos = useBunny((s) => s.lanes[lane]?.pos ?? -1);
  const phase = useBunny((s) => s.lanes[lane]?.phase ?? 'idle');
  const mistakes = useBunny((s) => s.lanes[lane]?.mistakes ?? 0);
  const n = useBunny((s) => s.levels[lane]?.tiles.length ?? 0);
  const ref = useRef<HTMLDivElement>(null);
  const last = useRef<[number, number] | null>(null);
  const played = useRef('');
  const moving = phase === 'hopping' || phase === 'returning' || phase === 'toGarden';
  const pose: Pose = phase === 'returning' ? 'hurt' : moving ? 'jump' : 'stand';

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const from = last.current;
    last.current = [el.offsetLeft, el.offsetTop];
    if (!moving) {
      el.getAnimations?.().forEach((a) => a.cancel());
      return;
    }
    const key = `${phase}:${pos}:${mistakes}`;
    if (played.current === key) return;
    played.current = key;
    const finish = () => {
      if (useBunny.getState().lanes[lane]?.phase === phase) useBunny.getState().landed(lane);
    };
    if (typeof el.animate !== 'function') return finish();
    const dx = from ? from[0] - el.offsetLeft : 0;
    const dy = from ? from[1] - el.offsetTop : 0;
    const dist = Math.hypot(dx, dy);
    const h = Math.min(130, 45 + dist * 0.18);
    const frames = phase === 'returning' ? returnFrames(dx, dy, h) : hopFrames(dx, dy, h);
    const duration = (phase === 'returning' ? 700 : 450) + Math.min(600, dist * 0.6);
    el.animate(frames, { duration }).onfinish = finish;
  }, [mode, pos, moving, phase, mistakes, lane]);

  useEffect(() => () => ref.current?.getAnimations?.().forEach((a) => a.cancel()), []);

  return (
    <div ref={ref} className="b2-rabbit" style={place(spot(mode, lane, pos, n))}>
      <Rabbit2D team={TEAMS[lane].key} pose={pose} />
    </div>
  );
}

/** Ô hình bàn chân ghi phép trừ. Ô kế tiếp phát sáng, hỏi "Bằng N?" và có hai nút Đúng / Sai ngay bên dưới. */
function PawTile({ lane, index }: { lane: number; index: number }) {
  const mode = useBunny((s) => s.mode);
  const tile = useBunny((s) => s.levels[lane].tiles[index]);
  const n = useBunny((s) => s.levels[lane].tiles.length);
  const target = useBunny((s) => s.levels[lane].target);
  const mark = useBunny((s) => s.lanes[lane].marks[index]);
  const wrong = useBunny((s) => s.lanes[lane].wrongId === tile.id);
  const mistakes = useBunny((s) => s.lanes[lane].mistakes);
  const ask = useBunny((s) => nextIndex(s.lanes[lane]) === index && s.lanes[lane].phase === 'idle');
  const answer = useBunny((s) => s.answer);
  const value = result(tile.a, tile.b);

  return (
    <div className={`paw ${mark} ${ask ? 'next' : ''}`} style={place(spot(mode, lane, index, n))} data-testid="paw">
      <div key={wrong ? mistakes : 'ok'} className={`paw-body ${wrong ? 'wrong shake' : ''}`}>
        <div className="paw-toes">
          <i />
          <i />
          <i />
          <i />
        </div>
        <div className="paw-pad">
          <span className="paw-text">
            {tile.a} − {tile.b}
            {mark !== 'unknown' && <span className="paw-value"> = {value}</span>}
          </span>
        </div>
      </div>
      {ask && (
        <>
          <div className="paw-ask">
            Bằng <span className="hl-target small">{target}</span>?
          </div>
          <div className="paw-answer">
            <button className="btn ans-yes" onClick={() => answer(lane, true)}>
              ✔ Đúng
            </button>
            <button className="btn ans-no" onClick={() => answer(lane, false)}>
              ✘ Sai
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** m:ss */
export function formatTime(ms: number) {
  const sec = Math.floor(ms / 1000);
  return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`;
}

/** Đồng hồ của một đội: chạy từ lúc hai đội cùng xuất phát, dừng khi thỏ đội đó vào hàng rào. */
function TeamClock({ lane }: { lane: number }) {
  const startedAt = useBunny((s) => s.startedAt);
  const time = useBunny((s) => s.times[lane] ?? null);
  const [, tick] = useReducer((x: number) => x + 1, 0);
  useEffect(() => {
    if (time !== null) return;
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [time]);
  return (
    <div className={`b2-clock ${time !== null ? 'done' : ''}`} data-testid="clock">
      {time !== null ? '🏁' : '⏱'} {formatTime(time ?? now() - startedAt)}
    </div>
  );
}

/** Hàng nút chọn số riêng của một đội. */
function TeamPicker({ lane }: { lane: number }) {
  const target = useBunny((s) => s.targets[lane]);
  const setTarget = useBunny((s) => s.setTarget);
  return (
    <div className="b2-pick">
      <span>Số:</span>
      {TARGETS.map((n) => (
        <button key={n} className={`btn btn-small ${n === target ? 'active' : ''}`} onClick={() => setTarget(lane, n)}>
          {n}
        </button>
      ))}
    </div>
  );
}

function Lane({ lane }: { lane: number }) {
  const mode = useBunny((s) => s.mode);
  const level = useBunny((s) => s.levels[lane]);
  const carrots = useBunny((s) => s.lanes[lane].carrots);
  const first = useBunny((s) => s.winner === lane);
  const arrived = useBunny((s) => s.lanes[lane].phase === 'arrived');
  const team = TEAMS[lane];
  const n = level.tiles.length;
  return (
    <div className={`b2-lane team-${team.key} side-${lane === 0 ? 'left' : 'right'}`} data-testid="lane">
      <div className="b2-lane-label">
        <div className="b2-lane-row">
          {mode === 'teams' && (
            <div className="b2-team-name">
              {arrived && <span className="b2-medal-icon">{first ? '🥇' : '🥈'} </span>}
              {team.name}
            </div>
          )}
          {mode === 'teams' && <TeamClock lane={lane} />}
          <div className="b2-carrots">
            🥕 {mode === 'solo' && 'Cà rốt: '}
            {carrots}/{requiredCount(level)}
          </div>
        </div>
        {mode === 'teams' && <TeamPicker lane={lane} />}
      </div>
      <div className="b2-start" style={place(spot(mode, lane, -1, n))}>
        <span>XUẤT PHÁT</span>
      </div>
      {level.tiles.map((t, i) => (
        <PawTile key={t.id} lane={lane} index={i} />
      ))}
      <LaneRabbit lane={lane} />
    </div>
  );
}

/** Hàng rào cà rốt: ở giữa khi hai đội, bên phải khi chơi một mình. Chỗ duy nhất có cà rốt. */
function CarrotGarden({ count }: { count: number }) {
  const fence = { backgroundImage: 'url(./images/bunny/fence.png)' };
  return (
    <div className="b2-garden" data-testid="garden">
      <div className="b2-garden-fence top" style={fence} />
      <div className="b2-garden-sign">🥕 Cà rốt</div>
      <div className="b2-garden-soil">
        {Array.from({ length: count }, (_, i) => (
          <img key={i} className="b2-garden-carrot" src="./images/bunny/carrot.png" alt="" draggable={false} />
        ))}
      </div>
      <div className="b2-garden-fence bottom" style={fence} />
    </div>
  );
}

/** Cảnh 2D của Bài 2: đồng cỏ phủ kín màn hình, bụi cây ở mép trên, các làn và hàng rào cà rốt. */
export function BunnyBoard() {
  const mode = useBunny((s) => s.mode);
  const laneCount = useBunny((s) => s.lanes.length);
  return (
    <div className="b2-scene">
      <div className="b2-grass" />
      <div className="b2-bushes">
        {Array.from({ length: 9 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
      <div className={`b2-board mode-${mode}`}>
        <CarrotGarden count={mode === 'teams' ? 6 : 4} />
        {Array.from({ length: laneCount }, (_, i) => (
          <Lane key={i} lane={i} />
        ))}
      </div>
    </div>
  );
}
