/* =========================================================
   BỘ NÃO XỬ LÝ (ENGINE) - SOC COMMAND CENTER
   Cập nhật: Quản lý Tab qua Sidebar, Phân luồng CC/BCC
   ========================================================= */

const SYSTEM_ASSETS = {
    "cai_dat": { img: "Images/Picture/cai-dat-nhanh.jpg", link: "https://hi.fpt.vn/rev/lbq/P3M3JDZB" },
    "theo_doi_ktv": { img: "Images/Picture/theo-doi-KTV.jpg", link: "https://hi.fpt.vn/rev/lbq/P3M3JDZB" },
    "thanh_toan": { img: "Images/Picture/thanh-toan-nhanh.jpg", link: "https://hi.fpt.vn/rev/fbu/1dnN3BoM" },
    "bao_hong": { img: "Images/Picture/bao-hong-nhanh.jpg", link: "https://hi.fpt.vn/rev/esv/Mq9r4jlG" }
};

window.SOC_TEMPLATES = window.SOC_TEMPLATES || {};
let currentTemplateId = "";

// Cấu hình mặc định nếu chưa lưu
let socSettings = {
    defaultBcc: "",
    mn: { prefixes: "SGH, BDD", emails: "" },
    mb: { prefixes: "HNFD, HND, HNSH, HTH, TQG", emails: "" }
};

document.addEventListener("DOMContentLoaded", () => {
    // 1. Tải Cài Đặt từ LocalStorage
    loadSettings();

    // 2. Nạp Template vào menu thả xuống
    const selector = document.getElementById("templateSelector");
    selector.innerHTML = '<option value="">-- Chọn nghiệp vụ / Mẫu email phục vụ --</option>';
    for (const [id, template] of Object.entries(window.SOC_TEMPLATES)) {
        selector.innerHTML += `<option value="${id}">${template.name}</option>`;
    }
    selector.addEventListener("change", (e) => {
        currentTemplateId = e.target.value;
        renderForm(currentTemplateId);
    });

    // 3. Đăng ký sự kiện Nút bấm
    document.getElementById("btnReset").addEventListener("click", () => renderForm(currentTemplateId));
    document.getElementById("btnCopy").addEventListener("click", copyEmailContent);
    document.getElementById("btnSaveSettings").addEventListener("click", saveSettings);

    // 4. Logic Chuyển Menu trên Sidebar
    document.getElementById("navMainBtn").addEventListener("click", () => switchMenu('main'));
    document.getElementById("navSettingsBtn").addEventListener("click", () => switchMenu('settings'));
});

// Hàm chuyển đổi giao diện và CSS cho Sidebar
function switchMenu(menuName) {
    const navMain = document.getElementById("navMainBtn");
    const navSet = document.getElementById("navSettingsBtn");
    const tabMain = document.getElementById("tabMain");
    const tabSettings = document.getElementById("tabSettings");

    const activeStyle = "background: linear-gradient(90deg, rgba(167, 139, 250, 0.15), transparent); border-left: 4px solid #a78bfa;";
    const activeTextClass = "text-indigo-700";
    const inactiveTextClass = "text-slate-500";

    if (menuName === 'main') {
        tabMain.classList.remove("hidden");
        tabSettings.classList.add("hidden");

        // Styling Menu Vận Hành
        navMain.style.cssText = activeStyle;
        navMain.classList.remove(inactiveTextClass, "hover:bg-slate-100", "hover:text-slate-700", "border-transparent");
        navMain.classList.add(activeTextClass, "shadow-sm");

        // Reset Menu Cài Đặt
        navSet.style.cssText = "";
        navSet.classList.remove(activeTextClass, "shadow-sm");
        navSet.classList.add(inactiveTextClass, "hover:bg-slate-100", "hover:text-slate-700", "border-transparent");
    } else {
        tabSettings.classList.remove("hidden");
        tabMain.classList.add("hidden");

        // Styling Menu Cài Đặt
        navSet.style.cssText = activeStyle;
        navSet.classList.remove(inactiveTextClass, "hover:bg-slate-100", "hover:text-slate-700", "border-transparent");
        navSet.classList.add(activeTextClass, "shadow-sm");

        // Reset Menu Vận Hành
        navMain.style.cssText = "";
        navMain.classList.remove(activeTextClass, "shadow-sm");
        navMain.classList.add(inactiveTextClass, "hover:bg-slate-100", "hover:text-slate-700", "border-transparent");
    }
}

function loadSettings() {
    const saved = localStorage.getItem("soc_settings_v2");
    if (saved) {
        socSettings = JSON.parse(saved);
    }
    document.getElementById("setting_bcc").value = socSettings.defaultBcc || "";
    document.getElementById("setting_mn_prefix").value = socSettings.mn.prefixes || "";
    document.getElementById("setting_mn_email").value = socSettings.mn.emails || "";
    document.getElementById("setting_mb_prefix").value = socSettings.mb.prefixes || "";
    document.getElementById("setting_mb_email").value = socSettings.mb.emails || "";
}

