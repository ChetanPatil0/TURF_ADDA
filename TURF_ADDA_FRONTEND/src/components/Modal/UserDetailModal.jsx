import React from 'react';
import { RiCloseLine, RiShieldCheckLine } from 'react-icons/ri';
import UserAvatar from '../common/UserAvatar';

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusTextClass = (status) => {
    const s = status?.toLowerCase();
    if (s === 'active') return 'text-green-600';
    if (s === 'inactive') return 'text-yellow-600';
    return 'text-gray-800';
  };

  const getRoleTextClass = (role) => {
    const r = role?.toLowerCase();
    if (r === 'superadmin') return 'text-indigo-600';
    if (r === 'owner') return 'text-purple-600';
    if (r === 'player') return 'text-blue-600';
    return 'text-gray-800';
  };

  return (
    <div className="fixed inset-0 bg-[rgba(0,0,0,0.3)] bg-opacity-30 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto border border-gray-200">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold text-gray-900">User Details</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition"
            aria-label="Close"
          >
            <RiCloseLine size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="p-6 space-y-7 text-gray-800 text-sm">
          <div className="flex items-start gap-5 pb-6 border-b border-gray-100">
            <UserAvatar
              size="large"
              firstName={user.firstName}
              profileImage={user.profileImage}
            />
            <div className="flex-1">
              <h3 className="text-xl font-bold text-gray-900 mb-1">
                {user.firstName} {user.middleName || ''} {user.lastName}
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  {user.role}
                </span>
                <span className="text-sm font-medium text-gray-600">
                  {user.status}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                First Name
              </label>
              <div className="font-medium">{user.firstName || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Middle Name
              </label>
              <div className="font-medium">{user.middleName || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Last Name
              </label>
              <div className="font-medium">{user.lastName || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Role
              </label>
              <div className={`font-medium ${getRoleTextClass(user.role)}`}>
                {user.role || '—'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Status
              </label>
              <div className={`font-medium ${getStatusTextClass(user.status)}`}>
                {user.status || '—'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Mobile Number
              </label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.mobile || '—'}</span>
                {user.isVerifiedMobile && (
                  <RiShieldCheckLine className="text-green-600" size={16} />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user.email || '—'}</span>
                {user.isVerifiedEmail && (
                  <RiShieldCheckLine className="text-green-600" size={16} />
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Country
              </label>
              <div className="font-medium capitalize">{user.country || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                State
              </label>
              <div className="font-medium">{user.state || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                City
              </label>
              <div className="font-medium">{user.city || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Area
              </label>
              <div className="font-medium">{user.area || '—'}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Created At
              </label>
              <div className="font-medium">{formatDate(user.createdAt)}</div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                Last Login
              </label>
              <div className="font-medium">{formatDate(user.lastLogin)}</div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;