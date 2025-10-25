import { FaUserSecret } from 'react-icons/fa6';

interface ProfileAvatarProps {
  profilePicture?: string | null;
  role?: string;
  username?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function ProfileAvatar({
  profilePicture,
  role,
  username,
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-base',
    md: 'w-12 h-12 text-xl',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
  };

  const sizeClass = sizeClasses[size];

  // If user has a profile picture, show it
  if (profilePicture) {
    const profilePicUrl = profilePicture.startsWith('/')
      ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${profilePicture}`
      : profilePicture;

    return (
      <img
        src={profilePicUrl}
        alt={username || 'Profilbild'}
        className={`${sizeClass} rounded-full object-cover ${className}`}
      />
    );
  }

  // If user is a customer without profile picture, show FaUserSecret icon
  if (role === 'customer') {
    return (
      <div className={`${sizeClass} rounded-full bg-page-secondary flex items-center justify-center ${className}`}>
        <FaUserSecret className="text-primary" style={{ fontSize: '95%' }} />
      </div>
    );
  }

  // Default fallback: show first letter of username
  const initial = username?.[0]?.toUpperCase() || '?';
  return (
    <div className={`${sizeClass} rounded-full bg-gradient-to-r from-[#00d4ff] via-[#4d7cfe] to-[#b845ed] flex items-center justify-center ${className}`}>
      <span className="text-[#0f1419] font-bold" style={{ fontSize: '60%' }}>
        {initial}
      </span>
    </div>
  );
}
