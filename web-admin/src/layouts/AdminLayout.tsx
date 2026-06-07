import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  LayoutDashboard, Users, FileText, Vote, Ticket, Crown,
  DollarSign, Flag, Settings, Bell, LogOut, Menu, X, ChevronDown, TrendingUp, Briefcase, Search, Moon, Sun, RotateCcw, Award
} from 'lucide-react';
import api from '../services/api';
import { connectSocket, disconnectSocket, joinUserRoom, joinAdminRoom, leaveAdminRoom, onNotificationNew, isSocketConnected } from '../services/socket';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-blue-500 to-cyan-500' },
  { to: '/users', icon: Users, label: 'Users', color: 'from-purple-500 to-pink-500' },
  { to: '/employers', icon: Briefcase, label: 'Employers', color: 'from-indigo-500 to-blue-500' },
  { to: '/posts', icon: FileText, label: 'Posts', color: 'from-green-500 to-emerald-500' },
  { to: '/votes', icon: Vote, label: 'Votes', color: 'from-orange-500 to-red-500' },
  { to: '/tickets', icon: Ticket, label: 'Tickets', color: 'from-pink-500 to-rose-500' },
  { to: '/challenges', icon: Award, label: 'Challenges', color: 'from-emerald-500 to-green-500' },
  { to: '/leaderboard', icon: TrendingUp, label: 'Leaderboard', color: 'from-yellow-500 to-orange-500' },
  { to: '/memberships', icon: Crown, label: 'Memberships', color: 'from-amber-500 to-yellow-500' },
  { to: '/payments', icon: DollarSign, label: 'Payments', color: 'from-emerald-500 to-teal-500' },
  { to: '/reports', icon: Flag, label: 'Reports', color: 'from-red-500 to-pink-500' },
  { to: '/refunds', icon: RotateCcw, label: 'Refunds', color: 'from-orange-500 to-amber-500' },
  { to: '/settings', icon: Settings, label: 'Settings', color: 'from-gray-500 to-slate-500' },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout, setUser } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch user info once on mount if not already loaded
  useEffect(() => {
    let isMounted = true;
    
    if (!user) {
      api.get('/auth/me')
        .then((res) => {
          if (isMounted) {
            const userData = res.data.data;
            setUser(userData);
            const token = localStorage.getItem('accessToken');
            if (token) {
              connectSocket(token);
              joinUserRoom(userData.id);
              // Join admin room for real-time notifications
              if (['ADMIN', 'SUPER_ADMIN'].includes(userData.role)) {
                joinAdminRoom();
              }
            }
          }
        })
        .catch(() => {});
    }
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty deps - run only once on mount

  // Cleanup socket connections on unmount
  useEffect(() => {
    return () => {
      leaveAdminRoom();
      disconnectSocket();
    };
  }, []); // Separate cleanup effect

  useEffect(() => {
    // Close sidebar on route change (mobile)
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getCurrentPageTitle = () => {
    const item = navItems.find(item => item.to === location.pathname);
    return item?.label || 'Dashboard';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/40 flex overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gradient-to-br from-black/70 via-black/60 to-black/70 backdrop-blur-md z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
          style={{ animation: 'fadeIn 0.2s ease-out' }}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed top-0 left-0 h-full w-64 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white z-50 transform transition-all duration-300 ease-out lg:translate-x-0 lg:static shadow-2xl flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05)'
        }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-pink-500/10 pointer-events-none" 
          style={{ animation: 'pulse 8s ease-in-out infinite' }} 
        />

        {/* Logo Header */}
        <div className="relative flex items-center justify-between px-4 py-4 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/50 animate-pulse-slow">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-xl blur opacity-50 animate-pulse"></div>
              <LayoutDashboard size={20} className="text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight">KSKA</h1>
              <p className="text-[10px] text-indigo-300 font-medium">Admin Panel</p>
            </div>
          </div>
          <button 
            className="lg:hidden p-2 hover:bg-white/10 rounded-lg transition-all duration-200 hover:rotate-90" 
            onClick={() => setSidebarOpen(false)}
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="relative flex-1 px-2 py-3 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent hover:scrollbar-thumb-white/20 min-h-0">
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-600/90 to-purple-600/90 text-white shadow-lg shadow-indigo-500/30 scale-[1.02]' 
                    : 'text-gray-300 hover:bg-white/5 hover:text-white hover:scale-[1.01]'
                }`
              }
              style={{ 
                animationDelay: `${index * 30}ms`,
                animation: 'slideInLeft 0.3s ease-out backwards'
              }}
            >
              {({ isActive }) => (
                <>
                  {/* Animated background on hover */}
                  {!isActive && (
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl`}></div>
                  )}
                  
                  {/* Icon with gradient on active */}
                  <div className={`relative p-1.5 rounded-lg transition-all duration-300 ${
                    isActive 
                      ? `bg-white/20 shadow-lg` 
                      : 'group-hover:bg-white/10'
                  }`}>
                    <item.icon 
                      size={16} 
                      className={`transition-all duration-300 ${
                        isActive 
                          ? 'text-white' 
                          : 'text-gray-400 group-hover:text-white group-hover:scale-110'
                      }`} 
                    />
                  </div>
                  
                  <span className="font-medium text-[13px] relative z-10">{item.label}</span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <>
                      <div className="ml-auto flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                        <div className="w-1 h-1 bg-white/70 rounded-full animate-pulse delay-75"></div>
                      </div>
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-l-full"></div>
                    </>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom User Info with modern design */}
        <div className="relative px-3 py-3 border-t border-white/10 bg-gradient-to-br from-black/30 to-indigo-900/20 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300 group cursor-pointer">
            <div className="relative w-9 h-9 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30 flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg blur opacity-50 animate-pulse"></div>
              <span className="relative z-10">{user?.fullName?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">{user?.fullName || 'Admin'}</p>
              <p className="text-[10px] text-indigo-300 truncate">{user?.role || 'Administrator'}</p>
            </div>
            <ChevronDown size={14} className="text-gray-400 group-hover:text-white transition-colors" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-0 h-full overflow-hidden">
        {/* Top Bar with glassmorphism */}
        <header className="relative bg-white/70 backdrop-blur-2xl shadow-sm border-b border-white/60 h-14 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 flex-shrink-0">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 pointer-events-none"></div>
          
          <div className="relative flex items-center gap-3 flex-1">
            <button 
              className="lg:hidden p-2 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group hover:scale-110 active:scale-95" 
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} className="text-gray-700 group-hover:text-indigo-600 transition-colors" />
            </button>
            
            {/* Page Title with icon - mobile */}
            <div className="flex items-center gap-2 lg:hidden">
              {navItems.find(item => item.to === location.pathname)?.icon && (
                <div className={`p-1.5 rounded-lg bg-gradient-to-br ${navItems.find(item => item.to === location.pathname)?.color}`}>
                  {(() => {
                    const Icon = navItems.find(item => item.to === location.pathname)?.icon;
                    return Icon ? <Icon size={16} className="text-white" /> : null;
                  })()}
                </div>
              )}
              <h2 className="text-sm font-bold text-gray-900">{getCurrentPageTitle()}</h2>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center flex-1 max-w-md">
              <div className="relative w-full group">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search anything..." 
                  className="w-full pl-10 pr-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-transparent rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-200 focus:bg-white transition-all duration-300 placeholder:text-gray-400"
                />
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-2">
            {/* Dark mode toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="hidden md:flex p-2 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group hover:scale-110 active:scale-95"
            >
              {darkMode ? (
                <Sun size={18} className="text-gray-600 group-hover:text-amber-500 transition-colors" />
              ) : (
                <Moon size={18} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
              )}
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group hover:scale-110 active:scale-95">
              <Bell size={18} className="text-gray-600 group-hover:text-indigo-600 transition-colors" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-gradient-to-br from-red-500 to-pink-500 rounded-full shadow-lg shadow-red-500/50 animate-pulse"></span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
            </button>
            
            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 transition-all duration-300 group hover:scale-105 active:scale-95"
              >
                <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-indigo-500/30 group-hover:shadow-indigo-500/50 transition-all duration-300">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-lg blur opacity-50"></div>
                  <span className="relative z-10">{user?.fullName?.charAt(0) || 'A'}</span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-gray-900 leading-tight">{user?.fullName}</p>
                  <p className="text-[10px] text-gray-500 leading-tight">{user?.role}</p>
                </div>
                <ChevronDown size={14} className="text-gray-500 hidden md:block group-hover:text-indigo-600 transition-colors" />
              </button>
              
              {profileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-60 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/60 overflow-hidden"
                  style={{ animation: 'slideDown 0.2s ease-out' }}
                >
                  {/* Gradient header */}
                  <div className="relative px-4 py-4 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent"></div>
                    <div className="relative flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {user?.fullName?.charAt(0) || 'A'}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{user?.fullName}</p>
                        <p className="text-xs text-white/80 truncate">{user?.email}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-2">
                    <div className="px-3 py-2 mb-2">
                      <span className="inline-block text-[10px] px-2.5 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full font-bold">
                        {user?.role}
                      </span>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2.5 text-sm text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 flex items-center gap-2 font-semibold transition-all duration-300 rounded-xl group"
                    >
                      <LogOut size={16} className="group-hover:scale-110 transition-transform" /> 
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content with subtle animation */}
        <main className="flex-1 p-3 sm:p-4 lg:p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400 min-h-0">
          <div className="max-w-[1600px] mx-auto" style={{ animation: 'fadeInUp 0.3s ease-out' }}>
            <Outlet />
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .delay-75 {
          animation-delay: 75ms;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 10px;
        }
        .scrollbar-thin:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.5);
        }
        .scrollbar-thumb-white\\/10::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
        }
        .scrollbar-thumb-white\\/10:hover::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
        }
        .scrollbar-thumb-gray-300::-webkit-scrollbar-thumb {
          background: rgba(209, 213, 219, 0.5);
        }
        .scrollbar-thumb-gray-400:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.7);
        }
      `}</style>
    </div>
  );
}
