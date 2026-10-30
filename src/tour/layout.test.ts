import { isGate, STATIONS, STOP_BEFORE_GATE, STOP_BEFORE_SQUARE } from './logic';
import { PATH } from './path';
import { allFootprints, ARCH_T, CAM_BACK, CAM_H, distToSegment, FENCE_SIDE, KID_TOP, plantTrees, ROAD_HALF, treeFits, viewpoints, type Footprint } from './layout';

function overlaps(list: Footprint[]) {
  const out: string[] = [];
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const a = list[i];
      const b = list[j];
      if (a.group === b.group || a.floor || b.floor) continue;
      const gap = Math.hypot(a.x - b.x, a.z - b.z) - a.r - b.r;
      if (gap < 0) out.push(`${a.id} ↔ ${b.id} (lấn ${(-gap).toFixed(2)} m)`);
    }
  }
  return out;
}

test('không vật nào đè lên vật khác', () => {
  expect(overlaps(allFootprints())).toEqual([]);
});

test('thú và bụi hoa nằm ngoài hàng rào; xe buýt và biển lớp không lấn lòng đường', () => {
  const pts = Array.from({ length: 401 }, (_, i) => PATH.getPointAt(i / 400));
  const lateral = (f: Footprint) => Math.min(...pts.map((p) => Math.hypot(p.x - f.x, p.z - f.z)));
  for (const f of allFootprints()) {
    // trước cổng chào không có hàng rào: xe buýt, biển lớp chỉ cần nằm ngoài mép đường lát đá
    if (/^(bus|class-sign)/.test(f.id)) expect(lateral(f) - f.r, f.id).toBeGreaterThan(ROAD_HALF + 0.3);
    else if (/^(animal|arch-giraffe|arch-elephant|bush)/.test(f.id)) expect(lateral(f) - f.r, f.id).toBeGreaterThan(FENCE_SIDE);
  }
});

test('trồng đủ cây, không cây nào chồng lên vật', () => {
  for (const n of [70, 36]) {
    const trees = plantTrees(n);
    expect(trees.length).toBeGreaterThanOrEqual(n * 0.9);
    const foot = allFootprints();
    for (const t of trees) {
      for (const f of foot) expect(Math.hypot(f.x - t.x, f.z - t.z)).toBeGreaterThan(f.r + t.r);
    }
    expect(trees.every((t) => treeFits(t.x, t.z, t.r))).toBe(true);
  }
});

test('không vật nào (cổng khác, cổng chào, đèn, bụi hoa, thú) chắn tầm nhìn từ camera tới các vật ở mỗi điểm dừng', () => {
  const all = allFootprints().filter((f) => !f.floor);
  const bad: string[] = [];
  for (const v of viewpoints()) {
    const own = new Set(v.targets.map((t) => t.id));
    const occluders = all.filter((f) => !own.has(f.id));
    for (const tg of v.targets) {
      for (const o of occluders) {
        if (distToSegment([o.x, o.z], v.cam, [tg.x, tg.z]) < o.r) bad.push(`${v.name}: ${o.id} che ${tg.id}`);
      }
    }
  }
  expect(bad).toEqual([]);
});

test('camera ở mỗi điểm dừng không đứng sau một cổng khác (vòm cổng không chắn ngang khung hình)', () => {
  const len = PATH.getLength();
  const arches = [ARCH_T, ...STATIONS.filter(isGate).map((s) => s.t)];
  for (const st of STATIONS.slice(1)) {
    const stop = st.t - (st.id === 'square' ? STOP_BEFORE_SQUARE : STOP_BEFORE_GATE);
    const cam = stop - CAM_BACK / len;
    // không vòm nào nằm giữa camera và trạm (trừ chính cổng của trạm), chừa 1 m
    for (const a of arches) if (a !== st.t) expect(a < cam - 1 / len || a > st.t, `${st.id}: vòm ở t=${a}`).toBe(true);
  }
});

test('camera đủ cao để bạn học sinh không che nội dung trên cổng', () => {
  // đường nhìn từ camera qua đỉnh đầu bạn nhỏ phải chạm đất trước mặt cổng
  const reach = CAM_BACK * CAM_H / (CAM_H - KID_TOP);
  expect(reach).toBeLessThan(CAM_BACK + 6.0 * 0.98); // cổng cách bạn nhỏ khoảng 6 m (STOP_BEFORE_GATE)
});

test('không cây nào chắn tầm nhìn từ camera tới các vật ở mỗi điểm dừng', () => {
  const trees = plantTrees(70);
  for (const v of viewpoints()) {
    for (const tg of v.targets) {
      for (const t of trees) {
        expect(distToSegment([t.x, t.z], v.cam, [tg.x, tg.z]), `${v.name}: cây che ${tg.id}`).toBeGreaterThan(t.r);
      }
    }
  }
});
