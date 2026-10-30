# Design

## Context

Động cơ và phạm vi xem ở proposal.md. Yêu cầu chi tiết xem ở `specs/bunny-carrot-game/spec.md`.

Hiện trạng của Bài 2:
- Luật chơi là hàm thuần trong `src/games/bunny/logic.ts`, có test.
  - Thỏ đi lần lượt từng ô (`nextIndex`).
  - `choose()` xử lý khi bấm vào ô, nghĩa là trả lời "bằng N". `skip()` xử lý nút "Bỏ qua", nghĩa là trả lời "không bằng N".
  - Nhầm thì gọi `mistake()`, đưa thỏ về đầu đường và xoá mọi đánh dấu.
  - Trạng thái chạy theo vòng `idle → hopping | returning → idle`, kết thúc bằng `toGarden → finished`. Cảnh gọi `landed()` khi hoạt ảnh nhảy xong.
- `levels.ts` sinh màn 7 ô từ `(target, seed)`. Ô đầu luôn đúng. Ô sai có kết quả lệch 1–2 so với mục tiêu.
- Hiển thị là cảnh R3F trong `BunnyScene.tsx`, dùng `Rabbit` và `Carrot` dựng bằng code trong `src/shared/3d/`. Hai thành phần này chỉ Bài 2 dùng. Bài 4 có mô hình riêng.
- `AudioManager.say()` bỏ qua câu nào thiếu file MP3, nên thêm khóa trước rồi tạo file sau cũng không làm vỡ trò chơi.

Ràng buộc: chạy trên máy chiếu 16:9 ở lớp, điều khiển bằng 1 chuột. Không có mạng. Người chơi là trẻ lớp 1, nên nút phải to và đặt gần chỗ đang hỏi.

## Goals / Non-Goals

**Goals:**
- Dùng lại tối đa luật chơi hiện có. Mở rộng từ "một làn" thành "một hoặc hai làn" mà không viết lại luật chấm.
- Cảnh 2D chỉ đọc store và gọi action, giống cách cảnh 3D đang làm, để vẫn test được luật mà không cần giao diện.
- Bố cục vừa màn hình 16:9 từ 1280×720 trở lên mà không phải cuộn.

**Non-Goals:**
- Không làm hoạt ảnh khung hình cho thỏ (sprite sheet). Thỏ chuyển động bằng biến đổi vị trí, tỉ lệ và đổi tư thế nếu bộ hình có.
- Không hỗ trợ điện thoại hay màn hình dọc.
- Không đổi Bài 3, Bài 4 hay khung ứng dụng.

## Decisions

### D1. Hiển thị bằng DOM + CSS, không dùng Canvas

Cảnh dựng bằng các thẻ `div` và `img` đặt tuyệt đối theo phần trăm, bên trong một khung giữ tỉ lệ 16:9.

- Nút Đúng và Sai là `<button>` thật: to, rõ, nhận chuột và cảm ứng, không cần tự xử lý va chạm.
- Chữ phép tính sắc nét ở mọi độ phân giải. Dùng font Baloo 2 đã có.
- Cú nhảy dùng Web Animations API (`element.animate`) theo đường vòng cung: co lại khi bật, duỗi khi bay, nén khi chạm đất. Sự kiện `finished` của animation gọi `landed()` trong store, thay cho `useFrame` trước đây.

**Phương án đã cân nhắc:**
- Canvas 2D: phải tự vẽ chữ và tự xử lý bấm.
- Giữ R3F với camera trực giao: vẫn nạp Three.js cho một cảnh phẳng, và còn nút trong `Html` overlay khó căn chỉnh.

### D2. Luật chơi: thêm lớp "cuộc đua" bọc quanh luật một làn

Trạng thái mỗi làn (`LaneState`) vẫn như `BunnyState` hiện tại: vị trí, đánh dấu ô, số cà rốt, số lần nhầm, ô vừa nhầm. Thêm một trạng thái bọc ngoài:

