## Purpose

Chuyến tham quan "Vườn Thú Số Vui" nối 4 bài Luyện tập của Bài 11 (SGK Toán 1 tập 1, trang 72–73) thành một mạch chuyện. Học sinh đi qua các cổng, mỗi cổng mở ra một trò chơi, và giáo viên điều khiển nhịp đi khi trình chiếu.

## ADDED Requirements

### Requirement: Thứ tự và tên cổng
Chuyến tham quan SHALL có đúng 4 cổng theo thứ tự cố định, cổng thứ N mở Bài N:
1. "Vườn Hoa Bướm Xinh", mở Bài 1.
2. "Đồng Cỏ Thỏ Nhảy Cà Rốt", mở Bài 2.
3. "Trạm Soát Vé Bàn Tay Thần Kỳ", mở Bài 3.
4. "Ếch Nhảy, Cò Bay, Trứng Nở", mở Bài 4.

Sau cổng 4 là "Quảng Trường Huy Hiệu". Mỗi cổng có biển tên 3D ghi tên cổng và số bài.

#### Scenario: Biển tên cổng 3
- **WHEN** camera dừng trước cổng thứ ba
- **THEN** biển cổng ghi "Trạm Soát Vé Bàn Tay Thần Kỳ" và "Bài 3"

### Requirement: Mở đầu chuyến tham quan
Sau khi bấm "Bắt đầu" ở màn chào, ứng dụng SHALL mở màn đường đi. Bạn học sinh chibi (Vẹt Xanh đậu trên vai) đứng quay mặt ra phía lớp, trước cổng chào lớn: hai cột gạch, vòm cầu vồng, các bạn thú trên cột (sư tử ở cột bên phải), dấu chân thú trên đường, và biển ghi "KHU VUI CHƠI SỞ THÚ" cùng lời chào "Chào mừng thầy cô và các em học sinh lớp 1/7!". Bên cạnh là xe buýt kiểu cổ (đỗ lệch sang bên, không che cổng chào) và biển "Lớp 1/7". Màn hình MUST NOT có bong bóng thoại của Vẹt Xanh. Tên lớp lấy từ một chỗ cấu hình duy nhất.

#### Scenario: Vào chuyến tham quan
- **WHEN** giáo viên bấm "Bắt đầu" ở màn chào
- **THEN** màn đường đi hiện ra với bạn học sinh, xe buýt, biển "Lớp 1/7" và cổng chào có chữ "KHU VUI CHƠI SỞ THÚ" và "Chào mừng thầy cô và các em học sinh lớp 1/7!", không có bong bóng thoại và không có tiếng

### Requirement: Không có âm thanh
Chuyến tham quan và cả 4 trò chơi SHALL không phát giọng đọc, nhạc hay hiệu ứng âm thanh nào. Gói phát hành MUST NOT chứa file âm thanh.

#### Scenario: Đi hết chuyến tham quan
- **WHEN** giáo viên đi từ đầu đường tới Quảng Trường Huy Hiệu và chơi cả 4 bài
- **THEN** ứng dụng không phát ra tiếng nào

### Requirement: Giáo viên điều khiển nhịp đi
Bạn học sinh chibi SHALL chỉ đi theo đường định sẵn, và chỉ khi giáo viên bấm nút. Camera luôn đi theo sau lưng, đủ cao để bạn nhỏ không che hologram, bục điều khiển hay màn hình của cổng khi dừng trước cổng. Ở đầu đường (hoặc khi đứng trước một cổng đã qua), nút "Đi tiếp" cho bạn nhỏ bước đi (vung tay, bước chân) tới trước cổng kế tiếp rồi dừng. Khi dừng lâu, bạn nhỏ quay lại phía lớp và vẫy tay. Người dùng MUST NOT tự đi lại tự do trên màn đường đi.

