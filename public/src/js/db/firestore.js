// ============================================
// Firestore Database Operations
// ============================================
// Dữ liệu được tổ chức theo subcollection của mỗi user:
// users/{userId}/folders/{folderId}
// users/{userId}/cards/{cardId}
// users/{userId}/cardTypes/{typeId}
// users/{userId}/profileFolders/{folderId}
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
            const subcollections = ['folders', 'cards', 'cardTypes', 'profileFolders'];
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
    // Folders (thuộc về từng user riêng)
    // ==========================================

    /**
     * Get all folders for current user
     * @returns {Array}
     */
    async getFolders() {
        const ref = this._userCollection('folders');
        if (!ref) return [];
        try {
            const snapshot = await ref.orderBy('order').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[Firestore] Error getting folders:', error);
            return [];
        }
    },

    /**
     * Create a folder
     * @param {Object} folder - { name, parentId, order }
     * @returns {string} folder ID
     */
    async createFolder(folder) {
        const ref = this._userCollection('folders');
        if (!ref) return null;
        try {
            const doc = await ref.add({
                name: folder.name,
                parentId: folder.parentId || null,
                order: folder.order || 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return doc.id;
        } catch (error) {
            console.error('[Firestore] Error creating folder:', error);
            return null;
        }
    },

    /**
     * Update a folder
     * @param {string} folderId
     * @param {Object} updates - { name, parentId, order, ... }
     */
    async updateFolder(folderId, updates) {
        const ref = this._userCollection('folders');
        if (!ref) return;
        try {
            await ref.doc(folderId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Firestore] Error updating folder:', error);
            throw error;
        }
    },

    /**
     * Delete a folder
     * @param {string} folderId
     */
    async deleteFolder(folderId) {
        const ref = this._userCollection('folders');
        if (!ref) return;
        try {
            await ref.doc(folderId).delete();
        } catch (error) {
            console.error('[Firestore] Error deleting folder:', error);
            throw error;
        }
    },

    // ==========================================
    // Cards (thuộc về từng user riêng)
    // ==========================================

    /**
     * Get all cards for current user in a folder
     * @param {string} folderId
     * @returns {Array}
     */
    async getCards(folderId) {
        const ref = this._userCollection('cards');
        if (!ref) return [];
        try {
            let query = ref;
            if (folderId) {
                query = ref.where('folderId', '==', folderId);
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
     * @returns {Array}
     */
    async getDueCards() {
        const ref = this._userCollection('cards');
        if (!ref) return [];
        try {
            const now = new Date();
            const snapshot = await ref
                .where('dueDate', '<=', now)
                .orderBy('dueDate', 'asc')
                .get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[Firestore] Error getting due cards:', error);
            return [];
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
            return snapshot.size;
        } catch (error) {
            console.error('[Firestore] Error getting due card count:', error);
            return 0;
        }
    },

    /**
     * Create a card
     * @param {Object} card
     * @returns {string} card ID
     */
    async createCard(card) {
        const ref = this._userCollection('cards');
        if (!ref) return null;
        try {
            const fsrsData = FSRS.createCard();
            const doc = await ref.add({
                folderId: card.folderId,
                cardTypeId: card.cardTypeId,
                fieldValues: card.fieldValues || {},
                // FSRS data
                state: fsrsData.state,
                difficulty: fsrsData.difficulty,
                stability: fsrsData.stability,
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
     * Update a card (e.g., after FSRS review)
     * @param {string} cardId
     * @param {Object} updates
     */
    async updateCard(cardId, updates) {
        const ref = this._userCollection('cards');
        if (!ref) return;
        try {
            await ref.doc(cardId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Firestore] Error updating card:', error);
        }
    },

    /**
     * Delete a card
     * @param {string} cardId
     */
    async deleteCard(cardId) {
        const ref = this._userCollection('cards');
        if (!ref) return;
        try {
            await ref.doc(cardId).delete();
        } catch (error) {
            console.error('[Firestore] Error deleting card:', error);
        }
    },

    // ==========================================
    // Profile Folders (thư mục hồ sơ cấu hình, riêng biệt khỏi folders lobby)
    // ==========================================

    /**
     * Get all profile folders for current user
     * @returns {Array}
     */
    async getProfileFolders() {
        const ref = this._userCollection('profileFolders');
        if (!ref) return [];
        try {
            const snapshot = await ref.orderBy('order').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[Firestore] Error getting profile folders:', error);
            return [];
        }
    },

    /**
     * Create a profile folder
     * @param {Object} folder - { name, parentId, order }
     * @returns {string} folder ID
     */
    async createProfileFolder(folder) {
        const ref = this._userCollection('profileFolders');
        if (!ref) return null;
        try {
            const doc = await ref.add({
                name: folder.name,
                parentId: folder.parentId || null,
                order: folder.order || 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return doc.id;
        } catch (error) {
            console.error('[Firestore] Error creating profile folder:', error);
            return null;
        }
    },

    /**
     * Update a profile folder
     * @param {string} folderId
     * @param {Object} updates
     */
    async updateProfileFolder(folderId, updates) {
        const ref = this._userCollection('profileFolders');
        if (!ref) return;
        try {
            await ref.doc(folderId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Firestore] Error updating profile folder:', error);
            throw error;
        }
    },

    /**
     * Delete a profile folder
     * @param {string} folderId
     */
    async deleteProfileFolder(folderId) {
        const ref = this._userCollection('profileFolders');
        if (!ref) return;
        try {
            await ref.doc(folderId).delete();
        } catch (error) {
            console.error('[Firestore] Error deleting profile folder:', error);
            throw error;
        }
    },

    // ==========================================
    // Card Types (hồ sơ cấu hình thẻ)
    // ==========================================

    /**
     * Get all card types for current user
     * @param {string} [folderId] - Optional: filter by profile folder
     * @returns {Array}
     */
    async getCardTypes(folderId) {
        const ref = this._userCollection('cardTypes');
        if (!ref) return [];
        try {
            let query = ref.orderBy('order');
            if (folderId) {
                query = ref.where('folderId', '==', folderId).orderBy('order');
            }
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('[Firestore] Error getting card types:', error);
            return [];
        }
    },

    /**
     * Get a single card type by ID
     * @param {string} typeId
     * @returns {Object|null}
     */
    async getCardType(typeId) {
        const ref = this._userCollection('cardTypes');
        if (!ref) return null;
        try {
            const doc = await ref.doc(typeId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('[Firestore] Error getting card type:', error);
            return null;
        }
    },

    /**
     * Create a card type
     * @param {Object} cardType - { name, folderId, fields, order }
     * @returns {string} card type ID
     */
    async createCardType(cardType) {
        const ref = this._userCollection('cardTypes');
        if (!ref) return null;
        try {
            const doc = await ref.add({
                name: cardType.name,
                folderId: cardType.folderId || null,
                fields: cardType.fields || [],
                order: cardType.order || 0,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return doc.id;
        } catch (error) {
            console.error('[Firestore] Error creating card type:', error);
            return null;
        }
    },

    /**
     * Update a card type
     * @param {string} typeId
     * @param {Object} updates - { name, folderId, fields, order }
     */
    async updateCardType(typeId, updates) {
        const ref = this._userCollection('cardTypes');
        if (!ref) return;
        try {
            await ref.doc(typeId).update({
                ...updates,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
        } catch (error) {
            console.error('[Firestore] Error updating card type:', error);
            throw error;
        }
    },

    /**
     * Delete a card type
     * @param {string} typeId
     */
    async deleteCardType(typeId) {
        const ref = this._userCollection('cardTypes');
        if (!ref) return;
        try {
            await ref.doc(typeId).delete();
        } catch (error) {
            console.error('[Firestore] Error deleting card type:', error);
            throw error;
        }
    }
};
