# Design

## Context

Hiện trạng dựng hình Bài 4:
- **Hình khối**: mọi vật đều ghép từ khối cơ bản `Ball/Tube/Cone/Box/Capsule` trong `src/shared/3d/toon.tsx`. Chỉ Bài 4 import file này.
- **Vật liệu**: hầu hết lấy qua `toon(color)`. Hàm này dùng `MeshToonMaterial` với ramp 3 texel, lọc `NearestFilter`, và cache theo màu.
- **Ngoại lệ**: vài chi tiết dùng `meshBasicMaterial` (đốm sáng mắt, má hồng, ngọn lửa, khói).
- **Đèn**: 1 `hemisphereLight` và 1 `directionalLight`, có sương. Không có hậu kỳ.
- **Chất lượng**: `useQuality()` có 2 mức `high` và `low`.

Hiện trạng logic nến:
- Nến nằm ở zone `'table'`, `pos` cố định trên `TABLE` (2 hàng × 5).
- `zoneAt()` xét `y > SKY_Y (3,4)` trước tiên, nên vật nào ở cao trên 3,4 m đều bị coi là "trên trời".
- `Draggable` cho vật trôi tới `obj.pos` bằng lerp mỗi khung hình. Tia bấm chỉ xét mặt đất và nước (`intersectSurface`), và mặt bàn (`isOnTable`).

Các thành phần chạy theo khung hình đặt ngoài React, như `boatRuntime`:
- `boatRuntime.focus` là chỗ camera nhìn khi đậu.
- `target === null` nghĩa là đã tới bến.
- R3F chỉ chiếu tia vào mesh có gắn handler. Khung vòng quay không có handler, nên không chặn tia bấm vào nến.

Ràng buộc:
- Chạy offline, `package.mjs` chặn URL lạ.
- Không thêm thư viện.
- Máy lớp học yếu.
- Giữ nguyên vị trí, số lượng và vùng bấm của các vật đếm.

## Goals / Non-Goals

**Goals:**
- Vật cần đếm nổi rõ trên nền nhờ ba thứ: viền, ánh sáng viền và bảng màu tương phản.
- Bóng toon mềm thay cho 3 bậc cứng.
- Phản hồi khi thao tác: sáng lên, co giãn, hạt hiệu ứng. Hoạt cảnh khi đứng yên: chớp mắt, nhún.
- Vòng quay 10 cabin thay bàn nến. Vòng quay quay và dừng theo luồng nhiệm vụ, nến gắn theo cabin.
- Dọn `mode`/`setMode` thừa trong store.

**Non-Goals:**
- Không đổi hình dáng hay tỉ lệ con vật. Không thay bằng mô hình GLTF.
- Không thêm hậu kỳ (SSAO, bloom) và không thêm `@react-three/postprocessing`.
- Không đổi luật nhiệm vụ, giọng đọc hay giao diện HTML. Chỉ đổi chữ trên biển khu và nhãn bến.
- Không đổi phong cách các bài 2 và 3.

## Decisions

### 1. Bóng toon mềm và ánh sáng viền nằm ngay trong `toon()`

**Bóng mềm:**
- Ramp đổi từ 3 texel `Nearest` sang khoảng 8 texel lọc `Linear`.
- Ramp làm từ 3 mức sáng nối bằng smoothstep, nên vẫn ra mảng sáng tối rõ nhưng mép chuyển mềm.

**Ánh sáng viền:**
- Dùng `onBeforeCompile` chèn một hạng fresnel `pow(1 − dot(N, V), 3)` có màu ấm (`#fff1d0`, khoảng 0,35) vào phần ánh sáng đi ra của `MeshToonMaterial`.
- Mọi vật liệu `toon()` cùng một chương trình shader (đặt `customProgramCacheKey` cố định), nên không tăng số lần biên dịch.

**Vì sao làm ở đây:** giữ nguyên chữ ký `toon(color, opts)`, nên khoảng 20 chỗ gọi không phải sửa.

**Phương án đã loại:**
- `MeshStandardMaterial` và IBL: kiểu Pixar, đã loại trong thảo luận.
- Shader toon tự viết hoàn toàn: mất bóng đổ và sương có sẵn của three.

