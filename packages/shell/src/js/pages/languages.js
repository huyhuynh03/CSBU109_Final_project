// ============================================
// Language Domain Registry (derived view)
// (Trang /languages đã bị gỡ — UI chọn ngôn ngữ giờ hiển thị trực tiếp ở Dashboard.)
//
// Phase 4: `languageDomains` KHÔNG còn hardcode. Nó là một getter map từ
// ModuleLoader registry (modules-registry.json) — single source of truth.
// HomePage._renderLanguageDomainCards() đọc qua đây.
//
// Khi thêm ngôn ngữ mới: chỉ cần thêm entry vào modules-registry.json,
// dashboard + sidebar tự cập nhật, không sửa file này.
// ============================================

const LanguagesPage = {
    /**
     * Danh sách domain ngôn ngữ để render card ở Dashboard.
     * Map từ registry entries → shape mà card UI cần.
     * @returns {Array<{id,name,nameNative,flagLabel,icon,color,colorGradient,description,route,available}>}
     */
    get languageDomains() {
        // Đọc từ registry nếu ModuleLoader đã loadRegistry()
        if (window.ModuleLoader && typeof window.ModuleLoader.getAllModules === 'function') {
            const entries = window.ModuleLoader.getAllModules();
            if (entries.length) {
                return entries.map(entry => ({
                    id: entry.id,
                    name: entry.meta?.name || entry.id,
                    nameNative: entry.meta?.nameNative || '',
                    flagLabel: entry.meta?.flagLabel || entry.id.slice(0, 2).toUpperCase(),
                    icon: entry.meta?.icon || 'translate',
                    color: entry.meta?.color || '#6C63FF',
                    colorGradient: entry.meta?.colorGradient || 'linear-gradient(135deg, #6C63FF 0%, #5A52E0 100%)',
                    description: entry.meta?.description || '',
                    route: entry.defaultRoute || `/${entry.id}`,
                    available: !!entry.available
                }));
            }
        }

        // Fallback an toàn (registry chưa load) — chỉ English
        return [
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
        ];
    }
};


export default LanguagesPage;
