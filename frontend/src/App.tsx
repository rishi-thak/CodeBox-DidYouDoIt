import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Assignments from './pages/Assignments';
import Admin from './pages/Admin';
import { useAuth } from './hooks/useAuth';

import SignIn from './pages/SignIn';

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="h-screen w-screen flex items-center justify-center bg-background text-primary">Loading...</div>;
  }

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/assignments" replace /> : <Home />} />
          <Route path="/signin" element={user ? <Navigate to="/assignments" replace /> : <SignIn />} />
          <Route path="/assignments" element={user ? <Assignments /> : <Navigate to="/" replace />} />
          <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/assignments" replace />} />
        </Routes>
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