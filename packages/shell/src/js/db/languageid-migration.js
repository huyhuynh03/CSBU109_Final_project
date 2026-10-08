// ============================================
// LanguageId Migration — backfill languageId='english' for legacy cards
// ============================================
// Phase 2.5: Cards/folders created before the multi-language refactor
// don't have a `languageId` field. This migration tags them all as 'english'.
// Idempotent: uses a localStorage flag, only runs once per user.
// ============================================

const LanguageIdMigration = {
    VERSION_KEY: 'lf_languageid_migration_v1',

    /**
     * Check if migration already ran for this user
     * @param {string} userId
     * @returns {boolean}
     */
    _isDone(userId) {
        try {
            return localStorage.getItem(`${this.VERSION_KEY}_${userId}`) === '1';
        } catch (e) {
            return false;
        }
    },

    _markDone(userId) {
        try {
            localStorage.setItem(`${this.VERSION_KEY}_${userId}`, '1');
        } catch (e) {
            console.warn('[LanguageIdMigration] Cannot persist migration flag:', e);
        }
    },

    /**
     * Run migration if not done yet.
     * Tags every card without `languageId` as `english`.
     */
    async run() {
        const user = (typeof Auth !== 'undefined') ? Auth.currentUser : null;
        if (!user) return;
        if (this._isDone(user.uid)) return;

        try {
            const ref = FirestoreDB._userCollection('cards');
            if (!ref) return;

            const snapshot = await ref.get();
            if (snapshot.empty) {
                this._markDone(user.uid);
                return;
            }

            const batchSize = 400; // Firestore limit is 500
            let batch = db.batch();
            let inBatch = 0;
            let updated = 0;

            for (const doc of snapshot.docs) {
                const data = doc.data();
                if (data.languageId) continue; // already tagged

                batch.update(doc.ref, { languageId: 'english' });
                inBatch++;
                updated++;

                if (inBatch >= batchSize) {
                    await batch.commit();
                    batch = db.batch();
                    inBatch = 0;
                }
            }

            if (inBatch > 0) {
                await batch.commit();
            }

            console.log(`[LanguageIdMigration] Tagged ${updated}/${snapshot.size} cards as english`);
            this._markDone(user.uid);
        } catch (e) {
            console.error('[LanguageIdMigration] Migration failed:', e);
        }
    }
};


export default LanguageIdMigration;
