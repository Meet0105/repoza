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
      <div className="fixed top-0 left-0 right-0 z-50">
        <div className="glass-strong border-b border-white/10">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="w-32 h-8 bg-white/10 rounded-lg animate-pulse"></div>
            <div className="w-24 h-10 bg-white/10 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 animate-slide-up">
      <div className="glass-strong border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-3 group"
          >
            <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center shadow-lg group-hover:shadow-glow-cyan transition-all duration-300">
              <span className="text-2xl font-bold text-white">R</span>
            </div>
            <span className="text-2xl font-bold gradient-text-primary hidden sm:block">
              Repoza
            </span>
          </button>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => router.push('/')}
              className={`text-sm font-medium transition-all duration-300 hover:text-cyan-400 ${router.pathname === '/' ? 'text-cyan-400' : 'text-gray-300'
                }`}
            >
              Search
            </button>
            <button
              onClick={() => router.push('/generator')}
              className={`text-sm font-medium transition-all duration-300 hover:text-purple-400 ${router.pathname === '/generator' ? 'text-purple-400' : 'text-gray-300'
                }`}
            >
              Generator
            </button>
            {session && (
              <>
                <button
                  onClick={() => router.push('/collections')}
                  className={`text-sm font-medium transition-all duration-300 hover:text-pink-400 ${router.pathname === '/collections' ? 'text-pink-400' : 'text-gray-300'
                    }`}
                >
                  Collections
                </button>
                <button
                  onClick={() => router.push('/history')}
                  className={`text-sm font-medium transition-all duration-300 hover:text-cyan-400 ${router.pathname === '/history' ? 'text-cyan-400' : 'text-gray-300'
                    }`}
                >
                  History
                </button>
              </>
            )}
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {/* Settings Icon */}
            {session && (
              <button
                onClick={() => router.push('/admin')}
                className="p-2.5 glass-light hover:glass text-gray-300 hover:text-cyan-400 rounded-lg transition-all duration-300 hover-lift"
                title="Admin Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            {/* Auth Section */}
            {session ? (
              <div className="relative" ref={dropdownRef}>
                {/* User Avatar/Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 glass-light hover:glass text-white rounded-lg px-3 py-2 transition-all duration-300 hover-lift"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || 'User'}
                      className="w-8 h-8 rounded-full ring-2 ring-cyan-500/30"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="font-medium hidden sm:block">{session.user?.name}</span>
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-56 glass-strong border border-white/10 rounded-xl shadow-xl overflow-hidden animate-slide-up">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-white/10 bg-gradient-to-r from-cyan-500/10 to-blue-500/10">
                      <p className="text-sm font-semibold text-white">{session.user?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{session.user?.email}</p>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={() => {
                          router.push('/collections');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all duration-300"
                      >
                        <History className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-medium">Collections</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push('/history');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all duration-300"
                      >
                        <History className="w-4 h-4 text-cyan-400" />
                        <span className="text-sm font-medium">History</span>
                      </button>

                      <button
                        onClick={() => {
                          router.push('/admin');
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-gray-300 hover:text-white hover:bg-white/10 flex items-center gap-3 transition-all duration-300"
                      >
                        <Settings className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-medium">Admin Settings</span>
                      </button>

                      <div className="border-t border-white/10 my-2"></div>

                      <button
                        onClick={() => {
                          signOut({ callbackUrl: '/' });
                          setShowDropdown(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-3 transition-all duration-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="btn-primary flex items-center gap-2"
              >
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
