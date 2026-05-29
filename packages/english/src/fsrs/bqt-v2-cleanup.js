// ============================================
// BQT v2 Cleanup - Xoá toàn bộ thẻ BQT legacy (schema v1)
// ============================================
// Lý do: Schema BQT v2 tách mỗi dạng thành 1 thẻ riêng (V2/V3/so sánh hơn/so sánh nhất).
// Các thẻ cũ gộp nhiều biến thể trong 1 thẻ (field pastSimple/pastParticiple/comparative/superlative)
// sẽ gây mâu thuẫn logic — luồng mới không thể xử lý. User đã cho phép xoá.
//
// Cleanup này idempotent: chỉ chạy 1 lần/user, flag lưu trong localStorage.
// Seed importer sẽ tự đổ 6 topic BQT mới (v2) sau khi cleanup.

const BqtV2Cleanup = {
    VERSION_KEY: 'lf_bqt_v2_cleanup_v1',

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
            console.warn('[BqtV2Cleanup] Cannot persist cleanup flag:', e);
        }
    },

    _isLegacyBqt(card) {
        const fv = card.fieldValues || card || {};
        return !!(fv.pastSimple || fv.pastParticiple || fv.comparative || fv.superlative);
    },

    /**
     * Xoá toàn bộ thẻ BQT legacy + xoá các folder BQT cũ (topicId cũ không thuộc 6 topic v2).
     */
    async run() {
        const userId = (typeof Auth !== 'undefined') ? Auth.getUserId() : null;
        if (!userId) return;
        if (this._hasRun(userId)) return;

        const ref = FirestoreDB._userCollection('cards');
        if (!ref) return;

        try {
            const snapshot = await ref.get();
            let deleted = 0;
            const batchSize = 400;
            let batch = db.batch();
            let inBatch = 0;

            snapshot.forEach((doc) => {
                const c = doc.data();
                const fv = c.fieldValues || {};
                // Điều kiện xoá: CHỈ xoá khi thẻ có field biến thể cũ schema v1
                // (pastSimple/pastParticiple/comparative/superlative). Đây là dấu hiệu
                // chắc chắn của thẻ legacy v1 cần thay bằng v2.
                //
                // [BUG-FIX 2026-04-24] Trước đây có thêm điều kiện `missingRole` (tag irregular-*
                // nhưng không có irregularRole). ĐIỀU KIỆN NÀY SAI vì các thẻ base form
                // (write/good/well…) tự nhiên không có irregularRole, dẫn đến cleanup
                // xoá oan toàn bộ base form đã học → seed importer tạo lại thành NEW
                // → user mất tiến trình ôn tập (Cấp độ 1+ về Học mới).
                const hasLegacyFields = !!(fv.pastSimple || fv.pastParticiple || fv.comparative || fv.superlative);

                if (!hasLegacyFields) return;

                batch.delete(doc.ref);
                deleted++;
                inBatch++;

                if (inBatch >= batchSize) {
                    batch.commit().catch(e => console.error('[BqtV2Cleanup] batch commit failed:', e));
                    batch = db.batch();
                    inBatch = 0;
                }
            });

            if (inBatch > 0) await batch.commit();

            console.log(`[BqtV2Cleanup] Cleaned ${deleted}/${snapshot.size} legacy cards`);
            this._markDone(userId);
        } catch (e) {
            console.error('[BqtV2Cleanup] Cleanup failed:', e);
        }
    }
};


export default BqtV2Cleanup;