### 2. Viền bằng "vỏ lộn ngược", độ dày cố định trên màn hình

Component `<Outlined>` (thêm vào `toon.tsx`) bọc quanh một nhóm, ví dụ `<Outlined><Frog/></Outlined>`.

**Cách hoạt động:**
- Sau khi mount, nó duyệt cây con. Với mỗi mesh dùng vật liệu toon, nó thêm một mesh con (gọi là "vỏ") dùng chung geometry, `side: BackSide`, và vật liệu viền dùng chung.
- Mesh có `meshBasicMaterial` (đốm sáng, má, lửa, khói) thì bỏ qua. Mesh có `userData.noOutline` cũng bỏ qua.
- Vật liệu viền là `ShaderMaterial`. Shader đẩy đỉnh theo pháp tuyến trong không gian clip, khoảng `2.5 px × clip.w / resolution`, nên độ dày viền không đổi theo khoảng cách và không méo khi khối bị co giãn không đều (`Ball` bầu dục).
- Vỏ là con của mesh gốc, nên đi theo mọi hoạt cảnh qua `ref`: cổ ếch phồng, cánh cò vỗ.

**Màu viền** theo loài, đậm hơn màu thân:
- Ếch: xanh rêu `#1f5a2a`.
- Cò: xanh than `#2f3a55`.
- Nến và thú: nâu `#4a2c1d`.

Màu được truyền qua prop `color` của `<Outlined>`. Mỗi màu có một vật liệu dùng chung.

**Phạm vi viền:**
- Có viền: `Frog`, `Stork`, `Candle`, 6 loài trong `Animals.tsx`, thân thuyền, `Boatman`, `Student`, `Teacher`.
- Không viền: `Vegetation`, `Structures` (kể cả vòng quay), `Sky`, `River`, `Terrain`, bướm.

**Chất lượng thấp:** vẫn giữ viền, theo spec "Viền ở chất lượng thấp".

**Phương án đã loại:**
- Dò cạnh hậu kỳ (depth/normal): cần EffectComposer hoặc tự viết pass, viền ra cả cây cối, và nặng.
- `<Outlines>` của drei: phải gắn từng mesh một, không hợp với cách ghép từ chục khối nhỏ.

### 3. Bảng màu "vật đếm rực, nền dịu"

**Nền:**
- Cỏ (`Terrain.tsx`): giảm độ bão hòa và ngả vàng nhạt, khoảng `#a9dc7a` / `#93cf6a`.
- Dải cát hai bờ khu ếch: rộng thêm khoảng 1 m, để ếch đứng trên nền vàng nhạt thay vì xanh.

**Ếch:** thân đổi sang xanh ngọc đậm, khoảng `#1fae4b`, đốm lưng `#137a35`. Bụng giữ vàng chanh. Thêm viền xanh rêu.

**Cò:**
- Thân giữ trắng, có viền xanh than. Đầu cánh đen đậm hơn. Mỏ và chân cam đậm hơn (`#ff8a1f`).
- Vòm trời (`Sky.tsx`) đậm hơn ở độ cao cò bay (`FLY_Y ≈ 6,5`), khoảng `#5bb8f0`.
- Sương (`fog`) chỉ bắt đầu từ xa hơn, để không làm trắng con cò.

**Cách chốt mã màu:** mã màu cụ thể sẽ chỉnh khi xem trực tiếp. Tiêu chí: chụp màn hình từ bến ếch, bến cò và bến nến, chuyển sang thang xám, rồi kiểm tra từng vật đếm vẫn tách khỏi nền. Kiểm tra bằng mắt, có ghi lại ảnh.

### 4. Phản hồi thao tác nằm trong `Draggable`

**Sáng lên:**
- Khi rê chuột hoặc khi đang chọn, viền của vật đổi sang vật liệu viền "nổi bật": màu vàng `#ffd23f`, dày khoảng 4 px.
- `<Outlined>` nhận prop `highlight`. Cách này rẻ: chỉ đổi tham chiếu vật liệu, không đụng vật liệu toon dùng chung.
- Vòng tròn dưới chân đang có thì giữ nguyên.

