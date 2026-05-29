// ============================================
// Vocabulary Topics - Danh sách chủ đề từ vựng
// ============================================

const VocabularyTopics = [
    // ==========================================
    // Nhóm 1: Xã hội & Đời sống
    // ==========================================
    {
        id: 'family-relationships',
        name: 'Gia đình & Các mối quan hệ',
        icon: 'family_restroom',
        category: 'society',
        order: 1
    },
    {
        id: 'daily-life',
        name: 'Đời sống hằng ngày',
        icon: 'wb_sunny',
        category: 'society',
        order: 2
    },
    {
        id: 'home-living',
        name: 'Nhà cửa & Sinh hoạt',
        icon: 'home',
        category: 'society',
        order: 3
    },
    {
        id: 'food-drink',
        name: 'Ẩm thực & Đồ uống',
        icon: 'restaurant',
        category: 'society',
        order: 4
    },
    {
        id: 'daily-activities',
        name: 'Hoạt động hằng ngày',
        icon: 'event_available',
        category: 'society',
        order: 5
    },
    {
        id: 'communication-social',
        name: 'Giao tiếp & Xã hội',
        icon: 'forum',
        category: 'society',
        order: 6
    },
    {
        id: 'personal-qualities',
        name: 'Phẩm chất cá nhân',
        icon: 'badge',
        category: 'society',
        order: 7
    },
    {
        id: 'emotion-feelings',
        name: 'Cảm xúc & Cảm giác',
        icon: 'mood',
        category: 'society',
        order: 8
    },
    {
        id: 'health',
        name: 'Sức khỏe',
        icon: 'health_and_safety',
        category: 'society',
        order: 9
    },
    {
        id: 'education',
        name: 'Giáo dục',
        icon: 'school',
        category: 'society',
        order: 10
    },
    {
        id: 'psychology',
        name: 'Tâm lý & Nhận thức',
        icon: 'psychology',
        category: 'society',
        order: 11
    },
    {
        id: 'culture',
        name: 'Văn hóa',
        icon: 'theater_comedy',
        category: 'society',
        order: 12
    },
    {
        id: 'arts',
        name: 'Nghệ thuật',
        icon: 'palette',
        category: 'society',
        order: 13
    },
    {
        id: 'literature-reading',
        name: 'Văn học & Đọc hiểu',
        icon: 'menu_book',
        category: 'society',
        order: 14
    },
    {
        id: 'media-entertainment',
        name: 'Truyền thông & Giải trí',
        icon: 'live_tv',
        category: 'society',
        order: 15
    },
    {
        id: 'sports',
        name: 'Thể thao',
        icon: 'sports_soccer',
        category: 'society',
        order: 16
    },
    {
        id: 'travel',
        name: 'Du lịch',
        icon: 'flight_takeoff',
        category: 'society',
        order: 17
    },

    // ==========================================
    // Nhóm 2: Kinh tế & Pháp luật
    // ==========================================
    {
        id: 'economy',
        name: 'Kinh tế',
        icon: 'trending_up',
        category: 'business',
        order: 18
    },
    {
        id: 'finance',
        name: 'Tài chính',
        icon: 'account_balance',
        category: 'business',
        order: 19
    },
    {
        id: 'investment',
        name: 'Đầu tư',
        icon: 'show_chart',
        category: 'business',
        order: 20
    },
    {
        id: 'business',
        name: 'Kinh doanh',
        icon: 'business_center',
        category: 'business',
        order: 21
    },
    {
        id: 'law',
        name: 'Luật pháp',
        icon: 'gavel',
        category: 'business',
        order: 22
    },
    {
        id: 'crime',
        name: 'Tội phạm',
        icon: 'local_police',
        category: 'business',
        order: 23
    },
    {
        id: 'politics',
        name: 'Chính trị',
        icon: 'how_to_vote',
        category: 'business',
        order: 24
    },
    {
        id: 'employment',
        name: 'Việc làm',
        icon: 'work',
        category: 'business',
        order: 25
    },
    {
        id: 'urbanization',
        name: 'Đô thị hóa',
        icon: 'location_city',
        category: 'business',
        order: 26
    },

    // ==========================================
    // Nhóm 3: Khoa học & Công nghệ
    // ==========================================
    {
        id: 'environment-climate',
        name: 'Môi trường & Biến đổi khí hậu',
        icon: 'eco',
        category: 'science',
        order: 27
    },
    {
        id: 'energy-resources',
        name: 'Năng lượng & Tài nguyên',
        icon: 'bolt',
        category: 'science',
        order: 28
    },
    {
        id: 'science',
        name: 'Khoa học',
        icon: 'science',
        category: 'science',
        order: 29
    },
    {
        id: 'mathematics',
        name: 'Toán học',
        icon: 'calculate',
        category: 'science',
        order: 30
    },
    {
        id: 'biology',
        name: 'Sinh học',
        icon: 'biotech',
        category: 'science',
        order: 31
    },
    {
        id: 'chemistry',
        name: 'Hóa học',
        icon: 'science',
        category: 'science',
        order: 32
    },
    {
        id: 'physics',
        name: 'Vật lý',
        icon: 'speed',
        category: 'science',
        order: 33
    },
    {
        id: 'information-technology',
        name: 'Công nghệ thông tin',
        icon: 'computer',
        category: 'science',
        order: 34
    },
    {
        id: 'space',
        name: 'Vũ trụ',
        icon: 'rocket_launch',
        category: 'science',
        order: 35
    },

    // ==========================================
    // Nhóm 4: IELTS Topics (Tiếng Anh)
    // ==========================================
    {
        id: 'history-archeology',
        name: 'Lịch sử & Khảo cổ học',
        icon: 'history_edu',
        category: 'ielts',
        order: 36
    },

    // ==========================================
    // Nhóm 5: Idiom
    // ==========================================
    {
        id: 'idioms',
        name: 'Thành ngữ',
        icon: 'format_quote',
        category: 'idiom',
        order: 37
    },

    // ==========================================
    // Nhóm 6: Bất quy tắc (mỗi dạng một topic)
    // ==========================================
    {
        id: 'irregular-verb-v1',
        name: 'Động từ BQT – V1 (Nguyên mẫu)',
        icon: 'bolt',
        category: 'irregular',
        order: 38
    },
    {
        id: 'irregular-verb-v2',
        name: 'Động từ BQT – V2 (Quá khứ đơn)',
        icon: 'history',
        category: 'irregular',
        order: 39
    },
    {
        id: 'irregular-verb-v3',
        name: 'Động từ BQT – V3 (Quá khứ phân từ)',
        icon: 'timelapse',
        category: 'irregular',
        order: 40
    },
    {
        id: 'irregular-adj-comparative',
        name: 'Irregular Comparison Comparative (So sánh hơn bất quy tắc)',
        icon: 'trending_up',
        category: 'irregular',
        order: 41
    },
    {
        id: 'irregular-adj-superlative',
        name: 'Irregular Comparison Superlative (So sánh nhất bất quy tắc)',
        icon: 'emoji_events',
        category: 'irregular',
        order: 42
    }
];

// Category labels
const TopicCategories = {
    society: { label: 'Xã hội & Đời sống', icon: 'groups', order: 1 },
    business: { label: 'Kinh tế & Pháp luật', icon: 'business', order: 2 },
    science: { label: 'Khoa học & Công nghệ', icon: 'biotech', order: 3 },
    ielts: { label: 'Văn hóa & Giải trí', icon: 'celebration', order: 4 },
    idiom: { label: 'Idiom', icon: 'format_quote', order: 5 },
    irregular: { label: 'Bất quy tắc', icon: 'swap_horiz', order: 6 }
};


export { VocabularyTopics, TopicCategories };
