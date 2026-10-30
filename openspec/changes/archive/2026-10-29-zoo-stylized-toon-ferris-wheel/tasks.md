# Tasks

## 1. Logic vòng quay và nến gắn cabin

- [x] 1.1 Trong `layout.ts`: thay `TABLE`/`CANDLE_GAP`/`isOnTable` bằng `WHEEL` và hàm thuần `cabinPos(slot, angle)` (cabin thẳng đứng, slot 0 = cabin ngôi sao ở góc "nhà"). Thêm test trong `logic.test.ts` kiểm tra 10 cabin cách đều khoảng 2,26 m, cabin đáy cao trên mặt đất, và `cabinPos(i, 2π) ≈ cabinPos(i, 0)`
- [x] 1.2 Trong `logic.ts`: đổi zone `'table'` thành `'wheel'`, thêm `slot?: number`. `zoneAt(kind, pos, onWheel)` xét `onWheel` trước `SKY_Y`. Cập nhật `byZone`. Sửa test cũ `zoneAt(..., true) → 'wheel'` và thêm test "nến ở cabin đỉnh (y > SKY_Y) vẫn là 'wheel'". Kiểm bằng `npm test`
- [x] 1.3 Thêm `freeSlots` và `nearestFreeSlot(objs, point, angle, maxDist, selfId?)` vào `logic.ts`. Test các trường hợp: cabin trống gần nhất được chọn, cabin đã có nến bị bỏ qua, ngoài `maxDist` thì trả `null`, cabin của chính nến đang kéo được tính là trống
- [x] 1.4 `initialObjects()`: nến `i` có `zone: 'wheel'`, `slot: i`, `pos = cabinPos(i, 0)`. Test: 10 nến đang cháy, slot 0–9 không trùng, `countKind('candle')` ra `stay 10 / away 0`
- [x] 1.5 Tạo `wheelRuntime.ts` gồm `wheelRuntime`, `resetWheel()` và hàm thuần `stepWheel(rt, dt, hold)` (về góc "nhà" theo chiều ngắn, giảm chấn, giới hạn tốc độ, khi hết hold thì tăng tốc lại `SPIN`). Thêm `wheel.test.ts`: từ góc 0,3π và từ 1,7π đều về 0 trong ≤ 4 s mô phỏng, không vượt quá đà; khi hết hold thì tốc độ tiến tới `SPIN`
- [x] 1.6 Store: thêm `dropOnWheel(id, slot)`. `drop` xóa `slot` khi thả ra ngoài. `reset()` gọi `resetWheel()`. Bỏ `Mode`/`mode`/`setMode` để `afterChange` luôn chạy luồng nhiệm vụ. Kiểm bằng `npx tsc -b` không lỗi và `npm test` qua
- [x] 1.7 `boat.ts`: bến `candles` nhìn vào `[WHEEL.x, WHEEL.z]`, nhãn `🎡 Bến nến`. Sửa `boat.test.ts` dùng `WHEEL` thay cho `TABLE`. Kiểm bằng `npm test`

## 2. Mô hình và hành vi vòng quay

