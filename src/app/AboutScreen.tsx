import { credits } from '../credits';

export function AboutScreen() {
  return (
    <div className="about">
      <h1>Giới thiệu</h1>
      <p>
        Bộ trò chơi luyện tập Bài 11 "Phép trừ trong phạm vi 10", SGK Toán 1 tập 1, trang 72–73, dẫn dắt bằng chuyến
        tham quan "Vườn Thú Số Vui" qua 4 cổng: Trạm Soát Vé Bàn Tay Thần Kỳ (Bài 3), Vườn Hoa Bướm Xinh (Bài 1), Đồng
        Cỏ Thỏ Nhảy Cà Rốt (Bài 2) và Hồ Ếch &amp; Vòng Quay Ánh Nến (Bài 4). Ứng dụng chạy hoàn
        toàn trên máy, không cần mạng. Hình ảnh camera chỉ được xử lý trên máy, không lưu và không gửi đi đâu.
      </p>
      <h2>Ghi nguồn tài nguyên</h2>
      <table className="credits">
        <thead>
          <tr>
            <th>Tài nguyên</th>
            <th>Tác giả</th>
            <th>Giấy phép</th>
            <th>Nguồn</th>
          </tr>
        </thead>
        <tbody>
          {credits.map((c) => (
            <tr key={c.asset}>
              <td>{c.asset}</td>
              <td>{c.author}</td>
              <td>{c.license}</td>
              <td>{c.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
