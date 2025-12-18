import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import { useAuth } from './hooks/useAuth';
const Home = React.lazy(() => import('./pages/Home'));
const Assignments = React.lazy(() => import('./pages/Assignments'));
const Admin = React.lazy(() => import('./pages/Admin'));
const SignIn = React.lazy(() => import('./pages/SignIn'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }



  return (
    <Router>
      <Layout>
        <React.Suspense fallback={
          <div className="flex h-screen w-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        }>
          <Routes>
            <Route path="/" element={user ? (user.role === 'BOARD_ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/assignments" replace />) : <Home />} />
            <Route path="/signin" element={user ? (user.role === 'BOARD_ADMIN' ? <Navigate to="/admin" replace /> : <Navigate to="/assignments" replace />) : <SignIn />} />
            <Route path="/assignments" element={user ? <Assignments /> : <Navigate to="/" replace />} />
            <Route path="/admin" element={['BOARD_ADMIN', 'TECH_LEAD', 'PRODUCT_MANAGER'].includes(user?.role || '') ? <Admin /> : <Navigate to="/assignments" replace />} />
          </Routes>
        </React.Suspense>
      </Layout>
    </Router>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRoutes />
    </QueryClientProvider>
  );
}

export default App;