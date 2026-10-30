## Purpose

Chuyến tham quan "Vườn Thú Số Vui" nối 4 bài Luyện tập của Bài 11 (SGK Toán 1 tập 1, trang 72–73) thành một mạch chuyện. Học sinh đi qua các cổng, mỗi cổng mở ra một trò chơi, và giáo viên điều khiển nhịp đi khi trình chiếu.

## ADDED Requirements

### Requirement: Thứ tự và tên cổng
Chuyến tham quan SHALL có đúng 4 cổng theo thứ tự cố định:
1. "Trạm Soát Vé Bàn Tay Thần Kỳ", mở Bài 3.
2. "Vườn Hoa Bướm Xinh", mở Bài 1.
3. "Đồng Cỏ Thỏ Nhảy Cà Rốt", mở Bài 2.
4. "Hồ Ếch & Vòng Quay Ánh Nến", mở Bài 4.

Sau cổng 4 là "Quảng Trường Huy Hiệu". Mỗi cổng có biển tên 3D ghi tên cổng và số bài.

#### Scenario: Biển tên cổng 2
- **WHEN** camera dừng trước cổng thứ hai
- **THEN** biển cổng ghi "Vườn Hoa Bướm Xinh" và "Bài 1"

### Requirement: Mở đầu chuyến tham quan
Sau khi bấm "Bắt đầu" ở màn chào, ứng dụng SHALL mở màn đường đi. Bạn học sinh chibi (Vẹt Xanh đậu trên vai) đứng quay mặt ra phía lớp, trước cổng chào lớn (hai tháp gạch sọc trắng, vòm sắt uốn ôm cầu vồng, biển gỗ) có chữ "KHU VUI CHƠI SỞ THÚ" và lời chào "Chào mừng thầy cô và các em học sinh lớp 1/7!". Bên cạnh là xe buýt kiểu cổ và cột biển gỗ "Lớp 1/7". Vẹt Xanh xuất hiện và đọc lời chào có tên lớp. Tên lớp lấy từ một chỗ cấu hình duy nhất.

#### Scenario: Vào chuyến tham quan
- **WHEN** giáo viên bấm "Bắt đầu" ở màn chào
- **THEN** màn đường đi hiện ra với bạn học sinh, xe buýt, cổng chào có chữ "KHU VUI CHƠI SỞ THÚ" và "Chào mừng thầy cô và các em học sinh lớp 1/7!", và giọng đọc phát lời chào của Vẹt Xanh

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

### Requirement: Lời dẫn tại cổng
Khi camera dừng trước một cổng, Vẹt Xanh SHALL đọc lời dẫn riêng của cổng đó. Lời dẫn đồng thời hiện thành bong bóng thoại. Lúc này nút "Vào cổng" xuất hiện.

#### Scenario: Lời dẫn Cổng 1
- **WHEN** camera dừng trước Cổng 1
- **THEN** bong bóng thoại và giọng đọc nói rằng muốn vào vườn thú thì phải đưa bàn tay cho máy soát vé kiểm tra, và có nút "Vào cổng"

### Requirement: Vào trò chơi của cổng
Bấm "Vào cổng" SHALL mở trò chơi của bài gắn với cổng đó. Trò chơi chạy đúng như khi mở riêng lẻ.

#### Scenario: Vào Cổng 3
- **WHEN** giáo viên bấm "Vào cổng" trước Cổng 3
- **THEN** trò chơi Bài 2 "Thỏ nhảy tìm cà rốt" mở ra

### Requirement: Dải cổng khi đang chơi
Khi trò chơi được mở từ một cổng, phía trên màn chơi SHALL có dải ghi số và tên cổng. Riêng Cổng 1 có thêm thanh chắn và 8 bóng đèn: mỗi câu Bài 3 trả lời đúng làm sáng thêm một bóng.

#### Scenario: Đèn soát vé sáng dần
- **WHEN** học sinh đang chơi ở Cổng 1 và đã trả lời đúng 3 câu
- **THEN** dải cổng có 3 trong 8 bóng đèn sáng

### Requirement: Cánh cổng khi đi tới
Khi bạn học sinh đi tới đứng trước một cổng chưa qua, cánh cổng đó SHALL vẫn đóng, cả lúc đang đi lẫn lúc đã dừng. Cổng chỉ mở khi được qua, hoặc mở tạm khi bạn nhỏ đi xuyên qua nó để tới một trạm khác (chọn trên Bản đồ), rồi đóng lại.

#### Scenario: Đi tới Cổng 1
- **WHEN** giáo viên bấm "Đi tiếp" ở đầu đường
- **THEN** cánh Cổng 1 đóng suốt lúc bạn nhỏ đi tới và khi bạn nhỏ dừng trước cổng

#### Scenario: Đi xuyên qua cổng chưa qua
- **WHEN** đang đứng trước Cổng 1 chưa qua và giáo viên chọn Cổng 3 trên Bản đồ
- **THEN** Cổng 1 và Cổng 2 mở tạm khi bạn nhỏ đi ngang rồi đóng lại, và cả hai vẫn chưa được đánh dấu đã qua

