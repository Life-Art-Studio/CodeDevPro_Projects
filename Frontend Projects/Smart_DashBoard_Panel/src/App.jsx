import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';

// Layouts (The Picture Frames)
import AuthLayouts from "./layouts/AuthLayouts";
import DashBoardLayout from "./layouts/DashBoardLayout";

import React, { Suspense, lazy } from 'react';
import LoadingSpinner from './components/LoadingSpinner';
import NotificationPanel from "./components/NotificationPanel";

// Auth Pages (Lazy)
const Login = lazy(() => import('./pages/auth/Login'));

// Dashboard Pages (Lazy)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Sales = lazy(() => import('./pages/Sales'));
const Customers = lazy(() => import('./pages/Customers'));
const Beats = lazy(() => import('./pages/Beats'));
const MapPage = lazy(() => import('./pages/MapPage'));
const Catalogue = lazy(() => import('./pages/Catalogue'));
const Users = lazy(() => import('./pages/Users'));
const AuditLogs = lazy(() => import('./pages/AuditLogs'));

// Auth Gate
import { useAuth } from "./context/AuthContext";
import { AuditProvider } from "./context/AuditContext";
import { CustomerProvider } from "./context/CustomerContext";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BeatProvider } from "./context/BeatContext";
import { VisitProvider } from "./context/VisitContext";
import { ProductProvider } from "./context/ProductContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isLoggedIn, currentUser } = useAuth();
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />;
  if (adminOnly && currentUser?.role !== 'ADMIN') return <Navigate to="/dashboard/customers" replace />;
  return children;
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AuditProvider>
        <CustomerProvider>
          <OrderProvider>
            <BeatProvider>
              <VisitProvider>
                <ProductProvider>
                  <HashRouter>
                    <Suspense fallback={<LoadingSpinner />}>
                      <Routes>
                        {/* Default Redirect: If they just type yourwebsite.com, send them to login */}
                        <Route path="/" element={<Navigate to="/auth/login" replace />} />

                        {/* Public Branch: Uses the blank, centered AuthLayout */}
                        <Route path="/auth" element={<AuthLayouts />}>
                          <Route path="login" element={<Login />} />
                        </Route>

                        {/* Private Branch: Uses the complex Sidebar/Topbar Layout */}
                        <Route path="/dashboard" element={<DashBoardLayout />}>
                          <Route
                            index
                            element={
                              <ProtectedRoute adminOnly>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="sales"
                            element={
                              <ProtectedRoute adminOnly>
                                <Sales />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="users"
                            element={
                              <ProtectedRoute adminOnly>
                                <Users />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="audit-logs"
                            element={
                              <ProtectedRoute adminOnly>
                                <AuditLogs />
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
                            <Route
                              path="catalogue"
                              element={
                                <ProtectedRoute>
                                  <Catalogue />
                                </ProtectedRoute>
                              }
                            />
                          
                        </Route>
                      </Routes>
                    </Suspense>

                    <NotificationPanel />
                  </HashRouter>
                </ProductProvider>
              </VisitProvider>
            </BeatProvider>
          </OrderProvider>
        </CustomerProvider>
        </AuditProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
