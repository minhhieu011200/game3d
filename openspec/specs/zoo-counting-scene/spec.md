# zoo-counting-scene Specification

## Purpose

Trò chơi bài 4 (SGK Toán 1 tr.73, "Tìm phép tính thích hợp với mỗi hình"): một vườn thú 3D hoạt hình phong cách hóa (bóng mềm, có viền, màu tương phản). Giáo viên lái thuyền tới từng bến, bấm nút để con vật cử động hoặc trứng nở, cả lớp đếm rồi giáo viên bấm "Đáp án" để hiện phép trừ. Ba tình huống: 10 − 5 ếch nhảy xuống hồ, 10 − 2 cò bay đi, 10 − 3 trứng nở ra gà con.

## Requirements

### Requirement: Cảnh vườn thú
Cảnh SHALL là một vườn thú 3D hoạt hình phong cách hóa. Cảnh gồm cổng vào, con sông có bờ, vịt bơi trên sông, cây cỏ, bầu trời và các khu: khu ếch bên sông, khu cò, khu trứng, và các chuồng thú làm cảnh (voi, hươu cao cổ, hổ, khỉ, gấu trúc, sư tử). Lúc bắt đầu có 10 con ếch trên bờ, 10 con cò trên mặt đất và 10 quả trứng trong ổ. Người dùng đi lại trên một chiếc thuyền chạy dọc sông.

#### Scenario: Vào vườn thú
- **WHEN** người dùng mở bài 4
- **THEN** thuyền đậu gần cổng vào, và cảnh có đủ 10 con ếch trên bờ, 10 con cò trên mặt đất và 10 quả trứng trong ổ

### Requirement: Khu trứng
Khu trứng SHALL nằm hẳn trên bờ, không chỗ nào tràn xuống sông. Khu có một ổ rơm đan hình bầu dục, 10 quả trứng xếp 2 hàng 5 quả, gà mái ngồi ấp phía sau ổ quay mặt ra sông, và hàng rào kẹo bao quanh như chuồng thú (mặt trước phía sông để thấp cho trẻ nhìn rõ trứng từ thuyền). Trong rào có hoa hướng dương, sỏi màu, và bọ rùa đậu trên rào trước. Biển khu ghi "🥚 Khu trứng". Ổ được vẽ to để cả lớp đếm được từng quả trên màn chiếu.

#### Scenario: Tới bến trứng
- **WHEN** thuyền cập bến trứng
- **THEN** người dùng thấy gà mái, ổ rơm có đủ 10 quả trứng và hàng rào quanh ổ, và mọi phần của khu trứng đều ở trên bờ

### Requirement: Vùng đếm
Mỗi con vật SHALL thuộc đúng một vùng tại mọi thời điểm:
- Ếch: "trên bờ" hoặc "dưới sông".
- Cò: "trên mặt đất" hoặc "bay đi" (trên trời).

Con vật đã xóa thì không thuộc vùng nào và không được đếm.

#### Scenario: Ếch thả xuống sông
- **WHEN** một con ếch được thả vào mặt nước sông
- **THEN** con ếch ở trong vùng "dưới sông", và số "trên bờ" giảm 1, số "dưới sông" tăng 1

### Requirement: Nút hành động ở mỗi bến
Khi thuyền đậu ở bến ếch, bến cò hoặc bến trứng, màn chơi SHALL hiện một nút hành động to ở giữa phía dưới:
- Bến ếch, nút "🐸 Nhảy": 5 con ếch đứng gần thuyền nhất cùng lúc nhảy xuống nước sát bờ, có nước tóe.
- Bến cò, nút "🕊️ Bay": 2 con cò đứng gần thuyền nhất cùng lúc bay lên trời, ra phía trên mặt sông gần thuyền cho dễ thấy, có lông bay.
- Bến trứng, nút "🐣 Nở": 3 quả trứng ở giữa hàng trước nứt vỏ, và gà con lớn dần lên từ trong vỏ.

