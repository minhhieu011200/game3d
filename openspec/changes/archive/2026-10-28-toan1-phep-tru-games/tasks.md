# Tasks

## 1. Khởi tạo dự án

- [x] 1.1 Tạo dự án Vite + React + TypeScript tại `D:\trochoi3d` (`base: './'`), thêm `three`, `@react-three/fiber`, `@react-three/drei`, `zustand`, `@mediapipe/tasks-vision`, `vitest`. Kiểm tra: `npm run dev` mở được trang trống và `npm test` chạy được một test mẫu
- [x] 1.2 Tạo cấu trúc thư mục `src/app`, `src/audio`, `src/hand`, `src/games/{bunny,finger,zoo}`, `src/shared/3d`, `public/{models,hdri,mediapipe,audio,fonts}`, `release/` theo design D10. Kiểm tra: các thư mục tồn tại
- [x] 1.3 Thêm font tiếng Việt chạy offline (Baloo 2 hoặc Nunito, file `.woff2` đặt trong `public/fonts`) và khai báo `@font-face`. Kiểm tra: chữ "Thỏ nhảy tìm cà rốt" hiển thị đúng dấu khi ngắt mạng

## 2. Khung ứng dụng (game-shell)

- [x] 2.1 Làm màn hình chính có nút "Bắt đầu" (mở khóa âm thanh) và 3 thẻ bài, điều hướng theo state và nút "Về trang chủ". Kiểm tra: test component vào và ra được cả 3 bài
- [x] 2.2 Làm `AudioManager` (hàng đợi, tắt tiếng) và `voiceLines.ts` (bảng khóa → file). Kiểm tra: unit test hàng đợi không phát chồng và tắt tiếng thì không phát
- [x] 2.3 Tạo khoảng 50 câu giọng đọc bé gái giọng Bắc (đề bài, khen, động viên, số 0–10, 8 câu bài 3, nhiệm vụ bài 4) bằng skill giọng trẻ em tiếng Việt, xuất MP3 vào `public/audio/voice/`. Kiểm tra: script đối chiếu mọi khóa trong `voiceLines.ts` đều có file
- [x] 2.4 Làm cài đặt chất lượng Cao/Thấp trong store chung, lưu `localStorage` có try/catch, và `QualityProvider` cho cảnh 3D. Kiểm tra: unit test ghi nhớ lựa chọn và vẫn chạy được khi `localStorage` ném lỗi
- [x] 2.5 Làm trang "Giới thiệu" đọc danh sách từ `src/credits.ts`. Kiểm tra: trang liệt kê mọi mục trong `credits.ts`

## 3. Nhận diện ngón tay (hand-finger-detection)

- [x] 3.1 Viết `src/hand/fingerCount.ts` thuần theo design D3 (đếm 4 ngón và ngón cái, tổng trên 2 tay). Kiểm tra: Vitest với bộ landmarks mẫu cho 0, 1, 3, 5 ngón, tay trái và tay phải, và 2 tay ra 7
- [x] 3.2 Viết bộ làm mượt và chốt (cửa sổ mode, `holdMs` 1500, khóa sau chốt đến khi giá trị đổi hoặc mất tay). Kiểm tra: unit test các scenario "Tay rung nhẹ", "Giữ đủ thời gian" (chốt đúng một lần) và "Không chốt lặp lại"
- [x] 3.3 Chép `vision_wasm_internal.{js,wasm}` và `hand_landmarker.task` vào `public/mediapipe/`, viết hook `useHandTracker` (mở/tắt webcam, GPU rồi CPU, `numHands: 2`). Kiểm tra: khi ngắt mạng, tab Network chỉ có yêu cầu tới localhost, và đèn camera tắt khi rời trang
- [x] 3.4 Làm `CameraView` (khung hình lật như gương, vẽ điểm khớp tay) và thông báo lỗi tiếng Việt khi không có camera hoặc bị từ chối quyền. Kiểm tra: từ chối quyền thì hiện đúng thông báo trong spec
- [ ] 3.5 Chạy thử với tay trẻ thật hoặc người lớn ở 2 điều kiện ánh sáng, ghi tỉ lệ đếm đúng 1–10 vào `docs/hand-test.md` và chỉnh ngưỡng nếu dưới 90%. Kiểm tra: file kết quả có số liệu
- [x] 3.6 Có mạng thì tải MediaPipe JS từ web (jsdelivr và storage.googleapis), lỗi hoặc quá 10 giây thì dùng bản trên máy (`src/hand/mediapipeSources.ts`). Kiểm tra: Vitest thứ tự nguồn; trên trình duyệt, có mạng thì tải từ web, chặn web thì vẫn nhận diện được bằng bản trên máy

## 4. Bài 2: Thỏ nhảy tìm cà rốt (bunny-carrot-game)

- [x] 4.1 Viết `levels.ts` (màn mặc định N = 4, 6 ô) và `logic.ts` (tính K, chọn đúng, chọn sai, khóa khi đang nhảy, hoàn thành, chơi lại, kiểm tra số bị trừ ≤ 10 và kết quả ≥ 0). Kiểm tra: Vitest phủ mọi scenario của spec, gồm K = 5 cho màn mặc định và K = 2 cho màn N = 3
- [x] 4.2 Tìm mô hình thỏ, cà rốt, rào, cây, đá (CC0) và nén bằng gltf-transform, cộng thêm ô bàn chân dựng bằng hình khối có chữ. Ghi nguồn vào `credits.ts`. Kiểm tra: mỗi file `.glb` dưới 3MB
- [x] 4.3 Dựng `BunnyScene` (đồng cỏ, suối, ô Bắt đầu, các ô bàn chân, vườn cà rốt, camera chéo cố định) và giao diện trên cùng (Điểm, đề bài, Cần tìm), theo bố cục ảnh tham khảo. Kiểm tra: chụp màn hình so với ảnh tham khảo
- [x] 4.4 Làm hoạt ảnh thỏ nhảy theo đường parabol đến ô, nhảy về ô Bắt đầu khi sai, ô rung đỏ hoặc sáng xanh, hiệu ứng vào vườn cà rốt và màn chúc mừng, cùng giọng đọc. Kiểm tra: chơi thử đủ các scenario sai rồi đúng, và bấm liên tục khi đang nhảy

