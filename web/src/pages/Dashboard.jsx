import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Membership Status</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{user?.status || 'Active'}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Role</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2 capitalize">{user?.role || 'Member'}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-sm font-medium">Joined Date</h3>
                    <p className="text-2xl font-bold text-gray-900 mt-2">
                        {new Date(user?.created_at || Date.now()).toLocaleDateString()}
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4">Recent Activity</h2>
                <div className="text-gray-500 text-center py-8">
                    No recent activity to show.
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
