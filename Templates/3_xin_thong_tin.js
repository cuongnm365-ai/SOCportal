window.SOC_TEMPLATES = window.SOC_TEMPLATES || {};

window.SOC_TEMPLATES["xin_thong_tin"] = {
    name: "Mẫu 3: Xin thông tin hợp đồng (Khách hàng cung cấp thiếu dữ liệu)",
    
    subject: "[Xử Lý] Tiếp nhận làm rõ thông tin thắc mắc hợp đồng",
    
    // Form này chỉ có tên KH và danh xưng mặc định, không cần thêm trường phụ
    fields: [],
    
    qrType: "cai_dat", 
    
    boxContent: `
        <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 4px;"><b>Số điện thoại liên hệ</b> hoặc <b>Số hợp đồng</b></li>
            <li style="margin-bottom: 4px;"><b>Gói dịch vụ</b> đang sử dụng <i>(nếu có)</i></li>
        </ul>
        <p style="margin-bottom:0; font-style: italic;">➔ Chi tiết vui lòng lấy tại ứng dụng <b>Hi FPT</b> (đăng nhập bằng SĐT đăng ký với FPT Telecom).</p>
    `,

    body: `
        Thân chào {{honorific}} <b>{{customerName}}</b>,<br><br>
        Em là <b>{{staffName}}</b> – CSKH FPT Telecom.<br><br>
        Em hiểu những mong muốn từ {{pronoun}}. Để có thể phục vụ {{pronoun.toLowerCase()}} một cách chính xác nhất, vui lòng cung cấp giúp em thêm thông tin đường truyền đang sử dụng như:<br>
        {INFO_BOX}
        Ngay khi nhận được phản hồi, bên em sẽ kiểm tra tình trạng và có phương án đề xuất phục vụ tốt nhất dành cho hợp đồng của {{pronoun.toLowerCase()}}.<br><br>
        Cảm ơn {{honorific}} đã liên hệ.
    `
};