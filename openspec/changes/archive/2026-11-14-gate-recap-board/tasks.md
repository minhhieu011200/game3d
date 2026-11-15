# Tasks

## 1. Máy trạng thái tour: pha `recap`

- [x] 1.1 Trong `src/tour/logic.ts`:
  - thêm `'recap'` vào `Phase`;
  - `pass()` đánh dấu đã qua và chuyển sang `phase: 'recap'`, giữ nguyên `at`;
  - `canAdvance` trả về `true` ở pha `recap`;
  - `advance` từ `recap` chuyển sang `at + 1, phase: 'moving'`;
  - `cameraT` ở pha `recap` trả về vị trí đứng trước cổng;
  - `jumpTo` vẫn dùng được từ pha `recap`.

  Sửa `src/tour/logic.test.ts` theo spec `zoo-tour`:
  - `pass` không còn đi luôn;
  - `pass` rồi `advance` thì tới cổng kế tiếp;
  - Cổng 4: `pass` rồi `advance` thì tới `SQUARE`;
  - `jumpTo` từ `recap` vẫn đúng.

  Kiểm bằng `npm test`.
- [x] 1.2 Trong `src/tour/store.ts`:
  - thêm trường `recap: RecapData | null` và hàm `setRecap`;
  - `enter()` và `reset()` xoá `recap` về `null`.

  Trong `src/tour/gateBridge.tsx`, thêm `reportRecap(data)`, chỉ ghi khi trò mở từ cổng. Thêm test trong `src/tour/store.test.ts` và `src/tour/gateBridge.test.tsx`:
  - không mở từ cổng thì `reportRecap` không ghi gì;
  - vào cổng thì `recap` về `null`.

  Kiểm bằng `npm test`.

## 2. Kiểu dữ liệu bảng và các hàm dựng bảng

- [x] 2.1 Tạo `src/tour/recap.ts` gồm các kiểu `RecapRow`, `RecapColumn`, `RecapData` và hàm `defaultRecap(gateId)`:
  - Cổng 1: 8 dòng 9 − 1 … 9 − 8.
  - Cổng 2: 5 dòng 6 − 1 … 6 − 5.
  - Cổng 4: 3 dòng 10 − 2, 10 − 5, 10 − 3, có icon.
  - Cổng 3: cột rỗng có ghi chú "Chưa chơi".

  Mọi dòng đều có `done: false`. Thêm `src/tour/recap.test.ts`, kiểm bằng `npm test`.
- [x] 2.2 Tạo `src/games/finger/recap.ts` (`fingerRecap(state)`) và `src/games/flower/recap.ts` (`flowerRecap(state)`) theo design mục 3, kèm test:
  - đúng 2 câu thì 2 dòng đầu `done`;
  - câu hiện tại đang hiện "đúng" (`feedback === 'correct'`) thì được tính là xong;
  - `finished` thì mọi dòng `done`.

  Kiểm bằng `npm test`.
- [x] 2.3 Tạo `src/games/bunny/recap.ts` (`bunnyRecap(levels, lanes, mode)`) và `src/games/zoo/recap.ts` (`zooRecap(student)`), kèm test theo các scenario Cổng 3 và Cổng 4 trong spec:
  - 1 người thì 1 cột không tiêu đề; 2 đội thì 2 cột "Đội Đỏ" / "Đội Xanh", mỗi cột có `target` riêng;
  - `marks` `correct` thì dòng `done` và `highlight`, `skipped` thì chỉ `done`, `unknown` thì chưa xong;
  - làn vừa trả lời nhầm thì các ô đã qua vẫn `done`, ô vừa nhầm chưa xong;
  - zoo: `taskIndex = 1` thì chỉ dòng ếch xong; `phase = 'done'` thì cả 3 dòng xong.

  Kiểm bằng `npm test`.

## 3. Các trò chơi báo bảng

- [x] 3.1 `FingerGame.tsx` và `FlowerGame.tsx` gọi `reportRecap(fingerRecap(s))` / `reportRecap(flowerRecap(s))` trong một `useEffect` theo `s`. Thêm vào `src/games/flower/FlowerGame.test.tsx` một test: mở từ cổng, trả lời đúng câu đầu, thì `useTour.getState().recap` có dòng 6 − 1 đã `done`. Kiểm bằng `npm test`.
- [x] 3.2 `BunnyGame.tsx` và `ZooGame.tsx` dùng `useEffect` để `subscribe` vào store của trò, báo `bunnyRecap` / `zooRecap` ngay lúc mở và mỗi khi trạng thái đổi; huỷ `subscribe` khi rời trò. Thêm test trong `src/games/bunny/BunnyBoard.test.tsx` (hoặc file test mới cạnh `BunnyGame`): mở từ cổng thì `recap` có 7 dòng. Kiểm bằng `npm test`.

## 4. Màn đường đi hiện bảng

- [x] 4.1 Tạo `src/tour/RecapBoard.tsx` và style trong `src/styles.css` theo design mục 5:
  - tiêu đề "Cổng N · tên cổng";
  - dòng xong ghi "a − b = c ✓", dòng chưa xong ghi "a − b = ?" có lớp `.pending`;
  - dòng `highlight` có 🥕;
  - 2 đội thì 2 cột.

  `TourScreen.tsx` hiện `RecapBoard` ở pha `recap`, lấy dữ liệu từ `recap ?? defaultRecap(...)`; nút "Đi tiếp" vẫn hiện nhờ `canAdvance`. Thêm test trong `src/tour/TourScreen.test.tsx` theo scenario "Qua Cổng 1 khi mới làm 2 câu" và "Qua cổng khi chưa vào chơi"; "Đi tiếp" thì bảng biến mất. Kiểm bằng `npm test`.
- [x] 4.2 `TourScene.tsx`: khi dựng cảnh ở pha `recap`, camera đặt trước cổng và cổng vừa qua mở dần (`closedGate = current(s).id`). `TourScreen` phát `sfx('whoosh')` khi vào ở pha `recap` thay cho pha `moving`. Kiểm bằng `npx tsc -b`, và chạy `npm run dev` để xem tận mắt: qua Cổng 2 thì cổng mở phía sau bảng; "Đi tiếp" thì đi qua cổng tới Cổng 3.
- [x] 4.3 Cập nhật `release/HUONG-DAN.txt`: qua cổng sẽ hiện bảng phép tính để cả lớp đọc lại, bấm "Đi tiếp" để đi tiếp. Cập nhật bảng điều khiển trong `README.md` nếu có nhắc "qua xong là đi luôn". Kiểm bằng cách đọc lại hai file.

## 5. Kiểm tra cả luồng

- [x] 5.1 Chạy `npm test` và `npm run build` (không lỗi). Chạy `npm run package`, mở `TroChoiToan1/start.bat`, rồi đi đủ Cổng 1 → Quảng Trường, xác nhận:
  - qua Cổng 1 sớm thì bảng có ✓ và "?" đúng số câu đã làm;
  - Cổng 3 chơi 2 đội thì bảng có 2 cột;
  - Cổng 4 thì bảng hiện rồi "Đi tiếp" mới tới quảng trường;
  - bảng vừa màn 1280×720, không phải cuộn.

## Workflow follow-up

- Archive `zoo-tour-gates` trước (để có `openspec/specs/zoo-tour/spec.md`), rồi mới archive change này.
