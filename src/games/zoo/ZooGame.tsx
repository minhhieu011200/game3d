import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { audio } from '../../audio/AudioManager';
import { useQuality } from '../../shared/3d/quality';
import { DOCKS, type BoatInput } from './boat';
import { boatRuntime } from './boatRuntime';
import { countKind, countLine, equationFor, formatEquation, KIND_LABELS, KINDS } from './logic';
import { SKY_BAND } from './objects/Draggable';
import { useZoo } from './store';
import { PassGateButton } from '../../tour/gateBridge';
import { TASKS, taskProgress } from './tasks';
import { ZooScene } from './ZooScene';

/** Thanh trên cùng: đặt lại và bật/tắt bảng đếm (cho giáo viên xem đáp án khi cần). */
function ModeBar({ board, toggleBoard }: { board: boolean; toggleBoard(): void }) {
  const reset = useZoo((s) => s.reset);
  return (
    <div className="zoo-modebar wood-panel">
      <button className={`btn btn-small ${board ? 'active' : ''}`} onClick={toggleBoard}>
        📋 Bảng đếm
      </button>
      <button className="btn btn-small" onClick={reset}>
        🔄 Đặt lại
      </button>
    </div>
  );
}

/** Nút bến: bấm là thuyền tự chạy tới. */
function Destinations() {
  const travel = useZoo((s) => s.travel);
  return (
    <div className="zoo-dest">
      {DOCKS.map((d) => (
        <button key={d.id} className="btn zoo-dest-btn" onClick={() => travel(d.id)}>
          {d.label}
        </button>
      ))}
    </div>
  );
}

type Dir = keyof BoatInput;
const KEYS: Record<string, Dir> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'back',
  ArrowDown: 'back',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
};

/** Lái thuyền bằng phím W A S D / mũi tên, hoặc giữ các nút mũi tên to trên màn hình. */
function DrivePad() {
  useEffect(() => {
    const set = (e: KeyboardEvent, on: boolean) => {
      const d = KEYS[e.code];
      if (!d) return;
      e.preventDefault();
      boatRuntime.input[d] = on;
    };
    const down = (e: KeyboardEvent) => set(e, true);
    const up = (e: KeyboardEvent) => set(e, false);
    const blur = () => (boatRuntime.input = { forward: false, back: false, left: false, right: false });
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', blur);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', blur);
      blur();
    };
  }, []);
  const hold = (d: Dir) => ({
    onPointerDown: (e: React.PointerEvent) => {
      (e.target as Element).setPointerCapture(e.pointerId);
      boatRuntime.input[d] = true;
    },
    onPointerUp: () => (boatRuntime.input[d] = false),
    onPointerCancel: () => (boatRuntime.input[d] = false),
  });
  return (
    <div className="zoo-pad" aria-label="Lái thuyền">
      <button className="btn pad-up" {...hold('forward')} aria-label="Tiến">
        ▲
      </button>
      <button className="btn pad-left" {...hold('left')} aria-label="Rẽ trái">
        ◀
      </button>
      <button className="btn pad-down" {...hold('back')} aria-label="Lùi">
        ▼
      </button>
      <button className="btn pad-right" {...hold('right')} aria-label="Rẽ phải">
        ▶
      </button>
    </div>
  );
}

