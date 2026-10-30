import { create } from 'zustand';
import { audio, sfx } from '../../audio/AudioManager';
import { randomPraise, randomRetry } from '../../audio/voiceLines';
import { resetBoat, sailTo } from './boatRuntime';
import { emitEffect } from './effects';
import { initialObjects } from './layout';
import { attachToSlot, deleteObject, moveObject, toggleCandle, zoneAt, type Kind, type ZooObject } from './logic';
import { chooseAnswer, initialStudent, onSceneChange, TASKS, taskProgress, type StudentState } from './tasks';
import { resetWheel } from './wheelRuntime';
import { reportDone } from '../../tour/gateBridge';

interface ZooStore {
  objects: ZooObject[];
  selected: string | null;
  dragging: string | null;
  /** Bảng đếm của từng loại đã được bấm "Hiện đáp án" chưa. */
  revealed: Record<Kind, boolean>;
  student: StudentState;
  /** Câu nhắc khi làm thừa, ví dụ "Nhiều quá rồi!…". */
  hint: string | null;

  reset(): void;
  select(id: string | null): void;
  setDragging(id: string | null): void;
  drop(id: string, pos: [number, number, number]): void;
  /** Thả nến vào cabin trống `slot` của vòng quay. */
  dropOnWheel(id: string, slot: number): void;
  remove(id: string): void;
  toggleCandle(id: string): void;
  reveal(kind: Kind): void;
  answer(choice: string): void;
  /** Thuyền tự chạy tới bến. */
  travel(id: string): void;
}

export const useZoo = create<ZooStore>()((set, get) => {
  /** Sau mỗi thao tác: cập nhật nhiệm vụ học sinh và đọc câu hỏi / lời nhắc. */
  const afterChange = (objects: ZooObject[]) => {
    const { student } = get();
    const next = onSceneChange(student, objects);
    const task = TASKS[next.taskIndex];
    let hint: string | null = null;
    if (next.phase === 'doing') {
      const p = taskProgress(task, objects);
      if (p.kind === 'too-many') {
        hint = task.tooMany(p.extra);
        if (get().hint !== hint) audio.say(task.voice.tooMany, { interrupt: true });
      }
    }
    if (student.phase !== 'question' && next.phase === 'question') {
      sfx('correct');
      audio.say([task.voice.question, 'b4.choose'], { interrupt: true });
    }
    set({ objects, student: next, hint });
  };

  const startStudent = () => {
    const s = initialStudent();
    audio.say(['b4.welcome', TASKS[0].voice.task], { interrupt: true });
    return s;
  };

  return {
    // Bài 4 chỉ có một cách chơi: làm lần lượt các nhiệm vụ (bảng đếm bật/tắt riêng).
    objects: initialObjects(),
    selected: null,
    dragging: null,
    revealed: { frog: false, stork: false, candle: false },
    student: initialStudent(),
    hint: null,

    reset() {
      resetBoat();
      resetWheel();
      const student = startStudent();
      set({
        objects: initialObjects(),
        selected: null,
        dragging: null,
        revealed: { frog: false, stork: false, candle: false },
        student,
        hint: null,
      });
    },
    select(id) {
      set({ selected: id });
    },
    setDragging(id) {
      set({ dragging: id });
    },
    drop(id, pos) {
      const o = get().objects.find((x) => x.id === id);
      if (!o) return;
      const zone = zoneAt(o.kind, pos);
      if (zone === 'sky') sfx('whoosh');
      else if (zone === 'river') sfx('splash');
      else sfx('pop');
      if (zone === 'river') emitEffect('splash', [pos[0], pos[1], pos[2]]);
      if (o.kind === 'stork' && zone === 'sky' && o.zone !== 'sky') emitEffect('feathers', o.pos);
      afterChange(moveObject(get().objects, id, pos, zone));
    },
    dropOnWheel(id, slot) {
      sfx('pop');
      afterChange(attachToSlot(get().objects, id, slot));
    },
    remove(id) {
      sfx('puff');
      set({ selected: null });
      afterChange(deleteObject(get().objects, id));
    },
    toggleCandle(id) {
      sfx('puff');
      afterChange(toggleCandle(get().objects, id));
    },
    reveal(kind) {
      set({ revealed: { ...get().revealed, [kind]: !get().revealed[kind] } });
    },
    answer(choice) {
      const { student, objects } = get();
      const r = chooseAnswer(student, objects, choice);
      if (student.phase !== 'question') return;
      if (!r.correct) {
        sfx('wrong');
        audio.say(randomRetry(), { interrupt: true });
        return set({ student: r.state });
      }
      sfx('correct');
      if (r.state.phase === 'done') {
        sfx('win');
        audio.say([randomPraise(), 'b4.done'], { interrupt: true });
        reportDone();
      } else {
        const t = TASKS[r.state.taskIndex];
        audio.say([randomPraise(), t.voice.task], { interrupt: true });
        get().travel(t.waypoint);
      }
      set({ student: r.state });
    },
    travel(id) {
      sailTo(id);
    },
  };
});