### Requirement: Qua cổng
Khi trò chơi của cổng kết thúc, màn kết thúc SHALL có nút "Qua cổng". Trong lúc đang chơi, giáo viên cũng luôn bấm được "Qua cổng" ở dải cổng mà không cần chơi hết. Bấm "Qua cổng" thì trở lại màn đường đi, cổng đó mở ra và được đánh dấu đã qua, rồi bạn nhỏ đi luôn qua cổng tới đứng trước cổng kế tiếp (sau Cổng 4 là Quảng Trường Huy Hiệu), không cần bấm "Đi tiếp".

#### Scenario: Chơi xong rồi qua cổng
- **WHEN** học sinh hoàn thành Bài 1 ở Cổng 2 và giáo viên bấm "Qua cổng"
- **THEN** màn đường đi hiện lại, Cổng 2 mở ra và có dấu đã qua, bạn nhỏ đi qua cổng rồi dừng trước Cổng 3, và Vẹt Xanh đọc lời dẫn của Cổng 3

#### Scenario: Qua cổng khi chưa chơi xong
- **WHEN** giáo viên bấm "Qua cổng" ở dải cổng lúc Bài 3 mới làm được 2 câu
- **THEN** ứng dụng tắt camera, trở lại màn đường đi, và Cổng 1 được đánh dấu đã qua

### Requirement: Rời trò chơi giữa chừng
Nút "Về đường đi" SHALL đưa người dùng từ trò chơi về màn đường đi, trước đúng cổng vừa vào, mà không đánh dấu cổng đó đã qua. Camera và âm thanh của trò chơi phải được tắt.

#### Scenario: Về đường đi
- **WHEN** đang chơi ở Cổng 4 và người dùng bấm "Về đường đi"
- **THEN** màn đường đi hiện lại trước Cổng 4, Cổng 4 chưa được đánh dấu đã qua, và nút "Vào cổng" vẫn còn

### Requirement: Bản đồ chuyến đi
Màn đường đi SHALL có nút "Bản đồ". Bản đồ hiện 4 cổng và Quảng Trường Huy Hiệu, mỗi điểm có tên và trạng thái đã qua hay chưa. Bấm vào một điểm thì camera chuyển thẳng tới trước điểm đó, kể cả khi các cổng phía trước chưa qua.

#### Scenario: Nhảy tới Cổng 4
- **WHEN** chưa qua cổng nào và giáo viên mở Bản đồ rồi chọn "Hồ Ếch & Vòng Quay Ánh Nến"
- **THEN** camera chuyển tới trước Cổng 4, Vẹt Xanh đọc lời dẫn của Cổng 4, và các cổng 1–3 vẫn chưa được đánh dấu đã qua

### Requirement: Quảng Trường Huy Hiệu
Khi bấm "Qua cổng" ở Cổng 4, hoặc chọn Quảng Trường trên bản đồ, ứng dụng SHALL đưa bạn học sinh tới Quảng Trường Huy Hiệu: cổng chúc mừng ghi "CHÚC MỪNG LỚP 1/7! – Hẹn gặp lại các bạn nhỏ!", huy chương vàng "Nhà thám hiểm Phép Trừ nhí" trên bục, băng rôn 4 cổng trên tường (cổng đã qua có màu và dấu ✓), pháo hoa ở mức đồ họa Cao, và lời chúc mừng, hẹn gặp lại của Vẹt Xanh. Màn hình MUST NOT có bảng thông báo che giữa cảnh. Nút "Đi lại từ đầu" nằm cùng chỗ các nút điều khiển.

#### Scenario: Tới quảng trường
- **WHEN** đã qua Cổng 1–3 và giáo viên bấm "Qua cổng" ở Cổng 4"
- **THEN** quảng trường hiện cổng chúc mừng, huy chương, 4 băng rôn cổng đều có dấu ✓ và pháo hoa, không có bảng che giữa màn hình, và giọng đọc phát lời chúc mừng, hẹn gặp lại

#### Scenario: Đi lại từ đầu
- **WHEN** giáo viên bấm "Đi lại từ đầu" ở quảng trường
- **THEN** mọi cổng trở về trạng thái chưa qua và camera về đầu đường

### Requirement: Tiến độ chỉ trong một lần mở
Tiến độ đã qua cổng SHALL được giữ trong suốt lúc ứng dụng đang mở, kể cả khi vào và ra các trò chơi. Tải lại trang thì chuyến đi bắt đầu lại từ đầu.

#### Scenario: Tải lại trang
- **WHEN** đã qua 2 cổng và người dùng tải lại trang
- **THEN** sau màn chào, chuyến đi bắt đầu ở đầu đường và chưa có cổng nào được đánh dấu đã qua

### Requirement: Chất lượng đồ họa cho màn đường đi
Màn đường đi SHALL tôn trọng cài đặt chất lượng chung. Ở mức "Thấp" thì tắt bóng đổ và pháo hoa dạng hạt, nhưng vẫn giữ biển cổng, Vẹt Xanh và mọi nút điều khiển.

#### Scenario: Chất lượng thấp
- **WHEN** chất lượng là "Thấp" và camera tới Quảng Trường Huy Hiệu
- **THEN** huy hiệu và lời chúc mừng vẫn hiện ra, và cảnh không có bóng đổ
