import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

import {
  FiHome,
  FiSearch,
  FiCalendar,
  FiHeart,
  FiUser,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';

import {
  MdOutlineSportsSoccer,
  MdAddCircleOutline,
  MdAttachMoney,
} from 'react-icons/md';

export default function Sidebar({
  mobileOpen,
  onClose,
  isCollapsed,
  toggleCollapse,
  variant = 'desktop',
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const role = user?.role || 'player';

  const playerMenu = [
    { label: 'Home', icon: <FiHome />, path: '/dashboard' },
    { label: 'Find Turfs', icon: <FiSearch />, path: '/player/find-turfs' },
    { label: 'My Bookings', icon: <FiCalendar />, path: '/player/bookings' },
    { label: 'Favorites', icon: <FiHeart />, path: '/player/favorites' },
    { label: 'Profile', icon: <FiUser />, path: '/player/profile' },
  ];

  const ownerMenu = [
    { label: 'Dashboard', icon: <FiHome />, path: '/dashboard' },
    { label: 'My Turfs', icon: <MdOutlineSportsSoccer />, path: '/owner/turfs' },
    { label: 'Add Turf', icon: <MdAddCircleOutline />, path: '/owner/turfs/add' },
    { label: 'Bookings', icon: <FiCalendar />, path: '/owner/bookings' },
    { label: 'Revenue', icon: <MdAttachMoney />, path: '/owner/revenue' },
    { label: 'Profile', icon: <FiUser />, path: '/owner/profile' },
  ];

  const menuItems = role === 'owner' ? ownerMenu : playerMenu;

  const isActive = (path) => location.pathname.startsWith(path);

  const baseClasses = "bg-[var(--color-bg-paper)] border-r border-[var(--color-divider)] flex flex-col transition-all duration-300 ease-in-out";

  const desktopClasses =
    variant === 'desktop'
      ? `hidden lg:flex sticky top-16 h-[calc(100vh-4rem)] ${isCollapsed ? 'w-20' : 'w-64'}`
      : '';

  const mobileClasses =
    variant === 'mobile'
      ? `fixed top-16 bottom-0 left-0 z-50 w-[80%] max-w-[320px] transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`
      : '';

  return (
    <>
      <aside className={`${baseClasses} ${desktopClasses} ${mobileClasses}`}>
        <div className="flex flex-col h-full p-4">
          {variant === 'desktop' && (
            <button
              onClick={toggleCollapse}
              className="self-end p-2 mb-4 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isCollapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>
          )}

          <nav className="flex flex-col gap-1.5 flex-1">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  navigate(item.path);
                  if (variant === 'mobile') onClose();
                }}
                className={`
                  relative flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left
                  transition-all duration-200
                  ${isActive(item.path)
                    ? 'bg-[var(--color-primary-light)]/70 text-[var(--color-primary)] font-medium shadow-sm'
                    : 'text-[var(--color-text-secondary)] hover:bg-gray-100 hover:text-[var(--color-text-primary)]'
                  }
                  ${isCollapsed && variant === 'desktop' ? 'justify-center px-3' : ''}
                `}
              >
                <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>

                {(variant === 'mobile' || !isCollapsed) && (
                  <span className="text-[15px] font-medium truncate">{item.label}</span>
                )}

                {isActive(item.path) && !isCollapsed && variant === 'desktop' && (
                  <div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full"
                    style={{ backgroundColor: 'var(--color-primary)' }}
                  />
                )}
              </button>
            ))}
          </nav>

          <div className="pt-4 mt-4 border-t" style={{ borderColor: 'var(--color-divider)' }}>
            <button
              onClick={() => {
                logout();
                navigate('/login');
              }}
              className={`
                flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left
                text-[var(--color-text-secondary)] hover:bg-red-50 hover:text-red-600
                transition-all duration-200
                ${isCollapsed && variant === 'desktop' ? 'justify-center px-3' : ''}
              `}
            >
              <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                <FiLogOut />
              </div>

              {(variant === 'mobile' || !isCollapsed) && (
                <span className="text-[15px] font-medium">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>

      {variant === 'mobile' && mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
}