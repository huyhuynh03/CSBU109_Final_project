// ============================================
// Language Domain Registry
// (Trang /languages đã bị gỡ — UI chọn ngôn ngữ giờ hiển thị trực tiếp ở Dashboard.)
// File này chỉ giữ lại bảng `languageDomains` để HomePage và Sidebar tham chiếu.
// ============================================

const LanguagesPage = {
    languageDomains: [
        {
            id: 'english',
            name: 'Tiếng Anh',
            nameNative: 'English',
            flagLabel: 'EN',
            icon: 'translate',
            color: '#3B82F6',
            colorGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
            description: 'Học từ vựng, ngữ pháp và giao tiếp tiếng Anh',
            route: '/english/vocabulary',
            available: true
        }
        // Các ngôn ngữ khác sẽ thêm vào đây khi ra mắt.
    ]
};
