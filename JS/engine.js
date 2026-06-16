/* =========================================================
   HỆ THỐNG XÁC THỰC GOOGLE VÀ BỘ NÃO XỬ LÝ
   ========================================================= */

// Hàm giải mã JWT Token của Google
function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Xử lý khi đăng nhập Google thành công
function handleCredentialResponse(response) {
    const payload = parseJwt(response.credential);
    
    // Lưu thông tin phiên đăng nhập
    sessionStorage.setItem("soc_user_email", payload.email);
    sessionStorage.setItem("soc_user_name", payload.name);

    // Cập nhật giao diện Sidebar
    document.getElementById("user-name").innerText = payload.name;
    document.getElementById("user-email").innerText = payload.email;
    const avatar = document.getElementById("user-avatar");
    avatar.src = payload.picture;
    avatar.classList.remove("hidden");

    // Ẩn màn hình đăng nhập, Hiện App chính
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app-container").classList.remove("hidden");

    // Điền sẵn tên nhân viên vào Form nếu chưa có
    const staffInput = document.getElementById("field_staffName");
    if (staffInput && !staffInput.value) {
        staffInput.value = payload.name;
        localStorage.setItem("soc_agent_name", payload.name);
    }
}

// Xử lý Đăng xuất
document.addEventListener("DOMContentLoaded", () => {
    const btnLogout = document.getElementById("btnLogout");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            sessionStorage.removeItem("soc_user_email");
            sessionStorage.removeItem("soc_user_name");
            // Tải lại trang để về lại màn hình đăng nhập
            window.location.reload();
        });
    }

    // (Giữ nguyên toàn bộ logic load template, tab, render Form ở dưới này)
    // ...
});