```
RaceState {
  mode: 'solo' | 'teams'
  lanes: LaneState[]        // 1 hoặc 2 làn, mỗi làn một Level
  turn: number              // chỉ số làn đang có lượt (solo luôn là 0)
  phase: 'idle' | 'hopping' | 'returning' | 'toGarden' | 'finished'
  active: number            // làn đang có thỏ chuyển động
  winner: number | null
}
```

- `answer(state, laneIdx, saysEqual: boolean)` hợp nhất `choose()` và `skip()`. Hàm bỏ qua thao tác khi `phase !== 'idle'` hoặc `laneIdx !== turn`. Phán khớp thì đi tiếp (`advance`), phán nhầm thì về đầu (`mistake`), dùng lại logic đang có.
- `phase` là của chung cả màn, nên khi bất kỳ thỏ nào đang nhảy thì mọi làn đều bị khoá. Điều này đáp ứng yêu cầu "Không nhận thao tác trong lúc thỏ đang nhảy".
- `landed()`:
  - Từ `hopping` hoặc `returning` về `idle`: nếu là chế độ `teams` thì đổi `turn`.
  - Từ `toGarden` sang `finished`: ghi `winner = active`.

  Đổi lượt nằm trong `landed()`, nên lượt chỉ chuyển khi thỏ đã chạm đất. Câu đọc "Lượt của đội …" vì vậy không đè lên lời khen.
- Chế độ `solo` chỉ là trường hợp một làn, không có nhánh luật riêng.

**Phương án đã cân nhắc:** hai store độc lập, mỗi đội một store, cộng thêm một biến lượt. Cách này dễ để hai thỏ cùng nhảy hoặc đổi lượt sai. Một trạng thái chung kiểm soát được bất biến dễ hơn.

### D3. Sinh hai làn khác nhau

Gọi `generateLevel(target, seed)` hai lần với hai seed khác nhau. Nếu dãy `(a, b)` của hai làn trùng nhau thì sinh lại làn thứ hai, tối đa 20 lần. Với mục tiêu 9 chỉ có một phép đúng là 10−1, nên hai làn vẫn khác nhau nhờ các ô sai và thứ tự ô.

Số ô và số ô đúng đã cố định theo `correctCount(target)`, nên hai làn tự cân bằng. Có test cho mọi mục tiêu 2–9.

### D4. Hình hoạt hình

- **Tiêu chí chọn hình:**
  - Giấy phép CC0 hoặc Pixabay Content License. Không dùng hình có điều khoản NC hay ND.
  - Nền trong suốt. Ưu tiên SVG, nếu là PNG thì cạnh dài ít nhất 512 px.
  - Thỏ, cà rốt và hàng rào cùng một bộ hoặc cùng nét vẽ.
- **Nguồn ưu tiên:** Kenney.nl, rồi OpenGameArt (lọc CC0), rồi Pixabay (mục Vector).
- **Thư mục:** hình lưu ở `public/images/bunny/` (`rabbit.svg|png`, `rabbit-jump.*` nếu có, `carrot.*`, `fence.*`). Mỗi hình có một dòng trong `src/credits.ts`.
- **Màu đội**, chọn theo thứ tự ưu tiên:
  1. Bộ hình có sẵn hai màu thỏ.
  2. SVG được đổi màu lông hoặc khăn trực tiếp trong file, thành hai file `rabbit-red` và `rabbit-blue`.
  3. PNG được thêm vòng màu đội dưới chân và một dải khăn màu dựng bằng CSS.

  Không dùng `filter: hue-rotate` lên cả hình vì sẽ làm đổi màu mắt và mũi thỏ.
- **Phương án dự phòng:** nếu không tìm được thỏ đạt tiêu chí, tự vẽ SVG thỏ theo phong cách ảnh mẫu `4805a2bcf98e79d0209f.jpg`. Cà rốt và hàng rào vẫn dùng hình tải về.
- **Nền:** dùng lại `textures/aerial_grass_rock_diff.jpg` làm nền cỏ lát lặp. Trời là dải gradient xanh, bụi cây là các hình elip CSS. Như vậy không cần tải thêm hình nền.

### D5. Bố cục

