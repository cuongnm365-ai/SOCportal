window.SOC_TEMPLATES = window.SOC_TEMPLATES || {};

window.SOC_TEMPLATES["thanh_toan"] = {
    name: "Mẫu 2: Đáo hạn cước phí & Thanh toán",
    
    subject: "[Thông Báo] Thông tin cước phí và gia hạn dịch vụ Internet - HĐ: {{contractId}}",
    
    fields: [
        { id: "contractId", label: "Số hợp đồng", type: "text", uppercase: true },
        { id: "address", label: "Địa chỉ sử dụng", type: "text" },
        { id: "amount", label: "Số tiền thanh toán", type: "text", placeholder: "Ví dụ: 1.200.000 VNĐ" },
        { id: "billingCycle", label: "Kỳ hạn thanh toán", type: "text", placeholder: "Ví dụ: 6 tháng (Từ 01/06 đến 30/11/2026)" },
        { id: "servicePackage", label: "Gói dịch vụ", type: "text", placeholder: "Ví dụ: Internet Sky" }
    ],
    
    qrType: "thanh_toan", // Gọi mã QR thanh toán nhanh
    
    boxContent: `
        <ul style="margin: 0; padding-left: 20px;">
            <li style="margin-bottom: 4px;"><b>Số tiền cần thanh toán:</b> <span style="color: #c53030; font-weight: bold; font-size: 15px;">{{amount}}</span></li>
            <li style="margin-bottom: 4px;"><b>Kỳ hạn trả trước:</b> <span style="font-style: italic;">{{billingCycle}}</span></li>
            <li style="margin-bottom: 4px;"><b>Gói dịch vụ:</b> <b>{{servicePackage}}</b></li>
        </ul>
        <p style="margin-bottom:0; font-style: italic;">➔ Thanh toán nhanh, an toàn & dễ dàng kiểm tra tình trạng thanh toán ngay tại ứng dụng <b>Hi FPT</b>.</p>
    `,

    body: `
        Thân chào {{honorific}} <b>{{customerName}}</b>,<br><br>
        Em là <b>{{staffName}}</b> - CSKH FPT Telecom.<br><br>
        Hiện tại hợp đồng <b>{{contractId}}</b> tại địa chỉ <b>{{address}}</b> đã đến kỳ gia hạn trả trước. Em gửi {{pronoun}} thông tin thanh toán cho gói mới như sau:<br>
        {INFO_BOX}
        Khi cần báo hỏng hoặc yêu cầu xử lý các nghiệp vụ khác, {{pronoun}} có thể gửi yêu cầu trực tiếp trên Ứng dụng Hi FPT tại mục <b>"Hỗ trợ"</b> hoặc <b>"Báo hỏng nhanh"</b> để được phục vụ nhanh chóng.<br><br>
        FPT Telecom cảm ơn {{honorific}} đã liên hệ ạ.
    `
};