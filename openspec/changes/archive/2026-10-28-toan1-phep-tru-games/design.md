# Design

## Context

Đây là dự án mới, thư mục hiện chỉ có `openspec/` và ảnh tham khảo `4805a2bcf98e79d0209f.jpg` (giao diện bài 2). Động cơ và phạm vi xem ở proposal.md, yêu cầu chi tiết xem ở `specs/`.

Các ràng buộc quyết định thiết kế:
- Máy lớp học chạy Windows 10/11, có Edge và webcam, **không có mạng**, không cài sẵn Node hay Python.
- Trình duyệt chỉ cho dùng camera (`getUserMedia`) trong secure context. Mở trực tiếp `file://` thì không chắc dùng được, còn `http://localhost` thì dùng được.
- Người dùng là trẻ lớp 1. Thao tác phải to, rõ, dễ tha lỗi. Phần chữ là tiếng Việt.

## Goals / Non-Goals

**Goals:**
- Một ứng dụng web tĩnh duy nhất. Build ra thư mục `dist/` và chạy được offline qua `start.bat`.
- Tách luật chơi (thuần TypeScript, test được) khỏi phần hiển thị 3D.
- Chạy được ở khoảng 30 khung hình/giây trên máy có card đồ họa tích hợp khi để chất lượng "Thấp".

**Non-Goals:**
- Không có máy chủ backend, không lưu điểm lâu dài, không có tài khoản.
- Không tự làm mô hình 3D bằng code cho các con vật. Mô hình lấy từ kho miễn phí.
- Không hỗ trợ trình duyệt cũ không có WebGL2.

## Decisions

### D1. React + Vite + TypeScript + React Three Fiber

- Dùng React Three Fiber (R3F) và `@react-three/drei` để làm cảnh 3D. Drei có sẵn `Environment` (HDRI), `Sky`, `useGLTF`, `CameraControls`, `PointerLockControls`, `ContactShadows`, `Html`. Đây đúng là các phần bài 4 cần.
- **Phương án đã cân nhắc:**
  - Three.js thuần: phải tự viết vòng đời và trạng thái, khó ghép với giao diện React.
  - Babylon.js: mạnh nhưng không theo kiểu React và ít ví dụ kéo thả kiểu React.
  - Unity WebGL: file nặng, build chậm, khó sửa giao diện tiếng Việt.

### D2. Nhận diện tay chạy trong trình duyệt, không dùng Python

- Dùng `@mediapipe/tasks-vision` `HandLandmarker`, `numHands: 2`, chạy ở chế độ VIDEO, ưu tiên GPU và tự chuyển sang CPU nếu không có.
- Các file `.wasm` và `hand_landmarker.task` được chép vào `public/mediapipe/` và nạp bằng đường dẫn tương đối.
- Khi `navigator.onLine` báo có mạng, thử tải trước từ web: `.wasm` từ jsdelivr (cùng phiên bản `@mediapipe/tasks-vision`), mô hình từ storage.googleapis.com. Lỗi hoặc quá 10 giây thì dùng bản trên máy. Thứ tự nguồn nằm trong `src/hand/mediapipeSources.ts` và có test. Bản trên máy luôn có trong gói, nên mất mạng vẫn chơi được.
- **Phương án đã cân nhắc:** Python (OpenCV + MediaPipe) gửi kết quả sang trình duyệt qua WebSocket. Cách này phải cài Python trên máy lớp, chạy thêm một tiến trình và dễ xung đột cổng, mà độ chính xác vẫn như nhau. Vì vậy loại bỏ.

### D3. Thuật toán đếm ngón

- Bốn ngón trỏ, giữa, áp út, út được tính là duỗi khi đầu ngón (TIP) ở xa cổ tay (landmark 0) hơn khớp PIP. Dùng khoảng cách, không dùng trục y, để vẫn đúng khi tay nghiêng.
- Ngón cái được tính là duỗi khi đầu ngón cái (4) cách xa gốc ngón út (17) hơn khớp IP (3), đồng thời góc tại khớp MCP (2) gần thẳng. Cách này không phụ thuộc tay trái hay tay phải, nên không bị lỗi do camera lật hình.
- Làm mượt:
  - Lấy giá trị xuất hiện nhiều nhất (mode) trong cửa sổ khoảng 8 khung hình.
  - Bộ đếm giữ (`holdMs`, mặc định 1500) đặt lại khi giá trị ổn định thay đổi.
  - Sau khi chốt, khóa lại cho đến khi giá trị đổi hoặc tay rời khung hình. Việc này đáp ứng scenario "không chốt lặp lại".
- Phần này viết thành module thuần, nhận đầu vào là landmarks. Nhờ đó test được bằng dữ liệu landmarks ghi sẵn.

### D4. Trạng thái và luật chơi

