import StorageService from "./storageService";
import toast from "react-hot-toast";

const AuthService = {
  login: (email, password) => {
    const user = StorageService.getUserByEmail(email);
    
    if (!user) {
      toast.error("User Not Found. Please sign up.");
      return false;
    }

    if (user.status === 'Inactive') {
      toast.error("Account deactivated. Please contact an admin.");
      return false;
    }

    if (password === user.password) {
      StorageService.updateUser(user.id, { lastLogin: new Date().toISOString() });
      const updatedUser = StorageService.getUserByEmail(email);
      StorageService.setCurrentUser(updatedUser);
      StorageService.setLoginStatus(true);
      return true;
    }
    
    return false;
  },

  // Handles registering a new user
  signUp: (userData) => {
    const existing = StorageService.getUserByEmail(userData.email);
    if (existing) {
      toast.error("Email already in use.");
      return false;
    }
    const newUser = StorageService.saveUser(userData);
    StorageService.setCurrentUser(newUser);
    StorageService.setLoginStatus(true);
    return true; 
  },

  // Handles standard logout
  logout: () => {
    StorageService.logout();
  },

  // Handles account deletion
  deleteAccount: () => {
    StorageService.clearAll();
   // a real backend, i would make an API call here to delete them from the database
  },

  // Handles data reset (Mock backend function)
  resetDashboardData: () => {
    // If i had a real backend, i would make an API call here to wipe their data tables
    console.log("Mock API Call: All dashboard data wiped for this user.");
  }
};

export default AuthService;