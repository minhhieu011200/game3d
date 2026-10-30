import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { CameraControls } from '@react-three/drei';
import CameraControlsImpl from 'camera-controls';
import * as THREE from 'three';
import { DOCKS } from '../boat';
import { boatRuntime } from '../boatRuntime';
import { ZONES } from '../layout';
import { riverCenterZ, WATER_Y } from '../world';

const ACTION = CameraControlsImpl.ACTION;
/** Sau khi thả chuột chừng này giây, camera tự xoay về sau lưng thuyền. */
const RECENTER_AFTER = 2.5;
/** Khi đậu ở bến: điểm nhìn nằm ở chừng này phần quãng từ thuyền tới khu cần xem. */
const FOCUS_SHARE = 0.6;
/** Lúc mới vào: đứng xa chừng này mét trước cổng, nhìn vào giữa cổng cho thấy trọn cổng cầu vồng. */
const INTRO_BACK = 24;
const INTRO_LOOK_Y = 4.2;

/** Camera đi theo thuyền từ phía sau; kéo chuột để xoay quanh thuyền, lăn chuột để lại gần/ra xa. */
export function ZooControls() {
  const ref = useRef<CameraControlsImpl>(null);
  const lastUser = useRef(-100);
  /** 0..FOCUS_SHARE: điểm nhìn đã dời bao nhiêu phần từ thuyền sang khu của bến. */
  const share = useRef(0);
  /** Đang ở cảnh mở đầu (nhìn cổng) cho tới khi thuyền chạy hoặc người dùng xoay camera. */
  const intro = useRef(true);
  const behind = new THREE.Vector3();

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    c.minDistance = 4;
    c.maxDistance = 26;
    c.minPolarAngle = 0.35;
    c.maxPolarAngle = Math.PI * 0.46; // không chui xuống nước
    c.dollySpeed = 0.6;
    c.mouseButtons.right = ACTION.NONE;
    c.mouseButtons.middle = ACTION.NONE;
    c.touches.two = ACTION.TOUCH_DOLLY;
    const b = boatRuntime.boat;
    // cảnh mở đầu: đứng xa trước cổng, nhìn vào giữa cổng
    const gx = ZONES.gate;
    const gz = riverCenterZ(gx);
    behind.set(gx - Math.sin(b.heading) * INTRO_BACK, WATER_Y + 4, gz - Math.cos(b.heading) * INTRO_BACK);
    void c.setLookAt(behind.x, behind.y, behind.z, gx, INTRO_LOOK_Y, gz, false);
    const mark = () => {
      lastUser.current = performance.now() / 1000;
      intro.current = false;
    };
    c.addEventListener('controlstart', mark);
    c.addEventListener('control', mark);
    return () => {
      c.removeEventListener('controlstart', mark);
      c.removeEventListener('control', mark);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    const c = ref.current;
    if (!c) return;
    const rt = boatRuntime;
    const b = rt.boat;
    if (intro.current) {
      // giữ khung hình cổng cho tới khi thuyền bắt đầu chạy; rồi lại gần thuyền như bình thường
      if (Math.abs(b.speed) < 0.05 && rt.target === null) return;
      intro.current = false;
      void c.dollyTo(12, true);
    }
    // Đã tới bến có khu cần xem (ếch, nến, cò): điểm nhìn dời dần từ thuyền sang khu đó.
    const docked = rt.focus !== null && rt.target === null;
    const want = docked ? FOCUS_SHARE : 0;
    share.current += (want - share.current) * 0.04;
    const fx = rt.focus ? rt.focus[0] - b.x : 0;
    const fz = rt.focus ? rt.focus[1] - b.z : 0;
    // bến của điểm nhìn hiện tại (sailTo gán đúng mảng `look` của bến)
    const dock = rt.focus ? DOCKS.find((d) => d.look === rt.focus) : undefined;
    const baseY = WATER_Y + 1.4;
    const y = baseY + ((dock?.lookY ?? baseY) - baseY) * (share.current / FOCUS_SHARE);
    // giữ nguyên góc nhìn người dùng chọn, chỉ dời theo thuyền (và điểm nhìn)
    void c.moveTo(b.x + fx * share.current, y, b.z + fz * share.current, false);

    const idle = performance.now() / 1000 - lastUser.current > RECENTER_AFTER;
    if (!idle) return;
    let wantAz: number | null = null;
    if (docked) {
      // camera đứng phía bên kia thuyền, nhìn qua thuyền sang khu
      wantAz = Math.atan2(-fx, -fz);
    } else if (Math.abs(b.speed) > 0.3) {
      // đang chạy: từ từ quay về sau lưng thuyền
      wantAz = b.heading + (b.speed >= 0 ? Math.PI : 0);
    }
    const wantPolar = docked && dock?.polar !== undefined ? dock.polar : null;
    if (wantAz !== null || wantPolar !== null) {
      let d = wantAz === null ? 0 : wantAz - c.azimuthAngle;
      d = Math.atan2(Math.sin(d), Math.cos(d));
      void c.rotate(d * 0.03, wantPolar === null ? 0 : (wantPolar - c.polarAngle) * 0.03, false);
    }
  });

  return <CameraControls ref={ref} makeDefault smoothTime={0.25} />;
}
