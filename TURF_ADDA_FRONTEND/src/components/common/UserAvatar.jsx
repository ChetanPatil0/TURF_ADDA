
import useAuthStore from '../../store/authStore';

export default function UserAvatar({ size = 'default' }) {
  const { user } = useAuthStore();

  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    default: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
  };

  return (
    <div className="group relative">
      <div
        className={`rounded-full flex items-center justify-center font-semibold text-white shadow-sm ${sizeClasses[size] || sizeClasses.default}`}
        style={{ backgroundColor: 'var(--color-primary)' }}
      >
        {user?.firstName?.[0]?.toUpperCase() || '?'}
      </div>

      <div className="absolute right-0 top-full mt-2 hidden group-hover:block pointer-events-none z-50">
        <div className="bg-gray-800 text-white text-sm rounded px-3 py-2 whitespace-nowrap">
          {user?.firstName} {user?.lastName || ''} <br />
          <span className="opacity-70 capitalize">{user?.role || 'player'}</span>
        </div>
      </div>
    </div>
  );
}