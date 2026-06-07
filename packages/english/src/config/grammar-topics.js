// ============================================
// Grammar Topics - Aggregator (14 nhóm ngữ pháp còn lại)
// ============================================
// Song song với grammar-tenses.js (nhóm #1 "Thì động từ").
// Gom 14 file nhóm trong config/grammar/*.js thành:
//   - GrammarGroups: danh sách metadata 14 nhóm (mỗi nhóm có lessons[]) — để render grid.
//   - GrammarLessonContent: nội dung học chi tiết theo lesson id (usage / formula / exercises).
//
// Cấu trúc mỗi nhóm = một "category label" (giống TopicCategories bên từ vựng);
// mỗi lesson bên trong = một "folder" (giống topic folder), link tới trang chi tiết.

import modalVerbs from './grammar/modal-verbs.js';
import passiveVoice from './grammar/passive-voice.js';
import conditionals from './grammar/conditionals.js';
import reportedSpeech from './grammar/reported-speech.js';
import clauses from './grammar/clauses.js';
import gerundsInfinitives from './grammar/gerunds-infinitives.js';
import nounsArticlesQuantifiers from './grammar/nouns-articles-quantifiers.js';
import pronouns from './grammar/pronouns.js';
import adjectivesAdverbs from './grammar/adjectives-adverbs.js';
import prepositions from './grammar/prepositions.js';
import sentenceStructure from './grammar/sentence-structure.js';
import connectors from './grammar/connectors.js';
import questions from './grammar/questions.js';
import specialStructures from './grammar/special-structures.js';

const _modules = [
    modalVerbs,
    passiveVoice,
    conditionals,
    reportedSpeech,
    clauses,
    gerundsInfinitives,
    nounsArticlesQuantifiers,
    pronouns,
    adjectivesAdverbs,
    prepositions,
    sentenceStructure,
    connectors,
    questions,
    specialStructures
];

// Danh sách metadata 14 nhóm (đã sort theo order).
const GrammarGroups = _modules
    .map(m => m.group)
    .sort((a, b) => a.order - b.order);

// Gộp nội dung chi tiết toàn bộ lessons thành 1 map phẳng theo lesson id.
const GrammarLessonContent = _modules.reduce((acc, m) => {
    Object.assign(acc, m.content || {});
    return acc;
}, {});

/**
 * Lấy metadata 1 nhóm theo id.
 */
function getGrammarGroup(id) {
    return GrammarGroups.find(g => g.id === id) || null;
}

/**
 * Lấy metadata 1 lesson + nhóm cha của nó theo lesson id.
 * @returns {{ group, lesson }|null}
 */
function getGrammarLesson(lessonId) {
    for (const group of GrammarGroups) {
        const lesson = (group.lessons || []).find(l => l.id === lessonId);
        if (lesson) return { group, lesson };
    }
    return null;
}

/**
 * Lấy nội dung học chi tiết của 1 lesson (hoặc null nếu chưa có).
 */
function getGrammarLessonContent(lessonId) {
    return GrammarLessonContent[lessonId] || null;
}

export {
    GrammarGroups,
    GrammarLessonContent,
    getGrammarGroup,
    getGrammarLesson,
    getGrammarLessonContent
};
