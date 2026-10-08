// ============================================
// FSRS Migration - Map stability cũ -> stepIndex mới
// ============================================
// Áp dụng cho các thẻ đã học trước khi có field stepIndex.
// Mapping (theo phân loại của user):
//   stability ~ 10            -> bậc 0 (30 phút)
//   stability ~ 1440 (1 ngày) -> bậc 1 (24 giờ)
//   stability ~ 4320 (3 ngày) -> bậc 1 (24 giờ)
//   stability ~ 10080 (7 ngày)-> bậc 2 (7 ngày)
//   stability ~ 43200 (30d)   -> bậc 3 (21 ngày)
//   stability ~ 64800 (45d)   -> bậc 4 (45 ngày)

const FsrsMigration = {
    VERSION_KEY: 'lf_fsrs_migration_v1',

    /**
     * Quy tắc map stability (phút) -> stepIndex.
     * Dùng ngưỡng để fallback khi giá trị không trùng chính xác.
     */
    _mapStabilityToStep(stability) {
        const s = Number(stability) || 0;
        if (s <= 0) return -1;            // chưa từng học (sẽ fix riêng nếu cần)
        if (s <  720)   return 0;         // < 12h  -> 30 phút
        if (s <  4320)  return 1;         // < 3d   -> 24h (gồm 1d và sát 3d)
        if (s <  20160) return 2;         // < 14d  -> 7 ngày  (gồm 7d và 10d)
        if (s <  64800) return 3;         // < 45d  -> 21 ngày
        return 4;                         // 45 ngày trở lên
    },

    /**
     * Đã chạy chưa? Lưu cờ trong localStorage theo userId.
     */
    _hasRun(userId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.VERSION_KEY) || '{}');
            return !!data[userId];
        } catch {
            return false;
        }
    },

    _markDone(userId) {
        try {
            const data = JSON.parse(localStorage.getItem(this.VERSION_KEY) || '{}');
            data[userId] = new Date().toISOString();
            localStorage.setItem(this.VERSION_KEY, JSON.stringify(data));
        } catch (e) {
            console.warn('[FsrsMigration] Cannot persist migration flag:', e);
        }
    },

    /**
     * Chạy migration cho tất cả thẻ của user hiện tại (idempotent).
     * Chỉ update các thẻ:
     *   - state !== NEW  (đã từng học)
     *   - stepIndex chưa được gán (undefined hoặc null)
     */
    async run() {
        const userId = (typeof Auth !== 'undefined') ? Auth.getUserId() : null;
        if (!userId) return;
        if (this._hasRun(userId)) return;

        const ref = FirestoreDB._userCollection('cards');
        if (!ref) return;

        try {
            const snapshot = await ref.get();
            let updated = 0;
            const batchSize = 400;
            let batch = db.batch();
            let inBatch = 0;

            snapshot.forEach((doc) => {
                const c = doc.data();
                if (typeof c.stepIndex === 'number') return;            // đã có
                if (c.state === FSRS.State.NEW || c.state === undefined) return; // chưa học

                const stepIndex = this._mapStabilityToStep(c.stability);
                if (stepIndex < 0) return;

                batch.update(doc.ref, { stepIndex });
                updated++;
                inBatch++;

                if (inBatch >= batchSize) {
                    batch.commit().catch(e => console.error('[FsrsMigration] batch commit failed:', e));
                    batch = db.batch();
                    inBatch = 0;
                }
            });

            if (inBatch > 0) await batch.commit();

            console.log(`[FsrsMigration] Migrated ${updated}/${snapshot.size} cards`);
            this._markDone(userId);
        } catch (e) {
            console.error('[FsrsMigration] Migration failed:', e);
        }
    }
};


export default FsrsMigration;