- [x] 2.1 Trong `Structures.tsx`: thay `CandleTable` bằng `FerrisWheel` (giữ bến gỗ; thêm chân chữ A, 2 vành, 10 nan, trục, 10 cabin mặt trước mở; cabin 0 màu đỏ có ngôi sao; bóng đèn trên vành). Cabin đọc vị trí từ `cabinPos(slot, wheelRuntime.angle)`. Kiểm bằng `npm run dev`: từ bến nến thấy đủ 10 cabin, cabin đỉnh không bị cắt khỏi khung hình (nếu bị cắt thì chỉnh `hubY`/`radius` theo design)
- [x] 2.2 Trong `FerrisWheel`: mỗi khung hình tính `hold` (nhiệm vụ nến đang làm, hoặc thuyền đậu bến nến, hoặc `now < touchedUntil`) rồi gọi `stepWheel`. Kiểm bằng `npm run dev`: lúc làm nhiệm vụ ếch thì vòng quay quay chậm, bấm "🎡 Bến nến" thì vòng dừng ở góc "nhà" với cabin ngôi sao ở thấp nhất bên trái
- [x] 2.3 `ZooScene.tsx`: dùng `FerrisWheel`, biển khu `🎡 Vòng quay`. `Vegetation.tsx`: vùng cấm trồng cây theo bao của `WHEEL`. Kiểm bằng mắt: không có cây hay bụi mọc xuyên qua vòng quay
- [x] 2.4 `Draggable.tsx`, nến zone `'wheel'`: đích lerp là `cabinPos(slot, wheelRuntime.angle)`, hệ số theo sát. `onPointerDown` đặt `touchedUntil = now + 8 s`. Kiểm: nến đi khít theo cabin khi đang quay; bấm một nến khi vòng đang quay thì nến tắt và vòng dừng
- [x] 2.5 `Draggable.tsx` kéo thả nến:
  - Lúc kéo, giao tia với mặt phẳng vòng quay rồi dùng `nearestFreeSlot` để xem trước nến "hút" vào cabin. Ưu tiên cabin hơn `SKY_BAND`.
  - Khi thả gần cabin trống thì gọi `dropOnWheel`; nếu không thì thả như cũ.

  Kiểm bằng tay theo các scenario "Gắn nến lại vào cabin trống" và "Thả nến vào cabin đã có nến", rồi bấm "Đặt lại" xem cả 10 nến về đúng cabin
- [x] 2.6 Chạy hết nhiệm vụ nến (thổi tắt 3 nến → chọn `10 − 3 = 7`) và xác nhận: vòng đứng yên suốt nhiệm vụ, quay lại sau khi xong, bảng đếm hiện "Đang cháy: 7 · Đã tắt: 3 · Tất cả: 10"

## 3. Bóng toon mềm, ánh sáng viền và viền

- [x] 3.1 `toon.tsx`: ramp khoảng 8 texel lọc `Linear` (3 mức nối smoothstep), và fresnel ánh sáng viền ấm chèn qua `onBeforeCompile` với `customProgramCacheKey` cố định. Giữ nguyên chữ ký `toon()`. Kiểm bằng `npx tsc -b` và bằng mắt: mép sáng tối mềm, viền khối sáng ấm
- [x] 3.2 `toon.tsx`: thêm vật liệu viền (`ShaderMaterial`, BackSide, đẩy theo pháp tuyến trong không gian clip, độ dày theo px, uniform `resolution` cập nhật khi đổi kích thước) và component `<Outlined color highlight>`. Component duyệt cây con để thêm vỏ cho mesh toon, bỏ qua `meshBasicMaterial`, `userData.noOutline` và mesh rất nhỏ. Khối `Box` dùng bản geometry có pháp tuyến làm mượt cho riêng vỏ. Kiểm bằng mắt: viền dày đều ở gần và ở xa, không hở ở góc hộp
- [x] 3.3 Bọc `<Outlined>` quanh `Frog`, `Stork`, `Candle` (trong `ZooScene`), 6 loài trong `Animals.tsx`, thân thuyền, `Boatman`, `Student`, `Teacher`, với màu viền theo design. Kiểm bằng mắt theo scenario "Cây không có viền": cây, cổng, vòng quay và bướm không có viền
- [x] 3.4 Xác nhận ở chất lượng `low`: ếch, cò và nến vẫn có viền và bóng mềm (scenario "Chất lượng thấp"). Ghi FPS ở bến ếch cho cả hai mức. Nếu `low` dưới 30 fps thì gộp geometry tĩnh của thú làm cảnh như trong design
  - Đã đo (RTX 3060, Chrome D3D11, 1280×720, bến ếch): mức high và low đều 144 fps (chạm trần tần số quét), khoảng 1.030 lệnh vẽ. Mức low giả lập CPU chậm 6 lần: khoảng 46 fps có viền, khoảng 49 fps khi tắt 628 lớp viền. Viền tốn khoảng 6%, trên ngưỡng 30 fps nên chưa cần gộp geometry.

## 4. Bảng màu tương phản