- Mỗi trò chơi có một store Zustand riêng, chứa máy trạng thái của trò chơi.
- Luật chơi là hàm thuần trong `src/games/<game>/logic.ts`, được test bằng Vitest. Thành phần 3D chỉ đọc store và gọi action.
- Bài 2 có các trạng thái: `idle → hopping → (idle | returning) → … → finished`. Ở trạng thái `hopping`/`returning` thì không nhận thao tác bấm.
- Bài 4: mỗi đối tượng có `{id, kind, zone, position, deleted}`. Vùng (`zone`) được tính lại khi thả vật, theo vị trí thả: chạm mặt nước, trên một độ cao ngưỡng, hoặc trên mặt đất. Số đếm được suy ra từ danh sách đối tượng, không lưu riêng.

### D5. Kéo thả trong bài 4

- Dùng pointer events của R3F. Khi bắt đầu kéo thì tắt `CameraControls`.
- Trong lúc kéo, vật đi theo mặt phẳng song song với màn hình, đi qua điểm vật đang đứng. Nhờ vậy kéo lên được trời. Khi thả:
  - Chiếu tia xuống để biết dưới vật là nước hay đất.
  - Nếu vật ở cao hơn `SKY_Y` thì xếp vào vùng trời và chạy hoạt ảnh bay lên.
- Ếch dưới nước nổi nhấp nhô bằng hoạt ảnh sin. Không dùng thư viện vật lý.
- **Phương án đã cân nhắc:** dùng Rapier cho vật rơi và nổi. Cách này phức tạp và khó đoán đối với trẻ nhỏ. Vì vậy **bỏ `@react-three/rapier`** khỏi danh sách phụ thuộc ở proposal.

### D6. Di chuyển và góc nhìn bài 4

- Có danh sách điểm đến (vị trí và hướng nhìn camera). Khi chọn điểm đến, dùng `CameraControls.setLookAt(..., true)` để camera bay mượt.
- Chế độ giáo viên thêm WASD/phím mũi tên, di chuyển trên mặt phẳng ngang, kẹp độ cao tối thiểu và giới hạn trong ranh giới vườn.
- Chế độ học sinh chỉ cho chọn điểm đến và xoay nhẹ quanh điểm đến, có giới hạn góc.

### D7. Đồ họa bán thực tế và chất lượng

- Mô hình `.glb` nén bằng `gltf-transform` (Draco/meshopt, texture KTX2 hoặc WebP).
- Ánh sáng gồm HDRI 1k, chiếu sáng môi trường, đèn mặt trời có bóng đổ, và sương mù nhẹ ở xa.
- Nước dùng `Water` (three/examples) ở mức Cao, và mặt phẳng trong suốt có texture chuyển động ở mức Thấp.
- Cỏ dùng `InstancedMesh`, số lượng phụ thuộc mức chất lượng.
- Mức chất lượng lưu trong store chung và `localStorage` (bọc try/catch).
- Nguồn mô hình ưu tiên: Quaternius và Poly Pizza (CC0) cho cây, cổng, rào; Sketchfab (CC-BY) cho ếch, cò, nến khi cần trông thật hơn. Danh sách nguồn lưu ở `src/credits.ts` và hiển thị ở trang Giới thiệu.

### D8. Âm thanh và giọng đọc

- Giọng đọc bé gái, giọng Bắc, được tạo trước bằng công cụ giọng trẻ em tiếng Việt, xuất MP3 vào `public/audio/voice/`.
- Có bảng `voiceLines.ts` ánh xạ khóa sang file, ví dụ `praise.1`, `retry.1`, `b2.intro.4`, `b3.q.9-3`, `b4.task.frog`.
- Phát âm thanh bằng một `AudioManager` dùng HTMLAudioElement, có hàng đợi để không đọc chồng nhau và có cờ tắt tiếng.
- Trình duyệt chỉ cho phát âm thanh sau khi người dùng tương tác. Vì vậy màn hình chính có nút "Bắt đầu" để mở khóa âm thanh.

### D9. Đóng gói và khởi chạy offline

- `vite build` với `base: './'`, ra thư mục `dist/`.
- Gói phát hành có cấu trúc:
  ```
  TroChoiToan1/
    start.bat
    server.ps1
    game/          <- nội dung dist/
  ```
- `server.ps1` dùng `System.Net.HttpListener` trên `http://localhost:8080/`. Nếu cổng bận thì thử 8081–8090. Script phục vụ file tĩnh với MIME đúng cho `.wasm` (`application/wasm`), `.glb`, `.task`, `.mp3`, `.ktx2`, `.hdr`, rồi mở `msedge` hoặc trình duyệt mặc định.
- `start.bat` gọi `powershell -NoProfile -ExecutionPolicy Bypass -File server.ps1`.
- **Phương án đã cân nhắc:**
  - Electron: dễ dùng nhất nhưng file nặng 150–250MB. Người dùng đã chọn `start.bat`.
  - Mở `file://`: không ổn định với camera và với việc nạp `.wasm`.

