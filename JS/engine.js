/* =========================================================
   BỘ NÃO XỬ LÝ (ENGINE) - SOC COMMAND CENTER
   Bản cập nhật: Gỡ SĐT mặc định, xử lý lỗi chữ thường
   ========================================================= */

const SYSTEM_ASSETS = {
    "cai_dat": { img: "Images/Picture/cai-dat-nhanh.jpg", link: "https://hi.fpt.vn/rev/lbq/P3M3JDZB" },
    "theo_doi_ktv": { img: "Images/Picture/theo-doi-KTV.jpg", link: "https://hi.fpt.vn/rev/lbq/P3M3JDZB" },
    "thanh_toan": { img: "Images/Picture/thanh-toan-nhanh.jpg", link: "https://hi.fpt.vn/rev/fbu/1dnN3BoM" },
    "bao_hong": { img: "Images/Picture/bao-hong-nhanh.jpg", link: "https://hi.fpt.vn/rev/esv/Mq9r4jlG" }
};

window.SOC_TEMPLATES = window.SOC_TEMPLATES || {};
let currentTemplateId = "";

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

function renderForm(templateId) {
    const formContainer = document.getElementById("dynamicForm");
    const template = window.SOC_TEMPLATES[templateId];
    
    if (!template) {
        formContainer.innerHTML = '<p class="text-center text-slate-500 text-xs italic py-10">Vui lòng chọn một mẫu để hệ thống tự động lắp ráp Form...</p>';
        return;
    }

    const savedAgentName = localStorage.getItem("soc_agent_name") || "";
    
    // Giao diện cố định chỉ còn Tên Agent, Danh xưng và Tên KH
    let html = `
        <div class="mb-4">
            <label class="soc-label">Tên Agent xử lý:</label>
            <input type="text" id="field_staffName" class="soc-input template-input" data-format="titlecase" placeholder="Ví dụ: Nguyễn Văn A" value="${savedAgentName}">
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
                <input type="text" id="field_customerName" class="soc-input template-input" data-format="titlecase" placeholder="Nhập tên KH">
            </div>
        </div>
    `;

    // Sinh các trường tùy biến từ Template
    if (template.fields) {
        template.fields.forEach(field => {
            html += `<div class="mb-4"><label class="soc-label">${field.label}:</label>`;
            let formatAttr = field.format ? `data-format="${field.format}"` : "";
            
            if (field.type === "textarea") {
                html += `<textarea id="field_${field.id}" rows="3" class="soc-input template-input" ${formatAttr} placeholder="${field.placeholder || ''}"></textarea>`;
            } else if (field.type === "select") {
                html += `<select id="field_${field.id}" class="soc-input template-input">`;
                field.options.forEach(opt => html += `<option value="${opt.value}">${opt.text}</option>`);
                html += `</select>`;
            } else if (field.type === "date") {
                html += `<input type="date" id="field_${field.id}" class="soc-input template-input">`;
            } else {
                html += `<input type="text" id="field_${field.id}" class="soc-input template-input" ${formatAttr} placeholder="${field.placeholder || ''}">`;
            }
            html += `</div>`;
        });
    }

    formContainer.innerHTML = html;

    document.querySelectorAll('.template-input').forEach(input => {
        input.addEventListener('input', (e) => {
            if (e.target.id === "field_staffName") localStorage.setItem("soc_agent_name", e.target.value);
            
            let format = e.target.dataset.format;
            let cursor = e.target.selectionStart;
            if (format === 'uppercase') {
                e.target.value = e.target.value.toUpperCase();
                e.target.setSelectionRange(cursor, cursor);
            } else if (format === 'titlecase') {
                e.target.value = e.target.value.toLowerCase().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                e.target.setSelectionRange(cursor, cursor);
            } else if (format === 'currency') {
                let val = e.target.value.replace(/\D/g, "");
                e.target.value = val !== "" ? val.replace(/\B(?=(\d{3})+(?!\d))/g, ".") : "";
            }
            renderEmail();
        });
    });
    renderEmail();
}

function renderEmail() {
    if (!currentTemplateId) return;
    const template = window.SOC_TEMPLATES[currentTemplateId];
    
    let data = {};
    document.querySelectorAll('.template-input').forEach(input => {
        let key = input.id.replace('field_', '');
        data[key] = input.value || `[${key}]`;
    });
    
    // Khai báo biến danh xưng
    data.honorific = data.gender;
    data.pronoun = (data.gender === 'Doanh Nghiệp') ? 'Quý công ty' : data.gender;
    data.pronounLc = data.pronoun.toLowerCase(); // GIẢI QUYẾT LỖI IN THƯỜNG
    if (data.gender === 'Doanh Nghiệp') data.honorific = 'Quý công ty';

    if (typeof template.computedVars === 'function') {
        Object.assign(data, template.computedVars(data));
    }

    const replaceVars = (text) => text ? text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] !== undefined ? data[key] : match) : "";

    let infoBoxHtml = "";
    if (template.boxContent) {
        let qrSection = "";
        if (template.qrType && SYSTEM_ASSETS[template.qrType]) {
            let asset = SYSTEM_ASSETS[template.qrType];
            qrSection = `<td width="140" align="center" valign="middle" style="padding: 15px; border-left: 1px dashed #cbd5e0;"><a href="${asset.link}" target="_blank" style="text-decoration: none;"><img src="${asset.img}" alt="QR" width="130" style="display: block; max-width: 100%; border: 1px solid #cbd5e0; padding: 4px; background: #fff; border-radius: 4px;"></a></td>`;
        }
        infoBoxHtml = `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f26f21; border-radius: 4px; margin: 15px 0;"><tr><td valign="middle" style="padding: 15px; font-family: 'Aptos', Arial, sans-serif; font-size: 14.5px; color: #2d3748; line-height: 1.6;">${replaceVars(template.boxContent)}</td>${qrSection}</tr></table>`;
    }

    let finalBody = replaceVars(template.body).replace('{INFO_BOX}', infoBoxHtml);
    let agentName = data.staffName !== "[staffName]" ? data.staffName : "[Tên Agent]";
    let finalSig = template.customSignature ? replaceVars(template.customSignature) : `Trân trọng,<br>Em <b>${agentName}</b> – CSKH FPT Telecom.`;

    document.getElementById("emailSubject").innerText = replaceVars(template.subject);
    document.getElementById("emailContent").innerHTML = finalBody;
    document.getElementById("emailSignature").innerHTML = finalSig;
}

function copyEmailContent() {
    const contentHtml = document.getElementById('emailContent').innerHTML;
    const sigHtml = document.getElementById('emailSignature').innerHTML;
    const fullHtml = `<div style="font-family: 'Aptos', Arial, sans-serif; font-size: 14.5px; color: #2d3748;">${contentHtml}<br>${sigHtml}</div>`;
    if (navigator.clipboard && window.ClipboardItem) {
        const blob = new Blob([fullHtml], { type: 'text/html' });
        navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })]).then(() => showToast("Đã copy NỘI DUNG VÀ FORMAT thành công!"));
    }
}
function showToast(msg) {
    const toast = document.getElementById('toast');
    document.getElementById('toast-message').innerText = msg;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3000);
}
