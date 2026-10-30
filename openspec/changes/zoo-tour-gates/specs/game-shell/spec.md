## MODIFIED Requirements

### Requirement: Màn hình chọn bài
Ứng dụng SHALL mở ra màn chào có nút "Bắt đầu". Bấm "Bắt đầu" thì vào màn đường đi của chuyến tham quan (xem zoo-tour). Lối vào thẳng từng bài nằm trong nút "Bản đồ" của màn đường đi. Bản đồ có 4 điểm: "Bài 1: Vườn Hoa Bướm Xinh", "Bài 2: Đồng Cỏ Thỏ Nhảy Cà Rốt", "Bài 3: Trạm Soát Vé Bàn Tay Thần Kỳ", "Bài 4: Hồ Ếch & Vòng Quay Ánh Nến". Khi đang ở trong trò chơi, nút "Về đường đi" đưa người dùng về màn đường đi.

#### Scenario: Vào một bài
- **WHEN** người dùng mở Bản đồ, chọn "Bài 3: Trạm Soát Vé Bàn Tay Thần Kỳ" rồi bấm "Vào cổng"
- **THEN** ứng dụng hiển thị trò chơi bài 3

#### Scenario: Quay về màn hình chính
- **WHEN** người dùng đang ở một trò chơi và bấm nút "Về đường đi"
- **THEN** ứng dụng trở về màn đường đi, đồng thời tắt camera và dừng âm thanh của trò chơi đó

### Requirement: Chạy hoàn toàn offline
Ứng dụng SHALL hoạt động đầy đủ khi máy không có kết nối mạng. Mọi tài nguyên (font, mô hình 3D, MediaPipe, âm thanh) MUST có sẵn trong gói. Chỉ MediaPipe được phép tải từ web khi có mạng (xem hand-finger-detection); mọi tài nguyên khác MUST NOT tải từ ngoài máy.

#### Scenario: Máy ngắt mạng
- **WHEN** máy không có mạng và người dùng đi hết màn đường đi và mở lần lượt cả bốn bài
- **THEN** mọi cảnh 3D, chữ, âm thanh và nhận diện tay đều hoạt động, và không có yêu cầu mạng nào thành công ra ngoài `localhost`

#### Scenario: Máy có mạng
- **WHEN** máy có mạng và người dùng mở lần lượt cả bốn bài
- **THEN** các yêu cầu ra ngoài máy chỉ là file MediaPipe (.wasm, .js, .task)
