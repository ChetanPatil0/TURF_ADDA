import { FiMenu } from 'react-icons/fi';
import Logo from './Logo';
import UserAvatar from './UserAvatar';

export default function Header({ onMobileMenuToggle, role, user }) {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 h-16 border-b flex items-center justify-between px-4 sm:px-6 lg:px-8"
      style={{
        backgroundColor: 'var(--color-bg-paper)',
        borderColor: 'var(--color-divider)',
      }}
    >
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Toggle menu"
        >
          <FiMenu size={24} style={{ color: 'var(--color-text-secondary)' }} />
        </button>

        <Logo isOwner={role === 'owner'} />
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex flex-col items-end">
          <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
            {user?.firstName} {user?.lastName || ''}
          </span>
          <span className="text-xs capitalize" style={{ color: 'var(--color-text-secondary)' }}>
            {role}
          </span>
        </div>

        <UserAvatar />
      </div>
    </header>
  );
}