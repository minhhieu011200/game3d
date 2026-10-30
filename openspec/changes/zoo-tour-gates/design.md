# Design

## Context

- Hiện tại `useApp` (`src/app/store.ts`) giữ `screen: 'home' | 'bunny' | 'finger' | 'zoo' | 'about'`. `App.tsx` nạp lười từng trò chơi, còn `TopBar` có nút "Về trang chủ".
- Ba trò chơi đang có đều không nhận props. Mỗi trò tự giữ trạng thái và tự báo xong theo cách riêng:
  - Bài 3: `useState` cục bộ, có `finished`.
  - Bài 2: store zustand, kiểm tra xong bằng `allArrived` / `winner`.
  - Bài 4: store zustand, xong khi `phase === 'done'`.
- Cảnh 3D dùng R3F + drei, phong cách toon trong `src/shared/3d/toon.tsx` (các khối `Ball`, `Capsule`, `CuteEye`…) và `useQuality()` cho mức Cao/Thấp.
- Giọng đọc lấy từ khóa trong `voiceLines.ts`, mỗi khóa ứng với một file MP3. `AudioManager` tự bỏ qua câu nào thiếu file.
- Change `zoo-stylized-toon-ferris-wheel` còn dở và đang sửa `toon.tsx`.

## Goals / Non-Goals

**Goals:**
- Thêm màn đường đi và trò Bài 1 mà **không đổi luật chơi** của Bài 2, 3, 4. Mỗi trò chỉ cần thêm một điểm báo "đã xong", một điểm báo tiến độ và một nút "Qua cổng".
- Logic tour và logic Bài 1 viết thành hàm thuần, có unit test, giống `src/games/*/logic.ts`.
- Chạy mượt trên máy lớp học yếu: tại mỗi thời điểm chỉ có một Canvas WebGL.

**Non-Goals:**
- Không lưu tiến độ qua lần tải lại trang (localStorage).
- Không làm nhận diện khuôn mặt. "Soát vé" ở Cổng 1 chính là Bài 3 giơ ngón tay.
- Không dùng mô hình GLB mới. Xe buýt, Vẹt Xanh, cổng và hoa dựng từ khối toon có sẵn hoặc SVG.
- Không cho người dùng tự đi lại tự do trên màn đường đi.

## Decisions

### 1. Tách store tour khỏi `useApp`
`src/tour/logic.ts` là phần thuần. Nó định nghĩa `STATIONS` gồm 4 cổng và quảng trường. Mỗi cổng có `id`, `title`, `lesson`, `screen`, khóa lời dẫn và vị trí trên đường. Trạng thái tour là `{ at: number, phase: 'idle' | 'moving' | 'atGate' | 'passing', passed: Set<GateId> }`, đổi qua các hàm `advance`, `arrive`, `pass`, `jumpTo`, `reset`.

`src/tour/store.ts` bọc phần này bằng zustand. `useApp` chỉ thêm hai thứ:
- màn `'tour'` và `'flower'`;
- trường `gate: GateId | null`, cho biết trò chơi đang mở từ cổng nào.

*Phương án đã cân nhắc:* nhét luôn trạng thái tour vào `useApp`. Cách này làm store chung phình to và khó test riêng.

### 2. Báo hiệu giữa trò chơi và tour qua một module nhỏ dùng chung
Thêm `src/tour/gateBridge.ts`, gồm:
- `reportProgress(n)`: Bài 3 gọi khi trả lời đúng, để thắp đèn.
- `reportDone()`: gọi khi trò chơi kết thúc.
- `<PassGateButton/>`: chỉ hiện khi `useApp().gate !== null`. Bấm thì gọi `passGate()`, đánh dấu cổng đã qua và chuyển `screen = 'tour'`.

Mỗi trò chơi chỉ cần gọi `reportDone()` ở chỗ đang phát `sfx('win')`, và đặt `<PassGateButton/>` vào overlay kết thúc.

*Phương án đã cân nhắc:*
- Truyền prop `onDone` cho từng trò chơi: phải đổi chữ ký của các default export đang nạp lười.
- Theo dõi store của từng trò: Bài 3 dùng `useState` nên không theo dõi được.

### 3. Khung cổng bọc trò chơi ở cấp `App`
Khi `gate !== null`, `App.tsx` đặt `<GateBanner/>` lên trên trò chơi. Banner gồm số và tên cổng, nút "Qua cổng" luôn bấm được, và riêng Cổng 1 có 8 đèn đọc từ `reportProgress`. `TopBar` đổi nút thành "🛣️ Về đường đi". Nút này gọi `leaveGate()` và không đánh dấu cổng đã qua.

