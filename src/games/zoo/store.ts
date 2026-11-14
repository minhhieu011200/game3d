import { create } from 'zustand';
import { dockById } from './boat';
import { resetBoat, sailTo } from './boatRuntime';
import { emitEffect } from './effects';
import { initialObjects } from './layout';
import { attachToSlot, deleteObject, moveObject, toggleCandle, zoneAt, type ZooObject } from './logic';
import { resetWheel } from './wheelRuntime';
import { riverCenterZ, RIVER_HALF_WIDTH, SKY_Y, WATER_Y } from './world';

/** Hành động ở mỗi bến: bấm nút thì `count` bạn cùng lúc nhảy xuống hồ / bay lên trời (phép tính 10 − count). */
export const ACTIONS = {
  frog: { dock: 'frogs', count: 5, label: '🐸 Nhảy' },
  stork: { dock: 'storks', count: 2, label: '🕊️ Bay' },
  // trứng không phải vật kéo thả: EggNest đọc `acted.egg` để cho 3 quả nở ra gà con
  egg: { dock: 'eggs', count: 3, label: '🐣 Nở' },
} as const;
export type ActKind = keyof typeof ACTIONS;
const NONE: Record<ActKind, boolean> = { frog: false, stork: false, egg: false };

interface ZooStore {
  objects: ZooObject[];
  selected: string | null;
  dragging: string | null;
  /** Đã bấm nút hành động của bến (ếch nhảy / cò bay). */
  acted: Record<ActKind, boolean>;
  /** Đã bấm "Đáp án" của bến đó. */
  answered: Record<ActKind, boolean>;

  reset(): void;
  select(id: string | null): void;
  setDragging(id: string | null): void;
  drop(id: string, pos: [number, number, number]): void;
  /** Thả nến vào cabin trống `slot` của vòng quay. */
  dropOnWheel(id: string, slot: number): void;
  remove(id: string): void;
  toggleCandle(id: string): void;
  /** Bến ếch: 5 bạn ếch cùng nhảy xuống hồ; bến cò: 2 bạn cò cùng bay lên trời; bến trứng: 3 quả trứng nở. */
  act(kind: ActKind): void;
  /** Hiện phép tính đáp án của bến (không tính là qua cổng). */
  showAnswer(kind: ActKind): void;
  /** Thuyền tự chạy tới bến. */
  travel(id: string): void;
}

export const useZoo = create<ZooStore>()((set, get) => {
  const afterChange = (objects: ZooObject[]) => set({ objects });

  return {
    objects: initialObjects(),
    selected: null,
    dragging: null,
    acted: NONE,
    answered: NONE,

    reset() {
      resetBoat();
      resetWheel();
      set({
        objects: initialObjects(),
        selected: null,
        dragging: null,
        acted: NONE,
        answered: NONE,
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
      if (zone === 'river') emitEffect('splash', [pos[0], pos[1], pos[2]]);
      if (o.kind === 'stork' && zone === 'sky' && o.zone !== 'sky') emitEffect('feathers', o.pos);
      afterChange(moveObject(get().objects, id, pos, zone));
    },
    dropOnWheel(id, slot) {
      afterChange(attachToSlot(get().objects, id, slot));
    },
    remove(id) {
      set({ selected: null });
      afterChange(deleteObject(get().objects, id));
    },
    toggleCandle(id) {
      afterChange(toggleCandle(get().objects, id));
    },
    act(kind) {
      if (get().acted[kind]) return;
      set({ acted: { ...get().acted, [kind]: true } });
      // chọn các bạn đứng gần thuyền (giữa khung hình) để không bị các nút hai bên che
      const dockX = dockById(ACTIONS[kind].dock).x;
      const movers = get()
        .objects.filter((o) => o.kind === kind && !o.deleted && o.zone === 'ground')
        .sort((p, q) => Math.abs(p.pos[0] - dockX) - Math.abs(q.pos[0] - dockX))
        .slice(0, ACTIONS[kind].count);
      // cả nhóm cùng lúc: ếch rơi xuống nước sát bờ, cò bay thẳng lên trời
      for (const o of movers) {
        const x = o.pos[0];
        get().drop(
          o.id,
          kind === 'frog'
            ? [x, WATER_Y, riverCenterZ(x) + RIVER_HALF_WIDTH * 0.82]
            : // cò bay vừa qua mức "bầu trời", ra phía trên mặt sông gần thuyền cho dễ thấy
              [x, SKY_Y + 0.6, riverCenterZ(x) - RIVER_HALF_WIDTH * 0.95],
        );
      }
    },
    showAnswer(kind) {
      set({ answered: { ...get().answered, [kind]: true } });
    },
    travel(id) {
      sailTo(id);
    },
  };
});