- [x] 4.1 `Terrain.tsx`: cỏ dịu và ngả vàng hơn, dải cát khu ếch rộng thêm khoảng 1 m. `Models.tsx`: ếch xanh ngọc đậm, đốm đậm hơn. Kiểm: ảnh chụp từ bến ếch chuyển sang thang xám vẫn tách rõ từng con ếch (scenario "Ếch nổi bật trên cỏ")
- [x] 4.2 `Models.tsx`: cò có viền xanh than, đầu cánh, mỏ và chân đậm hơn. `Sky.tsx`/`ZooScene.tsx`: trời đậm hơn ở độ cao bay, sương bắt đầu xa hơn. Kiểm: ảnh chụp cò đang ở vùng "bay đi" chuyển thang xám vẫn tách khỏi trời (scenario "Cò nổi bật trên trời")
- [x] 4.3 Chụp 3 ảnh tham chiếu (bến ếch, bến cò, bến nến) ở mức `high` và `low`, lưu vào `docs/zoo-style/` để làm mốc so sánh về sau

## 5. Phản hồi thao tác và hoạt cảnh

- [x] 5.1 `Draggable.tsx`: rê chuột hoặc đang chọn thì truyền `highlight` cho `<Outlined>` (viền vàng dày hơn), giữ vòng tròn dưới chân. Kiểm theo scenario "Rê chuột vào cò"
- [x] 5.2 `Draggable.tsx`: group co giãn theo lò xo (nhấc lên thì kéo dài, chạm đất hoặc nước thì dẹt rồi dao động về 1 trong khoảng 0,35 s). Tách hàm lò xo thành hàm thuần và test hội tụ về 1, không vượt quá đà quá 15%
- [x] 5.3 Tạo `effects.ts` (hàng đợi `emitEffect`) và `<Effects>` (pool `instancedMesh` khoảng 64 hạt: `splash`, `feathers`). `store.drop` phát `splash` khi zone mới là `river`, phát `feathers` khi cò chuyển sang `sky`. `<Effects>` không vẽ khi `quality.particles = false` (thêm cờ này vào `quality.ts`). Test `effects.ts`: phát sự kiện thì hàng đợi nhận đúng loại và vị trí. Kiểm bằng mắt theo scenario "Ếch xuống sông"
- [x] 5.4 `Candle`: mở rộng khói tắt nến thành 5 cụm xoắn. Kiểm: bấm tắt một nến trên cabin thì khói bay lên đúng chỗ, kể cả cabin cao
- [x] 5.5 Bóng tiếp đất (gradient tròn từ canvas, dùng chung) dưới vật đếm ở mặt đất và dưới thú làm cảnh. Vật ở trên trời hoặc trong cabin thì không có. Kiểm bằng mắt ở cả hai mức chất lượng
- [x] 5.6 `CuteEye` chớp mắt mỗi 3–6 s theo pha lấy từ vị trí. Cò nghiêng đầu và đổi chân, nến lắc lư nhẹ. Kiểm theo scenario "Ếch đứng yên trên bờ": để yên 10 s thì bảng đếm không đổi

## 6. Kiểm tra tổng thể

- [x] 6.1 `npx tsc -b` không lỗi, `npm test` qua hết
- [x] 6.2 Chơi trọn Bài 4 bằng chuột và bằng cảm ứng (ếch 10 − 2, cò 10 − 5, nến 10 − 3), có thử "Đặt lại" giữa chừng. Xác nhận mọi scenario trong delta spec `zoo-counting-scene`
- [x] 6.3 `npm run package` chạy được, và bước quét URL trong bản build không báo URL lạ (bản offline không gọi mạng)
  - Đã chạy: tạo được `TroChoiToan1/` (29,4 MB). Bước quét liệt kê 2 chuỗi `https://reactjs.org/docs/error-decoder…` và `https://docs.pmnd.rs/react-three-fiber/…`. Đây là chuỗi trong thông báo lỗi của `react-dom` và `@react-three/fiber` (có sẵn từ trước change này), không phải lời gọi mạng, và không có trong `src/`.

## Workflow follow-up

- Sau khi duyệt xong, archive change bằng `/opsx:archive` để gộp delta spec vào `openspec/specs/zoo-counting-scene/spec.md`.