#### Scenario: Đi tới cổng kế tiếp
- **WHEN** bạn học sinh đang ở đầu đường và giáo viên bấm "Đi tiếp"
- **THEN** bạn nhỏ bước đi qua cổng chào tới trước Cổng 1 rồi dừng lại, camera đi theo sau lưng

#### Scenario: Kéo chuột trên màn đường đi
- **WHEN** người dùng kéo chuột trên màn đường đi
- **THEN** vị trí camera không đổi

### Requirement: Cảnh đường đi sinh động
Hai bên đường SHALL có hàng rào kẹo, đèn lồng, bụi hoa và các bạn thú chibi (ít nhất 4 loài) cử động nhẹ. Mỗi cổng có bóng bay hai bên. Ở mức chất lượng "Thấp", số cây và bụi hoa được giảm, nhưng nhân vật, cổng và thú vẫn còn đủ.

#### Scenario: Trên đường tới Cổng 2
- **WHEN** bạn học sinh đang đi từ Cổng 1 tới Cổng 2
- **THEN** hai bên đường có hàng rào, đèn lồng và các bạn thú, và cổng phía trước có bóng bay

### Requirement: Dừng trước cổng
Khi camera dừng trước một cổng, nút "Vào cổng" SHALL xuất hiện. Lời dẫn của cổng không được đọc và không hiện bong bóng thoại.

#### Scenario: Tới Cổng 1
- **WHEN** camera dừng trước Cổng 1
- **THEN** có nút "Vào cổng" và màn hình không có bong bóng thoại

### Requirement: Vào trò chơi của cổng
Bấm "Vào cổng" SHALL mở trò chơi của bài gắn với cổng đó. Trò chơi chạy đúng như khi mở riêng lẻ, trừ màn kết thúc riêng của Bài 1 và Bài 2: khi mở từ cổng, hai màn này được thay bằng popup bảng phép tính.

#### Scenario: Vào Cổng 2
- **WHEN** giáo viên bấm "Vào cổng" trước Cổng 2
- **THEN** trò chơi Bài 2 "Thỏ nhảy tìm cà rốt" mở ra

### Requirement: Dải cổng khi đang chơi
Khi trò chơi được mở từ một cổng, phía trên màn chơi SHALL có dải ghi số và tên cổng, nút "Về đường đi" và nút "Qua cổng". Riêng Cổng 3 (trạm soát vé) có thêm thanh chắn và 8 bóng đèn: mỗi câu Bài 3 trả lời đúng làm sáng thêm một bóng.

#### Scenario: Đèn soát vé sáng dần
- **WHEN** học sinh đang chơi ở Cổng 3 và đã trả lời đúng 3 câu
- **THEN** dải cổng có 3 trong 8 bóng đèn sáng

### Requirement: Cánh cổng khi đi tới
Khi bạn học sinh đi tới đứng trước một cổng chưa qua, cánh cổng đó SHALL vẫn đóng, cả lúc đang đi lẫn lúc đã dừng. Cổng chỉ mở khi được qua, hoặc mở tạm khi bạn nhỏ đi xuyên qua nó để tới một trạm khác (chọn trên Bản đồ), rồi đóng lại.

#### Scenario: Đi tới Cổng 1
- **WHEN** giáo viên bấm "Đi tiếp" ở đầu đường
- **THEN** cánh Cổng 1 đóng suốt lúc bạn nhỏ đi tới và khi bạn nhỏ dừng trước cổng

#### Scenario: Đi xuyên qua cổng chưa qua
- **WHEN** đang đứng trước Cổng 1 chưa qua và giáo viên chọn Cổng 3 trên Bản đồ
- **THEN** Cổng 1 và Cổng 2 mở tạm khi bạn nhỏ đi ngang rồi đóng lại, và cả hai vẫn chưa được đánh dấu đã qua

