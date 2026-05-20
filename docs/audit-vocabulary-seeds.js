#!/usr/bin/env node

// ============================================
// Audit Vocabulary Seeds - Thống kê từ vựng từ seed files
// ============================================
// Chạy: node docs/audit-vocabulary-seeds.js

const fs = require('fs');
const path = require('path');

async function auditVocabularySeeds() {
    console.log('🔍 Bắt đầu thống kê từ vựng từ seed files...\n');
    
    try {
        const seedDir = path.join(__dirname, '../public/seed-vocabulary');
        const dataDir = path.join(__dirname, '../data/seed-vocabulary');
        
        const stats = {};
        let totalWords = 0;
        
        // Hàm đọc file JSON và lấy số lượng cards
        const getCardCount = (filePath) => {
            try {
                const content = fs.readFileSync(filePath, 'utf8');
                const data = JSON.parse(content);
                
                // Nếu là array trực tiếp
                if (Array.isArray(data)) {
                    return data.length;
                }
                
                // Nếu là object có property 'cards'
                if (data && data.cards && Array.isArray(data.cards)) {
                    return data.cards.length;
                }
                
                // Nếu là object có property '_meta' với 'totalCards'
                if (data && data._meta && typeof data._meta.totalCards === 'number') {
                    return data._meta.totalCards;
                }
                
                return 0;
            } catch (error) {
                return 0;
            }
        };
        
        // Thống kê từ public/seed-vocabulary
        console.log('📂 Quét thư mục: public/seed-vocabulary\n');
        
        if (fs.existsSync(seedDir)) {
            const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.json'));
            
            files.forEach(file => {
                const filePath = path.join(seedDir, file);
                const topicName = file.replace('.json', '');
                const count = getCardCount(filePath);
                
                if (count > 0) {
                    stats[topicName] = {
                        public: count,
                        data: 0,
                        total: count
                    };
                    totalWords += count;
                }
            });
        }
        
        // Thống kê từ data/seed-vocabulary
        console.log('📂 Quét thư mục: data/seed-vocabulary\n');
        
        if (fs.existsSync(dataDir)) {
            const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.json'));
            
            files.forEach(file => {
                const filePath = path.join(dataDir, file);
                const topicName = file.replace('.json', '');
                const count = getCardCount(filePath);
                
                if (count > 0) {
                    if (!stats[topicName]) {
                        stats[topicName] = {
                            public: 0,
                            data: count,
                            total: count
                        };
                    } else {
                        stats[topicName].data = count;
                        stats[topicName].total = Math.max(stats[topicName].public, count);
                    }
                    
                    if (!stats[topicName].public) {
                        totalWords += count;
                    }
                }
            });
        }
        
        // Sắp xếp theo số lượng từ
        const sortedTopics = Object.entries(stats)
            .sort((a, b) => b[1].total - a[1].total);
        
        // In bảng thống kê
        console.log('📊 THỐNG KÊ TỪ VỰNG THEO TOPIC\n');
        console.log('┌─ Topic'.padEnd(45) + '│ Public │ Data │ Total');
        console.log('├' + '─'.repeat(43) + '┼────────┼──────┼──────');
        
        sortedTopics.forEach(([topic, counts]) => {
            const status = counts.public === counts.data ? '✅' : '⚠️ ';
            console.log(
                status + ' ' + topic.padEnd(42) + 
                '│ ' + counts.public.toString().padEnd(5) + 
                '│ ' + counts.data.toString().padEnd(4) + 
                '│ ' + counts.total
            );
        });
        
        console.log('├' + '─'.repeat(43) + '┼────────┼──────┼──────');
        
        const totalPublic = Object.values(stats).reduce((sum, s) => sum + s.public, 0);
        const totalData = Object.values(stats).reduce((sum, s) => sum + s.data, 0);
        
        console.log(
            '  TỔNG'.padEnd(45) + 
            '│ ' + totalPublic.toString().padEnd(5) + 
            '│ ' + totalData.toString().padEnd(4) + 
            '│ ' + totalWords
        );
        console.log('└' + '─'.repeat(43) + '┴────────┴──────┴──────');
        
        // Phát hiện sự chênh lệch
        console.log('\n\n' + '='.repeat(70));
        console.log('⚠️  PHÁT HIỆN SỰ CHÊNH LỆCH');
        console.log('='.repeat(70) + '\n');
        
        const discrepancies = sortedTopics.filter(([_, counts]) => counts.public !== counts.data);
        
        if (discrepancies.length > 0) {
            discrepancies.forEach(([topic, counts]) => {
                console.log(`❌ ${topic}`);
                console.log(`   Public: ${counts.public} | Data: ${counts.data}`);
                
                if (counts.public > counts.data) {
                    console.log(`   ⚠️  public/seed-vocabulary có ${counts.public - counts.data} từ THÊM`);
                } else {
                    console.log(`   ⚠️  data/seed-vocabulary có ${counts.data - counts.public} từ THÊM`);
                }
                console.log();
            });
        } else {
            console.log('✅ Tất cả topics đều khớp giữa public và data!');
        }
        
        // Topics chỉ có trong một thư mục
        console.log('\n' + '='.repeat(70));
        console.log('📁 TOPICS CHỈ CÓ TRONG MỘT THƯ MỤC');
        console.log('='.repeat(70) + '\n');
        
        const onlyPublic = sortedTopics.filter(([_, counts]) => counts.data === 0);
        const onlyData = sortedTopics.filter(([_, counts]) => counts.public === 0);
        
        if (onlyPublic.length > 0) {
            console.log('📂 Chỉ có trong public/seed-vocabulary:');
            onlyPublic.forEach(([topic, counts]) => {
                console.log(`   - ${topic}: ${counts.public} từ`);
            });
            console.log();
        }
        
        if (onlyData.length > 0) {
            console.log('📂 Chỉ có trong data/seed-vocabulary:');
            onlyData.forEach(([topic, counts]) => {
                console.log(`   - ${topic}: ${counts.data} từ`);
            });
            console.log();
        }
        
        // Tóm tắt
        console.log('\n' + '='.repeat(70));
        console.log('📈 TÓM TẮT');
        console.log('='.repeat(70));
        console.log(`\n✅ Tổng topics: ${sortedTopics.length}`);
        console.log(`📚 Tổng từ vựng: ${totalWords}`);
        console.log(`⚠️  Topics có chênh lệch: ${discrepancies.length}`);
        console.log(`📁 Topics chỉ ở public: ${onlyPublic.length}`);
        console.log(`📁 Topics chỉ ở data: ${onlyData.length}`);
        
        // Lưu kết quả ra file
        const result = {
            timestamp: new Date().toISOString(),
            totalTopics: sortedTopics.length,
            totalWords,
            discrepancies: discrepancies.length,
            onlyInPublic: onlyPublic.length,
            onlyInData: onlyData.length,
            stats: Object.fromEntries(sortedTopics)
        };
        
        const resultPath = path.join(__dirname, 'audit-vocabulary-seeds-result.json');
        fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));
        
        console.log(`\n💾 Kết quả lưu tại: ${resultPath}`);
        console.log('\n✅ Hoàn thành!');
        
        return result;
        
    } catch (error) {
        console.error('❌ Lỗi:', error);
        process.exit(1);
    }
}

auditVocabularySeeds();
