# Tasks

## 1. Logic và store của chuyến tham quan

- [x] 1.1 Tạo `src/tour/logic.ts`, gồm:
  - `STATIONS`: 4 cổng theo thứ tự Bài 3 → Bài 1 → Bài 2 → Bài 4, rồi đến quảng trường. Mỗi trạm có `id`, `title`, `lesson`, `screen`, `voiceKey`, `t`.
  - Các hàm thuần `advance`, `arrive`, `enter`, `pass`, `leave`, `jumpTo`, `reset`.

  Thêm `src/tour/logic.test.ts` để kiểm:
  - thứ tự và tên cổng đúng như spec;
  - `pass` đánh dấu đã qua, còn `leave` thì không;
  - `jumpTo(3)` không đánh dấu các cổng 1–3;
  - `reset` xóa hết.

  Kiểm bằng `npm test`.
- [x] 1.2 Tạo `src/tour/store.ts` (zustand) bọc logic ở 1.1, có thêm `progress` (số đèn sáng). Mở rộng `useApp`:
  - `Screen` thêm `'tour' | 'flower'`;
  - thêm trường `gate: GateId | null`.

  Sửa `go()` để xóa `gate` khi rời trò chơi. Kiểm bằng `npx tsc -b` và test store mới: vào cổng thì `gate` đúng, "Qua cổng" thì `screen === 'tour'` và cổng có trong `passed`.
- [x] 1.3 Tạo `src/tour/gateBridge.ts` gồm `reportProgress(n)`, `reportDone()`, `passGate()`, `leaveGate()` và component `<PassGateButton/>` (chỉ hiện khi `gate !== null`). Thêm test bằng Testing Library: nút ẩn khi `gate === null`, hiện khi có `gate`, bấm thì về tour.

## 2. Trò chơi Bài 1 "Vườn Hoa Bướm Xinh"

- [x] 2.1 Tạo `src/games/flower/questions.ts` (6 − 1 … 6 − 5, câu đầu có `sample: true`) và `logic.ts` gồm `initialState`, `toggleFlower`, `canAnswer`, `answer`, `next`. Thêm `logic.test.ts` theo các scenario trong spec `flower-subtraction-game`:
  - bấm quá k bông thì bị chặn và có cờ nhắc;
  - bấm bông đỏ thì bỏ chọn;
  - chưa đủ k bông thì không chốt được;
  - đúng hay sai đều cập nhật `firstTry`;
  - câu cuối xong thì `finished`.

  Kiểm bằng `npm test`.
- [x] 2.2 Làm `FlowerGame.tsx`:
  - 6 bông hoa SVG vàng/đỏ, khớp màu với SGK. Bướm bay tới đậu bằng CSS.
  - Phép tính "6 − k = ?" với ô viền giống sách, và nhãn "Mẫu" ở câu 6 − 1.
  - 7 viên đá số 0–6, bị khóa cho tới khi bớt đủ hoa. Bấm sai thì đá rung.
  - Câu đã xong hiện lại thành dòng như sách.

  Kiểm bằng `npm run dev` ở 1280×720: đủ 6 hoa, phép tính và 7 viên đá, không phải cuộn trang.
- [x] 2.3 Màn tổng kết Bài 1: 5 dòng hoa kèm phép tính đã điền, số câu đúng ngay lần đầu, nút "Chơi lại" và `<PassGateButton/>`. Gọi `reportDone()` khi xong. Thêm test render: sau khi trả lời đúng cả 5 câu thì thấy đủ "6 − 1 = 5" … "6 − 5 = 1".
- [x] 2.4 Đăng ký màn `'flower'` trong `App.tsx` (nạp lười) và thêm câu đọc vào `voiceLines.ts`: `b1.intro`, `b1.q.6-k`, `b1.a.6-k`, `b1.enough`, `b1.needmore`. Nối các câu này vào `FlowerGame` (khen/động viên dùng `randomPraise`/`randomRetry`). Kiểm bằng `node scripts/export-voice-lines.mjs`: thấy các khóa mới trong `scripts/voice-lines.json`.