Mỗi nút chỉ có tác dụng một lần trong một lượt chơi; bấm rồi thì nút được thay bằng khung "Đáp án" của bến đó.

#### Scenario: Bấm Nhảy
- **WHEN** thuyền đậu ở bến ếch và giáo viên bấm "🐸 Nhảy"
- **THEN** 5 con ếch cùng lúc nhảy xuống hồ, trên bờ còn 5 con, và nút "Nhảy" được thay bằng khung "Đáp án"

#### Scenario: Bấm Bay
- **WHEN** thuyền đậu ở bến cò và giáo viên bấm "🕊️ Bay"
- **THEN** 2 con cò cùng lúc bay lên trời và trên mặt đất còn 8 con

#### Scenario: Bấm Nở
- **WHEN** thuyền đậu ở bến trứng và giáo viên bấm "🐣 Nở"
- **THEN** 3 quả trứng nở ra 3 gà con, trong ổ còn 7 quả trứng chưa nở

### Requirement: Đáp án của bến
Sau khi bấm nút hành động, khung bên phải SHALL có nút "Đáp án". Bấm "Đáp án" thì khung hiện phép trừ của bến đó: bến ếch "10 − 5 = 5", bến cò "10 − 2 = 8", bến trứng "10 − 3 = 7". Bấm "Đáp án" chỉ hiện phép tính của bến đó và MUST NOT tự qua cổng; giáo viên tự bấm "Qua cổng" khi xong các bến. Phép tính đã bấm "Đáp án" được ghi là xong trên popup bảng phép tính của Cổng 4 (xem zoo-tour).

#### Scenario: Hiện đáp án bến trứng
- **WHEN** trứng đã nở ở bến trứng và giáo viên bấm "Đáp án"
- **THEN** khung bên phải hiện "10 − 3 = 7", và trò chơi chưa qua cổng

### Requirement: Kéo thả con vật
Người dùng SHALL kéo được ếch và cò bằng chuột hoặc cảm ứng. Nơi thả quyết định con vật đi đâu:
- Thả lên vùng trời: con vật bay lên và nằm ở vùng "trên trời".
- Thả xuống mặt sông: con vật xuống nước.
- Thả lên mặt đất: con vật đứng tại chỗ.

Trong lúc kéo, camera không được xoay theo.

#### Scenario: Kéo cò lên trời
- **WHEN** người dùng kéo một con cò lên vùng trời rồi thả
- **THEN** con cò vỗ cánh bay lên trên cao và được đếm là "bay đi"

#### Scenario: Kéo ếch từ sông lên bờ
- **WHEN** người dùng kéo một con ếch đang ở dưới sông lên bờ
- **THEN** con ếch đứng trên bờ và được đếm lại vào "trên bờ"

### Requirement: Xóa con vật
Người dùng SHALL xóa được con vật đang chọn bằng nút "🗑️ Xóa" hoặc phím Delete. Mỗi lần mở Bài 4, cảnh bắt đầu lại từ trạng thái ban đầu.

#### Scenario: Xóa một con ếch
- **WHEN** người dùng chọn một con ếch trên bờ rồi bấm "🗑️ Xóa"
- **THEN** con ếch biến mất và tổng số ếch giảm 1

### Requirement: Đi lại bằng thuyền
Người dùng SHALL đi lại trong cảnh bằng thuyền trên sông:
- Có danh sách bến bên trái: Cổng, Bến ếch, Bến cò, Bến trứng. Bấm một bến thì thuyền tự chạy tới đó.
- Lái tay được bằng phím W A S D, phím mũi tên hoặc nút ▲◀▼▶ trên màn hình.
- Kéo chuột để xoay quanh thuyền, con lăn hoặc hai ngón để lại gần hay ra xa.
- Khi thuyền đậu ở bến có khu cần xem, camera từ từ nhìn sang khu đó mà không phóng to, để thấy đủ cả 10 con vật hay 10 quả trứng. Ở bến ếch và bến trứng camera nhìn chếch từ trên cao xuống để thuyền và các bạn nhỏ trên thuyền không che con vật; ở bến cò camera nhìn gần ngang để thấy cò bay trên trời.
- Camera không được chui xuống dưới mặt nước.

