import { Routes, Route, Navigate } from "react-router-dom";
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
const SupplyChain = lazy(() => import('./pages/SupplyChain'));
const BillingSystem = lazy(() => import('./pages/BillingSystem'));
const CompanySetup = lazy(() => import('./pages/CompanySetup'));
const CompanySettings = lazy(() => import('./pages/CompanySettings'));
// Auth Gate
import { useAuth } from "./context/AuthContext";
import AppProviders from "./context/AppProviders";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, currentUser, isLoading } = useAuth();
  
  if (isLoading) return <LoadingSpinner />;
  if (!isLoggedIn) return <Navigate to="/auth/login" replace />;
  
  if (allowedRoles && currentUser && !allowedRoles.includes(currentUser.role)) {
      if (currentUser.role === 'SALES') return <Navigate to="/dashboard/customers" replace />;
      if (currentUser.role === 'DISTRIBUTOR') return <Navigate to="/dashboard/sales" replace />;
      return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

const App = () => {
  return (
    <AppProviders>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
                        {/* Default Redirect: If they just type yourwebsite.com, send them to login */}
                        <Route path="/" element={<Navigate to="/auth/login" replace />} />

                        {/* Public Branch: Uses the blank, centered AuthLayout */}
                        <Route path="/auth" element={<AuthLayouts />}>
                          <Route path="login" element={<Login />} />
                        </Route>

                        <Route path="/company-setup" element={
                          <ProtectedRoute allowedRoles={['ADMIN']}>
                            <CompanySetup />
                          </ProtectedRoute>
                        } />

                        {/* Private Branch: Uses the complex Sidebar/Topbar Layout */}
                        <Route path="/dashboard" element={<DashBoardLayout />}>
                          <Route
                            index
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST']}>
                                <Dashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="sales"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR']}>
                                <Sales />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="users"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR']}>
                                <Users />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="audit-logs"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <AuditLogs />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="settings"
                            element={
                              <ProtectedRoute allowedRoles={['ADMIN']}>
                                <CompanySettings />
                              </ProtectedRoute>
                            }
                          />
                          
                            <Route
                              path="customers"
                              element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR', 'SALES']}>
                                  <Customers />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="beats"
                              element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'SALES']}>
                                  <Beats />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="map"
                              element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'SALES']}>
                                  <MapPage />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="catalogue"
                              element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR', 'SALES']}>
                                  <Catalogue />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="supply-chain"
                              element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR']}>
                                  <SupplyChain />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="billing"
                              element={
                                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_STOCKIST', 'DISTRIBUTOR']}>
                                  <BillingSystem />
                                </ProtectedRoute>
                              }
                            />
                          
                        </Route>

                        {/* Catch-all route to handle Supabase OAuth Hash fragments */}
                        <Route path="*" element={<Navigate to="/dashboard" replace />} />
                      </Routes>
                    </Suspense>

                    <NotificationPanel />
    </AppProviders>
  );
};

export default App;
