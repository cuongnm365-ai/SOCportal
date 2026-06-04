/* =========================================================
   BỘ NÃO XỬ LÝ (ENGINE) - SOC COMMAND CENTER
   Bản cập nhật: Hỗ trợ nhiều Agent dùng chung (Lưu LocalStorage)
   ========================================================= */

// 1. CẤU HÌNH HỆ THỐNG (Đường dẫn ảnh và Link QR)
const SYSTEM_ASSETS = {
    "cai_dat": { img: "Images/Picture/cai-dat-nhanh.jpg", link: "https://hi.fpt.vn/rev/lbq/P3M3JDZB" },
    "theo_doi_ktv": { img: "Images/Picture/theo-doi-KTV.jpg", link: "https://hi.fpt.vn/rev/lbq/P3M3JDZB" },
    "thanh_toan": { img: "Images/Picture/thanh-toan-nhanh.jpg", link: "https://hi.fpt.vn/rev/fbu/1dnN3BoM" },
    "bao_hong": { img: "Images/Picture/bao-hong-nhanh.jpg", link: "https://hi.fpt.vn/rev/esv/Mq9r4jlG" }
};

// 2. BIẾN TOÀN CỤC CHỨA CÁC KẸP HỒ SƠ
window.SOC_TEMPLATES = window.SOC_TEMPLATES || {};
let currentTemplateId = "";

// 3. KHỞI CHẠY KHI WEB LOAD XONG
document.addEventListener("DOMContentLoaded", () => {
    const selector = document.getElementById("templateSelector");
    
    selector.innerHTML = '<option value="">-- Chọn nghiệp vụ / Mẫu email phục vụ --</option>';
    for (const [id, template] of Object.entries(window.SOC_TEMPLATES)) {
        selector.innerHTML += `<option value="${id}">${template.name}</option>`;
    }

    selector.addEventListener("change", (e) => {
        currentTemplateId = e.target.value;
        renderForm(currentTemplateId);
    });

    document.getElementById("btnReset").addEventListener("click", () => renderForm(currentTemplateId));
    document.getElementById("btnCopy").addEventListener("click", copyEmailContent);
});

// 4. THỢ XÂY FORM (Tự động đẻ ra các ô nhập liệu)
function renderForm(templateId) {
    const formContainer = document.getElementById("dynamicForm");
    const template = window.SOC_TEMPLATES[templateId];
    
    if (!template) {
        formContainer.innerHTML = '<p class="text-center text-slate-500 text-xs italic py-10">Vui lòng chọn một mẫu để hệ thống tự động lắp ráp Form...</p>';
        document.getElementById("emailSubject").innerText = "";
        document.getElementById("emailContent").innerHTML = "<div class='text-center text-slate-400 mt-20 italic text-sm'>Nội dung email sẽ xuất hiện tại đây...</div>";
        document.getElementById("emailSignature").innerHTML = "";
        return;
    }

    // Lấy tên Agent đã lưu từ lần trước (Nếu có)
    const savedAgentName = localStorage.getItem("soc_agent_name") || "";

    // Giao diện chung (Có thêm ô nhập Tên Agent)
    let html = `
        <div class="mb-4">
            <label class="soc-label">Tên Agent xử lý (Hệ thống tự ghi nhớ):</label>
            <input type="text" id="field_staffName" class="soc-input template-input" placeholder="Ví dụ: Nguyễn Văn A" value="${savedAgentName}">
        </div>
        <div class="flex gap-3 mb-4">
            <div class="w-1/3">
                <label class="soc-label">Danh xưng:</label>
                <select id="field_gender" class="soc-input template-input">
                    <option value="Anh">Anh</option><option value="Chị">Chị</option>
                    <option value="Cô">Cô</option><option value="Chú">Chú</option>
                    <option value="Bác">Bác</option><option value="Doanh Nghiệp">Doanh Nghiệp</option>
                </select>
            </div>
            <div class="w-2/3">
                <label class="soc-label">Tên khách hàng:</label>
                <input type="text" id="field_customerName" class="soc-input template-input" placeholder="Nhập tên KH">
            </div>
        </div>
    `;

    // Sinh các trường riêng của mẫu
    if (template.fields && template.fields.length > 0) {
        template.fields.forEach(field => {
            html += `<div class="mb-4"><label class="soc-label">${field.label}:</label>`;
            
            if (field.type === "textarea") {
                html += `<textarea id="field_${field.id}" rows="3" class="soc-input template-input" placeholder="${field.placeholder || ''}"></textarea>`;
            } else if (field.type === "select") {
                html += `<select id="field_${field.id}" class="soc-input template-input">`;
                if(field.options) {
                    field.options.forEach(opt => {
                        html += `<option value="${opt.value}">${opt.text}</option>`;
                    });
                }
                html += `</select>`;
            } else {
                html += `<input type="text" id="field_${field.id}" class="soc-input template-input" placeholder="${field.placeholder || ''}">`;
            }
            html += `</div>`;
        });
    }

    formContainer.innerHTML = html;

    // Lắng nghe sự kiện gõ phím
    document.querySelectorAll('.template-input').forEach(input => {
        input.addEventListener('input', (e) => {
            // Nếu người dùng đang gõ vào ô Tên Agent, lưu ngay vào máy của họ
            if (e.target.id === "field_staffName") {
                localStorage.setItem("soc_agent_name", e.target.value);
            }
            renderEmail();
        });
    });

    renderEmail();
}