## 3. Nối các trò chơi đang có với cổng

- [x] 3.1 Bài 3 (`FingerGame.tsx`): gọi `reportProgress(index + 1)` khi trả lời đúng và `reportDone()` khi `finished`. Đặt `<PassGateButton/>` vào overlay "Hoàn thành!". Kiểm bằng `npm test` (test Bài 3 cũ vẫn qua) và bằng tay: khi mở từ Cổng 1 thì nút "Qua cổng" có mặt, còn mở thẳng thì không có.
- [x] 3.2 Bài 2 (`BunnyGame.tsx`, `store.ts`): gọi `reportDone()` ở chỗ phát `sfx('win')`. Đặt `<PassGateButton/>` vào overlay kết thúc ở cả chế độ 1 người và 2 đội. Kiểm bằng `npm test` (`BunnyBoard.test.tsx`, `store.test.ts` vẫn qua).
- [x] 3.3 Bài 4 (`ZooGame.tsx`, `store.ts`): gọi `reportDone()` khi `phase === 'done'`. Đặt `<PassGateButton/>` vào màn "done". Kiểm bằng `npm test` và bằng tay: làm xong nhiệm vụ nến thì thấy "Qua cổng".
- [x] 3.4 Tạo `GateBanner.tsx`: số và tên cổng, nút "Qua cổng" luôn bấm được, riêng Cổng 1 có thanh chắn và 8 đèn đọc `progress`. `App.tsx` đặt banner trong luồng bố cục, phía trên trò chơi, khi `gate !== null`. Kiểm bằng test render (Cổng 1 với `progress = 3` thì có 3 đèn sáng), rồi xem cả 4 trò ở 1280×720: không bị che, Bài 3 vẫn thấy cả camera lẫn bàn phím số.
- [x] 3.5 `TopBar.tsx`: đổi "🏠 Về trang chủ" thành "🛣️ Về đường đi", gọi `leaveGate()` (hoặc `go('tour')` khi mở từ Bản đồ). Cập nhật `App.test.tsx` cho đúng nhãn mới. Kiểm bằng `npm test`, và kiểm bằng tay là camera tắt khi rời Bài 3.

## 4. Cảnh đường đi 3D

> Nên làm sau nhóm 3 của change `zoo-stylized-toon-ferris-wheel`, vì nhóm đó sửa `toon.tsx`. Nhóm này chỉ dùng các export đang có.

- [x] 4.1 Tạo `TourScene.tsx`:
  - đường đi bằng `CatmullRomCurve3`, đồng cỏ, trời, vài cây dùng toon có sẵn;
  - camera nội suy `t` có giảm chấn tới trạm đích và nhìn về `t + δ`;
  - không có OrbitControls.

  Kiểm bằng `npm run dev`: kéo chuột không làm camera di chuyển, còn bấm "Đi tiếp" thì camera bay mượt tới trước cổng.
- [x] 4.2 Dựng 4 cổng, mỗi cổng có `Sign3D` ghi tên cổng và "Bài N", hai cánh mở ra khi trạm đã qua, và trang trí riêng: máy soát vé, luống hoa, hàng rào cà rốt, vòng quay nhỏ. Kiểm bằng mắt theo scenario "Biển tên cổng 2".
- [x] 4.3 Dựng xe buýt ở đầu đường và Vẹt Xanh từ khối toon (`Ball`, `Capsule`, `CuteEye`). Vẹt bay theo camera, đứng ở mép khung hình. Kiểm bằng mắt: Vẹt không che biển cổng.
- [x] 4.4 Làm Quảng Trường Huy Hiệu: huy hiệu "Nhà thám hiểm Phép Trừ nhí", pháo hoa `Points` chỉ có ở mức Cao (thêm hoặc dùng chung cờ `particles` trong `quality.ts`), và hiệu ứng CSS ở mức Thấp. Kiểm bằng cách đổi chất lượng ngay tại quảng trường: mức Thấp vẫn có huy hiệu và không có bóng đổ.

