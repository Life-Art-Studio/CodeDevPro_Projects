const StorageService = {
  saveUser: (userData) => {
    const users = StorageService.getAllUsers();
    const newUser = { ...userData, id: `USR-${Date.now()}` };
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return newUser;
  },

  deleteUser: (userId) => {
    const users = StorageService.getAllUsers();
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem("users", JSON.stringify(filteredUsers));
  },

  getAllUsers: () => {
    try {
      const data = localStorage.getItem("users");
      return data ? JSON.parse(data) : [];
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
  }
};

export default StorageService;
