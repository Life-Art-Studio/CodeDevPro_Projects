/**
 * SyncQueue.js
 * A simple utility to queue items when offline and sync them when the connection is restored.
 */
const QUEUE_KEY = "offline_sync_queue";

const SyncQueue = {
  getQueue: () => {
    try {
      const data = localStorage.getItem(QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveQueue: (queue) => {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  },

  addToQueue: (item) => {
    const queue = SyncQueue.getQueue();
    // Add item with a timestamp and status
    const newItem = {
      ...item,
      queuedAt: new Date().toISOString(),
      id: item.id || `SYNC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0
    };
    queue.push(newItem);
    SyncQueue.saveQueue(queue);
    return newItem;
  },

  removeFromQueue: (id) => {
    const queue = SyncQueue.getQueue();
    const updated = queue.filter(item => item.id !== id);
    SyncQueue.saveQueue(updated);
  },

  updateItem: (id, updates) => {
    const queue = SyncQueue.getQueue();
    const updated = queue.map(item => item.id === id ? { ...item, ...updates } : item);
    SyncQueue.saveQueue(updated);
  },

  clearQueue: () => {
    localStorage.removeItem(QUEUE_KEY);
  },

  /**
   * Processes all queued items using the provided syncHandler function.
   * syncHandler must be an async function that returns true on success, false on failure.
   */
  processQueue: async (syncHandler, onProgressUpdate) => {
    if (!navigator.onLine) {
      console.log("Cannot process sync queue: browser is offline.");
      return;
    }

    const queue = SyncQueue.getQueue();
    if (queue.length === 0) return;

    console.log(`Processing sync queue containing ${queue.length} items...`);
    
    for (const item of queue) {
      try {
        if (onProgressUpdate) {
          onProgressUpdate(item.id, 'syncing');
        }
        
        const success = await syncHandler(item);
        if (success) {
          SyncQueue.removeFromQueue(item.id);
          if (onProgressUpdate) {
            onProgressUpdate(item.id, 'success');
          }
        } else {
          // Increment retry count
          const updatedRetry = (item.retryCount || 0) + 1;
          SyncQueue.updateItem(item.id, { retryCount: updatedRetry });
          if (onProgressUpdate) {
            onProgressUpdate(item.id, 'failed');
          }
        }
      } catch (err) {
        console.error(`Failed to sync item ${item.id}:`, err);
        const updatedRetry = (item.retryCount || 0) + 1;
        SyncQueue.updateItem(item.id, { retryCount: updatedRetry });
        if (onProgressUpdate) {
          onProgressUpdate(item.id, 'failed');
        }
      }
    }
  },

  /**
   * Register a listener for the online event to trigger processing automatically
   */
  registerAutoSync: (syncHandler, onProgressUpdate) => {
    const handleOnline = () => {
      console.log("Device is online. Triggering auto-sync...");
      SyncQueue.processQueue(syncHandler, onProgressUpdate);
    };

    window.addEventListener("online", handleOnline);
    
    // Return unsubscribe function
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }
};

export default SyncQueue;