**Co giãn:**
- Thêm một group bọc `children`, scale theo lò xo tắt dần.
- Nhấc lên: kéo dài theo trục y (0,85 / 1,15).
- Chạm đất hoặc chạm nước: dẹt ra (1,2 / 0,8) rồi dao động về 1 trong khoảng 0,35 s.

**Hạt hiệu ứng:**
- Tạo module `effects.ts` gồm một hàng đợi sự kiện (`emitEffect(kind, pos)`) và component `<Effects>`. `<Effects>` vẽ một pool `instancedMesh` dùng chung, khoảng 64 hạt.
- Ba loại hạt: `splash` (giọt xanh trắng bắn lên rồi rơi), `feathers` (mảnh trắng rơi lắc lư), `smoke` (khói).
- `store.drop` phát `splash` khi zone mới là `river`, phát `feathers` khi một con cò chuyển sang `sky`.
- Khói tắt nến: mở rộng khói đang có trong `Candle` thành 5 cụm xoắn ốc. Không đi qua pool.
- Chất lượng thấp: `quality.particles = false` thì `<Effects>` không vẽ, nhưng sáng lên và co giãn vẫn giữ.

**Bóng tiếp đất:**
- Một mặt phẳng nhỏ có texture gradient tròn (tạo bằng canvas, dùng chung), đặt dưới mỗi vật đếm khi vật ở mặt đất.
- Vật ở trên trời hoặc trong cabin thì không có bóng tiếp đất. Thú làm cảnh thì có.
- Bóng này rẻ, nên giữ ở cả hai mức chất lượng.

### 5. Hoạt cảnh khi đứng yên

**Chớp mắt:**
- `CuteEye` thêm `useFrame`. Từng mắt lấy pha ngẫu nhiên từ vị trí thế giới lúc mount, nên hai mắt của cùng một con vẫn chớp cùng lúc vì vị trí gần nhau.
- Mỗi 3–6 s, mắt khép theo trục y trong khoảng 0,12 s.

**Nhún và nhảy:** ếch đã có. Thêm cho cò (nghiêng đầu, đổi chân) và cho nến (lắc lư nhẹ).

**Giới hạn:** hoạt cảnh chỉ đổi transform bên trong mô hình. `obj.pos` và zone không bao giờ đổi vì hoạt cảnh.

### 6. Vòng quay: hình học và vị trí

**Cấu hình** trong `layout.ts`, thay cho `TABLE`:
```
WHEEL = {
  x: ZONES.candles (−6),
  z: riverCenterZ(−6) + RIVER_HALF_WIDTH + 3.2,  // bờ nam, sau bến gỗ
  hubY: 5.8, radius: 3.6, hang: 1.75, slots: 10,
}
```

**Kích thước:**
- Mặt vòng quay song song với dòng sông, pháp tuyến hướng −z ra sông, để từ thuyền nhìn thẳng vào.
- Cabin treo dưới chốt trên vành một đoạn `hang` = 1,75 m. Sàn cabin thấp nhất ở y ≈ 0,6, mái cabin cao nhất ở y ≈ 9.
- Khoảng cách giữa hai cabin là 2π·3,6/10 ≈ 2,26 m, nên vùng bấm bán kính 0,45 của hai nến cạnh nhau không chồng lên nhau.

**Hàm thuần:**
- `cabinPos(slot, angle)` trả về `[x, y, z]` của tâm sàn cabin.
- Cabin treo luôn thẳng đứng: chỉ dời vị trí, không xoay.
- Slot 0 là cabin ngôi sao. Góc "nhà" là `angle = 0`, đặt cabin ngôi sao ở vị trí thấp nhất bên trái, gần thuyền nhất.

**Mô hình** (`FerrisWheel` trong `Structures.tsx`, thay `CandleTable`):
- Giữ bến gỗ.
- Hai chân chữ A, hai vành tròn (torus), 10 nan hoa, trục.
- 10 cabin gồm sàn, mái và vách sau thấp. Mặt trước mở để thấy rõ nến.
- Bóng đèn trang trí trên vành dùng vật liệu basic phát sáng.
- Cabin 0 màu đỏ, có ngôi sao vàng trên mái.

