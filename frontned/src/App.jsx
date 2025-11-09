import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import PrivateRoutes from './components/PrivateRoutes';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin/dashboard" 
        element={
          <PrivateRoutes Role={'Admin'}>
            <AdminDashboard/>
          </PrivateRoutes>
        } 
        />
      <Route path='/user/dashboard' 
        element={
          <PrivateRoutes Role={'Masyarakat'} >
            <UserDashboard/>
          </PrivateRoutes>
        }
      />
    </Routes>
  );
}

export default App;
