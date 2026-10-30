// Trạng thái thuyền thay đổi mỗi khung hình: giữ ngoài React để không phải vẽ lại giao diện liên tục.
import { boatAt, dockById, type BoatInput, type BoatState } from './boat';

export const boatRuntime: {
  boat: BoatState;
  input: BoatInput;
  /** x của bến đang tự lái tới, `null` nếu đang lái tay. */
  target: number | null;
  /** Điểm camera quay sang nhìn (khu của bến vừa chọn); `null` = nhìn dọc sông theo thuyền. */
  focus: [number, number] | null;
} = {
  boat: boatAt(dockById('gate').x),
  input: { forward: false, back: false, left: false, right: false },
  target: null,
  focus: null,
};

export function resetBoat() {
  boatRuntime.boat = boatAt(dockById('gate').x);
  boatRuntime.target = null;
  boatRuntime.focus = null;
  boatRuntime.input = { forward: false, back: false, left: false, right: false };
}

export function sailTo(dockId: string) {
  const d = dockById(dockId);
  boatRuntime.target = d.x;
  boatRuntime.focus = d.look ?? null;
}
