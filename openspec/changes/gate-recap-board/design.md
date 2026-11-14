# Design

> **Cập nhật 2026-11-14:** theo yêu cầu của giáo viên, bảng không còn hiện trên màn đường đi. Bỏ pha `recap` (mục 1, 2 bên dưới không còn áp dụng; qua cổng lại đi luôn như trước). Thay vào đó `RecapPopup` hiện ngay trong màn chơi (đặt cạnh `GateBanner` trong `App`): tự mở khi trò báo `reportDone`, hoặc khi bấm "Qua cổng" ở dải cổng (`recapOpen` trong tour store). Popup phủ lên màn kết thúc của trò, nên không phải sửa 4 trò; "Xem lại"/"Chơi tiếp" đóng popup, "Qua cổng" gọi `passGate`. Phép tính hiện chữ to, kết quả trong ô xanh, phép chưa làm có ô "?" viền đứt. Mục 5 (`RecapBoard`) được thay bằng `RecapPopup`.

## Context

- Tour là một máy trạng thái thuần trong `src/tour/logic.ts`, gồm `at` và `phase` (`idle | moving | atGate | playing`). `pass()` hiện chuyển thẳng sang `moving` tới trạm kế tiếp.
- `TourScene` dựa vào trạng thái lúc dựng cảnh (`init.justPassed`) để đặt camera trước cổng vừa qua và cho cổng mở rồi mới đi qua.
- Cầu nối trò chơi → tour (`gateBridge.tsx`) chỉ có `reportProgress(n)` và `reportDone()`. Cả hai chỉ chạy khi trò chơi mở từ một cổng (`useApp.gate !== null`).
- Trạng thái của từng trò:
  - Bài 3 (finger) và Bài 1 (flower) giữ trạng thái bằng `useState` trong component.
  - Bài 2 (bunny) và Bài 4 (zoo) dùng store zustand.
  - Bài 2 có `marks: TileMark[]` cho từng ô (`unknown | correct | skipped`) và mục tiêu riêng cho từng làn.
- Yêu cầu hiển thị nằm trong `specs/zoo-tour/spec.md`.

## Goals / Non-Goals

**Goals:**
- Một kiểu dữ liệu bảng dùng chung cho cả 4 cổng, dựng từ hàm thuần có test.
- Đổi luồng "Qua cổng" với ít thay đổi nhất ở cảnh 3D.

**Non-Goals:**
- Không đổi luật chơi, màn kết thúc hay giọng đọc của các trò.
- Không lưu bảng qua lần tải lại trang. Tiến độ tour vốn chỉ giữ trong một lần mở.
- Không hiện lại bảng của một cổng đã qua khi đi ngang hoặc nhảy bằng Bản đồ (có thể làm sau).

## Decisions

### 1. Thêm pha `recap` vào máy trạng thái tour

Luồng mới: `pass()` → `{ passed: [...], at giữ nguyên, phase: 'recap' }`.
- `canAdvance` trả về `true` khi đang ở pha `recap`.
- `advance` từ `recap` chuyển sang `at + 1, phase: 'moving'`, đúng như khi đứng trước một cổng đã qua.
- `cameraT` ở pha `recap` trả về vị trí đứng trước cổng (`st.t − STOP_BEFORE_GATE`).
- Cổng 4: `at` vẫn là cổng 4 ở pha `recap`; "Đi tiếp" mới tới `SQUARE`.
- `jumpTo` (Bản đồ) vẫn dùng được trong pha `recap`, và bảng đóng lại.

Đã cân nhắc: dùng lại pha `atGate` cộng thêm cờ `showRecap`. Không chọn vì hai trạng thái chồng nhau: `atGate` hiện "Vào cổng" và lời dẫn đọc khi vừa tới. Một pha riêng làm cho `TourScreen` hiện nút đúng mà không cần nhánh phụ. Hiệu ứng đọc lời dẫn cũng không chạy, vì nó chỉ chạy khi chuyển từ `moving` sang `atGate`.

### 2. Cảnh 3D khi dựng lại ở pha `recap`

Trong `TourScene`, `init` thêm một trường hợp: khi `phase === 'recap'` thì camera đặt ở `cameraT(s)` và `closedGate = current(s).id`.
- Cổng vừa qua dựng ở trạng thái đóng, rồi tự mở dần phía sau bảng, vì `Gate` đã có `passed = true`.
- Bấm "Đi tiếp" thì camera đi từ trước cổng qua cổng như cũ. `justPassed` vẫn đúng vì `prev = STATIONS[at − 1]` đã được đánh dấu qua.
- Âm thanh: trước đây vào màn đường đi ở pha `moving` thì phát `sfx('whoosh')`; giờ phát khi vào ở pha `recap`, để báo cổng đang mở.

### 3. Dữ liệu bảng: `RecapData` trong `src/tour/recap.ts`

