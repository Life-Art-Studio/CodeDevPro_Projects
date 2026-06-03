const StorageService = {
  saveUser: (userData) => {
    const users = StorageService.getAllUsers();
    const newUser = { ...userData, id: `USR-${Date.now()}`, status: userData.status || 'Active', lastLogin: null };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return newUser;
  },

  deleteUser: (userId) => {
    const users = StorageService.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem("users", JSON.stringify(filteredUsers));
  },

  updateUser: (userId, updatedData) => {
    const users = StorageService.getAllUsers();
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...updatedData } : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    const currentUser = StorageService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
       StorageService.setCurrentUser({ ...currentUser, ...updatedData });
    }
  },

  getAllUsers: () => {
    try {
      const data = localStorage.getItem("users");
      let users = data ? JSON.parse(data) : [];
      
      // Initialize default Admin if no users exist
      if (users.length === 0) {
        const defaultAdmin = {
          id: "USR-ADMIN",
          name: "System Admin",
          email: "admin@admin.com",
          password: "admin",
          role: "ADMIN",
          status: "Active",
          lastLogin: null
        };
        users.push(defaultAdmin);
        localStorage.setItem("users", JSON.stringify(users));
      }
      
      return users;
    } catch (error) {
      return [];
    }
  },

  getUserByEmail: (email) => {
    const users = StorageService.getAllUsers();
    return users.find(u => u.email === email) || null;
  },

  getCurrentUser: () => {
    try {
      const data = localStorage.getItem("currentUser");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user) => {
    if (user) {
      localStorage.setItem("currentUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("currentUser");
    }
  },

  updateCurrentUser: (updatedData) => {
    const currentUser = StorageService.getCurrentUser();
    if (!currentUser) return;
    const mergedUser = { ...currentUser, ...updatedData };
    StorageService.setCurrentUser(mergedUser);
    
    // Also update in the users array
    const users = StorageService.getAllUsers();
    const updatedUsers = users.map(u => u.id === currentUser.id ? mergedUser : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    return mergedUser;
  },

  // Save login status
  setLoginStatus: (status) => {
    localStorage.setItem("isLoggedIn", status);
  },

  // Check login status
  getLoginStatus: () => {
    return localStorage.getItem("isLoggedIn") === "true";
  },

  // Wipe everything on logout or account deletion
  clearAll: () => {
    localStorage.removeItem("users");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("isLoggedIn");
  },
  logout: () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
  },
  getCustomers: () => {
    try {
      return JSON.parse(localStorage.getItem("customers")) ?? null;
    } catch {
      return null;
    }
  },
  saveCustomers: (customers) => {
    localStorage.setItem("customers", JSON.stringify(customers));
  },
  deleteCustomer: (customerId) => {
    const customers = JSON.parse(localStorage.getItem("customers"));
    const newCustomers = customers.filter(
      (customer) => customer.id !== customerId,
    );
    localStorage.setItem("customers", JSON.stringify(newCustomers));
  },
  // === ORDERS ===
  getOrders: () => {
    try {
      return JSON.parse(localStorage.getItem("orders")) ?? null;
    } catch {
      return null;
    }
  },

  getNextInvoiceNumber: () => {
    const current = parseInt(localStorage.getItem("invoiceCounter") || "0");
    const next = current + 1;
    localStorage.setItem("invoiceCounter", next.toString());
    return `INV-${String(next).padStart(4, '0')}`;
  },

  saveOrders: (orders) => {
    localStorage.setItem("orders", JSON.stringify(orders));
  },

  clearOrders: () => {
    localStorage.removeItem("orders");
  },

  // === BEATS ===
  getBeats: () => {
    try {
      return JSON.parse(localStorage.getItem("beats")) ?? null;
    } catch {
      return null;
    }
  },

  saveBeats: (beats) => {
    localStorage.setItem("beats", JSON.stringify(beats));
  },

  getNextBeatId: () => {
    const current = parseInt(localStorage.getItem("beatCounter") || "0");
    const next = current + 1;
    localStorage.setItem("beatCounter", next.toString());
    return `BEAT-${String(next).padStart(3, '0')}`;
  },

  // === VISITS ===
  getVisits: () => {
    try {
      return JSON.parse(localStorage.getItem("beatVisits")) ?? null;
    } catch {
      return null;
    }
  },

  saveVisits: (visits) => {
    localStorage.setItem("beatVisits", JSON.stringify(visits));
  },

  // === PRODUCTS ===
  getProducts: () => {
    try {
      return JSON.parse(localStorage.getItem("products")) ?? null;
    } catch {
      return null;
    }
  },

  saveProducts: (products) => {
    localStorage.setItem("products", JSON.stringify(products));
  },

  // === AUDIT LOGS ===
  getAuditLogs: () => {
    try {
      return JSON.parse(localStorage.getItem("auditLogs")) ?? [];
    } catch {
      return [];
    }
  },

  saveAuditLogs: (logs) => {
    localStorage.setItem("auditLogs", JSON.stringify(logs));
  },

  batchUpdate: (key, updaterFn) => {
    const data = localStorage.getItem(key);
    let parsed = [];
    try {
      parsed = data ? JSON.parse(data) : [];
    } catch {
      parsed = [];
    }
    const updated = updaterFn(parsed);
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  },
  getSuperStockists: () => {
    try {
      return JSON.parse(localStorage.getItem("superStockists")) ?? null;
    } catch {
      return null;
    }
  },
  saveSuperStockists: (ss) => {
    localStorage.setItem("superStockists", JSON.stringify(ss));
  },
  getDistributors: () => {
    try {
      return JSON.parse(localStorage.getItem("distributors")) ?? null;
    } catch {
      return null;
    }
  },
  saveDistributors: (distributors) => {
    localStorage.setItem("distributors", JSON.stringify(distributors));
  },
  getInventoryLedger: () => {
    try {
      return JSON.parse(localStorage.getItem("inventoryLedger")) ?? null;
    } catch {
      return null;
    }
  },
  saveInventoryLedger: (ledger) => {
    localStorage.setItem("inventoryLedger", JSON.stringify(ledger));
  },
  getInvoices: () => {
    try {
      return JSON.parse(localStorage.getItem("invoices")) ?? null;
    } catch {
      return null;
    }
  },
  saveInvoices: (invoices) => {
    localStorage.setItem("invoices", JSON.stringify(invoices));
  },
  getReceiptCaptures: () => {
    try {
      return JSON.parse(localStorage.getItem("receiptCaptures")) ?? null;
    } catch {
      return null;
    }
  },
  saveReceiptCaptures: (receipts) => {
    try {
      const limitBytes = 4 * 1024 * 1024; // 4MB safe limit
      let serialized = JSON.stringify(receipts);
      
      let totalSize = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key !== "receiptCaptures") {
          totalSize += (localStorage.getItem(key) || "").length;
        }
      }
      totalSize += serialized.length;

      if (totalSize > limitBytes) {
        console.warn("Storage limit approaching. Purging older receipt images to free up space...");
        const prunedReceipts = receipts.map((rec, idx) => {
          if (idx < receipts.length - 3) {
            return { ...rec, rawImageBase64: "" };
          }
          return rec;
        });
        localStorage.setItem("receiptCaptures", JSON.stringify(prunedReceipts));
        return true;
      }

      localStorage.setItem("receiptCaptures", serialized);
      return false;
    } catch (e) {
      console.error("Storage failed or quota exceeded", e);
      return false;
    }
  }
};

export default StorageService;
