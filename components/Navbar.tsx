import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import { Settings, LogOut, History, User, LogIn } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (status === 'loading') {
    return (
      <div className="absolute top-6 right-6">
        <div className="w-10 h-10 bg-white/10 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="absolute top-6 right-6 flex items-center gap-3">
      {/* Settings Icon */}
      <button
        onClick={() => router.push('/admin')}
        className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        title="Admin Settings"
      >
        <Settings className="w-6 h-6" />
      </button>

      {/* Auth Section */}
      {session ? (
        <div className="relative" ref={dropdownRef}>
          {/* User Avatar/Button */}
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white rounded-lg px-4 py-2 transition-colors"
          >
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <User className="w-6 h-6" />
            )}
            <span className="font-medium hidden sm:block">{session.user?.name}</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-700">
                <p className="text-sm font-medium text-white">{session.user?.name}</p>
                <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    router.push('/history');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                >
                  <History className="w-4 h-4" />
                  History
                </button>

                <button
                  onClick={() => {
                    router.push('/admin');
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-white hover:bg-white/10 flex items-center gap-3 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Admin Settings
                </button>

                <div className="border-t border-gray-700 my-2"></div>

                <button
                  onClick={() => {
                    signOut({ callbackUrl: '/' });
                    setShowDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-white/10 flex items-center gap-3 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={() => signIn()}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
        >
          <LogIn className="w-5 h-5" />
          Login
        </button>
      )}
    </div>
  );
}
