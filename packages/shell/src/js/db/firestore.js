// ============================================
// Firestore Database Operations
// ============================================
// Dữ liệu được tổ chức theo subcollection của mỗi user:
// users/{userId}/folders/{folderId}
// users/{userId}/cards/{cardId}
// → Mỗi user có dữ liệu riêng biệt hoàn toàn

const FirestoreDB = {
    /**
     * Initialize Firestore listeners
     */
    init() {
        console.log('[Firestore] Initialized');
    },

    // ==========================================
    // Helper - Get user's subcollection reference
    // ==========================================

    /**
     * Get reference to a user's subcollection
     * @param {string} collectionName
     * @returns {firebase.firestore.CollectionReference|null}
     */
    _userCollection(collectionName) {
        const userId = Auth.getUserId();
        if (!userId) {
            console.warn('[Firestore] No user signed in');
            return null;
        }
        return db.collection('users').doc(userId).collection(collectionName);
    },

    // ==========================================
    // User Profile
    // ==========================================

    /**
     * Create or update user profile in Firestore
     * @param {Object} user - Firebase user object
     */
    async saveUserProfile(user) {
        if (!user) return;
        try {
            await db.collection('users').doc(user.uid).set({
                email: user.email,
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                theme: 'system',
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log('[Firestore] User profile saved:', user.uid);
        } catch (error) {
            console.error('[Firestore] Error saving user profile:', error);
        }
    },

    /**
     * Get user profile
     * @param {string} userId
     * @returns {Object|null}
     */
    async getUserProfile(userId) {
        try {
            const doc = await db.collection('users').doc(userId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('[Firestore] Error getting user profile:', error);
            return null;
        }
    },

    /**
     * Update user settings
     * @param {Object} settings - Settings to update
     */
    async updateUserSettings(settings) {
        const userId = Auth.getUserId();
        if (!userId) return;
        try {
            await db.collection('users').doc(userId).update({
                ...settings,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Firestore] Error updating settings:', error);
        }
    },

    /**
     * Delete all user data (when deleting account)
     * @param {string} userId
     */
    async deleteUserData(userId) {
        try {
            // Delete subcollections first
            const subcollections = ['folders', 'cards'];
            for (const sub of subcollections) {
                const snapshot = await db.collection('users').doc(userId).collection(sub).get();
                const batch = db.batch();
                snapshot.docs.forEach(doc => batch.delete(doc.ref));
                if (snapshot.docs.length > 0) {
                    await batch.commit();
                }
            }

            // Delete user document
            await db.collection('users').doc(userId).delete();
            console.log('[Firestore] All user data deleted:', userId);
        } catch (error) {
            console.error('[Firestore] Error deleting user data:', error);
            throw error;
        }
    },

    // ==========================================
    // Cards (thuộc về từng user riêng)
    // ==========================================

    /**
     * Get all cards for current user, optionally filtered
     * @param {Object} [filter] - { folderId, cardType, state }
     * @returns {Array}
     */
    async getCards(filter = {}) {
        const ref = this._userCollection('cards');
        if (!ref) return [];
        try {
            let query = ref;
            if (filter.folderId) {
                query = query.where('folderId', '==', filter.folderId);
            }
            if (filter.cardType) {
                query = query.where('cardType', '==', filter.cardType);
            }
            if (filter.state) {
                query = query.where('state', '==', filter.state);
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[Firestore] Error getting cards:', error);
            return [];
        }
    },

    /**
     * Get cards due for review (dueDate <= now)
     * @param {string} [cardType] - Optional: filter by card type
     * @returns {Array}
     */
    async getDueCards(cardType) {
        const ref = this._userCollection('cards');
        if (!ref) return [];
        try {
            const now = new Date();
            const snapshot = await ref
                .where('dueDate', '<=', now)
                .orderBy('dueDate', 'asc')
                .get();
            let cards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            if (cardType) {
                cards = cards.filter(c => c.cardType === cardType);
            }
            // Loại NEW card (kể cả khi vô tình còn dueDate cũ) — chỉ trả về thẻ thực sự cần ôn.
            cards = cards.filter(c => {
                const st = c.state;
                return !(st === 'new' || st === FSRS.State.NEW || st === undefined);
            });
            return cards;
        } catch (error) {
            console.error('[Firestore] Error getting due cards:', error);
            return [];
        }
    },

    /**
     * Get count of new cards (state = 'new')
     * @returns {number}
     */
    async getNewCardCount() {
        const ref = this._userCollection('cards');
        if (!ref) return 0;
        try {
            // FSRS.createCard() lưu state = 0 (số) chứ không phải 'new' (string).
            // Một số card cũ/legacy có thể lưu string. Phải quét toàn bộ và filter client-side
            // thay vì query where('state','==','new') (sẽ luôn trả 0 với card mới).
            const snapshot = await ref.get();
            let n = 0;
            snapshot.forEach(doc => {
                const st = doc.data().state;
                if (st === 'new' || st === FSRS.State.NEW || st === undefined) n++;
            });
            return n;
        } catch (error) {
            console.error('[Firestore] Error getting new card count:', error);
            return 0;
        }
    },

    /**
     * Get count of cards due for review
     * @returns {number}
     */
    async getDueCardCount() {
        const ref = this._userCollection('cards');
        if (!ref) return 0;
        try {
            const now = new Date();
            const snapshot = await ref
                .where('dueDate', '<=', now)
                .get();
            // Loại NEW card khỏi count để badge ôn tập không kẹt vì dueDate cũ.
            let n = 0;
            snapshot.forEach(doc => {
                const st = doc.data().state;
                if (!(st === 'new' || st === FSRS.State.NEW || st === undefined)) n++;
            });
            return n;
        } catch (error) {
            console.error('[Firestore] Error getting due card count:', error);
            return 0;
        }
    },

    /**
     * Get count of learned cards (state = 'review', regardless of due date)
     * @returns {number}
     */
    async getLearnedCardCount() {
        const ref = this._userCollection('cards');
        if (!ref) return 0;
        try {
            // FSRS lưu state REVIEW = 2 (số). Quét toàn bộ + filter để bắt được cả
            // dạng string legacy ('review', 'relearning') và dạng số (2, 3).
            const snapshot = await ref.get();
            let n = 0;
            snapshot.forEach(doc => {
                const st = doc.data().state;
                if (st === 'review' || st === 'relearning'
                    || st === FSRS.State.REVIEW || st === FSRS.State.RELEARNING) n++;
            });
            return n;
        } catch (error) {
            console.error('[Firestore] Error getting learned card count:', error);
            return 0;
        }
    },

    /**
     * Get total card count
     * @returns {number}
     */
    async getTotalCardCount() {
        const ref = this._userCollection('cards');
        if (!ref) return 0;
        try {
            const snapshot = await ref.get();
            return snapshot.size;
        } catch (error) {
            console.error('[Firestore] Error getting total card count:', error);
            return 0;
        }
    },

    /**
     * Create a card with fixed schema
     * @param {Object} card - { folderId, cardType, fieldValues }
     * @returns {string} card ID
     */
    async createCard(card) {
        const ref = this._userCollection('cards');
        if (!ref) return null;
        try {
            const fsrsData = FSRS.createCard();
            // Auto-inject languageId from current URL scope (Phase 2)
            const languageId = (typeof LinguaFlashHost !== 'undefined')
                ? LinguaFlashHost.getActiveLanguageId()
                : 'english';
            const doc = await ref.add({
                folderId: card.folderId,
                cardType: card.cardType, // 'vocabulary' or 'grammar'
                fieldValues: card.fieldValues || {},
                languageId: languageId || 'english',
                // FSRS data
                state: fsrsData.state,
                difficulty: fsrsData.difficulty,
                stability: fsrsData.stability,
                stepIndex: fsrsData.stepIndex,
                dueDate: fsrsData.dueDate,
                reps: fsrsData.reps,
                lapses: fsrsData.lapses,
                lastReview: null,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return doc.id;
        } catch (error) {
            console.error('[Firestore] Error creating card:', error);
            return null;
        }
    },

    /**
     * Update a card (e.g., after FSRS review or field edit)
     * @param {string} cardId
     * @param {Object} updates
     */
    async updateCard(cardId, updates) {
        const ref = this._userCollection('cards');
        if (!ref) return false;
        try {
            await ref.doc(cardId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('[Firestore] Error updating card:', error);
            return false;
        }
    },

    /**
     * Delete a card
     * @param {string} cardId
     * @returns {boolean} true nếu Firestore xác nhận xoá thành công
     */
    async deleteCard(cardId) {
        const ref = this._userCollection('cards');
        if (!ref) return false;
        try {
            await ref.doc(cardId).delete();
            return true;
        } catch (error) {
            console.error('[Firestore] Error deleting card:', error);
            return false;
        }
    },

    /**
     * Delete all cards in a folder
     * @param {string} folderId
     */
    async deleteCardsInFolder(folderId) {
       const ref = this._userCollection('cards');
       if (!ref) return;
       try {
           const snapshot = await ref.where('folderId', '==', folderId).get();
           if (snapshot.empty) return;
           const batch = db.batch();
           snapshot.docs.forEach(doc => batch.delete(doc.ref));
           await batch.commit();
           console.log(`[Firestore] Deleted ${snapshot.size} cards in folder ${folderId}`);
       } catch (error) {
           console.error('[Firestore] Error deleting cards in folder:', error);
       }
   },

   // ============================================
   // Study Sessions (tracking học tập hàng ngày)
   // ============================================

   /**
    * Log study time for today
    * @param {number} minutes - Minutes studied
    */
   async logStudyTime(minutes) {
       const ref = this._userCollection('studySessions');
       if (!ref) return;

       const today = new Date();
       const dateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

       try {
           const doc = await ref.doc(dateKey).get();
           if (doc.exists) {
               await ref.doc(dateKey).update({
                   minutes: firebase.firestore.FieldValue.increment(minutes),
                   updatedAt: firebase.firestore.FieldValue.serverTimestamp()
               });
           } else {
               await ref.doc(dateKey).set({
                   date: dateKey,
                   minutes: minutes,
                   createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                   updatedAt: firebase.firestore.FieldValue.serverTimestamp()
               });
           }
       } catch (error) {
           console.error('[Firestore] Error logging study time:', error);
       }
   },

   /**
    * Get study sessions for a date range
    * @param {number} days - Number of past days to fetch
    * @returns {Array} Array of {date, minutes}
    */
   async getStudySessions(days = 7) {
       const ref = this._userCollection('studySessions');
       if (!ref) return [];

       try {
           // Calculate date range
           const today = new Date();
           const startDate = new Date(today);
           startDate.setDate(startDate.getDate() - (days - 1));
           const startKey = `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}`;

           const snapshot = await ref.where('date', '>=', startKey).orderBy('date', 'asc').get();
           return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       } catch (error) {
           console.error('[Firestore] Error getting study sessions:', error);
           return [];
       }
   },

   /**
    * Get study sessions for a specific year
    * @param {number} year - The year to fetch (e.g. 2026)
    * @returns {Array} Array of {date, minutes}
    */
   async getStudySessionsByYear(year) {
       const ref = this._userCollection('studySessions');
       if (!ref) return [];

       try {
           const startKey = `${year}-01-01`;
           const endKey = `${year}-12-31`;
           const snapshot = await ref
               .where('date', '>=', startKey)
               .where('date', '<=', endKey)
               .orderBy('date', 'asc')
               .get();
           return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
       } catch (error) {
           console.error('[Firestore] Error getting study sessions by year:', error);
           return [];
       }
   },

   /**
    * Get current streak (consecutive days with study activity)
    * @returns {Object} {streak, totalMinutesToday}
    */
   async getStreakInfo() {
       const ref = this._userCollection('studySessions');
       if (!ref) return { streak: 0, totalMinutesToday: 0 };

       try {
           // Get last 90 days of sessions
           const sessions = await this.getStudySessions(90);
           const sessionMap = {};
           sessions.forEach(s => { sessionMap[s.date] = s.minutes; });

           const today = new Date();
           const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

           const totalMinutesToday = sessionMap[todayKey] || 0;

           // Calculate streak
           let streak = 0;
           let checkDate = new Date(today);

           // If no activity today, start checking from yesterday
           if (!sessionMap[todayKey]) {
               checkDate.setDate(checkDate.getDate() - 1);
           }

           while (true) {
               const key = `${checkDate.getFullYear()}-${String(checkDate.getMonth() + 1).padStart(2, '0')}-${String(checkDate.getDate()).padStart(2, '0')}`;
               if (sessionMap[key] && sessionMap[key] > 0) {
                   streak++;
                   checkDate.setDate(checkDate.getDate() - 1);
               } else {
                   break;
               }
           }

           return { streak, totalMinutesToday };
       } catch (error) {
           console.error('[Firestore] Error getting streak:', error);
           return { streak: 0, totalMinutesToday: 0 };
       }
   }
};


export default FirestoreDB;
