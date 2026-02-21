import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

import Signup from '../pages/Signup';
import OTPVerify from '../pages/OTPVerify';
import Login from '../pages/Login';

import PlayerHome from '../pages/player/PlayerHome';
import FindTurfs from '../pages/player/FindTurfs';
import PlayerBookings from '../pages/player/Bookings';
import Favorites from '../pages/player/Favorites';

import OwnerDashboard from '../pages/owner/OwnerDashboard';
import MyTurfs from '../pages/owner/MyTurfs';
import AddTurf from '../pages/owner/AddTurf';
import OwnerBookings from '../pages/owner/OwnerBookings';
import Revenue from '../pages/owner/Revenue';

import AdminDashboard from '../pages/admin/AdminDashboard';

import Profile from '../pages/Profile';
import { Typography } from '@mui/material';
import useAuthStore from '../store/authStore';
import TurfVerificationScreen from '../pages/admin/TurfVerificationScreen';
import TurfVerifyDetail from '../pages/admin/TurfVerifyDetail';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getHomeRedirect = () => {
    if (!isAuthenticated) return '/login';

    const role = user?.role?.toLowerCase();

    if (role === 'superadmin' || role === 'admin') {
      return '/admin';
    }
    if (role === 'owner') {
      return '/owner';
    }
    return '/player';
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<OTPVerify />} />

      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      <Route element={<ProtectedRoute />}>
        
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route
            index
            element={
              user?.role?.toLowerCase() === 'owner'
                ? <OwnerDashboard />
                : user?.role?.toLowerCase() === 'superadmin' || user?.role?.toLowerCase() === 'admin'
                ? <AdminDashboard />
                : <PlayerHome />
            }
          />
        </Route>

        <Route path="/player" element={<DashboardLayout />}>
          <Route index element={<PlayerHome />} />
          <Route path="find-turfs" element={<FindTurfs />} />
          <Route path="bookings" element={<PlayerBookings />} />
          <Route path="favorites" element={<Favorites />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/owner" element={<DashboardLayout />}>
          <Route index element={<OwnerDashboard />} />
          <Route path="turfs" element={<MyTurfs />} />
          <Route path="add-turf" element={<AddTurf />} />
          <Route path="bookings" element={<OwnerBookings />} />
          <Route path="revenue" element={<Revenue />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="/admin/turfs/pending"  element={<TurfVerificationScreen />} />
          <Route path="/admin/turf/:id/verify" element={<TurfVerifyDetail />} />
        </Route>

      </Route>

      <Route
        path="*"
        element={
          <Typography variant="h4" align="center" mt={10}>
            404 - Page Not Found
          </Typography>
        }
      />
    </Routes>
  );
};

export default AppRoutes;