**Chỗ khác dùng `TABLE`:**
- `Vegetation.tsx` (vùng cấm trồng cây) đổi sang bao của `WHEEL`.
- `boat.ts` bến `candles` đổi `look` thành `[WHEEL.x, WHEEL.z]`, nhãn thành `🎡 Bến nến`.
- Bến nến có thêm `lookY` (điểm nhìn cao ngang khoảng giữa vòng quay) và `polar` (camera nhìn gần ngang). `ZooControls` dùng hai giá trị này khi đậu, để từ thuyền thấy đủ 10 cabin. Đã kiểm bằng ảnh chụp: cách này giải quyết rủi ro "cabin cao vượt khung hình".
- Ray chỉ vào mặt vòng quay mà không có cabin trống gần đó thì nến rơi xuống sàn bến ngay trước vòng quay, không bay lên trời (theo scenario "Thả nến vào cabin đã có nến").
- Biển khu đổi thành `🎡 Vòng quay`.

### 7. Vòng quay: trạng thái quay và dừng

Tạo `wheelRuntime.ts`, theo cùng kiểu với `boatRuntime`:
```
wheelRuntime = { angle, speed, touchedUntil }
SPIN = 2π / 40 s
```

Mỗi khung hình, component `FerrisWheel` gọi `stepWheel(rt, dt, hold)`. Đây là hàm thuần, có test. Cờ `hold` đúng khi có một trong ba điều:
- Nhiệm vụ hiện tại là nến và chưa xong: `TASKS[student.taskIndex].kind === 'candle'` và `phase !== 'done'`. Đọc bằng `useZoo.getState()`.
- Thuyền đã đậu ở bến nến: `boatRuntime.target === null` và `focus` trùng `look` của bến nến.
- Vừa chạm nến: `now < touchedUntil`. Mỗi lần nhấn xuống một ngọn nến thì đặt `touchedUntil = now + 8 s`.

Khi `hold`:
- Vòng quay chạy về góc "nhà" gần nhất (bội của 2π), **theo chiều ngắn hơn**, tức quay ngược nếu còn quá nửa vòng.
- Dùng giảm chấn tới hạn với hằng thời gian khoảng 0,35 s, giới hạn tốc độ khoảng 1,2 rad/s. Lúc bắt đầu, `speed` được hòa dần sang chuyển động này.
- Khi đủ gần thì chốt `angle = 0`.

Khi hết `hold`: `speed` tăng dần trở lại `SPIN`.

**Vì sao chọn chiều ngắn hơn:**
- Nếu chỉ quay tới, có lúc phải đi gần một vòng (40 s), hoặc phải tua nhanh gây chói mắt.
- Đi chiều ngắn nhất thì quãng đường không quá π, về nhà trong khoảng 3 s.
- Đổi lại, có lúc vòng quay quay lùi một chút. Mình chấp nhận điều này.

**Đặt lại:** `store.reset()` gọi `resetWheel()`, đưa `angle = 0` và `speed = SPIN`, giống `resetBoat()`.

### 8. Nến gắn theo cabin

**Kiểu dữ liệu** (`logic.ts`):
- `Zone` đổi `'table'` thành `'wheel'`.
- `ZooObject` thêm `slot?: number`, chỉ dùng cho nến trên vòng quay.
- `zoneAt(kind, pos, onWheel)` xét `onWheel` **trước** `SKY_Y`. Nhờ vậy nến ở cabin đỉnh không bị tính là trên trời.

**Hàm thuần mới:**
- `freeSlots(objs)`
- `nearestFreeSlot(objs, point, angle, maxDist = 1.2)`: chiếu điểm lên mặt phẳng vòng quay, rồi chọn cabin trống gần nhất trong `maxDist`.
- Khi đang kéo, cabin của chính ngọn nến đó được tính là trống.

**`initialObjects()`:** nến `i` có `zone: 'wheel'`, `slot: i`, `pos = cabinPos(i, 0)` (vị trí lúc ở góc "nhà"). Test và bảng đếm dùng được ngay.