```
+--------------------------------------------------------------+
| [1 người|2 đội]   THỎ NHẢY TÌM CÀ RỐT · bằng N    [2..9][Màn mới] |
|~~~~~~~~~~~~~~~~~~~~~ trời, bụi cây ~~~~~~~~~~~~~~~~~~~~~~~~~~~|
| ĐỎ  🥕0/4 [thỏ] (o)(o)(o)(o)(o)(o)(o)                  |rào|   |
|                  [Đúng][Sai]                           |cà |   |
| XANH 🥕0/4 [thỏ] (o)(o)(o)(o)(o)(o)(o)                  |rốt|   |
|               >>> Lượt của: ĐỘI ĐỎ <<<                       |
+--------------------------------------------------------------+
```

- Chế độ 1 người: chỉ có một làn, đặt ở giữa theo chiều dọc. Không có dải "Lượt của".
- Nút Đúng và Sai hiện ngay dưới ô sẽ nhảy tới của làn đang có lượt, cao ít nhất 64 px. Làn không có lượt không hiện hai nút này, và được làm mờ nhẹ.
- Toạ độ ô không còn đọc từ `Tile.pos`. Vị trí ô tính theo chỉ số trên làn, dàn đều theo chiều ngang. Trường `pos` bị bỏ khỏi `Tile`.

### D6. Giọng đọc

Thêm 4 khóa vào `voiceLines.ts`:
- `b2.turn.red`: "Lượt của đội Đỏ."
- `b2.turn.blue`: "Lượt của đội Xanh."
- `b2.win.red`: "Đội Đỏ thắng rồi!"
- `b2.win.blue`: "Đội Xanh thắng rồi!"

Tạo file MP3 bằng cùng giọng bé gái đang dùng, theo quy trình `scripts/export-voice-lines.mjs`, rồi kiểm tra bằng `--check`.

Thứ tự phát khi đổi lượt: lời khen hoặc lời động viên phát ngay lúc bấm, còn câu "Lượt của…" xếp hàng phát sau, không ngắt lời khen.

### D7. Dọn mã 3D

Xoá các file sau, sau khi đã kiểm tra bằng grep là không còn nơi nào dùng:
- `BunnyScene.tsx`
- `src/shared/3d/Rabbit.tsx`, `Carrot.tsx`, `fur.ts`, `optionalModel.ts`, `useModel.ts`
- `public/models/README.txt`

Sửa dòng "Toàn bộ nhân vật … thỏ, cà rốt … dựng bằng code" trong `credits.ts`, bỏ thỏ và cà rốt ra khỏi dòng này. Cập nhật tài liệu `release/HUONG-DAN.txt` nếu trong đó có nhắc tới `models/rabbit.glb`.

## Risks / Trade-offs

- **[Đội Đỏ luôn đi trước nên có lợi thế nhỏ]** Nếu hai đội không nhầm lần nào, Đội Đỏ về đích trước một lượt. → Chấp nhận, vì luật "tới đích trước" do giáo viên chọn. Thực tế tỉ lệ nhầm của trẻ lớn hơn nhiều so với lợi thế một lượt. Giáo viên có thể cho hai đội đổi màu giữa các màn.
- **[Không tìm được hình thỏ đẹp, cùng bộ với cà rốt]** → Dùng phương án dự phòng ở D4 (tự vẽ SVG thỏ). Đây là task riêng, chỉ làm khi bước tìm hình thất bại.
- **[Bấm nhầm sang làn đội kia]** → Làn không có lượt không có nút Đúng hoặc Sai, và luật cũng từ chối theo `turn`.
- **[Thiếu file MP3 cho câu mới]** → `AudioManager` bỏ qua câu thiếu file. Bước `--check` trong tasks bắt lỗi này trước khi đóng gói.
- **[Bỏ 3D làm mất cài đặt chất lượng cho Bài 2]** → Cảnh 2D đủ nhẹ nên không cần cài đặt này. Yêu cầu chất lượng đồ họa trong `game-shell` vẫn áp dụng cho Bài 4.

## Migration Plan

Không có dữ liệu cần chuyển vì trò chơi không lưu tiến độ. Đóng gói lại bằng `npm run package` rồi chép đè thư mục `TroChoiToan1/` sang máy lớp. Muốn quay về bản cũ thì chép lại gói cũ.
