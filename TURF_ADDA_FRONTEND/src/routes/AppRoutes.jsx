// import { Routes, Route, Navigate } from 'react-router-dom';
// import ProtectedRoute from './ProtectedRoute';
// import DashboardLayout from '../components/layout/DashboardLayout';

// import Signup from '../pages/Signup';
// import OTPVerify from '../pages/OTPVerify';
// import Login from '../pages/Login';

// import PlayerDashboard from '../pages/player/PlayerDashboard';
// import FindTurfs from '../pages/player/FindTurfs';
// import PlayerBookings from '../pages/player/Bookings';
// import Favorites from '../pages/player/Favorites';

// import OwnerDashboard from '../pages/owner/OwnerDashboard';
// import MyTurfs from '../pages/owner/MyTurfs';
// import AddTurf from '../pages/owner/AddTurf';
// import OwnerBookings from '../pages/owner/OwnerBookings';
// import Revenue from '../pages/owner/Revenue';

// import AdminDashboard from '../pages/admin/AdminDashboard';

// import Profile from '../pages/Profile';
// import { Typography } from '@mui/material';
// import useAuthStore from '../store/authStore';
// import TurfVerificationScreen from '../pages/admin/TurfVerificationScreen';
// import TurfVerifyDetail from '../pages/admin/TurfVerifyDetail';
// import TurfDetail from '../pages/common/TurfDetail';
// import EditTurf from '../pages/owner/EditTurf';
// import TurfDetailOwnerView from '../pages/owner/TurfDetailOwnerView';
// import AdminUsersList from '../pages/admin/AdminUsersList';
// import ChangePassword from '../pages/auth/ChangePassword';
// import ForgotPasswordVerify from '../pages/auth/ForgotPasswordVerify';
// import ForgotPasswordRequest from '../pages/auth/ForgotPasswordRequest';


// const AppRoutes = () => {
//   const { isAuthenticated, user } = useAuthStore();

//   const getHomeRedirect = () => {
//     if (!isAuthenticated) return '/login';

//     const role = user?.role?.toLowerCase();

//     if (role === 'superadmin' || role === 'admin') {
//       return '/admin';
//     }
//     if (role === 'owner') {
//       return '/owner';
//     }
//     return '/player';
//   };

//   return (
//     <Routes>
//       <Route path="/login" element={<Login />} />
//       <Route path="/signup" element={<Signup />} />
//       <Route path="/verify-otp" element={<OTPVerify />} />
//       <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
//       <Route path="/forgot-password/verify" element={<ForgotPasswordVerify />} />

//       <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

//       <Route element={<ProtectedRoute />}>
      
        
//         <Route path="/dashboard" element={<DashboardLayout />}>
//           <Route
//             index
//             element={
//               user?.role?.toLowerCase() === 'owner'
//                 ? <OwnerDashboard />
//                 : user?.role?.toLowerCase() === 'superadmin' || user?.role?.toLowerCase() === 'admin'
//                 ? <AdminDashboard />
//                 : <PlayerDashboard />
//             }
//           />
//         </Route>

//         <Route path="/player" element={<DashboardLayout />}>
//           <Route index element={<PlayerDashboard />} />
//           <Route path="find-turfs" element={<FindTurfs />} />
//           <Route path="bookings" element={<PlayerBookings />} />
//           <Route path="favorites" element={<Favorites />} />
//           <Route path="profile" element={<Profile />} />
//           <Route path="turf/:id" element={<TurfDetail />} />           
//   {/* <Route path="turf/:id/book" element={<TurfBooking />} /> */}
 
//         </Route>

//         <Route path="/owner" element={<DashboardLayout />}>
//           <Route index element={<OwnerDashboard />} />
//           <Route path="turfs" element={<MyTurfs />} />
//           <Route path="turfs/add-turf" element={<AddTurf />} />
//           <Route path="bookings" element={<OwnerBookings />} />
//           <Route path="revenue" element={<Revenue />} />
//           <Route path="profile" element={<Profile />} />
//           <Route path="turf/:id" element={<TurfDetailOwnerView />} /> 
//            <Route path="turf/:id/edit" element={<EditTurf />} />
//         </Route>

