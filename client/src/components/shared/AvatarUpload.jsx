'use client';
import { useRouter } from 'next/navigation';
import { Camera } from 'lucide-react';

export default function AvatarUpload({ currentAvatar, userName, size = 'md' }) {
  const router = useRouter();

  // Size classes for the avatar display
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-20 h-20',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-2xl',
    lg: 'text-3xl',
    xl: 'text-4xl',
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  const handleClick = () => {
    router.push('/avatar');
  };

  const displayAvatar = currentAvatar || null;
  const initials = userName?.charAt(0).toUpperCase() || 'U';

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-4 border-slate-900 shadow-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center`}>
        {displayAvatar ? (
          <img 
            src={displayAvatar} 
            alt="Avatar" 
            className="w-full h-full object-cover"
          />
        ) : (
          <span className={`${textSizeClasses[size]} font-bold text-white`}>{initials}</span>
        )}
      </div>
      
      {/* Upload overlay button - navigates to avatar page */}
      <button
        onClick={handleClick}
        className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
      >
        <Camera className={`${iconSizeClasses[size]} text-white`} />
      </button>
    </div>
  );
}