### Requirement: Popup bảng phép tính của cổng
Khi trò chơi mở từ một cổng, màn chơi SHALL hiện popup bảng phép tính của bài ngay khi trò chơi kết thúc. Popup cũng hiện khi giáo viên bấm "Qua cổng" ở dải cổng lúc chưa chơi xong. Popup có tên và số của cổng, và luôn có đủ phép tính của bài, chữ to. Phép đã làm xong ghi kết quả nổi bật. Phép chưa làm ghi "a − b = ?", màu mờ; bấm vào một dòng "?" thì dòng đó hiện kết quả đúng. Popup không đọc thành tiếng. Popup có nút "Qua cổng" và nút đóng popup ("Chơi tiếp" khi chưa chơi xong, "Xem lại" khi đã xong) để quay lại trò chơi. Màn đường đi MUST NOT hiện bảng này.

Cách trình bày theo từng cổng:
- Cổng 1 (Bài 1): 5 dòng như trang sách, mỗi dòng có 6 bông hoa (các bông bị bớt tô đỏ) và phép tính 6 − 1 … 6 − 5.
- Cổng 2 (Bài 2): ghi theo yêu cầu "Bảng phép tính của Cổng 2".
- Cổng 3 (Bài 3): một bảng dọc kiểu SGK gồm 8 phép 9 − 1 … 9 − 8.
- Cổng 4 (Bài 4): 3 dòng "🐸 10 − 5", "🕊️ 10 − 2", "🐣 10 − 3"; một dòng xong khi giáo viên đã bấm "Đáp án" ở bến đó.

#### Scenario: Chơi xong Cổng 1
- **WHEN** giáo viên bấm qua hết 5 câu Bài 1 ở Cổng 1
- **THEN** popup "Cùng đọc lại các phép tính!" hiện ngay trên màn chơi với 5 dòng 6 − 1 = 5, 6 − 2 = 4, 6 − 3 = 3, 6 − 4 = 2, 6 − 5 = 1, mỗi dòng có 6 bông hoa, và không có màn "Hoàn thành" riêng của Bài 1 bị đè bên dưới

#### Scenario: Bấm Qua cổng khi mới làm 2 câu
- **WHEN** Bài 3 mới đúng câu 9 − 1 và 9 − 2, và giáo viên bấm "Qua cổng" ở dải cổng
- **THEN** popup hiện bảng dọc đủ 8 phép: 9 − 1 = 8, 9 − 2 = 7, và 6 phép mờ từ 9 − 3 = ? tới 9 − 8 = ?; cổng chưa được đánh dấu đã qua

#### Scenario: Bấm vào dòng chưa làm
- **WHEN** popup đang có dòng "9 − 5 = ?" và giáo viên bấm vào dòng đó
- **THEN** dòng đó hiện "9 − 5 = 4"

#### Scenario: Đóng popup để chơi tiếp
- **WHEN** popup đang hiện lúc chưa chơi xong và giáo viên bấm "Chơi tiếp"
- **THEN** popup đóng lại và học sinh chơi tiếp từ câu đang làm

#### Scenario: Chưa có câu nào được làm
- **WHEN** giáo viên bấm "Qua cổng" ở dải cổng khi Bài 1 chưa có câu nào được làm
- **THEN** popup vẫn ghi đủ phép tính của bài, tất cả đều ở dạng "a − b = ?" màu mờ

#### Scenario: Bảng của Cổng 4
- **WHEN** giáo viên đã bấm "Đáp án" ở cả bến ếch, bến cò và bến trứng rồi bấm "Qua cổng"
- **THEN** popup có 3 dòng "🐸 10 − 5 = 5", "🕊️ 10 − 2 = 8", "🐣 10 − 3 = 7", đều đã xong