// 5. THỢ THAY CHỮ (Render Nội dung Email)
function renderEmail() {
    if (!currentTemplateId) return;
    const template = window.SOC_TEMPLATES[currentTemplateId];
    
    let data = {};
    document.querySelectorAll('.template-input').forEach(input => {
        let key = input.id.replace('field_', '');
        
        if (input.dataset.uppercase === "true" || key === 'contractId') {
            let cursor = input.selectionStart;
            input.value = input.value.toUpperCase();
            input.setSelectionRange(cursor, cursor);
        }
        
        data[key] = input.value || `[${key}]`;
    });
    
    data.honorific = data.gender;
    data.pronoun = (data.gender === 'Doanh Nghiệp') ? 'Quý công ty' : data.gender;
    if (data.gender === 'Doanh Nghiệp') data.honorific = 'Quý công ty';

    const replaceVars = (text) => {
        if (!text) return "";
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return data[key] !== undefined ? data[key] : match;
        });
    };

    let infoBoxHtml = "";
    if (template.boxContent) {
        let boxText = replaceVars(template.boxContent);
        let qrSection = "";
        
        if (template.qrType && SYSTEM_ASSETS[template.qrType]) {
            let asset = SYSTEM_ASSETS[template.qrType];
            qrSection = `<td width="140" align="center" valign="middle" style="padding: 15px; border-left: 1px dashed #cbd5e0;">
                            <a href="${asset.link}" target="_blank" style="text-decoration: none;">
                                <img src="${asset.img}" alt="QR Code" width="130" style="display: block; max-width: 100%; border: 1px solid #cbd5e0; padding: 4px; background: #fff; border-radius: 4px;">
                            </a>
                        </td>`;
        }
        infoBoxHtml = `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f26f21; border-radius: 4px; margin: 15px 0;">
                        <tr><td valign="middle" style="padding: 15px; font-family: 'Aptos', Arial, sans-serif; font-size: 14.5px; color: #2d3748; line-height: 1.6;">${boxText}</td>${qrSection}</tr>
                    </table>`;
    }

    let finalSubject = replaceVars(template.subject);
    let finalBody = replaceVars(template.body);
    finalBody = finalBody.replace('{INFO_BOX}', infoBoxHtml);
    
    // Lấy tên Agent để đưa vào chữ ký
    let agentSignatureName = document.getElementById("field_staffName").value || "[Tên Agent]";
    let finalSig = `Trân trọng,<br>Em <b>${agentSignatureName}</b> – CSKH FPT Telecom.`;

    document.getElementById("emailSubject").innerText = finalSubject;
    document.getElementById("emailContent").innerHTML = finalBody;
    document.getElementById("emailSignature").innerHTML = finalSig;
}

// 6. HÀM SAO CHÉP CHUẨN ĐỊNH DẠNG OUTLOOK
function copyEmailContent() {
    const contentHtml = document.getElementById('emailContent').innerHTML;
    const sigHtml = document.getElementById('emailSignature').innerHTML;
    const fullHtml = `<div style="font-family: 'Aptos', Arial, sans-serif; font-size: 14.5px; color: #2d3748;">${contentHtml}<br>${sigHtml}</div>`;

    if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([fullHtml], { type: 'text/html' });
        navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => {
            showToast("Đã copy NỘI DUNG VÀ FORMAT thành công! Hãy dán (Ctrl+V) vào Outlook.");
        }).catch(err => {
            fallbackCopy();
        });
    } else {
        fallbackCopy();
    }
}

function fallbackCopy() {
    const emailContainer = document.createElement("div");
    emailContainer.innerHTML = document.getElementById('emailContent').innerHTML + "<br>" + document.getElementById('emailSignature').innerHTML;
    document.body.appendChild(emailContainer);
    
    const range = document.createRange();
    range.selectNode(emailContainer);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    
    try {
        document.execCommand('copy');
        showToast("Đã bôi đen và copy thành công!");
    } catch (err) {
        alert("Vui lòng bôi đen nội dung rồi nhấn Ctrl+C để copy.");
    }
    
    window.getSelection().removeAllRanges();
    document.body.removeChild(emailContainer);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}