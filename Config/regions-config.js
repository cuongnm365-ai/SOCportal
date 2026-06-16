/* =========================================================
   QUẢN LÝ KHU VỰC & ĐỊA PHƯƠNG - SOC COMMAND CENTER
   Hệ thống tự động detect khu vực dựa trên prefix hợp đồng
   ========================================================= */

// Cấu hình mapping giữa prefix hợp đồng -> tỉnh thành -> khu vực
const REGION_CONFIG = {
    // MIỀN BẮC
    "north": {
        name: "Khu vực Miền Bắc",
        email: "support-north@fpt.vn", // Email CC/BCC mặc định
        provinces: {
            "HN": { name: "Hà Nội", prefixes: ["HN"] },
            "HP": { name: "Hải Phòng", prefixes: ["HP"] },
            "QN": { name: "Quảng Ninh", prefixes: ["QN"] },
            "HB": { name: "Hải Bình", prefixes: ["HB"] },
            "HT": { name: "Hà Tĩnh", prefixes: ["HT", "HTH"] },
            "QB": { name: "Quảng Bình", prefixes: ["QB", "QTB"] },
            "QT": { name: "Quảng Trị", prefixes: ["QT", "QTR"] },
            "TH": { name: "Thanh Hóa", prefixes: ["TH"] },
            "ND": { name: "Nghệ An", prefixes: ["ND", "NA"] },
            "BG": { name: "Bắc Giang", prefixes: ["BG"] },
            "BK": { name: "Bắc Kạn", prefixes: ["BK"] },
            "CL": { name: "Cao Bằng", prefixes: ["CL", "CB"] },
            "LS": { name: "Lạng Sơn", prefixes: ["LS"] },
            "TD": { name: "Tuyên Dương", prefixes: ["TD"] },
            "YB": { name: "Yên Bái", prefixes: ["YB"] },
            "TB": { name: "Thái Bình", prefixes: ["TB"] },
            "TN": { name: "Thái Nguyên", prefixes: ["TN"] }
        }
    },
    // MIỀN NAM
    "south": {
        name: "Khu vực Miền Nam",
        email: "support-south@fpt.vn", // Email CC/BCC mặc định
        provinces: {
            "SG": { name: "Sài Gòn (TP.HCM)", prefixes: ["SG", "SGH", "SGHCM"] },
            "DN": { name: "Đà Nẵng", prefixes: ["DN", "DA", "DAF", "DAFD"] },
            "QN": { name: "Quảng Nam", prefixes: ["QN", "QA", "QAD"] },
            "QG": { name: "Quảng Ngãi", prefixes: ["QG"] },
            "BH": { name: "Bình Định", prefixes: ["BH", "BD"] },
            "PY": { name: "Phú Yên", prefixes: ["PY"] },
            "KH": { name: "Khánh Hòa", prefixes: ["KH"] },
            "NB": { name: "Ninh Bình", prefixes: ["NB"] },
            "NT": { name: "Ninh Thuận", prefixes: ["NT"] },
            "BT": { name: "Bình Thuận", prefixes: ["BT"] },
            "BR": { name: "Bình Dương", prefixes: ["BR", "BD"] },
            "BR": { name: "Bà Rịa Vũng Tàu", prefixes: ["BR", "VT"] },
            "DL": { name: "Đồng Nai", prefixes: ["DL", "DN"] },
            "CT": { name: "Cần Thơ", prefixes: ["CT"] },
            "AG": { name: "An Giang", prefixes: ["AG"] },
            "KG": { name: "Kiên Giang", prefixes: ["KG"] },
            "HG": { name: "Hậu Giang", prefixes: ["HG"] },
            "SL": { name: "Sóc Trăng", prefixes: ["SL", "ST"] },
            "BL": { name: "Bạc Liêu", prefixes: ["BL"] },
            "CL": { name: "Cà Mau", prefixes: ["CL", "CM"] },
            "LA": { name: "Long An", prefixes: ["LA"] },
            "TG": { name: "Tiền Giang", prefixes: ["TG"] },
            "BV": { name: "Bến Tre", prefixes: ["BV", "BT"] },
            "VL": { name: "Vĩnh Long", prefixes: ["VL"] }
        }
    }
};

/**
 * HÀM DETECT KHU VỰC TỬ PREFIX HỢP ĐỒNG
 * @param {string} contractId - Số hợp đồng (ví dụ: "SGH123234", "HTH456", "QAD789")
 * @returns {object} { region, province, regionName, provinceName, email }
 */
function detectRegionFromContract(contractId) {
    if (!contractId || typeof contractId !== 'string') {
        return null;
    }

    const contractUpper = contractId.toUpperCase().trim();
    
    // Tìm kiếm trong cả hai khu vực
    for (const [regionKey, regionData] of Object.entries(REGION_CONFIG)) {
        for (const [provinceKey, provinceData] of Object.entries(regionData.provinces)) {
            for (const prefix of provinceData.prefixes) {
                // Kiểm tra contract có bắt đầu với prefix này không
                if (contractUpper.startsWith(prefix)) {
                    return {
                        region: regionKey,
                        regionName: regionData.name,
                        province: provinceKey,
                        provinceName: provinceData.name,
                        email: regionData.email,
                        prefix: prefix
                    };
                }
            }
        }
    }

    return null; // Không tìm thấy
}

/**
 * LẤY DANH SÁCH TẤT CẢ TỈNH THEO KHU VỰC
 * @param {string} region - "north" hoặc "south"
 * @returns {array} Mảng các tỉnh thành
 */
function getProvincesByRegion(region) {
    if (!REGION_CONFIG[region]) return [];
    
    return Object.entries(REGION_CONFIG[region].provinces).map(([key, data]) => ({
        code: key,
        name: data.name,
        prefixes: data.prefixes
    }));
}

/**
 * LẤY EMAIL REGION
 * @param {string} region - "north" hoặc "south"
 * @returns {string} Email của khu vực
 */
function getRegionEmail(region) {
    return REGION_CONFIG[region]?.email || null;
}

/**
 * CẬP NHẬT EMAIL REGION (cho phép người dùng tùy chỉnh)
 * @param {string} region - "north" hoặc "south"
 * @param {string} email - Email mới
 */
function setRegionEmail(region, email) {
    if (REGION_CONFIG[region]) {
        REGION_CONFIG[region].email = email;
        // Lưu vào localStorage
        localStorage.setItem(`soc_region_email_${region}`, email);
    }
}

/**
 * LOAD CẤU HÌNH REGION TỪ LOCALSTORAGE
 */
function loadRegionConfigFromStorage() {
    for (const region of ['north', 'south']) {
        const savedEmail = localStorage.getItem(`soc_region_email_${region}`);
        if (savedEmail) {
            REGION_CONFIG[region].email = savedEmail;
        }
    }
}

/**
 * KHỞI TẠO CẤU HÌNH REGION MẶC ĐỊNH (NẾU CHƯA CÓ)
 */
function initializeRegionDefaults() {
    if (!localStorage.getItem('soc_region_email_north')) {
        localStorage.setItem('soc_region_email_north', REGION_CONFIG.north.email);
    }
    if (!localStorage.getItem('soc_region_email_south')) {
        localStorage.setItem('soc_region_email_south', REGION_CONFIG.south.email);
    }
}

// Tự động load khi file được import
loadRegionConfigFromStorage();
initializeRegionDefaults();
