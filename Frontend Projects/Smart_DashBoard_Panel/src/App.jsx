import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Layouts (The Picture Frames)
import AuthLayouts from "./layouts/AuthLayouts";
import DashBoardLayout from "./layouts/DashBoardLayout";

// Auth Pages
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";

// Dashboard Pages
import Dashboard from "./pages/Dashboard";
import Sales from "./pages/Sales";
import Customers from "./pages/Customers";
import Beats from "./pages/Beats";
import MapPage from "./pages/MapPage";
// Auth Gate
import { useAuth } from "./context/AuthContext";
import { CustomerProvider } from "./context/CustomerContext";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BeatProvider } from "./context/BeatContext";
import { VisitProvider } from "./context/VisitContext";

const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/auth/login" replace />;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CustomerProvider>
          <OrderProvider>
            <BeatProvider>
              <VisitProvider>
                <HashRouter>
              <Routes>
                {/* Default Redirect: If they just type yourwebsite.com, send them to login */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* Public Branch: Uses the blank, centered AuthLayout */}
                <Route path="/auth" element={<AuthLayouts />}>
                  <Route path="login" element={<Login />} />
                  <Route path="signup" element={<Signup />} />
                </Route>

                {/* Private Branch: Uses the complex Sidebar/Topbar Layout */}
                <Route path="/dashboard" element={<DashBoardLayout />}>
                  <Route
                    index
                    element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="sales"
                    element={
                      <ProtectedRoute>
                        <Sales />
                      </ProtectedRoute>
                    }
                  />
                  
                    <Route
                      path="customers"
                      element={
                        <ProtectedRoute>
                          <Customers />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="beats"
                      element={
                        <ProtectedRoute>
                          <Beats />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="map"
                      element={
                        <ProtectedRoute>
                          <MapPage />
                        </ProtectedRoute>
                      }
                    />
                  
                </Route>
              </Routes>
                <Toaster position="top-right" toastOptions={{ className: 'dark:bg-slate-800 dark:text-white' }} />
              </HashRouter>
            </VisitProvider>
          </BeatProvider>
        </OrderProvider>
        </CustomerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