```ts
interface RecapRow { a: number; b: number; done: boolean; highlight?: boolean; icon?: string }
interface RecapColumn { title?: string; target?: number; rows: RecapRow[] }
interface RecapData { columns: RecapColumn[] }
```

Mỗi dòng luôn có `a` và `b`, nên dòng chưa làm vẫn ghi được "a − b = ?" và kết quả luôn là `a − b`. Bảng không lưu đáp án học sinh bấm, vì chỉ hiện phép đã làm đúng.

Các hàm thuần, có test:
- Mỗi trò có một hàm dựng bảng từ trạng thái của trò đó:
  - `fingerRecap(state)`: dòng đã xong là `i < index`, cộng câu hiện tại nếu `feedback === 'correct'`; `finished` thì tất cả đã xong.
  - `flowerRecap(state)`: dòng đã xong là `i < history.length`, hoặc `finished`.
  - `bunnyRecap(levels, lanes, mode)`: dòng đã xong là `marks[i] !== 'unknown'`; `highlight = marks[i] === 'correct'`; mỗi làn một cột có `title` (tên đội, chỉ khi chơi 2 đội) và `target`.
  - `zooRecap(student)`: dòng đã xong là `i < taskIndex`, hoặc `phase === 'done'`. `icon` lấy theo loại vật: 🐸, 🕊️, 🕯️.
- `defaultRecap(gateId)`: bảng toàn "?" từ bộ câu hỏi cố định (`QUESTIONS`, `TASKS`). Dùng khi qua cổng mà trò chưa báo gì, ví dụ qua cổng từ pha `atGate`.
  - Cổng 3 không có bộ ô cố định trước khi chơi, nên bảng mặc định ghi 1 cột rỗng kèm dòng "Chưa chơi".

Đặt các hàm này cạnh từng trò (`src/games/*/recap.ts`) để `src/tour/` không phải biết cấu trúc trạng thái của trò. `src/tour/recap.ts` chỉ giữ kiểu dữ liệu và `defaultRecap`.

### 4. Báo bảng: `reportRecap(data)` trong `gateBridge`

- Tour store thêm `recap: RecapData | null`: bảng của cổng đang mở. Giá trị bị xoá về `null` trong `enter()` và `reset()`.
- `reportRecap(data)` chỉ ghi khi trò mở từ cổng, giống `reportProgress`.
- Trò chơi gọi `reportRecap` mỗi khi trạng thái đổi:
  - finger và flower: `useEffect` theo `s`.
  - bunny và zoo: `useEffect` trong component chính, `subscribe` vào store, chạy ngay một lần lúc mở.

  Vì vậy bảng luôn phản ánh đúng trạng thái lúc bấm "Qua cổng", kể cả khi bấm "Chơi lại" hay thỏ vừa trả lời nhầm.
- `RecapBoard` đọc `useTour().recap ?? defaultRecap(current.id)`.

Đã cân nhắc: chỉ báo một lần khi bấm "Qua cổng", bằng cách cho `passGate` hỏi trò chơi. Không chọn vì phải lấy trạng thái nằm trong `useState` của component từ bên ngoài. Báo liên tục thì đơn giản và dễ test hơn.

### 5. Giao diện bảng: `RecapBoard`

- Một `wood-panel` giữa màn hình, giống các overlay sẵn có, nhưng **không** che nút điều khiển `tour-controls`; nút "Đi tiếp" vẫn ở chỗ cũ.
- Tiêu đề: `Cổng N · <tên cổng>`.
- Dòng đã xong: `a − b = c ✓`. Dòng chưa xong: `a − b = ?` với lớp `.pending` (độ mờ khoảng 0.45).
- Cổng 3: dòng `highlight` có nền cam nhạt kèm 🥕.
- Bố cục: 1 cột thì chia lưới 2 cột cho bảng dài (8 dòng của Cổng 1). 2 đội thì 2 cột cạnh nhau.
- Chữ to cho máy chiếu, phải vừa màn 1280×720 không cuộn.

## Risks / Trade-offs

- **Đội cũ chuyển "đi luôn" thành "dừng lại".** Giáo viên quen bấm "Qua cổng" là đi luôn sẽ thấy thêm một bước bấm. → Nút "Đi tiếp" đặt đúng chỗ cũ, và cập nhật `release/HUONG-DAN.txt`.
- **Báo liên tục gây render lại tour store.** Mỗi lần trò đổi trạng thái là một lần `set` vào tour store trong lúc đang chơi, mà màn đường đi lúc đó không hiện. → Chỉ `GateBanner` đọc tour store khi đang chơi, nên chi phí không đáng kể.
- **Phụ thuộc change `zoo-tour-gates`.** Spec `zoo-tour` chỉ có sau khi archive change đó. → Archive `zoo-tour-gates` trước khi archive change này (xem tasks).

## Migration Plan

Không có dữ liệu cần chuyển. Sau khi làm xong, chạy `npm run package` để cập nhật thư mục `TroChoiToan1/`.