Để trò chơi không bị che, banner nằm trong luồng bố cục (chiều cao cố định khoảng 56px), không nổi đè lên trên. Riêng Bài 4 cần kiểm tra lại chiều cao Canvas.

### 4. Cảnh đường đi: một Canvas, camera chạy trên đường cong
- `src/tour/TourScene.tsx` dựng một con đường uốn nhẹ bằng `CatmullRomCurve3`.
- Mỗi trạm gắn với một tham số `t` trên đường cong. Camera nội suy `t` có giảm chấn (damp) tới trạm đích, và luôn nhìn về điểm `t + δ`.
- Không có OrbitControls. Thao tác chuột không làm camera di chuyển.
- Khi vào trò chơi thì gỡ Canvas tour (unmount), để tại mỗi thời điểm chỉ có một ngữ cảnh WebGL. Lúc quay lại thì dựng lại Canvas và đặt camera ngay tại trạm hiện tại, không phát lại hoạt cảnh.
- Mỗi cổng có hai cánh mở ra khi qua cổng. Biển tên dùng `Sign3D` có sẵn. Mỗi cổng có trang trí riêng: máy soát vé, luống hoa, hàng rào cà rốt, vòng quay nhỏ.
- Xe buýt đậu ở đầu đường. Vẹt Xanh bay theo camera và đứng ở mép khung hình.

*Phương án đã cân nhắc:* dùng lại cảnh Bài 4 làm màn đường đi. Cảnh đó quá nặng, lại gắn chặt với thuyền và sông.

### 4b. Nhóm cô trò chibi đi bộ, camera ngôi thứ ba
Giáo viên muốn "con người đi vào" chứ không chỉ có camera trôi. Vị trí trên đường (`cameraT`) giờ là vị trí của nhóm cô trò. Camera đứng sau lưng nhóm 6,5 m, cao 3,4 m, nhìn về phía trước.
- `Walkers.tsx` dùng lại `ChibiHead` của Bài 4, thêm thân đứng, chân, tay và cặp sách.
- Tốc độ bước lấy từ vận tốc thật của lò xo, nên khởi động và dừng đều êm. Đứng yên khoảng 1 giây thì nhân vật quay lại vẫy tay.
- Cảnh trang trí nằm trong `Decor.tsx`: cổng chào, hàng rào kẹo (instanced), đèn lồng, bụi hoa, bóng bay. Thú dùng lại `Animal` của Bài 4, có thêm tham số `ground` cho mặt đất phẳng.
- Tên lớp nằm trong `CLASS_NAME` (`src/tour/logic.ts`). Lời đọc ghi "lớp Một Bảy".
- Bong bóng thoại và nút được dời xuống góc trái dưới, để giữa màn hình cho nhóm nhân vật.

### 5. Lời dẫn và nút điều khiển là lớp DOM
Bong bóng thoại của Vẹt Xanh, các nút "Đi tiếp / Vào cổng / Bản đồ" và bản đồ (modal) đều là phần tử HTML đặt trên Canvas. Chữ HTML nét hơn khi chiếu, đúng font Baloo 2 và dễ test bằng Testing Library. Lời dẫn phát qua `audio.say('tour.gate.N')`.

### 6. Bài 1 là trò 2D bằng DOM và SVG
`src/games/flower/` có cấu trúc giống Bài 2:
- `questions.ts`: dữ liệu 6 − 1 … 6 − 5, có cờ `sample`.
- `logic.ts`: hàm thuần `toggleFlower`, `answer`, `next`, có test.
- `FlowerGame.tsx`.

Hoa và bướm là SVG nội tuyến, chuyển động bằng CSS. Màu vàng và đỏ khớp với hình trong SGK.

Đây là bài nhìn và đếm theo hàng như trang sách. Làm 2D thì nhẹ, nét và giống sách. Phần 3D đã có ở màn đường đi và Bài 4.

### 7. Giọng đọc
Thêm các khóa sau vào `voiceLines.ts`:
- `tour.welcome`, `tour.gate.1` … `tour.gate.4`, `tour.square`
- `b1.intro`, `b1.q.6-k`, `b1.a.6-k`, `b1.enough`, `b1.needmore`

Sau đó chạy `scripts/export-voice-lines.mjs` để xuất danh sách cần tạo, tạo MP3 cùng giọng bé gái đang dùng, rồi chạy `--check`. Trong lúc chưa có file thì trò chơi vẫn chạy, vì `AudioManager` bỏ qua câu thiếu file. Chữ trên màn hình vẫn đủ ý.