function TeacherBoard() {
  const objects = useZoo((s) => s.objects);
  const revealed = useZoo((s) => s.revealed);
  const reveal = useZoo((s) => s.reveal);
  return (
    <div className="zoo-board wood-panel">
      <h3>Bảng đếm</h3>
      {KINDS.map((k) => {
        const c = countKind(objects, k);
        return (
          <div key={k} className="zoo-board-row">
            <div className="zoo-board-head">
              <b>{KIND_LABELS[k].name}</b>
              <button className="btn btn-small" onClick={() => reveal(k)}>
                {revealed[k] ? 'Ẩn' : 'Hiện đáp án'}
              </button>
            </div>
            {revealed[k] && (
              <div className="pop-in">
                <div>{countLine(k, c)}</div>
                <div className="zoo-eq">{formatEquation(equationFor(c))}</div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StudentPanel() {
  const student = useZoo((s) => s.student);
  const objects = useZoo((s) => s.objects);
  const hint = useZoo((s) => s.hint);
  const answer = useZoo((s) => s.answer);
  const reset = useZoo((s) => s.reset);

  if (student.phase === 'done') {
    return (
      <div className="overlay">
        <div className="overlay-box wood-panel pop-in">
          <h2>🎉 Hoan hô!</h2>
          <p>Bạn đã hoàn thành chuyến tham quan vườn thú!</p>
          <div className="zoo-done-eqs">
            <div>🐸 10 − 2 = 8</div>
            <div>🕊️ 10 − 5 = 5</div>
            <div>🕯️ 10 − 3 = 7</div>
          </div>
          <div className="overlay-actions">
            <button className="btn btn-big" onClick={reset}>
              🔁 Chơi lại
            </button>
            <PassGateButton />
          </div>
        </div>
      </div>
    );
  }

  const task = TASKS[student.taskIndex];
  const p = taskProgress(task, objects);
  return (
    <div className="zoo-task wood-panel">
      <div className="zoo-task-step">
        Nhiệm vụ {student.taskIndex + 1} / {TASKS.length}
      </div>
      {student.phase === 'doing' ? (
        <>
          <div className="zoo-task-prompt">{task.prompt}</div>
          {hint ? (
            <div className="zoo-hint">{hint}</div>
          ) : (
            p.kind === 'not-enough' && <div className="zoo-task-left">Còn {p.left} nữa</div>
          )}
          <button className="btn btn-small" onClick={() => audio.say(task.voice.task, { interrupt: true })}>
            🔊 Nghe lại
          </button>
        </>
      ) : (
        <>
          <div className="zoo-task-prompt">{task.question}</div>
          <div className="zoo-choices">
            {student.choices.map((c) => (
              <button
                key={c}
                className={`btn zoo-choice ${student.wrongChoices.includes(c) ? 'wrong' : ''}`}
                disabled={student.wrongChoices.includes(c)}
                onClick={() => answer(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function SelectionBar() {
  const selected = useZoo((s) => s.selected);
  const objects = useZoo((s) => s.objects);
  const remove = useZoo((s) => s.remove);
  const select = useZoo((s) => s.select);
  const o = objects.find((x) => x.id === selected && !x.deleted);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'Delete' || e.key === 'Backspace') && o) remove(o.id);
      if (e.key === 'Escape') select(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [o, remove, select]);
  if (!o) return null;
  const name = { frog: 'Bạn ếch', stork: 'Bạn cò', candle: 'Ngọn nến' }[o.kind];
  return (
    <div className="zoo-selection wood-panel">
      <span>{name} đang được chọn</span>
      <button className="btn btn-small" onClick={() => remove(o.id)}>
        🗑️ Xóa
      </button>
      <button className="btn btn-small" onClick={() => select(null)}>
        ✖ Bỏ chọn
      </button>
    </div>
  );
}

function SkyDropZone() {
  const dragging = useZoo((s) => s.dragging);
  return (
    <div className={`zoo-skyband ${dragging ? 'show' : ''}`} style={{ height: `${SKY_BAND * 100}%` }}>
      ☁️ Thả vào đây để đưa lên trời ☁️
    </div>
  );
}

// Cho phép script kiểm thử đọc trạng thái khi chạy bản phát triển.
if (import.meta.env.DEV) (window as unknown as { __zoo: typeof useZoo }).__zoo = useZoo;

export default function ZooGame() {
  const q = useQuality();
  const [board, setBoard] = useState(false);
  const reset = useZoo((s) => s.reset);
  useEffect(() => {
    reset();
    return () => audio.stop();
  }, [reset]);

  return (
    <div className="game zoo">
      <Canvas
        dpr={q.dpr}
        gl={{ antialias: q.antialias }}
        camera={{ position: [-45, 4, -9], fov: 55, near: 0.1, far: 400 }}
        onPointerMissed={() => useZoo.getState().select(null)}
      >
        <Suspense fallback={null}>
          <ZooScene />
        </Suspense>
      </Canvas>
      <SkyDropZone />
      <ModeBar board={board} toggleBoard={() => setBoard((b) => !b)} />
      <Destinations />
      {board ? <TeacherBoard /> : <StudentPanel />}
      <SelectionBar />
      <DrivePad />
      <div className="zoo-help">
        Lái thuyền: W A S D, phím mũi tên hoặc nút ▲◀▼▶ · Bấm bến để thuyền tự chạy · Kéo chuột để xoay · Kéo con vật để di chuyển · Bấm nến để thổi tắt
      </div>
    </div>
  );
}
