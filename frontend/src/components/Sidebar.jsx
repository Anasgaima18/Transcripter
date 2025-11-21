import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const location = useLocation();
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { path: '/record', label: 'Record', icon: '🎙️' },
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    ];

    return (
        <aside className="fixed left-4 top-4 bottom-4 w-64 glass rounded-3xl p-6 flex flex-col z-50 hidden md:flex">
            <div className="flex items-center gap-3 px-2 mb-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-background font-bold text-xl shadow-[0_0_20px_rgba(0,255,128,0.3)]">
                    T
                </div>
                <span className="text-xl font-bold tracking-wide text-foreground">
                    Transcripter
                </span>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        className={`
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
              ${isActive(item.path)
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                                : 'hover:bg-white/10 text-muted-foreground hover:text-foreground'
                            }
            `}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="font-medium">{item.label}</span>
                    </Link>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-white/10">
                <div className="flex items-center gap-3 px-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center text-white text-sm font-bold">
                        {user?.username?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate text-foreground">{user?.username}</p>
                        <p className="text-xs text-muted-foreground truncate">Pro Plan</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-all duration-300"
                >
                    <span>🚪</span>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
