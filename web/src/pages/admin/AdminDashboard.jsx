import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    pendingRequests: 0,
    upcomingEvents: 0,
    totalFunds: 0,
    recentRegistrations: [],
    systemStatus: {
      server: "Checking...",
      db: "Checking...",
      lastChecked: null,
    },
  });
  const [loading, setLoading] = useState(true);

  console.log(stats);

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [membersRes, eventsRes, financeRes, healthRes] = await Promise.all([
        api.get("/members"),
        api.get("/events"),
        api.get("/finance/summary"),
        api
          .get("/health")
          .catch(() => ({ data: { status: "offline", db: "disconnected" } })),
      ]);

      const members = membersRes.data;
      const events = eventsRes.data;
      const finance = financeRes.data;
      const health = healthRes.data;

      const totalMembers = members.length;
      const pendingRequests = members.filter(
        (m) => m.status === "pending"
      ).length;
      const upcomingEvents = events.filter(
        (e) => new Date(e.date) > new Date()
      ).length;
      const recentRegistrations = members.slice(0, 5); // Already sorted by created_at DESC in backend

      setStats({
        totalMembers,
        pendingRequests,
        upcomingEvents,
        totalFunds: finance.total_balance || 0,
        recentRegistrations,
        systemStatus: {
          server: health.status === "online" ? "Online" : "Offline",
          db: health.db === "connected" ? "Connected" : "Disconnected",
          lastChecked: new Date().toLocaleTimeString(),
        },
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReview = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setShowModal(false);
  };

  const handleStatusUpdate = async (newStatus) => {
    if (!selectedUser) return;

    if (newStatus === "pending") {
      // Suspend action
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "You are about to suspend this user!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, suspend!",
      });

      if (!result.isConfirmed) return;
    }

    try {
      await api.put(`/members/${selectedUser.id}/role`, { status: newStatus });

      // Update local state
      setStats((prev) => ({
        ...prev,
        recentRegistrations: prev.recentRegistrations.map((u) =>
          u.id === selectedUser.id ? { ...u, status: newStatus } : u
        ),
        pendingRequests:
          newStatus === "active" && selectedUser.status === "pending"
            ? prev.pendingRequests - 1
            : prev.pendingRequests,
      }));

      if (newStatus === "pending") {
        Swal.fire("Suspended!", "User has been suspended.", "success");
      }

      closeModal();
      fetchDashboardData(); // Refresh all data to be safe
    } catch (error) {
      console.error("Failed to update status", error);
      Swal.fire("Error!", "Failed to update status.", "error");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        অ্যাডমিন ওভারভিউ
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">মোট সদস্য</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.totalMembers}
          </p>
        </div>
        <Link
          to="/admin/users"
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <h3 className="text-gray-500 text-sm font-medium">
            অনুমোদনের অপেক্ষায়
          </h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.pendingRequests}
          </p>
          {stats?.pendingRequests > 0 && (
            <span className="text-orange-600 text-sm font-medium">
              পদক্ষেপ প্রয়োজন
            </span>
          )}
        </Link>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">আসন্ন ইভেন্ট</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {stats.upcomingEvents}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-gray-500 text-sm font-medium">মোট তহবিল</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            ৳{stats.totalFunds}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            সাম্প্রতিক নিবন্ধন
          </h2>
          <div className="space-y-4">
            {stats?.recentRegistrations?.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.name || "N/A"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(user?.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleReview(user)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  পর্যালোচনা
                </button>
              </div>
            ))}
            {stats?.recentRegistrations?.length === 0 && (
              <p className="text-gray-500 text-sm">
                কোন সাম্প্রতিক নিবন্ধন নেই।
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            সিস্টেম স্ট্যাটাস
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">সার্ভার স্ট্যাটাস</span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  stats.systemStatus?.server === "Online"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stats.systemStatus?.server === "Online" ? "অনলাইন" : "অফলাইন"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">ডাটাবেস</span>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  stats.systemStatus?.db === "Connected"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {stats.systemStatus?.db === "Connected"
                  ? "সংযুক্ত"
                  : "বিচ্ছিন্ন"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">সর্বশেষ পরীক্ষা</span>
              <span className="text-gray-900 text-sm">
                {stats.systemStatus?.lastChecked}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              সদস্য পর্যালোচনা
            </h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-2xl font-bold">
                  {selectedUser.name?.charAt(0) || "U"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">নাম</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.name}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">ফোন</p>
                  <p className="font-medium text-gray-900">
                    {selectedUser.phone}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">ভূমিকা</p>
                  <p className="font-medium text-gray-900 capitalize">
                    {selectedUser.role === "admin" ? "অ্যাডমিন" : "সদস্য"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">স্ট্যাটাস</p>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                      selectedUser.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedUser.status === "active" ? "সক্রিয়" : "বিচারাধীন"}
                  </span>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-500">যোগদান</p>
                  <p className="font-medium text-gray-900">
                    {new Date(selectedUser.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={closeModal}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
              >
                বাতিল
              </button>
              {selectedUser.status !== "active" && (
                <button
                  onClick={() => handleStatusUpdate("active")}
                  className="flex-1 px-4 py-2 text-white bg-green-600 hover:bg-green-700 rounded-xl font-medium transition-colors"
                >
                  অনুমোদন করুন
                </button>
              )}
              {selectedUser.status === "active" && (
                <button
                  onClick={() => handleStatusUpdate("pending")}
                  className="flex-1 px-4 py-2 text-white bg-yellow-500 hover:bg-yellow-600 rounded-xl font-medium transition-colors"
                >
                  স্থগিত করুন
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
