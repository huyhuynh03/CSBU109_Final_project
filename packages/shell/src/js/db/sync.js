// ============================================
// Sync Module - Online/Offline synchronization
// ============================================
// Stub - Firestore handles most of this automatically

const Sync = {
    isOnline: navigator.onLine,

    /**
     * Initialize sync monitoring
     */
    init() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            Toast.success('Đã kết nối mạng', 'Dữ liệu sẽ được đồng bộ tự động.');
            console.log('[Sync] Online');
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            Toast.warning('Mất kết nối mạng', 'Bạn vẫn có thể học offline. Dữ liệu sẽ đồng bộ khi có mạng.');
            console.log('[Sync] Offline');
        });

        console.log('[Sync] Initialized, online:', this.isOnline);
    }
};


export default Sync;
