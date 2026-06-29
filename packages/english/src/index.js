/**
 * English Module Entry Point
 *
 * Exports default an object following the Module Contract:
 * (xem plans/microfrontend-architecture.md mục 3)
 *
 * Each internal file is imported here and assigned to window.* for
 * backward-compatibility — files reference each other via globals
 * (e.g., vocabulary.js calls Router.navigate, FirestoreDB.getCards).
 *
 * The shell will dynamic import() this module when user enters /english/*
 * and call install(host) to wire up routes + sidebar.
 */

// ============================================
// Config
// ============================================
import CardSchemas from './config/card-schemas.js';
window.CardSchemas = CardSchemas;

import { VocabularyTopics, TopicCategories } from './config/vocabulary-topics.js';
window.VocabularyTopics = VocabularyTopics;
window.TopicCategories = TopicCategories;

import { GrammarTenses, GrammarTenseContent } from './config/grammar-tenses.js';
window.GrammarTenses = GrammarTenses;
window.GrammarTenseContent = GrammarTenseContent;

import {
    GrammarGroups,
    GrammarLessonContent,
    getGrammarGroup,
    getGrammarLesson,
    getGrammarLessonContent
} from './config/grammar-topics.js';
window.GrammarGroups = GrammarGroups;
window.GrammarLessonContent = GrammarLessonContent;
window.getGrammarGroup = getGrammarGroup;
window.getGrammarLesson = getGrammarLesson;
window.getGrammarLessonContent = getGrammarLessonContent;

// ============================================
// Utils
// ============================================
import FamilyWordManager from './utils/family-word-manager.js';
window.FamilyWordManager = FamilyWordManager;

import SeedImporter from './utils/seed-importer.js';
window.SeedImporter = SeedImporter;

// ============================================
// FSRS extensions specific to English module
// ============================================
import BqtV2Cleanup from './fsrs/bqt-v2-cleanup.js';
window.BqtV2Cleanup = BqtV2Cleanup;

import ContentRulesCleanup from './fsrs/content-rules-cleanup.js';
window.ContentRulesCleanup = ContentRulesCleanup;

import MergedPosCleanup from './fsrs/merged-pos-cleanup.js';
window.MergedPosCleanup = MergedPosCleanup;

import CardModeManager from './fsrs/card-mode-manager.js';
window.CardModeManager = CardModeManager;

// ============================================
// UI components specific to English
// ============================================
import CardFilter from './ui/card-filter.js';
window.CardFilter = CardFilter;

// ============================================
// Pages
// ============================================
import VocabularyPage from './pages/vocabulary.js';
window.VocabularyPage = VocabularyPage;

import TopicDetailPage from './pages/topic-detail.js';
window.TopicDetailPage = TopicDetailPage;

import GrammarPage from './pages/grammar.js';
window.GrammarPage = GrammarPage;

import GrammarTensePage from './pages/grammar-tense.js';
window.GrammarTensePage = GrammarTensePage;

import GrammarLessonPage from './pages/grammar-lesson.js';
window.GrammarLessonPage = GrammarLessonPage;

import StudyPage from './pages/study.js';
window.StudyPage = StudyPage;

import ReviewPage from './pages/review.js';
window.ReviewPage = ReviewPage;

// ============================================
// Module Contract
// ============================================
const EnglishModule = {
    id: 'english',
    version: '1.0.0',

    meta: {
        name: 'Tiếng Anh',
        nameNative: 'English',
        flagLabel: 'EN',
        icon: 'translate',
        color: '#3B82F6',
        colorGradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
        description: 'Học từ vựng, ngữ pháp và giao tiếp tiếng Anh'
    },

    basePath: '/english',
    defaultRoute: '/english/vocabulary',

    sidebarItems: [
        { id: 'en-vocab', icon: 'menu_book', label: 'Từ vựng', route: '/english/vocabulary' },
        { id: 'en-grammar', icon: 'school', label: 'Ngữ pháp', route: '/english/grammar' }
    ],

    routes: [
        { path: '/english/vocabulary', page: VocabularyPage },
        { path: '/english/grammar', page: GrammarPage },
        { path: '/english/grammar/tense/:id', page: GrammarTensePage },
        { path: '/english/grammar/lesson/:id', page: GrammarLessonPage },
        { path: '/english/topic/:id', page: TopicDetailPage },
        { path: '/english/study', page: StudyPage },
        { path: '/english/review', page: ReviewPage }
    ],

    /**
     * Lifecycle hook: called by shell after loading bundle.
     * Use this for one-time setup (CSS injection, listeners, FSRS init...).
     */
    async install(host) {
        // FamilyWordManager auto-cleans legacy keys on import (already done).
        // BqtV2Cleanup runs on user login (hooked elsewhere).
        // No additional setup needed for monorepo Phase 3.
        console.log('[EnglishModule] Installed (v1.0.0)');
    },

    /**
     * Lifecycle hook: called by shell when user switches to a different language.
     * Use this for cleanup (remove CSS, abort fetches, clear timers).
     */
    async uninstall() {
        console.log('[EnglishModule] Uninstalled');
    }
};

export default EnglishModule;
