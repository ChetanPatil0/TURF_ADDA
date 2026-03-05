import { BASE_URL_MEDIA } from "../../const";

export default function UserAvatar({
  size = 'default',
  className = '',
  firstName = '',          
  profileImage = null,      
}) {
  const sizeClasses = {
    small: 'w-8 h-8 text-sm',
    default: 'w-10 h-10 text-sm',
    large: 'w-12 h-12 text-base',
    xlarge: 'w-16 h-16 text-lg',
    '2xl': 'w-20 h-20 text-2xl',
    '4xl': 'w-32 h-32 text-4xl',
  };

  const selectedSize = sizeClasses[size] || sizeClasses.default;

  const imageUrl = BASE_URL_MEDIA + profileImage || null;
  console.log('UserAvatar imageUrl:', imageUrl);


  const initial = firstName?.trim()?.[0]?.toUpperCase() || '?';

  return (
    <div
      className={`
        rounded-full 
        flex items-center justify-center 
        font-semibold text-white 
        shadow-sm
        overflow-hidden
        ${selectedSize}
        ${className}
      `}
      style={{ backgroundColor: 'var(--color-primary)' }}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.nextSibling.style.display = 'flex';
          }}
        />
      ) : null}

      <div
        className="w-full h-full flex items-center justify-center"
        style={{ display: imageUrl ? 'none' : 'flex' }}
      >
        {initial}
      </div>
    </div>
  );
}