//         <Route path="/admin" element={<DashboardLayout />}>
//           <Route index element={<AdminDashboard />} />
//           <Route path="profile" element={<Profile />} />
//           <Route path="users" element={<AdminUsersList />} />
//           <Route path="turfs/pending"  element={<TurfVerificationScreen />} />
//           <Route path="turf/:id/verify" element={<TurfVerifyDetail />} />
//         </Route>


//       <Route path="/change-password" element={<ChangePassword />} />
//       </Route>

//       <Route
//         path="*"
//         element={
//           <Typography variant="h4" align="center" mt={10}>
//             404 - Page Not Found
//           </Typography>
//         }
//       />
//     </Routes>
//   );
// };

// export default AppRoutes;


import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';

import Signup from '../pages/Signup';
import OTPVerify from '../pages/OTPVerify';
import Login from '../pages/Login';

import PlayerDashboard from '../pages/player/PlayerDashboard';
import FindTurfs from '../pages/player/FindTurfs';
import PlayerBookings from '../pages/player/PlayerBookings';
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
import TurfDetail from '../pages/common/TurfDetail';
import EditTurf from '../pages/owner/EditTurf';
import TurfDetailOwnerView from '../pages/owner/TurfDetailOwnerView';
import AdminUsersList from '../pages/admin/AdminUsersList';
import ChangePassword from '../pages/auth/ChangePassword';
import ForgotPasswordVerify from '../pages/auth/ForgotPasswordVerify';
import ForgotPasswordRequest from '../pages/auth/ForgotPasswordRequest';
import PaymentScreen from '../pages/common/PaymentScreen';
import BalancePaymentScreen from '../pages/common/BalancePaymentScreen';

const AppRoutes = () => {
  const { isAuthenticated, user } = useAuthStore();

  const getHomeRedirect = () => {
    if (!isAuthenticated) return '/login';

    const role = user?.role?.toLowerCase();

    if (role === 'superadmin' || role === 'admin') {
      return '/dashboard';
    }
    if (role === 'owner') {
      return '/dashboard';
    }
    return '/dashboard'; // player also goes to dashboard
  };

  const getDashboardComponent = () => {
    const role = user?.role?.toLowerCase();

    if (role === 'superadmin' || role === 'admin') {
      return <AdminDashboard />;
    }
    if (role === 'owner') {
      return <OwnerDashboard />;
    }
    return <PlayerDashboard />;
  };

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/verify-otp" element={<OTPVerify />} />
      <Route path="/forgot-password" element={<ForgotPasswordRequest />} />
      <Route path="/forgot-password/verify" element={<ForgotPasswordVerify />} />

      {/* Home redirect */}
      <Route path="/" element={<Navigate to={getHomeRedirect()} replace />} />

      {/* Protected routes with DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Main dashboard - role based */}
          <Route path="/dashboard" element={getDashboardComponent()} />

          {/* Player-specific routes - flat/short URLs */}
          <Route path="/find-turfs" element={<FindTurfs />} />
          <Route path="/bookings" element={<PlayerBookings />} />
          <Route path="/favorites" element={<Favorites />} />

          {/* Owner-specific routes */}
          <Route path="/turfs" element={<MyTurfs />} />
          <Route path="/turfs/add-turf" element={<AddTurf />} />
          <Route path="/turfs/:id/edit" element={<EditTurf />} />
          <Route path="/owner-bookings" element={<OwnerBookings />} />
          <Route path="/revenue" element={<Revenue />} />
          <Route path="/turf/:id/owner" element={<TurfDetailOwnerView />} />

          {/* Admin-specific routes */}
          <Route path="/users" element={<AdminUsersList />} />
          <Route path="/turfs/pending" element={<TurfVerificationScreen />} />
          <Route path="/turf/:id/verify" element={<TurfVerifyDetail />} />

          {/* Shared protected routes */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/turf/:id" element={<TurfDetail />} />\
          <Route path="/payment" element={<PaymentScreen />} />
          <Route path="/pay-balance" element={<BalancePaymentScreen />} />
          <Route path="/profile/change-password" element={<ChangePassword />} />
        </Route>
      </Route>

      {/* 404 */}
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