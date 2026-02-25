import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Superadmin whitelist — works even if DB role update is pending
const ADMIN_EMAILS = ['sudhansu@gmail.com'];

// Pages
import Home from './pages/Home';
import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import Listings from './pages/Listings';
import PropertyDetails from './pages/PropertyDetails';
import Messages from './pages/Messages';
import Roommates from './pages/Roommates';
import Dashboard from './pages/dashboard/Dashboard';
import OwnerDashboard from './pages/dashboard/OwnerDashboard';
import AddListing from './pages/dashboard/AddListing';
import EditListing from './pages/dashboard/EditListing';
import AdminPanel from './pages/admin/AdminPanel';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-plum-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin-only Route wrapper
const AdminRoute = ({ children }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-plum-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const isAdmin = profile?.role === 'admin' || ADMIN_EMAILS.includes(user?.email);
  if (!isAdmin) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/property/:id" element={<PropertyDetails />} />
              <Route path="/roommates" element={<Roommates />} />
              <Route path="/messages" element={
                <ProtectedRoute><Messages /></ProtectedRoute>
              } />
              <Route path="/dashboard" element={
                <ProtectedRoute><Dashboard /></ProtectedRoute>
              } />
              <Route path="/owner-dashboard" element={
                <ProtectedRoute><OwnerDashboard /></ProtectedRoute>
              } />
              <Route path="/dashboard/add-listing" element={
                <ProtectedRoute><AddListing /></ProtectedRoute>
              } />
              <Route path="/dashboard/edit-listing/:id" element={
                <ProtectedRoute><EditListing /></ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute><AdminPanel /></AdminRoute>
              } />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
