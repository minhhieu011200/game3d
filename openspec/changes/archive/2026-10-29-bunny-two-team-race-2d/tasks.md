# Tasks

## 1. Luật chơi một hoặc hai làn (logic thuần)

- [x] 1.1 Bỏ trường `pos` khỏi `Tile`, cùng `pathPos`, `START_POS` và `GARDEN_POS` trong `levels.ts`, và sửa `logic.test.ts` theo. Kiểm tra: `npm test` xanh cho bộ test sinh phép tính hiện có
- [x] 1.2 Thêm `generateRace(target, mode, seed)` vào `levels.ts`, sinh 1 hoặc 2 làn. Hai làn phải khác dãy phép tính, nếu trùng thì sinh lại tối đa 20 lần (design D3). Kiểm tra: Vitest với mọi mục tiêu 2–9 và 40 seed: hai làn có cùng số ô và cùng `requiredCount`, dãy `(a, b)` khác nhau
- [x] 1.3 Viết `RaceState` và `answer(state, laneIdx, saysEqual)` trong `logic.ts`, thay `choose()` và `skip()` (design D2). Hàm bỏ qua thao tác khi không phải lượt của làn đó hoặc khi đang nhảy. Phán khớp thì `advance`, phán nhầm thì `mistake` (về đầu, xoá đánh dấu, cà rốt về 0). Kiểm tra: Vitest cho các scenario "Bấm Đúng ở ô 8−4", "Bấm Sai ở ô 6−3", "Bấm Đúng ở ô 6−3 sau khi đã qua 2 ô", "Bấm Sai ở ô bằng mục tiêu" và "Bấm liên tục"
- [x] 1.4 Sửa `landed()` theo D2: chế độ `teams` thì đổi `turn` khi thỏ chạm đất; từ `toGarden` sang `finished` thì ghi `winner`. Kiểm tra: Vitest cho "Đúng xong vẫn đổi lượt", "Sai xong đổi lượt", "Bấm vào làn không có lượt", "Đội Xanh về đích trước" (sau khi thắng, `answer` bỏ qua mọi thao tác) và "Về đích ở chế độ 1 người"

## 2. Store và giọng đọc

- [x] 2.1 Viết lại `store.ts` quanh `RaceState`, gồm các action `answer(lane, saysEqual)`, `landed()`, `setMode(mode)` và `newLevel(target?)`. Đổi chế độ hoặc đổi mục tiêu thì sinh màn mới và giữ phần còn lại. Kiểm tra: Vitest cho store với "Chuyển sang 2 đội", "Đổi mục tiêu khi đang chơi 2 đội" và "Chơi màn mới"
- [x] 2.2 Thêm 4 khóa `b2.turn.red`, `b2.turn.blue`, `b2.win.red`, `b2.win.blue` vào `voiceLines.ts`. Phát câu "Lượt của…" xếp hàng sau lời khen hoặc lời động viên, không ngắt lời (design D6). Phát `b2.win.*` khi có đội thắng. Kiểm tra: Vitest với `audio` giả, xác nhận thứ tự gọi `say` khi đổi lượt và khi thắng
- [x] 2.3 Tạo 4 file MP3 mới bằng cùng giọng bé gái giọng Bắc, đặt vào `public/audio/voice/`. Kiểm tra: `node scripts/export-voice-lines.mjs --check` báo đủ file

## 3. Hình hoạt hình

- [x] 3.1 Tìm và tải hình thỏ, cà rốt và hàng rào đạt tiêu chí ở design D4 (CC0 hoặc Pixabay License, nền trong suốt, cùng nét vẽ). Lưu vào `public/images/bunny/` và thêm một dòng `credits.ts` cho mỗi hình. Kiểm tra: các file có trong thư mục, trang "Giới thiệu" hiện đủ tác giả, giấy phép và nguồn
- [x] 3.2 Làm hai phiên bản thỏ theo màu đội (Đỏ và Xanh) theo thứ tự ưu tiên ở D4. Kiểm tra: đặt hai thỏ cạnh nhau, phân biệt được ngay trên máy chiếu hoặc màn hình 1280×720
- [x] 3.3 (Chỉ làm khi 3.1 không tìm được thỏ đạt tiêu chí) Tự vẽ SVG thỏ theo phong cách ảnh mẫu `4805a2bcf98e79d0209f.jpg`, có bản ngồi và bản đang nhảy. Kiểm tra: hình hiển thị đúng ở hai màu đội; nếu không cần làm thì ghi "không cần" vào task này — Không cần: bộ Jumper Pack của Kenney (CC0) có sẵn thỏ nhiều tư thế
- [x] 3.4 Nếu `credits.ts` có tên miền mới (ví dụ `pixabay.com`, `opengameart.org`), thêm vào danh sách cho phép trong `scripts/package.mjs`. Kiểm tra: `npm run package` chạy hết, không báo URL lạ — Không cần sửa: nguồn trong `credits.ts` ghi không có `http(s)://` nên không bị quét