## 5. Bài 3: Giơ ngón tay (finger-count-game)

- [x] 5.1 Viết `questions.ts` (9−1 … 9−8) và `logic.ts` (so đáp án, sang câu, đếm đúng ngay lần đầu, tổng kết, chơi lại). Kiểm tra: Vitest cho các scenario trả lời đúng, trả lời sai và hoàn thành 8 câu
- [x] 5.2 Làm giao diện `FingerGame`: phép tính chữ to, "Bạn đang giơ: n", thanh tiến trình giữ, `CameraView`, bàn phím số 0–10 dự phòng, hiệu ứng đúng/sai, giọng đọc phép tính. Kiểm tra: chơi hết 8 câu bằng ngón tay, rồi chơi hết bằng bàn phím khi tắt camera

## 6. Bài 4: Vườn thú 3D (zoo-counting-scene)

- [x] 6.1 Viết `logic.ts`: mô hình đối tượng `{id, kind, zone, deleted}`, tính vùng từ vị trí thả, đếm theo vùng, sinh phép trừ, đặt lại cảnh. Kiểm tra: Vitest các scenario "Ếch thả xuống sông", "Xóa", "Đặt lại", "Tắt 3 nến"
- [x] 6.2 Viết `tasks.ts` và máy trạng thái chế độ học sinh (giao việc, phát hiện làm thừa hoặc làm thiếu, câu hỏi có 3 lựa chọn, chọn sai cho chọn lại, chuyển nhiệm vụ). Kiểm tra: Vitest cho các scenario "Nhiệm vụ ếch", "Chọn sai phép tính", "Làm thừa thao tác"
- [x] 6.3 Tìm và nén mô hình bán thực tế: ếch, cò (có hoạt ảnh bay nếu có), nến, bàn, cổng vườn thú, cây, rào, cùng ít nhất 2 loài thú làm cảnh, và HDRI 1k. Ghi nguồn vào `credits.ts`. Kiểm tra: tổng dung lượng `public/models` dưới 50MB
- [ ] 6.4 Dựng cảnh: địa hình, lối đi, sông (`Water` ở mức Cao, mặt phẳng có texture ở mức Thấp), bờ, cỏ dạng instanced, ánh sáng, bóng đổ, sương mù, và vị trí ban đầu 10 ếch, 10 cò, 10 nến. Kiểm tra: đạt từ 30 khung hình/giây ở mức Thấp trên máy có card đồ họa tích hợp
- [x] 6.5 Làm kéo thả (tắt điều khiển camera khi kéo, mặt phẳng kéo, chiếu tia khi thả, hoạt ảnh cò bay lên, ếch nổi nhấp nhô dưới sông), vùng bấm lớn, vòng sáng khi rê chuột, nút xóa. Kiểm tra: thao tác thử đủ các scenario kéo thả và xóa trong spec
- [x] 6.6 Làm thổi tắt và thắp lại nến (lửa dùng shader hoặc sprite, có hiệu ứng khói). Kiểm tra: bấm 3 nến thì bảng đếm hiện 7 cháy và 3 tắt
- [x] 6.7 Làm điểm đến camera (Cổng, Bờ sông, Khu cò, Bàn nến, Khu thú) bay mượt, chế độ giáo viên đi WASD/phím mũi tên có kẹp độ cao và ranh giới, chế độ học sinh chỉ dùng biển chỉ đường. Kiểm tra: camera không xuyên đất và không ra ngoài vườn
- [x] 6.8 Làm giao diện bảng đếm (ẩn hoặc "Hiện đáp án" ở chế độ giáo viên), công tắc Giáo viên/Học sinh có đặt lại cảnh, bảng nhiệm vụ và lựa chọn ở chế độ học sinh, cùng giọng đọc. Kiểm tra: chơi hết 3 nhiệm vụ ếch, cò, nến ở chế độ học sinh

## 7. Đóng gói offline

- [x] 7.1 Viết `release/server.ps1` (HttpListener, cổng 8080–8090, MIME cho `.wasm`, `.glb`, `.task`, `.mp3`, `.ktx2`, `.hdr`, `.woff2`, mở Edge) và `release/start.bat` (`-ExecutionPolicy Bypass`). Kiểm tra: bấm đúp `start.bat` thì trò chơi mở được, và chiếm cổng 8080 trước thì máy chủ chuyển sang 8081
- [x] 7.2 Viết script `npm run package`: build rồi chép `dist/` vào `TroChoiToan1/game/` kèm `start.bat` và `server.ps1`. Viết `README.md` tiếng Việt cho giáo viên (cách chạy, cấp quyền camera, xử lý khi PowerShell bị chặn). Kiểm tra: thư mục gói tạo ra đúng cấu trúc và dưới 80MB

## 8. Kiểm tra tích hợp

- [ ] 8.1 Trên máy Windows đã ngắt mạng, chép gói `TroChoiToan1/`, chạy `start.bat` và chơi hết bài 2, bài 3 (camera thật) và bài 4 (cả hai chế độ), ở cả mức chất lượng Cao và Thấp. Kiểm tra: ghi kết quả vào `docs/acceptance.md`, không có yêu cầu mạng ra ngoài và không có lỗi trong console