### Requirement: Bảng phép tính của Cổng 2
Bảng của Cổng 2 SHALL ghi cả 7 ô của làn theo đúng thứ tự thỏ đi, kèm số mục tiêu của làn ("bằng N"). Ô thỏ đã nhảy qua ghi kết quả; ô có kết quả bằng mục tiêu được tô nổi bật và có 🥕, ô có kết quả khác mục tiêu có dấu ✘. Ô thỏ chưa tới ghi "a − b = ?", màu mờ. Chơi 2 đội thì bảng có 2 cột "Đội Đỏ" và "Đội Xanh", mỗi cột ghi 7 ô và số mục tiêu của làn đội đó.

#### Scenario: Một người chơi xong
- **WHEN** ở chế độ 1 người, mục tiêu 4, thỏ đã tới hàng rào cà rốt
- **THEN** popup ghi "bằng 4" và 7 dòng có kết quả; các dòng bằng 4 được tô nổi bật và có 🥕, các dòng khác có ✘, và không có màn chúc mừng riêng của Bài 2 bị đè bên dưới

#### Scenario: Hai đội, một đội chưa về đích
- **WHEN** ở chế độ 2 đội, Đội Đỏ đã về đích, Đội Xanh mới qua 3 ô, và giáo viên bấm "Qua cổng" ở dải cổng
- **THEN** cột Đội Đỏ có đủ 7 kết quả, cột Đội Xanh có 3 dòng có kết quả và 4 dòng "a − b = ?" màu mờ, và popup vừa màn 1280×720 không phải cuộn

#### Scenario: Thỏ vừa trả lời nhầm
- **WHEN** thỏ đã qua 2 ô, trả lời nhầm ở ô thứ 3, rồi giáo viên bấm "Qua cổng" ở dải cổng
- **THEN** 2 ô đầu của làn ghi kết quả, ô thứ 3 và các ô sau ghi "a − b = ?" màu mờ

### Requirement: Qua cổng
Khi trò chơi được mở từ một cổng, nút "Qua cổng" SHALL nằm trong popup bảng phép tính. Trong lúc đang chơi, giáo viên luôn bấm được "Qua cổng" ở dải cổng mà không cần chơi hết; nút này mở popup trước, và nút "Qua cổng" trong popup mới qua cổng. Qua cổng thì phép tính trên popup được lưu lại cho Quảng Trường Huy Hiệu, ứng dụng trở lại màn đường đi, cổng đó mở ra và được đánh dấu đã qua, rồi bạn nhỏ đi luôn qua cổng tới đứng trước cổng kế tiếp (sau Cổng 4 là Quảng Trường Huy Hiệu), không cần bấm "Đi tiếp".

#### Scenario: Chơi xong rồi qua cổng
- **WHEN** học sinh hoàn thành Bài 1 ở Cổng 1 và giáo viên bấm "Qua cổng" trong popup bảng phép tính
- **THEN** màn đường đi hiện lại, Cổng 1 mở ra và có dấu đã qua, bạn nhỏ đi qua cổng rồi dừng trước Cổng 2

#### Scenario: Qua cổng khi chưa chơi xong
- **WHEN** giáo viên bấm "Qua cổng" ở dải cổng lúc Bài 3 mới làm được 2 câu, rồi bấm "Qua cổng" trong popup
- **THEN** ứng dụng tắt camera, trở lại màn đường đi, và Cổng 3 được đánh dấu đã qua

### Requirement: Rời trò chơi giữa chừng
Nút "Về đường đi" SHALL đưa người dùng từ trò chơi về màn đường đi, trước đúng cổng vừa vào, mà không đánh dấu cổng đó đã qua. Camera của trò chơi phải được tắt.

#### Scenario: Về đường đi
- **WHEN** đang chơi ở Cổng 4 và người dùng bấm "Về đường đi"
- **THEN** màn đường đi hiện lại trước Cổng 4, Cổng 4 chưa được đánh dấu đã qua, và nút "Vào cổng" vẫn còn

### Requirement: Bản đồ chuyến đi
Màn đường đi SHALL có nút "Bản đồ". Bản đồ hiện 4 cổng và Quảng Trường Huy Hiệu, mỗi điểm có tên và trạng thái đã qua hay chưa. Bấm vào một điểm thì bạn nhỏ đi thẳng tới trước điểm đó, kể cả khi các cổng phía trước chưa qua.

