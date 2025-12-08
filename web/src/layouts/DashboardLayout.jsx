import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Users,
    Calendar,
    LogOut,
    Menu,
    X,
    Settings,
    User
} from 'lucide-react';
import clsx from 'clsx';

const DashboardLayout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: user?.role === 'admin' ? '/admin' : '/dashboard', icon: LayoutDashboard },
        ...(user?.role === 'admin' ? [
            { label: 'Members', path: '/admin/users', icon: Users },
            { label: 'Events', path: '/admin/events', icon: Calendar },
        ] : [
            { label: 'Events', path: '/events', icon: Calendar },
        ]),
        // { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Profile', path: '/profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={clsx(
                "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center px-6 border-b border-gray-100">
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                            Goaldah United
                        </span>
                    </div>

                    <div className="flex-1 py-6 px-4 space-y-1">
                        {navItems?.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors",
                                    location.pathname === item.path
                                        ? "bg-blue-50 text-blue-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                <item.icon className={clsx("mr-3 h-5 w-5", location.pathname === item.path ? "text-blue-600" : "text-gray-400")} />
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    <div className="p-4 border-t border-gray-100">
                        <Link to="/profile" className="flex items-center p-4 bg-gray-50 rounded-xl mb-3 hover:bg-gray-100 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden">
                                {user?.profile_picture ? (
                                    <img src={user?.profile_picture} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    user?.name?.charAt(0) || 'U'
                                )}
                            </div>
                            <div className="ml-3 overflow-hidden">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate capitalize">{user?.role}</p>
                            </div>
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-2 text-sm font-medium text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
                    <button
                        onClick={() => setIsSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                    >
                        <Menu className="h-6 w-6" />
                    </button>
                    <div className="flex-1 flex justify-end">
                        {/* Header actions can go here */}
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