#### Scenario: Đi đến bến ếch
- **WHEN** người dùng bấm "Bến ếch"
- **THEN** thuyền tự chạy tới bến ếch, camera nhìn chếch xuống khu ếch, thấy đủ 10 con ếch, và nút "🐸 Nhảy" hiện ra

### Requirement: Phong cách hình ảnh dễ đếm
Cảnh SHALL vẽ theo phong cách hoạt hình 3D phong cách hóa:
- Bóng đổ chuyển mềm giữa các mảng sáng tối và có ánh sáng viền.
- Có viền tối quanh các con vật cần đếm (ếch, cò), các con thú làm cảnh, thuyền và người trên thuyền.
- Cây cối, công trình, bướm, trời, sông và mặt đất không có viền.
- Mỗi vật cần đếm (ếch, cò, trứng, gà con) phải có màu tương phản rõ với nền ngay phía sau nó; ổ rơm có màu vàng rơm đậm để trứng trắng nổi rõ mà không chói.

#### Scenario: Ếch nổi bật trên cỏ
- **WHEN** người dùng nhìn khu ếch từ thuyền đậu ở bến ếch
- **THEN** cả 10 con ếch có viền và màu thân khác hẳn màu cỏ quanh chúng, đủ để đếm từng con

#### Scenario: Cò nổi bật trên trời
- **WHEN** một con cò đang ở vùng "bay đi" trên trời
- **THEN** con cò có viền và vẫn tách rõ khỏi màu trời phía sau

#### Scenario: Cây không có viền
- **WHEN** người dùng nhìn một cái cây hoặc cổng vườn thú
- **THEN** vật đó không có viền

### Requirement: Viền ở chất lượng thấp
Khi đặt chất lượng đồ họa thấp, cảnh SHALL vẫn giữ viền và bóng toon mềm cho mọi vật có viền. Được phép tắt bóng đổ và hạt hiệu ứng.

#### Scenario: Chất lượng thấp
- **WHEN** người dùng chọn chất lượng đồ họa thấp và mở Bài 4
- **THEN** ếch và cò vẫn có viền

### Requirement: Phản hồi hình ảnh khi thao tác
Mỗi con vật kéo được SHALL sáng lên nhẹ khi được rê chuột hoặc chạm vào. Con vật SHALL co giãn khi được nhấc lên và khi được thả xuống. Ngoài ra còn có hạt hiệu ứng theo hành động: nước tóe khi ếch xuống sông, lông bay khi cò cất cánh. Ở chất lượng thấp được phép bỏ hạt hiệu ứng, nhưng vẫn giữ hiệu ứng sáng lên và co giãn.

#### Scenario: Ếch xuống sông
- **WHEN** người dùng thả một con ếch xuống mặt sông
- **THEN** con ếch co giãn lúc chạm nước và có nước tóe lên tại chỗ thả

#### Scenario: Rê chuột vào cò
- **WHEN** người dùng rê chuột lên một con cò
- **THEN** con cò sáng lên nhẹ để báo là kéo được

### Requirement: Hoạt cảnh khi đứng yên
Các con vật SHALL có cử động nhỏ, ngẫu nhiên khi không bị kéo, như nhún, nhảy nhẹ hay chớp mắt. Cử động không được làm con vật rời khỏi vùng đếm của nó.

#### Scenario: Ếch đứng yên trên bờ
- **WHEN** không ai thao tác trong vài giây
- **THEN** các con ếch thỉnh thoảng chớp mắt hoặc nhún nhẹ và vẫn được đếm "trên bờ"
