## MODIFIED Requirements

### Requirement: Màn hình chọn bài
Ứng dụng SHALL mở ra màn chào có nút "Bắt đầu". Bấm "Bắt đầu" thì vào màn đường đi của chuyến tham quan (xem zoo-tour). Lối vào thẳng từng bài nằm trong nút "Bản đồ" của màn đường đi. Bản đồ có 4 cổng và Quảng Trường Huy Hiệu: "Bài 1: Vườn Hoa Bướm Xinh", "Bài 2: Đồng Cỏ Thỏ Nhảy Cà Rốt", "Bài 3: Trạm Soát Vé Bàn Tay Thần Kỳ", "Bài 4: Ếch Nhảy, Cò Bay, Trứng Nở". Khi đang ở trong trò chơi, nút "Về đường đi" đưa người dùng về màn đường đi.

#### Scenario: Vào một bài
- **WHEN** người dùng mở Bản đồ, chọn "Bài 3: Trạm Soát Vé Bàn Tay Thần Kỳ" rồi bấm "Vào cổng"
- **THEN** ứng dụng hiển thị trò chơi bài 3

#### Scenario: Quay về màn hình chính
- **WHEN** người dùng đang ở một trò chơi và bấm nút "Về đường đi"
- **THEN** ứng dụng trở về màn đường đi và tắt camera của trò chơi đó

### Requirement: Chạy hoàn toàn offline
Ứng dụng SHALL hoạt động đầy đủ khi máy không có kết nối mạng. Mọi tài nguyên (font, hình ảnh, MediaPipe) MUST có sẵn trong gói. Chỉ MediaPipe được phép tải từ web khi có mạng (xem hand-finger-detection); mọi tài nguyên khác MUST NOT tải từ ngoài máy.

#### Scenario: Máy ngắt mạng
- **WHEN** máy không có mạng và người dùng đi hết màn đường đi và mở lần lượt cả bốn bài
- **THEN** mọi cảnh 3D, chữ và nhận diện tay đều hoạt động, và không có yêu cầu mạng nào thành công ra ngoài `localhost`

#### Scenario: Máy có mạng
- **WHEN** máy có mạng và người dùng mở lần lượt cả bốn bài
- **THEN** các yêu cầu ra ngoài máy chỉ là file MediaPipe (.wasm, .js, .task)

### Requirement: Khởi chạy bằng start.bat
Gói phát hành SHALL có file `start.bat` chạy được dù đặt ở thư mục nào. Bấm đúp vào file này thì nó tự tìm thư mục trò chơi: trước hết cạnh nó và ở các thư mục cha, rồi chỗ đã tìm thấy lần trước, rồi thư mục `TroChoiToan1` ở Desktop, Documents, Downloads và các ổ đĩa, USB (sâu tới 2 cấp thư mục). Sau đó nó chạy một máy chủ tĩnh trên `localhost` chỉ dùng công cụ có sẵn của Windows, rồi trình duyệt mặc định hoặc Edge mở trang trò chơi. Máy không cần cài thêm phần mềm.

#### Scenario: Khởi chạy lần đầu
- **WHEN** giáo viên bấm đúp `start.bat` trên máy Windows 10/11 chưa cài Node hay Python
- **THEN** trình duyệt mở màn chào tại một địa chỉ `http://localhost:<cổng>`

#### Scenario: start.bat để ngoài thư mục gói
- **WHEN** thư mục trò chơi nằm ở `D:\GiaoAn\TroChoiToan1`, và giáo viên chép `start.bat` ra Desktop rồi bấm đúp
- **THEN** `start.bat` tìm thấy thư mục trò chơi trên ổ D và mở trò chơi

#### Scenario: Cổng mặc định đang bận
- **WHEN** cổng mặc định đã bị chương trình khác dùng
- **THEN** máy chủ chọn cổng trống kế tiếp và mở trình duyệt đúng cổng đó

### Requirement: Ghi nguồn tài nguyên
Ứng dụng SHALL có trang "Giới thiệu" liệt kê tác giả và giấy phép của mọi tài nguyên bên thứ ba có yêu cầu ghi nguồn.

#### Scenario: Xem ghi nguồn
- **WHEN** người dùng mở trang "Giới thiệu"
- **THEN** mỗi mô hình 3D hoặc hình ảnh có giấy phép CC-BY đều được liệt kê kèm tên tác giả và giấy phép

## REMOVED Requirements

### Requirement: Giọng đọc tiếng Việt
**Reason**: Giáo viên không dùng giọng đọc; toàn bộ âm thanh và file âm thanh đã bị xóa khỏi ứng dụng (xem zoo-tour, "Không có âm thanh").
**Migration**: Không cần. Giáo viên tự đọc đề và khen học sinh trên lớp.