## 4. Cảnh 2D

- [x] 4.1 Viết `BunnyBoard.tsx`: khung 16:9 có nền cỏ (`aerial_grass_rock_diff.jpg` lát lặp), dải trời và bụi cây CSS, một hoặc hai làn, ô bàn chân ghi phép tính, hàng rào cà rốt chung ở cuối (design D4, D5). Không có suối, đá, khối gỗ hay cà rốt dọc đường. Kiểm tra: test component, chế độ 1 người có 1 làn 7 ô, chế độ 2 đội có 2 làn, và không có phần tử cà rốt nào ngoài hàng rào
- [x] 4.2 Hiển thị trạng thái ô: ô kế tiếp phát sáng kèm "Bằng N?"; ô bằng N đã qua thì sáng xanh và ghi "= N"; ô khác N đã qua thì hiện kết quả và mờ đi; ô nhầm thì rung đỏ, rung lại cả khi nhầm cùng một ô (`wrongTick`). Kiểm tra: test component cho từng trạng thái
- [x] 4.3 Đặt nút **Đúng** và **Sai** ngay dưới ô kế tiếp của làn đang có lượt, cao ít nhất 64 px, và nối vào `answer()`. Làn không có lượt thì không có nút và được làm mờ nhẹ. Kiểm tra: test component, bấm Đúng hoặc Sai gọi đúng làn; làn không có lượt không có nút
- [x] 4.4 Làm cú nhảy của thỏ bằng Web Animations API: đường vòng cung, co, duỗi và nén, đổi sang hình tư thế nhảy nếu có. Animation `finished` gọi `landed()`. Cú về vạch xuất phát và cú nhảy vào hàng rào dùng cùng cơ chế. Kiểm tra: chạy `npm run dev`, chơi hết một màn 1 người và một màn có nhầm; không có thao tác nào lọt qua trong lúc nhảy
- [x] 4.5 Làm thanh trên cùng: nút chọn chế độ "1 người | 2 đội", tiêu đề và đề bài "Tìm phép trừ có kết quả bằng N", nút số 2–9, nút "Màn mới". Thêm bảng "Cà rốt: x/K" cho từng làn và dải "Lượt của: ĐỘI …" theo màu đội. Kiểm tra: test component cho nhãn K của từng làn và dải lượt chỉ có ở chế độ 2 đội
- [x] 4.6 Làm màn kết thúc: chế độ 1 người hiện số cà rốt, số lần nhầm và nút "Chơi màn mới"; chế độ 2 đội hiện "Đội … thắng!" theo màu đội và nút "Chơi màn mới". Kiểm tra: test component cho cả hai chế độ
- [x] 4.7 Thay `BunnyScene`/`Canvas` trong `BunnyGame.tsx` bằng `BunnyBoard`. Viết lại CSS `b2-*`, bỏ `.b2-skip` và `.b2-legend` cũ. Kiểm tra: `npm run build` không lỗi; ở 1280×720 và 1920×1080 bố cục vừa màn, không phải cuộn

## 5. Dọn mã 3D và tài liệu

- [x] 5.1 Xoá `BunnyScene.tsx`, `src/shared/3d/Rabbit.tsx`, `Carrot.tsx`, `fur.ts`, `optionalModel.ts`, `useModel.ts` và `public/models/README.txt`, sau khi grep xác nhận không còn nơi nào import. Kiểm tra: `npm run build` và `npm test` đều xanh
- [x] 5.2 Sửa mục "Toàn bộ nhân vật … dựng bằng code" trong `credits.ts`, bỏ thỏ và cà rốt khỏi danh sách. Sửa `release/HUONG-DAN.txt`: bỏ đoạn `models\rabbit.glb`/`carrot.glb` và thêm cách chơi 2 đội. Sửa dòng Bài 2 trong `README.md`. Kiểm tra: đọc lại ba file, không còn nhắc mô hình 3D của Bài 2

## 6. Kiểm tra tích hợp

- [x] 6.1 Chạy `npm run package`, chép `TroChoiToan1/` ra rồi chạy `start.bat` khi đã ngắt mạng. Chơi một màn 1 người và một màn 2 đội tới khi có đội thắng. Kiểm tra: mọi hình và giọng đọc đều có; tab Network không có yêu cầu ra ngoài localhost
- [x] 6.2 Chạy `openspec validate bunny-two-team-race-2d --strict`. Kiểm tra: không lỗi

## Workflow follow-up

- Sau khi xong và đã kiểm tra trên máy lớp, chạy `/opsx:archive` để gộp phần sửa spec vào `openspec/specs/bunny-carrot-game/spec.md`.
