import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AdminLayout from './layouts/AdminLayout';
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import UsersPage from './pages/users/UsersPage';
import PostsPage from './pages/posts/PostsPage';
import VotesPage from './pages/votes/VotesPage';
import TicketsPage from './pages/tickets/TicketsPage';
import MembershipsPage from './pages/memberships/MembershipsPage';
import PaymentsPage from './pages/payments/PaymentsPage';
import ReportsPage from './pages/reports/ReportsPage';
import LeaderboardPage from './pages/leaderboard/LeaderboardPage';
import SettingsPage from './pages/settings/SettingsPage';
import EmployersPage from './pages/employers/EmployersPage';
import RefundsPage from './pages/refunds/RefundsPage';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="posts" element={<PostsPage />} />
            <Route path="votes" element={<VotesPage />} />
            <Route path="tickets" element={<TicketsPage />} />
            <Route path="memberships" element={<MembershipsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="leaderboard" element={<LeaderboardPage />} />
            <Route path="employers" element={<EmployersPage />} />
            <Route path="refunds" element={<RefundsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
