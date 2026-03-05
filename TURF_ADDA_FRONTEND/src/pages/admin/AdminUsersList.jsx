// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//   RiArrowLeftLine,
//   RiEyeLine,
//   RiShieldCheckLine,
//   RiSearchLine,
//   RiFilterLine,
// } from 'react-icons/ri';

// import Loader from '../../components/common/Loader';
// import { useMessageModal } from '../../context/MessageModalContext';
// import { getAllUsers, softDeleteUser } from '../../api/adminApi'; // make sure softDeleteUser is exported here
// import UserAvatar from '../../components/common/UserAvatar';
// import UserDetailModal from '../../components/Modal/UserDetailModal';

// const AdminUsersList = () => {
//   const navigate = useNavigate();
//   const { showMessage } = useMessageModal();

//   const [users, setUsers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   const [page, setPage] = useState(1);
//   const [limit] = useState(10);
//   const [total, setTotal] = useState(0);

//   const [search, setSearch] = useState('');
//   const [roleFilter, setRoleFilter] = useState('');
//   const [statusFilter, setStatusFilter] = useState('');

//   const [selectedUser, setSelectedUser] = useState(null);

//   useEffect(() => {
//     const fetchUsers = async () => {
//       setLoading(true);
//       setError(null);

//       const params = {
//         page,
//         limit,
//         search: search.trim() || undefined,
//         role: roleFilter || undefined,
//         status: statusFilter || undefined,
//       };

//       try {
//         const data = await getAllUsers(params);
//         if (data?.success) {
//           setUsers(data.users || []);
//           setTotal(data.total || 0);
//         } else {
//           throw new Error(data?.message || 'Failed to fetch users');
//         }
//       } catch (err) {
//         const msg = err.message || 'Failed to load users';
//         setError(msg);
//         showMessage({ type: 'error', title: 'Error', message: msg });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchUsers();
//   }, [page, search, roleFilter, statusFilter, showMessage]);

//   const handleSearchChange = (e) => {
//     setSearch(e.target.value);
//     setPage(1);
//   };

//   const handleRoleChange = (e) => {
//     setRoleFilter(e.target.value);
//     setPage(1);
//   };

//   const handleStatusChange = (e) => {
//     setStatusFilter(e.target.value);
//     setPage(1);
//   };

//   const handleClearFilters = () => {
//     setSearch('');
//     setRoleFilter('');
//     setStatusFilter('');
//     setPage(1);
//   };

//   const handleView = (user) => {
//     setSelectedUser(user);
//   };

//   const handleDeactivate = (userId, displayName = '') => {
//     const userDisplay = displayName.trim() ? `"${displayName}"` : 'this user';

//     showMessage({
//       type: 'confirm',
//       title: 'Deactivate User',
//       message: `Are you sure you want to deactivate ${userDisplay}?\n\nThis performs a soft delete — the account can be restored later.`,
//       confirmText: 'Deactivate',
//       cancelText: 'Cancel',
//       onConfirm: async () => {
//         const previousUsers = [...users];
//         setUsers((prev) => prev.filter((u) => u._id !== userId));

//         try {
//         console.log('Attempting to soft delete user with ID:', userId);
//           await softDeleteUser(userId);
         

//           showMessage({
//             type: 'success',
//             title: 'Success',
//             message: 'User deactivated successfully (soft delete)',
//           });
//         } catch (err) {
         
//           setUsers(previousUsers);

//           const errorMessage =
//             err?.response?.data?.message ||
//             err.message ||
//             'Failed to deactivate user. Please try again.';

//           showMessage({
//             type: 'error',
//             title: 'Deactivation Failed',
//             message: errorMessage,
//           });
//         }
//       },
//     });
//   };

//   const closeModal = () => setSelectedUser(null);

//   const getStatusClass = (status) => {
//     const s = (status || '').toLowerCase();
//     if (s === 'active') return 'bg-green-100 text-green-800';
//     if (s === 'inactive') return 'bg-yellow-100 text-yellow-800';
//     return 'bg-gray-100 text-gray-800';
//   };

//   const getRoleClass = (role) => {
//     const r = (role || '').toLowerCase();
//     if (r === 'superadmin') return 'bg-indigo-100 text-indigo-800';
//     if (r === 'owner') return 'bg-purple-100 text-purple-800';
//     if (r === 'player') return 'bg-blue-100 text-blue-800';
//     return 'bg-gray-100 text-gray-800';
//   };