**Thay đổi trong `Draggable`:**
- **Đích lerp:** với nến có `zone === 'wheel'`, đích là `cabinPos(slot, wheelRuntime.angle)`, tính lại mỗi khung hình. Hệ số lerp cao (theo sát, không trôi trễ).
- **Lúc kéo:**
  - Ngoài `intersectSurface`, còn giao tia với mặt phẳng vòng quay.
  - Nếu điểm giao có cabin trống trong 1,2 m: nến hiện "hút" vào cabin đó (xem trước), và viền nổi bật nhấp nháy.
  - Nếu không: nến đi theo cách cũ (mặt đất, nước, trời).
- **Khi thả:** gọi `store.dropOnWheel(id, slot)` hoặc `store.drop(id, pos)` như cũ.
  - Thả ra ngoài thì xóa `slot`.
  - Thả vào cabin đã có nến mà không có cabin trống gần đó thì rơi xuống như thả thường, theo spec.
- **Nhấn xuống** một ngọn nến (bấm hay kéo) thì đặt `wheelRuntime.touchedUntil` ngay trong `onPointerDown`, để vòng quay bắt đầu dừng lại lập tức.

**Bấm khi vòng đang quay:** vùng bấm hình trụ đi cùng group của nến, nên trùng với nến đang quay. Vòng quay chậm (khoảng 0,57 m/s ở vành), nên một cú bấm ngắn không bị trượt.

### 9. Dọn `mode`

Bỏ `Mode`, `mode` và `setMode` trong `store.ts`. `afterChange` và `reset` luôn chạy luồng nhiệm vụ. Không có giao diện nào gọi `setMode`. Thứ còn tham chiếu tới nó cần kiểm tra lại là test của `App`.

## Risks / Trade-offs

- **[Số lần vẽ tăng gần gấp đôi cho vật có viền]** Ước tính khoảng 1.300–1.600 mesh ở mức high.
  - Giảm nhẹ: không làm vỏ cho mesh quá nhỏ (đốm, sọc nến), vì scale thế giới nhỏ hơn khoảng 0,03.
  - Đo FPS ở mức `low` trên máy yếu. Nếu dưới 30 fps, gộp geometry tĩnh của từng thú làm cảnh (`mergeGeometries`) trước khi làm vỏ.
- **[Viền vỡ ở khối mặt phẳng]** Khối `Box` có pháp tuyến tách ở góc, nên vỏ bị hở cạnh.
  - Giảm nhẹ: khối hộp dùng pháp tuyến làm mượt cho riêng vỏ (bản sao geometry đã `mergeVertices` + `computeVertexNormals`, cache).
- **[Quay lùi khi về nhà]** Có thể trông lạ. Chấp nhận, vì quãng ngắn và chậm. Nếu giáo viên phản hồi xấu thì đổi sang "quay tới, tối đa 1,5 lần tốc độ".
- **[Cabin cao vượt khung hình]** Đỉnh khoảng 8,6 m, camera ở bến nến có thể cắt mất cabin đỉnh.
  - Giảm nhẹ: kiểm tra bằng ảnh chụp từ bến nến. Nếu bị cắt, hạ `hubY` hoặc `radius`, hoặc thêm độ cao nhìn riêng cho bến nến.
- **[Dải trời trên màn hình (SKY_BAND 18%)]** Nến ở cabin cao có thể nằm trong dải trời, nên kéo nhẹ đã thành "lên trời".
  - Giảm nhẹ: khi đang kéo mà tia còn giao mặt phẳng vòng quay gần một cabin trống, ưu tiên cabin hơn dải trời.
- **[Bảng màu phải chỉnh bằng mắt]** Không có test tự động cho độ tương phản. Chấp nhận, kiểm bằng ảnh thang xám theo Quyết định 3.
- **[Test hiện có]** `logic.test.ts` (zone `'table'`) và `boat.test.ts` (`TABLE`) phải sửa theo `'wheel'` và `WHEEL`. Đây là thay đổi có chủ đích.