#### Scenario: Nhảy tới Cổng 4
- **WHEN** chưa qua cổng nào và giáo viên mở Bản đồ rồi chọn "Bài 4: Ếch Nhảy, Cò Bay, Trứng Nở"
- **THEN** bạn nhỏ tới trước Cổng 4, có nút "Vào cổng", và các cổng 1–3 vẫn chưa được đánh dấu đã qua

### Requirement: Quảng Trường Huy Hiệu
Khi bấm "Qua cổng" ở Cổng 4, hoặc chọn Quảng Trường trên bản đồ, ứng dụng SHALL đưa bạn học sinh tới Quảng Trường Huy Hiệu: cổng chúc mừng ghi "CHÚC MỪNG LỚP 1/7! – Hẹn gặp lại các bạn nhỏ!", huy chương vàng "Nhà thám hiểm Phép Trừ nhí" trên bục, bóng bay và cây hai bên. Hai bên cổng chúc mừng, thay cho tường rào, là hai bảng gỗ quay về phía lớp: bảng trái "CỔNG 1 – 2", bảng phải "CỔNG 3 – 4". Mỗi cổng là một cột trên bảng, ghi lại các phép tính đã lưu lúc qua cổng đó (phép chưa làm ghi "?"); cổng chưa qua ghi "(chưa qua)". Pháo hoa bắn ra ở giữa cổng chúc mừng ở mức đồ họa Cao. Màn hình MUST NOT có bảng thông báo che giữa cảnh. Nút "Đi lại từ đầu" nằm cùng chỗ các nút điều khiển.

#### Scenario: Tới quảng trường
- **WHEN** đã qua Cổng 1–3 và giáo viên bấm "Qua cổng" trong popup ở Cổng 4
- **THEN** quảng trường hiện cổng chúc mừng, huy chương, hai bảng gỗ có đủ 4 cột phép tính của các cổng đã qua, và pháo hoa giữa cổng, không có bảng che giữa màn hình

#### Scenario: Tới quảng trường khi chưa qua cổng nào
- **WHEN** chưa qua cổng nào và giáo viên chọn Quảng Trường trên Bản đồ
- **THEN** cả 4 cột trên hai bảng gỗ đều ghi "(chưa qua)"

#### Scenario: Đi lại từ đầu
- **WHEN** giáo viên bấm "Đi lại từ đầu" ở quảng trường
- **THEN** mọi cổng trở về trạng thái chưa qua, hai bảng gỗ xóa hết phép tính, và camera về đầu đường

### Requirement: Tiến độ chỉ trong một lần mở
Tiến độ đã qua cổng và phép tính đã lưu SHALL được giữ trong suốt lúc ứng dụng đang mở, kể cả khi vào và ra các trò chơi. Tải lại trang thì chuyến đi bắt đầu lại từ đầu.

#### Scenario: Tải lại trang
- **WHEN** đã qua 2 cổng và người dùng tải lại trang
- **THEN** sau màn chào, chuyến đi bắt đầu ở đầu đường và chưa có cổng nào được đánh dấu đã qua

### Requirement: Chất lượng đồ họa cho màn đường đi
Màn đường đi SHALL tôn trọng cài đặt chất lượng chung. Ở mức "Thấp" thì tắt bóng đổ và pháo hoa dạng hạt, nhưng vẫn giữ biển cổng, Vẹt Xanh, hai bảng gỗ và mọi nút điều khiển.

#### Scenario: Chất lượng thấp
- **WHEN** chất lượng là "Thấp" và camera tới Quảng Trường Huy Hiệu
- **THEN** huy chương, lời chúc mừng và hai bảng gỗ vẫn hiện ra, và cảnh không có bóng đổ
