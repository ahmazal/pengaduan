import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
import UserDashboard from './pages/user/UserDashboard';
import PrivateRoutes from './components/PrivateRoutes';
import LandingPage from './pages/landingpages/App'
import FormPengaduan from './pages/user/FormPengaduan';
import SemuaPengaduan from './pages/admin/SemuaPengaduan';
import ListAduan from './pages/user/ListAduan';
import AnalyticsPage from './pages/admin/AnalyticsPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* admin */}
      <Route path="/admin/dashboard" 
        element={
          <PrivateRoutes Role={'Admin'}>
            <AdminDashboard/>
          </PrivateRoutes>
        } 
      />
      <Route path="/admin/listAduan" 
        element={
          <PrivateRoutes Role={'Admin'}>
            <SemuaPengaduan />
          </PrivateRoutes>
        } 
      />
      <Route path="/admin/analytics" 
        element={
          <PrivateRoutes Role={'Admin'}>
            <AnalyticsPage />
          </PrivateRoutes>
        } 
      />

        {/* user */}
      <Route path='/user/dashboard' 
        element={
          <PrivateRoutes Role={'Masyarakat'} >
            <UserDashboard/>
          </PrivateRoutes>
        }
      />
      <Route path="/user/buatpengaduan" element={
        <PrivateRoutes Role={'Masyarakat'} >
            <FormPengaduan/>
          </PrivateRoutes>
      } />
      <Route path="/user/riwayat" element={
        <PrivateRoutes Role={'Masyarakat'} >
            <ListAduan/>
          </PrivateRoutes>
      } />
    </Routes>
  );
}

export default App;