### 8. Pháo hoa và chất lượng
Ở mức Cao, pháo hoa là `Points` với khoảng 300 hạt mỗi lần bắn. Ở mức Thấp thì không có hạt, chỉ có huy hiệu phóng to và hiệu ứng CSS. Thêm cờ `particles` vào `QualitySettings` (change toon cũng định thêm cờ này). Nếu change kia đã thêm rồi thì dùng chung.

## Risks / Trade-offs

- **[Rủi ro] Xung đột với change `zoo-stylized-toon-ferris-wheel` ở `toon.tsx` và `quality.ts`.**
  → Tour chỉ *dùng* các export đang có (`Ball`, `Capsule`, `toon()`…), không sửa file. Nên làm xong phần toon của change kia trước rồi mới làm task cảnh tour.
- **[Rủi ro] Gỡ rồi dựng lại Canvas mỗi lần ra vào cổng gây chậm khoảng 0,5–1 giây trên máy yếu.**
  → Cảnh tour chỉ dựng từ khối đơn giản, không tải file. Hiện "Đang tải…" trong lúc chờ.
- **[Đánh đổi] Thứ tự cổng (3 → 1 → 2 → 4) khác số bài trong SGK.**
  → Biển cổng và bản đồ luôn ghi rõ "Bài N", để giáo viên và học sinh không bị nhầm.
- **[Rủi ro] Thêm banner thì vùng chơi còn ít chỗ hơn, nhất là Bài 3 phải hiện cả camera và bàn phím số.**
  → Banner thấp (khoảng 56px). Kiểm tra cả 4 trò ở độ phân giải 1280×720.
- **[Rủi ro] Chưa có MP3 cho các câu mới.**
  → Câu thiếu file được bỏ qua mà không lỗi. Đưa bước tạo giọng đọc vào tasks và dùng `--check` trước khi đóng gói.

## Migration Plan

- Không có dữ liệu cần chuyển đổi. Nút "Về trang chủ" đổi thành "Về đường đi", và `HomeScreen` chỉ còn màn chào.
- Cập nhật `release/HUONG-DAN.txt` theo luồng tham quan mới, rồi chạy `npm run package` để đóng gói lại.
- Muốn quay lại bản cũ thì khôi phục `HomeScreen` có 3 thẻ. Các trò chơi vẫn chạy được độc lập vì `gate === null`.

### 4c. Phong cách hình ảnh theo ảnh mẫu của giáo viên
Màn đường đi chuyển từ toon phẳng sang kiểu "đồ chơi 3D dưới nắng chiều": vật liệu `MeshStandardMaterial` cho đá lát, gạch, cỏ, sắt, xe buýt, cây; nhân vật và thú vẫn dùng toon nhưng bỏ viền ở nhân vật. Mọi chất liệu (đá, gạch, cỏ, vân gỗ của biển) vẽ bằng canvas lúc chạy (`src/tour/textures.ts`, tuỳ chọn `wood` của `Sign3D`), nên không thêm file ảnh và vẫn chạy offline. Bầu trời là một quả cầu shader chuyển màu đi theo camera; ánh nắng là một đèn hướng màu vàng ấm chiếu xiên. Không dùng hậu kỳ (bloom, độ sâu trường ảnh) vì sẽ phải thêm thư viện và nặng cho máy lớp, nên ảnh thật sẽ kém mịn hơn ảnh dựng mẫu.

Bốn cổng tham quan dùng chung một khung cổng vòm (`src/tour/Gates.tsx`, hình vòm dựng bằng `ExtrudeGeometry` từ một `Shape` có lỗ vòm) và một bảng chủ đề `THEMES` theo `GateId` (màu đai, màu cửa, màu hoa, chữ trên bảng, đồ trang trí). Thêm cổng mới chỉ cần thêm một mục chủ đề.

### 4d. Bố cục một chỗ, có kiểm tra chồng lấn
Vị trí các vật lớn của màn đường đi nằm trong `src/tour/layout.ts` (toạ độ cục bộ theo điểm trên đường, đổi sang toạ độ thế giới bằng `toWorld`). Mỗi vật có một vùng chiếm chỗ hình tròn trên mặt đất. `layout.test.ts` kiểm tra không vật nào đè nhau, thú và bụi hoa nằm ngoài hàng rào, xe buýt và biển lớp không lấn đường. Cây được rải ngẫu nhiên có hạt giống cố định nhưng loại bỏ chỗ chồng lên vật hoặc nằm trên đường nhìn từ camera (ở mỗi điểm dừng) tới các vật của điểm đó, nên không còn cây che thú hay cổng.
