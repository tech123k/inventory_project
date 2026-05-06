import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/auth/Login';
import Signup from './pages/auth/Signup';
import ForgotPassword from './pages/auth/ForgotPassword';
import ChangePassword from './pages/auth/ChangePassword';

import Dashboard from './pages/inventory/Dashboard';
import AddStock from './pages/inventory/AddStock';
import StockOut from './pages/inventory/StockOut';
import StockTable from './pages/inventory/StockTable';
import Catalogue from './pages/inventory/Catalogue';
import Movements from './pages/inventory/Movements';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontFamily: 'Inter, sans-serif', fontSize: '14px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' },
            success: { iconTheme: { primary: '#10b981', secondary: '#fff' } },
            error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } }
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Protected */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/add-stock" element={<PrivateRoute><AddStock /></PrivateRoute>} />
          <Route path="/stock-out" element={<PrivateRoute><StockOut /></PrivateRoute>} />
          <Route path="/stock-table" element={<PrivateRoute><StockTable /></PrivateRoute>} />
          <Route path="/catalogue" element={<PrivateRoute><Catalogue /></PrivateRoute>} />
          <Route path="/movements" element={<PrivateRoute><Movements /></PrivateRoute>} />
          <Route path="/change-password" element={<PrivateRoute><ChangePassword /></PrivateRoute>} />

          {/* Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