## 5. Lớp điều khiển, lời dẫn và màn chính

- [x] 5.1 Tạo `TourScreen.tsx`:
  - Canvas tour và lớp DOM: bong bóng thoại của Vẹt, các nút "Đi tiếp / Vào cổng / Bản đồ" hiện theo `phase`.
  - Khi `arrive` thì phát `audio.say('tour.gate.N')`. Khi vào cổng thì gỡ Canvas. Khi quay lại thì đặt camera ngay tại trạm hiện tại.

  Kiểm bằng test render: ở trạng thái `atGate` thì thấy "Vào cổng" và lời dẫn của cổng đó.
- [x] 5.2 Tạo `TourMap.tsx` (modal): 4 cổng ghi "Bài N: tên cổng" và Quảng Trường, có dấu ✓ cho cổng đã qua. Bấm vào một điểm thì gọi `jumpTo`. Kiểm bằng test theo scenario "Nhảy tới Cổng 4".
- [x] 5.3 Màn chào trong `HomeScreen.tsx` giữ nút "Bắt đầu", bấm thì `go('tour')` và phát `tour.welcome`. Bỏ 3 thẻ cũ. Nút "Đi lại từ đầu" ở quảng trường gọi `reset`. Cập nhật `App.test.tsx`. Kiểm bằng `npm test`.
- [x] 5.4 Thêm các câu đọc `tour.welcome`, `tour.gate.1` … `tour.gate.4`, `tour.square` vào `voiceLines.ts`, dùng đúng lời dẫn trong kịch bản. Kiểm bằng `node scripts/export-voice-lines.mjs`.

## 6. Giọng đọc, tài liệu và kiểm tra tổng thể

- [x] 6.1 Tạo MP3 cho mọi khóa mới (`b1.*`, `tour.*`) bằng cùng giọng bé gái, đặt vào `public/audio/voice/`. Kiểm bằng `node scripts/export-voice-lines.mjs --check` không báo thiếu file.
- [x] 6.2 Cập nhật `release/HUONG-DAN.txt`, `README.md` (bảng bài: thêm Bài 1 và luồng tham quan) và `AboutScreen.tsx`. Kiểm bằng cách đọc lại: có đủ tên 4 cổng, cách dùng "Đi tiếp / Vào cổng / Qua cổng / Bản đồ".
- [ ] 6.3 Kiểm tra cả luồng trên bản đóng gói: chạy `npm run package`, mở `TroChoiToan1/start.bat` lúc ngắt mạng, rồi đi lần lượt Cổng 1 → quảng trường. Xác nhận các điểm sau:
  - mỗi cổng mở đúng bài;
  - đèn soát vé sáng dần;
  - "Qua cổng" mở cánh cổng;
  - Bản đồ nhảy được tới cổng bất kỳ;
  - "Về đường đi" không đánh dấu cổng đã qua;
  - tải lại trang thì tiến độ trở về đầu;
  - không có yêu cầu mạng ra ngoài `localhost`.
- [x] 6.4 Chạy `npm test` và `npx tsc -b` lần cuối, đảm bảo không có lỗi.

## 7. Nhóm cô trò chibi và cổng chào (yêu cầu thêm của giáo viên)

