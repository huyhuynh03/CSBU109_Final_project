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
        id: 'health',
        name: 'Sức khỏe',
        icon: 'health_and_safety',
        category: 'society',
        order: 2
    },
    {
        id: 'education',
        name: 'Giáo dục',
        icon: 'school',
        category: 'society',
        order: 3
    },
    {
        id: 'psychology',
        name: 'Tâm lý',
        icon: 'psychology',
        category: 'society',
        order: 4
    },
    {
        id: 'culture',
        name: 'Văn hóa',
        icon: 'theater_comedy',
        category: 'society',
        order: 5
    },
    {
        id: 'arts',
        name: 'Nghệ thuật',
        icon: 'palette',
        category: 'society',
        order: 6
    },
    {
        id: 'sports',
        name: 'Thể thao',
        icon: 'sports_soccer',
        category: 'society',
        order: 7
    },
    {
        id: 'travel',
        name: 'Du lịch',
        icon: 'flight_takeoff',
        category: 'society',
        order: 8
    },

    // ==========================================
    // Nhóm 2: Kinh tế & Pháp luật
    // ==========================================
    {
        id: 'economy',
        name: 'Kinh tế',
        icon: 'trending_up',
        category: 'business',
        order: 9
    },
    {
        id: 'finance',
        name: 'Tài chính',
        icon: 'account_balance',
        category: 'business',
        order: 10
    },
    {
        id: 'investment',
        name: 'Đầu tư',
        icon: 'show_chart',
        category: 'business',
        order: 11
    },
    {
        id: 'business',
        name: 'Kinh doanh',
        icon: 'business_center',
        category: 'business',
        order: 12
    },
    {
        id: 'law',
        name: 'Luật pháp',
        icon: 'gavel',
        category: 'business',
        order: 13
    },
    {
        id: 'crime',
        name: 'Tội phạm',
        icon: 'local_police',
        category: 'business',
        order: 14
    },
    {
        id: 'politics',
        name: 'Chính trị',
        icon: 'how_to_vote',
        category: 'business',
        order: 15
    },
    {
        id: 'employment',
        name: 'Việc làm',
        icon: 'work',
        category: 'business',
        order: 16
    },
    {
        id: 'urbanization',
        name: 'Đô thị hóa',
        icon: 'location_city',
        category: 'business',
        order: 17
    },

    // ==========================================
    // Nhóm 3: Khoa học & Công nghệ
    // ==========================================
    {
        id: 'environment-climate',
        name: 'Môi trường & Biến đổi khí hậu',
        icon: 'eco',
        category: 'science',
        order: 18
    },
    {
        id: 'energy-resources',
        name: 'Năng lượng & Tài nguyên',
        icon: 'bolt',
        category: 'science',
        order: 19
    },
    {
        id: 'science',
        name: 'Khoa học',
        icon: 'science',
        category: 'science',
        order: 20
    },
    {
        id: 'information-technology',
        name: 'Công nghệ thông tin',
        icon: 'computer',
        category: 'science',
        order: 21
    },
    {
        id: 'space',
        name: 'Vũ trụ',
        icon: 'rocket_launch',
        category: 'science',
        order: 22
    },

    // ==========================================
    // Nhóm 4: IELTS Topics (Tiếng Anh)
    // ==========================================
    {
        id: 'travel-tourism',
        name: 'Du lịch & Ngành du lịch',
        icon: 'luggage',
        category: 'ielts',
        order: 23
    },
    {
        id: 'arts-literature',
        name: 'Nghệ thuật & Văn học',
        icon: 'auto_stories',
        category: 'ielts',
        order: 24
    },
    {
        id: 'music-entertainment',
        name: 'Âm nhạc & Giải trí',
        icon: 'music_note',
        category: 'ielts',
        order: 25
    },
    {
        id: 'sports-games',
        name: 'Thể thao & Trò chơi',
        icon: 'sports_esports',
        category: 'ielts',
        order: 26
    },
    {
        id: 'history-archeology',
        name: 'Lịch sử & Khảo cổ học',
        icon: 'history_edu',
        category: 'ielts',
        order: 27
    },
    {
        id: 'cultural-differences',
        name: 'Khác biệt văn hóa',
        icon: 'public',
        category: 'ielts',
        order: 28
    },

    // ==========================================
    // Nhóm 5: Idiom
    // ==========================================
    {
        id: 'idioms',
        name: 'Thành ngữ',
        icon: 'format_quote',
        category: 'idiom',
        order: 29
    }
];

// Category labels
const TopicCategories = {
    society: { label: 'Xã hội & Đời sống', icon: 'groups', order: 1 },
    business: { label: 'Kinh tế & Pháp luật', icon: 'business', order: 2 },
    science: { label: 'Khoa học & Công nghệ', icon: 'biotech', order: 3 },
    ielts: { label: 'Văn hóa & Giải trí', icon: 'celebration', order: 4 },
    idiom: { label: 'Idiom', icon: 'format_quote', order: 5 }
};