function saveSettings() {
    socSettings.defaultBcc = document.getElementById("setting_bcc").value.trim();
    socSettings.mn.prefixes = document.getElementById("setting_mn_prefix").value.trim();
    socSettings.mn.emails = document.getElementById("setting_mn_email").value.trim();
    socSettings.mb.prefixes = document.getElementById("setting_mb_prefix").value.trim();
    socSettings.mb.emails = document.getElementById("setting_mb_email").value.trim();
    localStorage.setItem("soc_settings_v2", JSON.stringify(socSettings));
    showToast("Đã lưu Cấu hình Biến hệ thống thành công!");
    renderEmail(); // Load lại Preview để ăn ngay CC/BCC
}

// Hàm nhận diện tự động Email vùng miền từ Số Hợp Đồng
function getRegionEmail(contractId) {
    if (!contractId || contractId.includes('[')) return "";
    const cid = contractId.toUpperCase().trim();
    
    const checkMatch = (prefixStr) => {
        if (!prefixStr) return false;
        const prefixes = prefixStr.split(',').map(p => p.trim().toUpperCase()).filter(p => p);
        return prefixes.some(p => cid.startsWith(p));
    };

    if (checkMatch(socSettings.mn.prefixes)) return socSettings.mn.emails;
    if (checkMatch(socSettings.mb.prefixes)) return socSettings.mb.emails;
    return "";
}

function renderForm(templateId) {
    const formContainer = document.getElementById("dynamicForm");
    const template = window.SOC_TEMPLATES[templateId];
    
    if (!template) {
        formContainer.innerHTML = '<p class="text-center text-slate-400 text-sm italic py-10 font-medium">Vui lòng chọn một mẫu để hệ thống tự động lắp ráp Form...</p>';
        document.getElementById("emailSubject").innerText = "";
        document.getElementById("emailContent").innerHTML = "<div class='text-center text-slate-300 mt-20 italic text-sm font-medium'>Nội dung email sẽ xuất hiện tại đây...</div>";
        document.getElementById("emailSignature").innerHTML = "";
        document.getElementById("bccWrapper").classList.add("hidden");
        document.getElementById("ccWrapper").classList.add("hidden");
        return;
    }

    const savedAgentName = localStorage.getItem("soc_agent_name") || "";
    
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
    
    data.honorific = data.gender;
    data.pronoun = (data.gender === 'Doanh Nghiệp') ? 'Quý công ty' : data.gender;
    data.pronounLc = data.pronoun.toLowerCase();
    if (data.gender === 'Doanh Nghiệp') data.honorific = 'Quý công ty';

    if (typeof template.computedVars === 'function') {
        Object.assign(data, template.computedVars(data));
    }

    /* ---- TỰ ĐỘNG XỬ LÝ CC / BCC VÙNG MIỀN ---- */
    const isInternal = template.isInternal === true;
    const regionEmail = getRegionEmail(data.contractId || "");
    const defaultBcc = socSettings.defaultBcc || "";
    
    const bccWrapper = document.getElementById("bccWrapper");
    const ccWrapper = document.getElementById("ccWrapper");

    if (isInternal) {
        // Nội bộ: Chỉ CC địa chỉ Email Miền (Ẩn BCC)
        bccWrapper.classList.add("hidden");
        if (regionEmail) {
            ccWrapper.classList.remove("hidden");
            document.getElementById("emailCC").innerText = regionEmail;
        } else {
            ccWrapper.classList.add("hidden");
        }
    } else {
        // Bên ngoài: BCC địa chỉ Default + Địa chỉ Email Miền (Ẩn CC)
        ccWrapper.classList.add("hidden");
        let bccList = [];
        if (defaultBcc) bccList.push(defaultBcc);
        if (regionEmail) bccList.push(regionEmail);
        
        if (bccList.length > 0) {
            bccWrapper.classList.remove("hidden");
            document.getElementById("emailBCC").innerText = bccList.join(", ");
        } else {
            bccWrapper.classList.add("hidden");
        }
    }
    /* ------------------------------------------- */

    const replaceVars = (text) => text ? text.replace(/\{\{(\w+)\}\}/g, (match, key) => data[key] !== undefined ? data[key] : match) : "";

    let infoBoxHtml = "";
    if (template.boxContent) {
        let qrSection = "";
        if (template.qrType && SYSTEM_ASSETS[template.qrType]) {
            let asset = SYSTEM_ASSETS[template.qrType];
            qrSection = `<td width="140" align="center" valign="middle" style="padding: 15px; border-left: 1px dashed #cbd5e0;"><a href="${asset.link}" target="_blank" style="text-decoration: none;"><img src="${asset.img}" alt="QR" width="130" style="display: block; max-width: 100%; border: 1px solid #cbd5e0; padding: 4px; background: #fff; border-radius: 4px;"></a></td>`;
        }
        infoBoxHtml = `<table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #f26f21; border-radius: 4px; margin: 15px 0;"><tr><td valign="middle" style="padding: 15px; font-family: inherit; font-size: 14.5px; color: #2d3748; line-height: 1.6;">${replaceVars(template.boxContent)}</td>${qrSection}</tr></table>`;
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