- [x] 7.1 Tạo `Walkers.tsx`: cô giáo áo dài và 2 bạn học sinh chibi biết bước đi, dừng lâu thì quay lại vẫy tay. Camera đi sau lưng nhóm. Kiểm bằng ảnh chụp: nhóm bước đi khi bấm "Đi tiếp", dừng trước cổng thì quay lại vẫy
- [x] 7.2 Làm cổng chào "KHU VUI CHƠI SỞ THÚ" có lời chào lớp `CLASS_NAME` (1/7), đặt xe buýt "Lớp 1/7", và đổi lời chào của Vẹt Xanh (có tạo lại giọng đọc). Kiểm bằng test `TourScreen.test.tsx` (lời chào có "lớp 1/7"), `export-voice-lines.mjs --check`, và ảnh chụp ở đầu đường
- [x] 7.3 Tạo `Decor.tsx`: hàng rào kẹo, đèn lồng, bụi hoa, bóng bay ở các cổng, 10 bạn thú dọc đường (dùng lại `Animal` của Bài 4 với tham số `ground`). Dời bong bóng thoại và nút xuống góc trái dưới. Kiểm bằng ảnh chụp ở 1280×720 và `npm test`
- [x] 7.4 Cổng chưa qua tự mở tạm khi nhóm cô trò đi ngang (nhảy bằng Bản đồ), đi qua rồi đóng lại; tháp kẹo cổng chào thấp hơn biển để không che chữ "lớp 1/7"; các bạn nhỏ ngoái đầu nhìn hai bên khi đi. Kiểm bằng ảnh chụp: Bản đồ từ Cổng 1 tới Cổng 3 không đi xuyên cánh cổng, biển cổng chào đọc trọn câu
- [x] 7.5 Làm lại cảnh theo ảnh mẫu giáo viên gửi: nắng chiều vàng ấm (bầu trời chuyển màu, sương ấm), đường lát đá, thảm cỏ, cây nhiều tán; cổng chào có tháp gạch sọc trắng, vòm sắt uốn ôm cầu vồng, cánh cổng sắt, tường gạch có rào sắt, biển gỗ "Chào mừng thầy cô và các em học sinh lớp 1/7!"; xe buýt kiểu cổ và cột biển gỗ "Lớp 1/7"; nhóm cô trò quay mặt ra lớp ngay khi mở màn, bỏ viền đen ở nhân vật; cột cổng 1–4 bằng gạch; hàng rào dọc đường bằng sắt. Chất liệu vẽ bằng canvas trong `textures.ts` (chạy offline). Kiểm bằng ảnh chụp 1280×720 so với ảnh mẫu, `npm test`
- [x] 7.6 Làm lại 4 cổng theo ảnh mẫu Trạm Soát Vé (`Gates.tsx`): vòm đá xây có viên đá khóa, hai cột tròn có đai màu cổng và quả cầu, vòng hoa lá theo vòm, biển gỗ trên đỉnh, hai cánh cổng gỗ chấn song (mở khi qua cổng), hai cánh tường có vòm nhỏ và cửa lưới gỗ, tấm bảng gỗ theo chủ đề ("Yêu cầu", "Lưu ý", "Nhiệm vụ", "Thử thách"). Trang trí riêng: Cổng 1 chậu hoa và 8 đèn trên vòm (sáng khi qua), Cổng 2 luống hoa vàng và bướm, Cổng 3 luống cà rốt và tượng thỏ, Cổng 4 hồ ếch, vòng quay nhỏ và hươu. Kiểm bằng ảnh chụp cả 4 cổng ở 1280×720 và `npm test`
- [x] 7.7 Cổng 1 kiểu "trạm soát vé công nghệ" theo ảnh mẫu (`TicketTech.tsx`): màn hologram quét dấu vân tay lấp lòng vòm ("ĐANG XÁC THỰC – DẤU VÂN TAY…", thanh quét chạy, chuyển xanh lá "ĐÃ XÁC THỰC!" rồi mờ dần khi cổng mở), bục máy quét có tấm đặt tay phát sáng, camera an ninh quay trên hai cánh tường, màn hình "Hướng dẫn – Dấu vân tay" (4 bước) và "Hệ thống – Hoạt động" (lời yêu cầu xếp hàng), biển ghi thêm "Yêu cầu: Sử dụng Dấu Vân Tay". Kiểm bằng ảnh chụp Cổng 1 lúc đứng trước cổng và lúc qua cổng, `npm test`
- [x] 7.8 Sửa lỗi cổng tự mở rồi đóng khi nhóm đi tới đứng trước cổng: chỉ mở tạm khi đi xuyên qua cổng tới trạm khác. "Qua cổng" đi luôn tới trước cổng kế tiếp (Cổng 4 → Quảng Trường), không cần "Đi tiếp". Kiểm bằng test `logic.test.ts`/`store.test.ts` và ảnh chụp lúc đi tới Cổng 1 (cánh cổng đóng) và sau khi qua Cổng 1 (tự tới Cổng 2)
- [x] 7.9 Cổng 2–4 có đồ công nghệ như Cổng 1, theo đúng trò chơi (`GateTech.tsx`, thay `TicketTech.tsx`): màn hologram trong lòng vòm (Cổng 2: 6 bông hoa, 2 bông đỏ có bướm, "6 − ? = ?"; Cổng 3: ô bàn chân "7 − 3", "9 − 5", "BẰNG 4?"; Cổng 4: 🐸 🕊️ 🕯️ với 10 − 2, 10 − 5, 10 − 3), bục điều khiển (đá số 0–6; nút Đúng/Sai; thẻ phép tính), màn hình "Hướng dẫn" 4 bước và "Nhiệm vụ / Mục tiêu" trên cánh tường, đồ vật 3D (hàng 6 bông hoa có bướm; luống cà rốt và tượng thỏ; ếch, cò, nến của Bài 4). Kiểm bằng ảnh chụp cả 4 cổng
- [x] 7.10 Bố cục không chồng lấn (`layout.ts`): gom vị trí cổng chào, xe buýt, biển lớp, cổng, đồ trang trí, bóng bay, thú ven đường, đèn, bụi hoa vào một chỗ, mỗi vật có vùng chiếm chỗ; cây chỉ mọc ở chỗ không chồng lên vật và không chắn tầm nhìn từ camera ở các điểm dừng. Dời cột biển "Lớp 1/7" ra cạnh đuôi xe buýt (không che xe), làm lại cột biển (hai cột có chóp, thanh ngang treo biển bằng xích, chân đá, hộp hoa). Kiểm bằng `layout.test.ts` (không vật nào đè nhau; thú, bụi hoa ngoài hàng rào; xe buýt, biển không lấn đường; cây không chồng vật, không che tầm nhìn) và ảnh chụp đầu đường
- [x] 7.11 Sửa hướng dẫn Cổng 1 cho đúng Bài 3 (giơ ngón tay trả lời 9 − ?, không phải quét vân tay): hologram "GIƠ NGÓN TAY – 9 − ? = ?", bục "GIƠ TAY TRƯỚC CAMERA", 4 bước (xem phép tính → giơ số ngón bằng kết quả → giữ yên tay → đúng thì đèn sáng), yêu cầu "hơn 5 thì dùng 2 tay, sáng đủ 8 đèn là cổng mở". Kiểm bằng ảnh chụp Cổng 1
- [x] 7.12 Làm lại Quảng Trường Huy Hiệu (`Square.tsx`): bỏ bảng thông báo giữa màn hình; thêm cổng chúc mừng "CHÚC MỪNG LỚP 1/7! – Hẹn gặp lại các bạn nhỏ!" có dây cờ và bóng bay; huy chương vàng mới (ruy băng sọc, viền nổi, ngôi sao nổi hai mặt, chữ khắc "NHÀ THÁM HIỂM PHÉP TRỪ NHÍ – LỚP 1/7", vầng sáng tia, đốm lấp lánh) trên bục đá viền vàng; băng rôn 4 cổng trên tường; lời Vẹt Xanh chúc mừng và hẹn gặp lại (tạo lại giọng đọc). Kiểm bằng `TourScreen.test.tsx`, `layout.test.ts` (vật ở quảng trường không đè nhau) và ảnh chụp ở mức Cao/Thấp
- [x] 7.13 Chỉ còn một bạn học sinh đi tham quan, Vẹt Xanh đậu trên vai (`Parrot.tsx`, bỏ vẹt bay cố định giữa khung hình). Camera cao và lùi xa hơn để nhìn qua đầu bạn nhỏ, không che nội dung trên cổng. Cổng 1 dời xa cổng chào để camera không đứng sau vòm cổng chào. Đèn, bụi hoa không đặt trên đường nhìn tới vật ở các điểm dừng; bỏ chú khỉ che cánh tường Cổng 1. Kiểm bằng `layout.test.ts` (không vật nào chắn tầm nhìn ở điểm dừng; camera không đứng sau vòm khác; camera đủ cao) và ảnh chụp 5 điểm dừng
- [x] 7.14 Pháo hoa chào mừng đẹp hơn (`Square.tsx`): tên lửa bay lên có vệt sáng, nổ nhiều kiểu (cầu, vòng nghiêng, hai lớp, liễu rủ), mỗi phát 2–3 màu rực trong bảng 9 màu, hạt giữ màu đậm và mờ dần bằng độ trong suốt (không ngả trắng trên nền trời), ánh trắng thoáng qua lúc nổ, chớp sáng có màu, lấp lánh khi sắp tàn; nổ hai bên biển chúc mừng, vừa khung hình, tránh bong bóng lời thoại. Chỉ có ở mức đồ họa Cao. Kiểm bằng ảnh chụp liên tiếp ở quảng trường
- [x] 7.15 Bỏ cột đèn trong khung hình cổng chúc mừng (`LAMP_END`). Sửa giật khi bấm "Qua cổng": biên dịch đồ họa trước, chờ khung hình chạy đều mới cho bạn nhỏ đi (tối đa 1,5 giây), tích phân chuyển động theo bước nhỏ, giới hạn một khung hình khựng ở 1/15 giây và tăng tốc độ bước chân từ từ. Kiểm bằng đo vị trí từng khung hình sau khi bấm "Qua cổng" (xuất phát từ 0, không có bước nhảy lớn) và ảnh chụp quảng trường
- [x] 7.16 Bướm bay tự nhiên hơn (`src/shared/3d/Butterfly.tsx`, dùng ở Cổng 2 và cảnh Bài 4): có thân, đầu, râu, cánh trước lớn và cánh sau nhỏ có viền sẫm và chấm; vỗ cánh ~8 lần/giây quanh trục thân (đập xuống nhanh, nâng lên chậm) xen lúc lướt giữ cánh, thân nhấp nhô theo nhịp; tự chọn điểm đến quanh chỗ neo, lượn mềm, đầu quay theo hướng bay, nghiêng khi rẽ; bướm đậu trên hoa đỏ thì khép mở cánh chậm, thỉnh thoảng vỗ nhanh. Kiểm bằng chuỗi ảnh chụp ở Cổng 2 và lượt chạy bản đóng gói (vào Bài 4 không lỗi)
- [x] 7.17 Bài 4 đồng bộ với màn đường đi: nắng chiều ấm (trời có dải cam sát chân trời nhưng vẫn xanh ở độ cao cò bay, sương ấm, đèn vàng chiếu xiên), cỏ/bờ cát/lá cây cùng tông; trên thuyền là bạn học sinh có Vẹt Xanh (`TourKid`, tư thế riêng: thuyền chạy thì nhìn phía trước, thuyền đậu thì quay lại vẫy tay) thay cô giáo và 4 bạn. Đổi thứ tự dọc sông: cổng → ếch → cò → chuồng thú → vòng quay nến ở cuối (bến cũng theo thứ tự này). Bỏ đá cuội xám và nấm dọc bờ (học sinh dễ lẫn với ếch). Kiểm bằng `npm test` (test Bài 4 vẫn qua) và ảnh chụp các bến
