import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import Layout from './components/Layout';
import Home from './pages/Home';
import Game from './pages/Game';
import Earnings from './pages/Earnings';
import Referrals from './pages/Referrals';
import Login from './pages/Login';
import Register from './pages/Register';
import Admin from './pages/Admin';
import AdViewer from './pages/AdViewer'; // Import New Page
import LoadingScreen from './components/LoadingScreen';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Home />} />
        <Route path="game" element={<Game />} />
        <Route path="earnings" element={<Earnings />} />
        <Route path="referrals" element={<Referrals />} />
        <Route path="admin" element={<Admin />} />
      </Route>
      
      {/* Ad Route (Protected but outside Layout for full screen) */}
      <Route path="/ads" element={
        <ProtectedRoute>
          <AdViewer />
        </ProtectedRoute>
      } />

    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '12px', background: '#333', color: '#fff' } }} />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
