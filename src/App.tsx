import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

import { ReportEmergencyPage } from './pages/reporter/ReportEmergencyPage';
import { MyReportsPage } from './pages/reporter/MyReportsPage';
import { ReportDetailPage } from './pages/reporter/ReportDetailPage';

import { DashboardPage } from './pages/authority/DashboardPage';
import { IncidentQueuePage } from './pages/authority/IncidentQueuePage';
import { IncidentManagementPage } from './pages/authority/IncidentManagementPage';
import { TeamPage } from './pages/authority/TeamPage';
import { AnalyticsPage } from './pages/authority/AnalyticsPage';

import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { NotFoundPage } from './pages/NotFoundPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-red-500 selection:text-white">
              <Navbar />
              <main className="flex-1">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />

                  {/* Reporter Routes */}
                  <Route
                    path="/report"
                    element={
                      <ProtectedRoute allowedRoles={['reporter', 'authority', 'admin']}>
                        <ReportEmergencyPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports"
                    element={
                      <ProtectedRoute allowedRoles={['reporter', 'authority', 'admin']}>
                        <MyReportsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reports/:incidentId"
                    element={
                      <ProtectedRoute allowedRoles={['reporter', 'authority', 'admin']}>
                        <ReportDetailPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Authority Routes */}
                  <Route
                    path="/authority"
                    element={
                      <ProtectedRoute allowedRoles={['authority', 'admin']}>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/authority/incidents"
                    element={
                      <ProtectedRoute allowedRoles={['authority', 'admin']}>
                        <IncidentQueuePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/authority/incidents/:incidentId"
                    element={
                      <ProtectedRoute allowedRoles={['authority', 'admin']}>
                        <IncidentManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/authority/team"
                    element={
                      <ProtectedRoute allowedRoles={['authority', 'admin']}>
                        <TeamPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/authority/analytics"
                    element={
                      <ProtectedRoute allowedRoles={['authority', 'admin']}>
                        <AnalyticsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AdminOverviewPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <UserManagementPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-log"
                    element={
                      <ProtectedRoute allowedRoles={['admin']}>
                        <AuditLogPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback Route */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
