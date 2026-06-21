const StorageService = {
  saveUser: (userData) => {
    const users = StorageService.getAllUsers();
    // Use simple base64 "hashing" for demonstration
    const passwordHash = userData.password ? btoa(userData.password) : undefined;
    const newUser = { ...userData, id: `USR-${Date.now()}`, status: userData.status || 'Active', lastLogin: null };
    if (passwordHash) newUser.password = passwordHash;
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    return newUser;
  },

  deleteUser: (userId) => {
    const users = StorageService.getAllUsers();
    const userToDelete = users.find(u => u.id === userId);
    
    // Prevent deleting the last ADMIN
    if (userToDelete && userToDelete.role === "ADMIN") {
      const adminCount = users.filter(u => u.role === "ADMIN").length;
      if (adminCount <= 1) {
        console.error("Cannot delete the last remaining ADMIN account.");
        return false;
      }
    }
    
    const filteredUsers = users.filter(user => user.id !== userId);
    localStorage.setItem("users", JSON.stringify(filteredUsers));
    return true;
  },

  updateUser: (userId, updatedData) => {
    const users = StorageService.getAllUsers();
    const dataToSave = { ...updatedData };
    if (dataToSave.password) {
       dataToSave.password = btoa(dataToSave.password);
    }
    const updatedUsers = users.map(u => u.id === userId ? { ...u, ...dataToSave } : u);
    localStorage.setItem("users", JSON.stringify(updatedUsers));
    
    const currentUser = StorageService.getCurrentUser();
    if (currentUser && currentUser.id === userId) {
       StorageService.setCurrentUser({ ...currentUser, ...dataToSave });
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
          password: btoa("admin"),
          role: "ADMIN",
          status: "Active",
          lastLogin: null,
          mustChangePassword: true
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
    StorageService.clearAll();
  }
};

export default StorageService;
