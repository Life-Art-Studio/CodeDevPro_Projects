const StorageService = {
  saveUser: (userData) => {
    localStorage.setItem("userData", JSON.stringify(userData));
  },

  // Get user object safely (prevents JSON parse errors)
  getUser: () => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Failed to parse user data", error);
      return null;
    }
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
    localStorage.removeItem("userData");
    localStorage.removeItem("isLoggedIn");
  },
  logout: () => {
    localStorage.removeItem("isLoggedIn");
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
