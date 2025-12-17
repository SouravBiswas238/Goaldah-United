import React, { useState, useEffect } from "react";
import api from "../../api/axios";
import { Search, Filter, MoreVertical, Check, X, Shield } from "lucide-react";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/members");
      setUsers(response.data);
    } catch (error) {
      console.error("Failed to fetch users", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      await api.put(`/members/${userId}/role`, { role: newRole });
      fetchUsers(); // Refresh list
    } catch (error) {
      console.error("Failed to update role", error);
      alert("Failed to update role");
    }
  };

  const filteredUsers = users.filter((user) => {
    if (filter === "all") return true;
    return user.role === filter;
  });

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">সদস্য পরিচালনা</h1>
        <div className="flex gap-2">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">সকল ভূমিকা</option>
            <option value="member">সদস্য</option>
            <option value="admin">অ্যাডমিন</option>
            <option value="executive">নির্বাহী</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ব্যবহারকারী
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ফোন
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  ভূমিকা
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  স্ট্যাটাস
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  যোগদান
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                  পদক্ষেপ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {user.name?.charAt(0) || "U"}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name || "N/A"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {user.role === "admin"
                        ? "অ্যাডমিন"
                        : user.role === "executive"
                        ? "নির্বাহী"
                        : "সদস্য"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status === "active" ? "সক্রিয়" : "বিচারাধীন"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      {user.role !== "admin" && (
                        <button
                          onClick={() => handleRoleUpdate(user.id, "admin")}
                          className="text-indigo-600 hover:text-indigo-900 text-xs border border-indigo-200 px-2 py-1 rounded hover:bg-indigo-50"
                        >
                          অ্যাডমিন করুন
                        </button>
                      )}
                      {user.role === "admin" && (
                        <button
                          onClick={() => handleRoleUpdate(user.id, "member")}
                          className="text-gray-600 hover:text-gray-900 text-xs border border-gray-200 px-2 py-1 rounded hover:bg-gray-50"
                        >
                          পদত্যাগ
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
