import StorageService from "./storageService";
import toast from "react-hot-toast";

const AuthService = {
  login: (email, password) => {
    const savedUser = StorageService.getUser();
    
    if (!savedUser) {
      toast.error("User Not Found. Please sign up.");
      return false;
    }

    if (email === savedUser.email && password === savedUser.password) {
      StorageService.setLoginStatus(true);
      return true;
    }
    
    return false;
  },

  // Handles registering a new user
  signUp: (userData) => {
    StorageService.saveUser(userData);
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