//   const showingFrom = (page - 1) * limit + 1;
//   const showingTo = Math.min(page * limit, total);

//   return (
//     <div className="min-h-screen bg-[var(--color-bg-default)] font-roboto">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div className="flex items-center gap-4">
//             <button
//               onClick={() => navigate(-1)}
//               className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-primary)] hover:bg-gray-100 rounded-lg transition font-medium text-sm"
//             >
//               <RiArrowLeftLine size={18} />
//               Back
//             </button>

//             <div>
//               <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
//                 All Users
//               </h1>
//               <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
//                 Manage players, owners & admins in one place
//               </p>
//             </div>
//           </div>
//           <div className="w-20" />
//         </div>

//         {/* Filters */}
//         <div className="bg-[var(--color-bg-paper)] rounded-lg shadow-sm border border-[var(--color-divider)] p-4 mb-6">
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//             <div className="relative">
//               <RiSearchLine
//                 className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
//                 size={16}
//               />
//               <input
//                 type="text"
//                 value={search}
//                 onChange={handleSearchChange}
//                 placeholder="Search name, mobile, email..."
//                 className="w-full pl-9 pr-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
//               />
//             </div>

//             <select
//               value={roleFilter}
//               onChange={handleRoleChange}
//               className="w-full px-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 bg-white"
//             >
//               <option value="">All Roles</option>
//               <option value="player">Player</option>
//               <option value="owner">Owner</option>
//               <option value="superadmin">Superadmin</option>
//             </select>

//             <select
//               value={statusFilter}
//               onChange={handleStatusChange}
//               className="w-full px-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 bg-white"
//             >
//               <option value="">All Status</option>
//               <option value="active">Active</option>
//               <option value="inactive">Inactive</option>
//             </select>

//             <button
//               onClick={handleClearFilters}
//               className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)] rounded-md text-sm transition"
//             >
//               <RiFilterLine size={16} />
//               Clear
//             </button>
//           </div>
//         </div>

//         {/* Content */}
//         {loading ? (
//           <div className="flex justify-center py-16">
//             <Loader />
//           </div>
//         ) : error ? (
//           <div className="text-center py-12 text-[var(--color-error)] text-sm font-medium">{error}</div>
//         ) : users.length === 0 ? (
//           <div className="text-center py-12 text-[var(--color-text-secondary)] text-sm">
//             No users found matching your filters.
//           </div>
//         ) : (
//           <>
//             <div className="bg-[var(--color-bg-paper)] shadow-sm rounded-lg overflow-hidden border border-[var(--color-divider)]">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-[var(--color-divider)]">
//                   <thead className="bg-gray-50">
//                     <tr>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Name</th>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Mobile</th>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Email</th>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Role</th>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Location</th>
//                       <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Last Login</th>
//                       <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-[var(--color-divider)]">
//                     {users.map((user) => (
//                       <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
//                         <td className="px-5 py-3 whitespace-nowrap">
//                           <div className="flex items-center gap-2.5">
//                             <UserAvatar size="small" firstName={user.firstName} profileImage={user.profileImage} />
//                             <span className="text-sm font-medium text-[var(--color-text-primary)]">
//                               {user.firstName} {user.lastName || ''}
//                             </span>
//                           </div>
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap text-sm">
//                           <div className="flex items-center gap-1.5">
//                             {user.mobile || '—'}
//                             {user.isVerifiedMobile && <RiShieldCheckLine className="text-[var(--color-primary)]" size={14} />}
//                           </div>
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap text-sm">
//                           <div className="flex items-center gap-1.5">
//                             {user.email || '—'}
//                             {user.isVerifiedEmail && <RiShieldCheckLine className="text-[var(--color-primary)]" size={14} />}
//                           </div>
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap">
//                           <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getRoleClass(user.role)}`}>
//                             {user.role || '—'}
//                           </span>
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap">
//                           <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>
//                             {user.status || '—'}
//                           </span>
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
//                           {[user.city, user.state].filter(Boolean).join(', ') || '—'}
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
//                           {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
//                         </td>
//                         <td className="px-5 py-3 whitespace-nowrap text-right text-sm space-x-4">
//                           <button
//                             onClick={() => handleView(user)}
//                             className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
//                           >
//                             View
//                           </button>
//                           <button
//                             onClick={() =>
//                               handleDeactivate(
//                                 user._id,
//                                 `${user.firstName} ${user.lastName || ''}`.trim()
//                               )
//                             }
//                             className="text-[var(--color-error)] hover:text-red-700 font-medium"
//                           >
//                             Deactivate
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Pagination */}
//             <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-[var(--color-text-secondary)]">
//               <div className="flex gap-2">
//                 <button
//                   onClick={() => setPage((p) => Math.max(1, p - 1))}
//                   disabled={page === 1}
//                   className="px-4 py-1.5 border border-[var(--color-divider)] rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition"
//                 >
//                   Previous
//                 </button>
//                 <button
//                   onClick={() => setPage((p) => p + 1)}
//                   disabled={showingTo >= total}
//                   className="px-4 py-1.5 border border-[var(--color-divider)] rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition"
//                 >
//                   Next
//                 </button>
//               </div>

