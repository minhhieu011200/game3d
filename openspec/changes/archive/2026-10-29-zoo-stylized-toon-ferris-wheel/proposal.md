# Proposal

## Why

Cảnh vườn thú Bài 4 đang tô toon phẳng 3 bậc cứng, không có viền, nên các vật cần đếm khó tách khỏi nền: ếch xanh `#58d15a` đứng trên cỏ xanh `#7ed957`, cò trắng bay trên trời nhạt và sương `#d6f3ff`. Học sinh lớp 1 cần nhìn ra từng con mới đếm đúng được. Cảnh cũng còn "đứng im", ít phản hồi khi trẻ kéo thả. Bàn nến 2 hàng × 5 thì nhỏ và lẫn vào bến gỗ, nên giáo viên muốn thay bằng một **vòng quay (Ferris wheel) 10 cabin**, mỗi cabin một ngọn nến, vừa nổi bật vừa sinh động. Ngoài ra, spec `zoo-counting-scene` còn mô tả chế độ giáo viên/học sinh và danh sách điểm đến camera, những thứ code đã bỏ. Change này cập nhật spec theo đúng code.

## What Changes

- **Phong cách hình ảnh Stylized Toon mềm, có viền** (chỉ Bài 4):
  - Ramp toon mềm thay cho 3 bậc cứng.
  - Ánh sáng viền ấm để tách vật khỏi nền.
  - Bóng tiếp đất dưới mỗi con vật.
- **Viền** quanh vật đếm được (ếch, cò, nến), 6 loài thú làm cảnh, thuyền, bác lái đò, học sinh và cô giáo. Cây, công trình, bướm, trời, sông và đất không có viền. Viền vẫn giữ ở chế độ chất lượng thấp.
- **Bảng màu theo nguyên tắc "vật đếm rực, nền dịu"**:
  - Sửa hai chỗ trùng màu: ếch trên cỏ, cò trên trời.
  - Giữ nguyên hình dáng, vị trí và số lượng mọi vật thể.
- **Hoạt cảnh sinh động hơn**:
  - Nhún, nhảy và chớp mắt ngẫu nhiên.
  - Co giãn (squash & stretch) khi nhấc lên và khi thả xuống.
  - Hạt hiệu ứng: nước tóe khi ếch xuống sông, lông bay khi cò cất cánh, khói xoắn khi tắt nến (mở rộng hiệu ứng khói đang có).
  - Phát sáng nhẹ khi rê chuột hoặc chạm vào vật kéo được.
- **Vòng quay nến thay bàn nến** tại bến nến (bờ nam, x = −6):
  - 10 cabin treo luôn thẳng đứng, cabin đầu tiên màu đỏ có ngôi sao.
  - Vòng quay chậm khi rảnh và giảm tốc dừng đúng góc "nhà" khi bắt đầu nhiệm vụ nến, khi thuyền cập bến nến, hoặc khi chạm/kéo một ngọn nến.
  - Kéo nến ra thì cabin trống. Thả gần một cabin trống thì nến gắn vào cabin đó.
- **BREAKING (spec)**: Vùng đếm của nến đổi từ "trên bàn" sang "trên vòng quay". Biển "🕯️ Bàn nến" đổi thành "🎡 Vòng quay".
- **Cập nhật spec theo code hiện tại**:
  - Bỏ requirement "Chế độ giáo viên" và "Chuyển chế độ".
  - Thay "Di chuyển và góc nhìn" (danh sách điểm đến camera) bằng "Đi lại bằng thuyền" (bấm bến, lái thuyền).
  - "Chế độ học sinh" trở thành luồng chơi duy nhất, có nút bật/tắt bảng đếm.
- Không thêm thư viện, chạy offline, giữ nguyên giọng đọc. Lời thoại chỉ nói "ngọn nến", không nhắc tới "bàn".

## Capabilities

### New Capabilities
<!-- Không có. -->

### Modified Capabilities
- `zoo-counting-scene`:
  - Cảnh đổi sang phong cách toon mềm, có viền, và nến đặt trên vòng quay.
  - Vùng đếm của nến là vòng quay. Kéo thả gắn nến vào cabin, và "Đặt lại" đưa nến về đúng cabin.
  - Thêm requirement cho vòng quay và cho phản hồi hình ảnh khi thao tác.
  - Viết lại phần di chuyển (thuyền, bến) và luồng nhiệm vụ cho khớp code.
  - Bỏ hai chế độ giáo viên/học sinh.

## Impact

- **Dựng hình dùng chung**:
  - `src/shared/3d/toon.tsx`: vật liệu, ramp, ánh sáng viền, viền. Chỉ Bài 4 dùng file này.
  - `src/shared/3d/quality.ts`: thêm cờ cho hạt hiệu ứng và bóng tiếp đất.
- **Cảnh Bài 4**:
  - `ZooScene.tsx`: đèn, sương, biển khu.
  - `objects/Models.tsx`, `scene/Animals.tsx`, `objects/Boat.tsx`, `objects/Passengers.tsx`: màu, viền, hoạt cảnh.
  - `scene/Terrain.tsx`, `scene/Sky.tsx`, `scene/Vegetation.tsx`: bảng màu nền.
  - `scene/Structures.tsx`: `CandleTable` được thay bằng vòng quay.
- **Logic Bài 4**:
  - `layout.ts`: `TABLE` được thay bằng cấu hình vòng quay và vị trí cabin.
  - `logic.ts`: zone `'table'` đổi thành `'wheel'`, và nến có thêm chỉ số cabin.
  - `objects/Draggable.tsx`: nến đi theo cabin, thả vào cabin trống.
  - `store.ts`: trạng thái quay/dừng, thả vào cabin.
  - `boat.ts`: bến nến nhìn vào vòng quay.
  - Dọn `mode`/`setMode` thừa trong `store.ts`.
- **Test**: `logic.test.ts` và `boat.test.ts` đang dùng `TABLE` và zone `'table'`, cần cập nhật. Thêm test cho phần gắn cabin và góc dừng.
- **Hiệu năng**: viền làm tăng số lần vẽ cho các vật có viền. Chế độ `low` tắt hạt hiệu ứng và bóng đổ, nhưng giữ viền và ramp.