### D10. Cấu trúc thư mục

```
src/
  app/        (router đơn giản theo state, HomeScreen, AboutScreen, Settings)
  audio/      (AudioManager, voiceLines)
  hand/       (fingerCount.ts thuần, useHandTracker.ts, CameraView)
  games/bunny/ (logic.ts, levels.ts, BunnyScene.tsx, store.ts)
  games/finger/ (logic.ts, questions.ts, FingerGame.tsx, store.ts)
  games/zoo/   (logic.ts, tasks.ts, ZooScene.tsx, objects/, controls/, store.ts)
  shared/3d/   (Lighting, QualityProvider, các loader dùng chung)
public/ (models/, hdri/, mediapipe/, audio/, fonts/)
release/ (start.bat, server.ps1)
```

### D11. Điều chỉnh trong lúc làm

- **Thỏ, ếch, cò đứng, nến và cây được dựng bằng code.** Không tải được mô hình CC0 phù hợp từ nguồn tải trực tiếp: Poly Pizza chặn tải tự động, Sketchfab cần đăng nhập, cây của Poly Haven nặng 46–950 MB. Riêng ếch có chỗ cắm sẵn: nếu có file `models/frog.glb` thì tự dùng file đó.
- **Cò bay dùng mô hình `Stork.glb`** của kho ví dụ three.js, có hoạt ảnh vỗ cánh. Mô hình này có giấy phép CC BY-NC-SA 3.0 nên chỉ dùng phi thương mại. Cò đứng trên đất dùng mô hình dựng bằng code, vì mô hình gốc chỉ có tư thế bay.
- **Kéo thả trong bài 4 bám theo mặt đất/mặt nước**, không dùng mặt phẳng song song màn hình như dự định ở D5. Đưa vật lên trời bằng cách thả vào dải "bầu trời" ở trên cùng màn hình, hoặc thả vào chỗ tia nhìn không chạm đất. Trẻ kéo con vật trên mặt đất trực quan hơn.
- **Camera phải tắt ngay trong sự kiện pointerdown** của vật và bật lại trong pointerup, không đợi React vẽ lại. Nếu đợi, `camera-controls` lỡ mất pointerup và cứ xoay theo chuột.
- **Mô hình nén bằng meshopt**, không dùng Draco, vì drei mặc định tải bộ giải nén Draco từ CDN. Texture không nén sang WebP được vì libvips trên máy build lỗi. Gói phát hành vẫn chỉ 46,5 MB.
- **Hiệu ứng âm thanh tổng hợp bằng WebAudio**, không cần file.
- **Câu dẫn bài 2 tạo sẵn cho từng giá trị mục tiêu 1–9** (`b2.intro.N`), không ghép "bằng" + "số N", vì ghép như vậy nghe rời rạc.

## Risks / Trade-offs

- [Máy lớp học yếu, bài 4 bị giật] → Mức chất lượng Thấp, nén mô hình, giới hạn số đối tượng, dùng `frameloop="demand"` cho bài 2.
- [Đếm ngón cái sai với tay trẻ nhỏ hoặc ánh sáng kém] → Luôn hiển thị số máy đang thấy, có bàn phím dự phòng, thử sớm với tay trẻ thật (task riêng), và chỉnh ngưỡng bằng hằng số.
- [Nhà trường chặn PowerShell script] → Dùng `-ExecutionPolicy Bypass`. Nếu vẫn bị chặn thì ghi hướng dẫn dự phòng trong README (chạy `msedge --allow-file-access-from-files`, chế độ hạn chế).
- [Mô hình CC-BY phải ghi nguồn; mô hình "giống thật" có thể rất nặng] → Chọn mô hình dưới 3MB sau khi nén, ghi nguồn ở trang Giới thiệu, ưu tiên CC0.
- [Trẻ kéo thả trên màn hình cảm ứng khó chính xác] → Vùng bấm của đối tượng lớn hơn mô hình (hitbox vô hình), có vòng sáng khi rê chuột qua.
- [Kích thước gói lớn do HDRI, mô hình, MediaPipe, âm thanh] → Mục tiêu dưới 80MB. Không có mạng thì kích thước chỉ ảnh hưởng thời gian chép USB.

## Migration Plan

Không áp dụng: dự án mới. Phát hành bằng cách chép thư mục `TroChoiToan1/` sang máy lớp. Muốn quay về bản cũ thì chép đè thư mục bản trước.

## Open Questions

- Giọng Bắc hay Nam: tạm để giọng Bắc, chỉ cần tạo lại file âm thanh nếu đổi.
- Chọn mô hình ếch, cò, nến cụ thể: quyết định lúc làm, dựa theo kích thước và giấy phép.
