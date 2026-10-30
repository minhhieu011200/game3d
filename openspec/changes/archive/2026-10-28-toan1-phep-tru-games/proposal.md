# Proposal

## Why

Bài 11 "Phép trừ trong phạm vi 10" (SGK Toán 1 tập 1, trang 72–73, phần Luyện tập) hiện chỉ có bài tập trên giấy. Học sinh lớp 1 học phép trừ tốt hơn khi được thao tác, nhìn thấy và vận động. Vì vậy cần một bộ trò chơi 3D cho bài 2, bài 3 và bài 4 chạy được trên máy lớp học. Máy có webcam nhưng **không có mạng**.

## What Changes

- Tạo mới một ứng dụng web (React + Vite + TypeScript + React Three Fiber) gồm màn hình chọn bài và 3 trò chơi.
- **Bài 2: Thỏ nhảy tìm cà rốt.** Cảnh 3D có thỏ, các ô bàn chân ghi phép trừ và vườn cà rốt. Học sinh chọn các phép tính có kết quả bằng giá trị mục tiêu (mặc định là 4). Chọn đúng thì thỏ nhảy lên ô đó. Chọn sai thì thỏ về ô Bắt đầu, các ô đúng đã tìm vẫn được giữ. Số ô "cần tìm" được tính tự động từ dữ liệu, không ghi cứng. Hình mẫu ghi "6" là sai, thực tế chỉ có 5 ô đúng.
- **Bài 3: Giơ ngón tay chọn đáp án.** Màn hình hiện lần lượt các phép 9 − 1 … 9 − 8. Học sinh giơ ngón tay trước webcam, máy đếm trên cả hai tay. Giữ ổn định 1,5 giây thì máy chốt đáp án. Có bàn phím số dự phòng.
- **Bài 4: Vườn thú 3D.** Cảnh bán thực tế có sông, bờ, ếch, cò, bàn nến và các con thú làm cảnh. Có thể kéo vật lên trời, thả xuống sông, xóa vật, thổi tắt nến. Bảng đếm tự động sinh phép trừ. Có hai chế độ:
  - Giáo viên: đi tự do, bảng đếm ẩn hoặc hiện theo nút.
  - Học sinh: bấm biển chỉ đường để đi, máy giao việc và chấm.
- Nhận diện bàn tay bằng MediaPipe HandLandmarker **chạy trong trình duyệt**. Không dùng Python. Có mạng thì tải MediaPipe JS từ web; mất mạng hoặc web lỗi thì dùng bản đóng gói sẵn.
- Chạy offline: tất cả tài nguyên được đóng gói sẵn, gồm mã, mô hình 3D, WASM và mô hình MediaPipe, font chữ, âm thanh. Chạy bằng `start.bat`, file này gọi máy chủ tĩnh viết bằng PowerShell trên `localhost` rồi mở Edge.
- Giọng đọc bé gái (mặc định giọng Bắc) được tạo sẵn thành file âm thanh cho đề bài, lời khen, lời động viên và các con số.
- Nút chọn chất lượng đồ họa Cao/Thấp cho máy yếu.

## Capabilities

### New Capabilities
- `game-shell`: Màn hình chọn bài, điều hướng giữa các trò chơi, phát giọng đọc và âm thanh, cài đặt chất lượng đồ họa, chạy offline bằng `start.bat`.
- `bunny-carrot-game`: Luật chơi bài 2: các ô phép trừ, kiểm tra kết quả bằng giá trị mục tiêu, thỏ nhảy hoặc quay về, đếm số ô đúng, điểm và màn kết thúc.
- `hand-finger-detection`: Đọc webcam, phát hiện tối đa 2 bàn tay, đếm số ngón đang giơ (0–10), làm mượt kết quả và báo trạng thái camera.
- `finger-count-game`: Luật chơi bài 3: hiện phép trừ, nhận đáp án từ số ngón tay sau khi giữ ổn định hoặc từ bàn phím dự phòng, chấm điểm và chuyển câu.
- `zoo-counting-scene`: Bài 4: cảnh vườn thú 3D, di chuyển camera, kéo thả, xóa, thổi tắt nến, đếm theo vùng và sinh phép trừ, chế độ giáo viên và học sinh.

### Modified Capabilities
<!-- Không có: dự án mới, chưa có spec nào. -->

## Impact

- Dự án mới hoàn toàn trong `D:\trochoi3d`. Hiện chỉ có `openspec/` và ảnh tham khảo.
- Phụ thuộc mới (npm, chỉ dùng lúc build): `react`, `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `@mediapipe/tasks-vision`, `vite`, `typescript`.
- Tài nguyên ngoài: mô hình 3D miễn phí giấy phép CC0/CC-BY, có ghi nguồn tác giả; ảnh bầu trời HDRI; mô hình `hand_landmarker.task`. Tất cả tải về một lần lúc phát triển rồi đóng gói kèm.
- Máy lớp học: Windows 10/11, Edge, có webcam, có card đồ họa hỗ trợ WebGL2. PowerShell phải được phép chạy script; `start.bat` dùng `-ExecutionPolicy Bypass`.
- Ngoài phạm vi: Python, máy chủ trên mạng, tài khoản người dùng, lưu tiến độ lâu dài, các bài khác ngoài bài 2, 3, 4 của trang 72–73.
