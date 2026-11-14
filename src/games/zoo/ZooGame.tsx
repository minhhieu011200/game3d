import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { useQuality } from '../../shared/3d/quality';
import { dockById, DOCKS, type BoatInput } from './boat';
import { boatRuntime } from './boatRuntime';
import { SKY_BAND } from './objects/Draggable';
import { ACTIONS, useZoo, type ActKind } from './store';
import { reportRecap } from '../../tour/gateBridge';
import { zooRecap } from './recap';
import { ZooScene } from './ZooScene';

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

const ACT_KINDS = Object.keys(ACTIONS) as ActKind[];

/** Bến đang đậu có nút hành động (ếch / cò); đọc trạng thái thuyền vài lần mỗi giây, vì thuyền chạy ngoài React. */
function useDockedAction(): ActKind | null {
  const [kind, setKind] = useState<ActKind | null>(null);
  useEffect(() => {
    const id = window.setInterval(() => {
      const docked = boatRuntime.target === null ? ACT_KINDS.find((k) => boatRuntime.focus === dockById(ACTIONS[k].dock).look) : undefined;
      setKind(docked ?? null);
    }, 200);
    return () => window.clearInterval(id);
  }, []);
  return kind;
}

/** Ở bến ếch / bến cò: nút "Nhảy" / "Bay"; bấm xong thì khung "Đáp án" bên phải hiện phép tính 10 − n. */
function ActionPanel() {
  const kind = useDockedAction();
  const acted = useZoo((s) => s.acted);
  const answered = useZoo((s) => s.answered);
  const act = useZoo((s) => s.act);
  const showAnswer = useZoo((s) => s.showAnswer);
  if (!kind) return null;
  const n = ACTIONS[kind].count;
  return (
    <>
      {!acted[kind] && (
        <button className="btn btn-big btn-primary zoo-jump pop-in" onClick={() => act(kind)}>
          {ACTIONS[kind].label}
        </button>
      )}
      {acted[kind] && (
        <div className="zoo-answer wood-panel pop-in">
          {answered[kind] ? (
            <div className="zoo-answer-eq pop-in">
              10 − {n} = {10 - n}
            </div>
          ) : (
            <button className="btn btn-big" onClick={() => showAnswer(kind)}>
              Đáp án
            </button>
          )}
        </div>
      )}
    </>
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
  const reset = useZoo((s) => s.reset);
  useEffect(() => {
    reset();
  }, [reset]);
  // bảng phép tính hiện trong popup khi qua cổng: báo ngay lúc mở và khi hiện đáp án
  useEffect(() => {
    reportRecap(zooRecap(useZoo.getState().answered));
    return useZoo.subscribe((s, prev) => {
      if (s.answered !== prev.answered) reportRecap(zooRecap(s.answered));
    });
  }, []);

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
      <Destinations />
      <ActionPanel />
      <SelectionBar />
      <DrivePad />
      <div className="zoo-help">
        Lái thuyền: W A S D, phím mũi tên hoặc nút ▲◀▼▶ · Bấm bến để thuyền tự chạy · Kéo chuột để xoay · Kéo con vật để di chuyển · Bấm nến để thổi tắt
      </div>
    </div>
  );
}