//               <div className="font-medium text-sm">
//                 Showing <span className="text-[var(--color-text-primary)]">{showingFrom}</span>–
//                 <span className="text-[var(--color-text-primary)]">{showingTo}</span> of{' '}
//                 <span className="text-[var(--color-text-primary)]">{total}</span>
//               </div>
//             </div>
//           </>
//         )}

//         {selectedUser && <UserDetailModal user={selectedUser} onClose={closeModal} />}
//       </div>
//     </div>
//   );
// };

// export default AdminUsersList;


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiShieldCheckLine,
  RiSearchLine,
  RiFilterLine,
} from 'react-icons/ri';

import Loader from '../../components/common/Loader';
import { useMessageModal } from '../../context/MessageModalContext';
import { getAllUsers, softDeleteUser } from '../../api/adminApi';
import UserAvatar from '../../components/common/UserAvatar';
import UserDetailModal from '../../components/Modal/UserDetailModal';

const AdminUsersList = () => {
  const navigate = useNavigate();
  const { showMessage } = useMessageModal();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setError(null);

      const params = {
        page,
        limit,
        search: search.trim() || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      };

      try {
        const data = await getAllUsers(params);
        if (data?.success) {
          setUsers(data.users || []);
          setTotal(data.total || 0);
        } else {
          throw new Error(data?.message || 'Failed to fetch users');
        }
      } catch (err) {
        const msg = err.message || 'Failed to load users';
        setError(msg);
        showMessage({ type: 'error', title: 'Error', message: msg });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [page, search, roleFilter, statusFilter]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleRoleChange = (e) => {
    setRoleFilter(e.target.value);
    setPage(1);
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setStatusFilter('');
    setPage(1);
  };

  const handleView = (user) => {
    setSelectedUser(user);
  };

  const handleDeactivate = (userId, displayName = '') => {
    const userDisplay = displayName.trim() ? `"${displayName}"` : 'this user';

    showMessage({
      type: 'confirm',
      title: 'Deactivate User',
      message: `Are you sure you want to deactivate ${userDisplay}?\n\nThis is a soft delete — the account can be restored later.`,
      confirmText: 'Deactivate',
      cancelText: 'Cancel',
      onConfirm: async () => {
        const previousUsers = [...users];
        setUsers((prev) => prev.filter((u) => u._id !== userId));

        try {
          await softDeleteUser(userId);
          showMessage({
            type: 'success',
            title: 'Success',
            message: 'User deactivated successfully (soft delete)',
          });
        } catch (err) {
          setUsers(previousUsers);
          const errorMsg =
            err?.response?.data?.message ||
            err.message ||
            'Failed to deactivate user. Please try again.';
          showMessage({
            type: 'error',
            title: 'Deactivation Failed',
            message: errorMsg,
          });
        }
      },
    });
  };

  const closeModal = () => setSelectedUser(null);

  const getStatusClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'active') return 'bg-green-100 text-green-800';
    if (s === 'inactive') return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getRoleClass = (role) => {
    const r = (role || '').toLowerCase();
    if (r === 'superadmin') return 'bg-indigo-100 text-indigo-800';
    if (r === 'owner') return 'bg-purple-100 text-purple-800';
    if (r === 'player') return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const showingFrom = (page - 1) * limit + 1;
  const showingTo = Math.min(page * limit, total);

  return (
    <div className="min-h-screen bg-[var(--color-bg-default)] font-roboto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-4 py-2 text-[var(--color-text-primary)] hover:bg-gray-100 rounded-lg transition font-medium text-sm"
            >
              <RiArrowLeftLine size={18} />
              Back
            </button>

            <div>
              <h1 className="text-xl font-bold text-[var(--color-text-primary)]">
                All Users
              </h1>
              <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                Manage players, owners & admins in one place
              </p>
            </div>
          </div>
          <div className="w-20" />
        </div>

        <div className="bg-[var(--color-bg-paper)] rounded-lg shadow-sm border border-[var(--color-divider)] p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <RiSearchLine
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search name, mobile, email..."
                className="w-full pl-9 pr-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40"
              />
            </div>

            <select
              value={roleFilter}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 bg-white"
            >
              <option value="">All Roles</option>
              <option value="player">Player</option>
              <option value="owner">Owner</option>
              <option value="superadmin">Superadmin</option>
            </select>

            <select
              value={statusFilter}
              onChange={handleStatusChange}
              className="w-full px-3 py-2 border border-[var(--color-divider)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]/40 bg-white"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-[var(--color-text-primary)] rounded-md text-sm transition"
            >
              <RiFilterLine size={16} />
              Clear
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader />
          </div>
        ) : error ? (
          <div className="text-center py-12 text-[var(--color-error)] text-sm font-medium">{error}</div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-[var(--color-text-secondary)] text-sm">
            No users found matching your filters.
          </div>
        ) : (
          <>
            <div className="bg-[var(--color-bg-paper)] shadow-sm rounded-lg overflow-hidden border border-[var(--color-divider)]">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--color-divider)]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Mobile</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Role</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Location</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Last Login</th>
                      <th className="px-5 py-3 text-right text-xs font-semibold text-[var(--color-text-primary)] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-divider)]">
                    {users.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar size="small" firstName={user.firstName} profileImage={user.profileImage} />
                            <span className="text-sm font-medium text-[var(--color-text-primary)]">
                              {user.firstName} {user.lastName || ''}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1.5">
                            {user.mobile || '—'}
                            {user.isVerifiedMobile && <RiShieldCheckLine className="text-[var(--color-primary)]" size={14} />}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm">
                          <div className="flex items-center gap-1.5">
                            {user.email || '—'}
                            {user.isVerifiedEmail && <RiShieldCheckLine className="text-[var(--color-primary)]" size={14} />}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getRoleClass(user.role)}`}>
                            {user.role || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getStatusClass(user.status)}`}>
                            {user.status || '—'}
                          </span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                          {[user.city, user.state].filter(Boolean).join(', ') || '—'}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-[var(--color-text-secondary)]">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right text-sm space-x-4">
                          <button
                            onClick={() => handleView(user)}
                            className="text-[var(--color-primary)] hover:text-[var(--color-primary)]/80 font-medium"
                          >
                            View
                          </button>
                          <button
                            onClick={() =>
                              handleDeactivate(
                                user._id,
                                `${user.firstName} ${user.lastName || ''}`.trim()
                              )
                            }
                            className="text-[var(--color-error)] hover:text-red-700 font-medium"
                          >
                            Deactivate
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-5 flex flex-col sm:flex-row justify-between items-center gap-3 text-sm text-[var(--color-text-secondary)]">
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-1.5 border border-[var(--color-divider)] rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={showingTo >= total}
                  className="px-4 py-1.5 border border-[var(--color-divider)] rounded-md text-sm disabled:opacity-50 hover:bg-gray-50 transition"
                >
                  Next
                </button>
              </div>

              <div className="font-medium text-sm">
                Showing <span className="text-[var(--color-text-primary)]">{showingFrom}</span>–
                <span className="text-[var(--color-text-primary)]">{showingTo}</span> of{' '}
                <span className="text-[var(--color-text-primary)]">{total}</span>
              </div>
            </div>
          </>
        )}

        {selectedUser && <UserDetailModal user={selectedUser} onClose={closeModal} />}
      </div>
    </div>
  );
};

export default AdminUsersList;