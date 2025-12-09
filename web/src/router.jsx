import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Users from './pages/admin/Users';
import AdminEvents from './pages/admin/Events'; // Renamed to avoid conflict
import MemberEvents from './pages/Events';
import Profile from './pages/Profile'; // New import
import Finance from './pages/Finance'; // Added

const ProtectedRoute = ({ children, requiredRole }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (requiredRole && user.role !== requiredRole) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};

const Router = () => {
    const { user } = useAuth();

    const router = createBrowserRouter([
        {
            path: '/',
            element: <LandingPage />,
        },
        {
            path: '/login',
            element: !user ? <Login /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />,
        },
        {
            path: '/register',
            element: !user ? <Register /> : <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />,
        },
        {
            path: '/',
            element: <DashboardLayout />,
            children: [
                {
                    path: 'dashboard',
                    element: (
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'profile',
                    element: (
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'events',
                    element: (
                        <ProtectedRoute>
                            <MemberEvents />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'admin',
                    element: (
                        <ProtectedRoute requiredRole="admin">
                            <AdminDashboard />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'admin/users',
                    element: (
                        <ProtectedRoute requiredRole="admin">
                            <Users />
                        </ProtectedRoute>
                    ),
                },
                {
                    path: 'admin/events',
                    element: (
                        <ProtectedRoute requiredRole="admin">
                            <AdminEvents />
                        </ProtectedRoute>
                    ),
                },
                // Add more routes here
            ],
        },
    ]);

    return <RouterProvider router={router} />;
};

export default Router;
