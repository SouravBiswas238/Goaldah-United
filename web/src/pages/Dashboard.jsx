import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  CreditCard,
  Users,
  Search,
  X,
  Wallet,
  PieChart,
  Clock,
  CheckCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
} from "lucide-react";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState({
    totalFund: 0,
    totalExpenses: 0,
    currentBalance: 0,
  });
  const [myContributions, setMyContributions] = useState([]);
  const [allContributions, setAllContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [userContributions, setUserContributions] = useState([]);
  const [publicSearchQuery, setPublicSearchQuery] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const [selectedMonthTotal, setSelectedMonthTotal] = useState({
    amount: 0,
    count: 0,
  });
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const promises = [
          api.get("/finance/summary"),
          api.get("/finance/contributions/me"),
          api.get("/finance/expenses"),
          api.get("/members"),
          api.get("/finance/contributions"),
        ];

        const results = await Promise.all(promises);

        setSummary(results[0].data);
        setMyContributions(results[1].data);
        setExpenses(results[2].data);
        setMembers(results[3].data);

        const allContribs = results[4].data.filter(
          (c) => c.status === "approved"
        );
        setAllContributions(allContribs);

        if (isAdmin) {
          const monthlyMap = {};
          allContribs.forEach((contrib) => {
            const month =
              contrib.month || new Date(contrib.date).toISOString().slice(0, 7);
            if (!monthlyMap[month]) {
              monthlyMap[month] = 0;
            }
            monthlyMap[month] += parseFloat(contrib.amount);
          });

          const monthlyArray = Object.entries(monthlyMap)
            .map(([month, amount]) => ({ month, amount }))
            .sort((a, b) => b.month.localeCompare(a.month))
            .slice(0, 6);

          setMonthlyData(monthlyArray);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const myTotalContribution = myContributions
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.phone.includes(searchQuery)
  );

  const handleSelectUser = async (member) => {
    setSelectedUser(member);
    try {
      const response = await api.get("/finance/contributions");
      const userContribs = response.data.filter(
        (c) => c.user_id === member.id && c.status === "approved"
      );
      setUserContributions(userContribs);
    } catch (error) {
      console.error("Failed to fetch user contributions", error);
    }
  };

  const clearUserSelection = () => {
    setSelectedUser(null);
    setUserContributions([]);
    setSearchQuery("");
  };

  const getMonthName = (monthStr) => {
    if (!monthStr) return "N/A";

    const months = {
      "01": "জানুয়ারি",
      "02": "ফেব্রুয়ারি",
      "03": "মার্চ",
      "04": "এপ্রিল",
      "05": "মে",
      "06": "জুন",
      "07": "জুলাই",
      "08": "আগস্ট",
      "09": "সেপ্টেম্বর",
      10: "অক্টোবর",
      11: "নভেম্বর",
      12: "ডিসেম্বর",
    };
    const [year, month] = monthStr.split("-");
    return `${months[month]} ${year}`;
  };

  const filteredPublicContributions = allContributions.filter(
    (contrib) =>
      !publicSearchQuery ||
      contrib.member_name
        ?.toLowerCase()
        .includes(publicSearchQuery.toLowerCase()) ||
      contrib.member_phone?.includes(publicSearchQuery)
  );

  useEffect(() => {
    if (allContributions.length === 0) {
      setSelectedMonthTotal({ amount: 0, count: 0 });
      return;
    }

    let total = 0;
    let count = 0;

    allContributions.forEach((contrib) => {
      const contribMonth =
        contrib.month || new Date(contrib.date).toISOString().slice(0, 7);
      if (contribMonth === selectedMonth) {
        total += parseFloat(contrib.amount);
        count += 1;
      }
    });

    setSelectedMonthTotal({ amount: total, count: count });
  }, [selectedMonth, allContributions]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-3 border-gray-200 border-t-blue-500 mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-4 sm:pb-6">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 space-y-4 sm:space-y-5">
        {/* Welcome Header */}
        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-1">
                নমস্কার, {user?.name}! 👋
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm">
                {new Date().toLocaleDateString("bn-BD", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button
              onClick={() => navigate("/finance")}
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>টাকা জমা দিন</span>
            </button>
          </div>
        </div>

        {/* Stats Cards - Compact */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
          {/* My Contribution Card */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:border-blue-300 hover:shadow transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <CheckCircle className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <p className="text-xs text-gray-500 mb-1">আমার মোট জমা</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">
              ৳{myTotalContribution.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {myContributions.filter((c) => c.status === "approved").length} টি
            </p>
          </div>

          {/* Village Fund Card */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:border-emerald-300 hover:shadow transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
              <ArrowUpCircle className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <p className="text-xs text-gray-500 mb-1">গ্রামের মোট সংগ্রহ</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">
              ৳{summary.totalFund.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">সকল সদস্য</p>
          </div>

          {/* Total Expenses Card */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:border-orange-300 hover:shadow transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
              <ArrowDownCircle className="h-3.5 w-3.5 text-orange-500" />
            </div>
            <p className="text-xs text-gray-500 mb-1">মোট ব্যয়িত</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">
              ৳{summary.totalExpenses.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">বিভিন্ন খাতে</p>
          </div>

          {/* Current Balance Card */}
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 hover:border-purple-300 hover:shadow transition-all">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-1.5 bg-purple-50 rounded-lg">
                <DollarSign className="h-4 w-4 text-purple-600" />
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-purple-500" />
            </div>
            <p className="text-xs text-gray-500 mb-1">বর্তমান তহবিল</p>
            <p className="text-lg sm:text-xl font-semibold text-gray-900">
              ৳{summary.currentBalance.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Monthly Collection - Admin Only */}
        {isAdmin && monthlyData.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PieChart className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  মাসওয়ারি সংগ্রহ
                </h2>
                <p className="text-xs text-gray-500">সাম্প্রতিক ৬ মাস</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
              {monthlyData.map((item, index) => {
                const maxAmount = Math.max(...monthlyData.map((m) => m.amount));
                const percentage = (item.amount / maxAmount) * 100;
                const isTop = index < 2;

                return (
                  <div
                    key={item.month}
                    className={`bg-white rounded-lg p-3 border ${
                      isTop
                        ? "border-blue-200 bg-blue-50/30"
                        : "border-gray-200"
                    } hover:shadow transition-all`}
                  >
                    {isTop && (
                      <div className="flex justify-end mb-1">
                        <span className="bg-blue-500 text-white text-xs font-medium px-2 py-0.5 rounded-full">
                          শীর্ষ {index + 1}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-gray-600">
                        {getMonthName(item.month)}
                      </span>
                      <Calendar className="h-3 w-3 text-gray-400" />
                    </div>
                    <p className="text-lg font-semibold text-gray-900 mb-2">
                      ৳{item.amount.toLocaleString()}
                    </p>
                    <div className="relative bg-gray-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all ${
                          isTop ? "bg-blue-500" : "bg-blue-400"
                        }`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {percentage.toFixed(0)}% সর্বোচ্চ থেকে
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Monthly Collection Viewer - For Everyone */}
        {allContributions.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 border-b border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-blue-100 rounded-lg">
                  <Calendar className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    মাসিক সংগ্রহ
                  </h2>
                  <p className="text-xs text-gray-500">মাস নির্বাচন করুন</p>
                </div>
              </div>

              {/* Month Selector - Improved */}
              <div className="max-w-xs">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  মাস নির্বাচন করুন
                </label>
                <div className="relative cursor-pointer">
                  <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    onClick={(e) => e.target.showPicker?.()}
                    max={new Date().toISOString().slice(0, 7)}
                    className="w-full px-3 pr-10 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 font-medium cursor-pointer transition-all"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Month Total Display */}
            <div className="p-4 sm:p-6 bg-gray-50">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">
                  {getMonthName(selectedMonth)}
                </p>
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-gray-200">
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ৳{selectedMonthTotal.amount.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-gray-600 bg-gray-50 rounded-lg py-2 px-3">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <p className="text-xs sm:text-sm font-medium">
                      মোট{" "}
                      <span className="font-semibold text-blue-600">
                        {selectedMonthTotal.count}
                      </span>{" "}
                      টি লেনদেন
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Search & Transaction Display - Admin Only */}
        {isAdmin && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-emerald-50 border-b border-gray-200 p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-emerald-100 rounded-lg">
                  <Users className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                    সদস্যের লেনদেন খুঁজুন
                  </h2>
                  <p className="text-xs text-gray-500">
                    নাম বা ফোন নম্বর দিয়ে
                  </p>
                </div>
              </div>

              {/* Search Box */}
              <div className="relative max-w-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="নাম বা ফোন নম্বর..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 bg-white text-gray-900 placeholder-gray-400 transition-all"
                />
              </div>

              {/* Search Results */}
              {searchQuery && filteredMembers.length > 0 && (
                <div className="mt-3 bg-white rounded-lg border border-gray-200 max-h-48 overflow-y-auto shadow-sm">
                  {filteredMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => handleSelectUser(member)}
                      className="w-full text-left px-3 py-2 hover:bg-emerald-50 transition-colors border-b border-gray-100 last:border-0 flex items-center gap-2"
                    >
                      <div className="p-1 bg-emerald-100 rounded">
                        <Users className="h-3 w-3 text-emerald-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {member.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {member.phone}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected User Transactions */}
            {selectedUser && (
              <div className="p-3 sm:p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-100 rounded-lg">
                      <Users className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900">
                        {selectedUser.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {selectedUser.phone}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={clearUserSelection}
                    className="px-3 py-1.5 bg-red-400 hover:bg-red-500 text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <X className="h-3 w-3" />
                    বন্ধ করুন
                  </button>
                </div>

                {userContributions.length > 0 ? (
                  <div className="space-y-2">
                    {/* Mobile: Card View */}
                    <div className="block sm:hidden space-y-2">
                      {userContributions.map((contrib) => (
                        <div
                          key={contrib.id}
                          className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
                        >
                          <div className="mb-2">
                            <span className="font-semibold text-base text-gray-900">
                              ৳{parseFloat(contrib.amount).toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-gray-600">
                            <p>
                              <span className="font-medium">তারিখ:</span>{" "}
                              {new Date(contrib.date).toLocaleDateString(
                                "bn-BD"
                              )}
                            </p>
                            <p>
                              <span className="font-medium">মাস:</span>{" "}
                              {getMonthName(
                                contrib.month ||
                                  new Date(contrib.date)
                                    .toISOString()
                                    .slice(0, 7)
                              )}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Desktop: Table View */}
                    <div className="hidden sm:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                      <table className="min-w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                              তারিখ
                            </th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                              টাকা
                            </th>
                            <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                              মাস
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {userContributions.map((contrib) => (
                            <tr
                              key={contrib.id}
                              className="hover:bg-emerald-50 transition-colors"
                            >
                              <td className="px-4 py-2.5 text-xs text-gray-700">
                                {new Date(contrib.date).toLocaleDateString(
                                  "bn-BD"
                                )}
                              </td>
                              <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">
                                ৳{parseFloat(contrib.amount).toLocaleString()}
                              </td>
                              <td className="px-4 py-2.5 text-xs text-gray-700">
                                {getMonthName(
                                  contrib.month ||
                                    new Date(contrib.date)
                                      .toISOString()
                                      .slice(0, 7)
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="bg-emerald-500 rounded-lg p-3 text-white">
                      <p className="text-xs font-medium mb-0.5">মোট জমা</p>
                      <p className="text-xl font-bold">
                        ৳
                        {userContributions
                          .reduce((sum, c) => sum + parseFloat(c.amount), 0)
                          .toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                    <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-medium">
                      এই সদস্যের কোন অনুমোদিত লেনদেন নেই
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Public Transactions - For Everyone */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-rose-50 border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-rose-100 rounded-lg">
                <Users className="h-4 w-4 text-rose-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  সকল সদস্যের লেনদেন
                </h2>
                <p className="text-xs text-gray-500">স্বচ্ছতার জন্য</p>
              </div>
            </div>

            {/* Public Search Box */}
            <div className="relative max-w-xs">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="নাম বা ফোন নম্বর..."
                value={publicSearchQuery}
                onChange={(e) => setPublicSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-200 bg-white text-gray-900 placeholder-gray-400 transition-all"
              />
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50">
            {filteredPublicContributions.length > 0 ? (
              <div className="space-y-2">
                {/* Mobile: Card View */}
                <div className="block lg:hidden space-y-2">
                  {filteredPublicContributions.map((contrib) => (
                    <div
                      key={contrib.id}
                      className="bg-white rounded-lg p-3 shadow-sm border border-gray-200 hover:shadow transition-all"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">
                            {contrib.member_name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {contrib.member_phone}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <span className="text-xs text-gray-600">
                          {new Date(contrib.date).toLocaleDateString("bn-BD")}
                        </span>
                        <span className="font-semibold text-base text-gray-900">
                          ৳{parseFloat(contrib.amount).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop: Table View */}
                <div className="hidden lg:block overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                          সদস্যের নাম
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                          ফোন
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                          টাকা
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                          মাস
                        </th>
                        <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                          তারিখ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredPublicContributions.map((contrib) => (
                        <tr
                          key={contrib.id}
                          className="hover:bg-rose-50 transition-colors"
                        >
                          <td className="px-4 py-2.5 text-xs font-medium text-gray-900">
                            {contrib.member_name}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-600">
                            {contrib.member_phone}
                          </td>
                          <td className="px-4 py-2.5 text-xs font-semibold text-gray-900">
                            ৳{parseFloat(contrib.amount).toLocaleString()}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-700">
                            {getMonthName(
                              contrib.month ||
                                new Date(contrib.date).toISOString().slice(0, 7)
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-xs text-gray-600">
                            {new Date(contrib.date).toLocaleDateString("bn-BD")}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                  {publicSearchQuery
                    ? "কোন ফলাফল পাওয়া যায়নি"
                    : "এখনও কোন অনুমোদিত লেনদেন নেই"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Transactions - My Contributions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-blue-50 border-b border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                  আমার সাম্প্রতিক জমা
                </h2>
                <p className="text-xs text-gray-500">সকল লেনদেন</p>
              </div>
            </div>
          </div>

          <div className="p-3 sm:p-4 bg-gray-50">
            {myContributions.length > 0 ? (
              <div className="space-y-2">
                {myContributions.map((contrib) => (
                  <div
                    key={contrib.id}
                    className="bg-white rounded-lg p-3 shadow-sm border-l-2 border-blue-400 hover:shadow transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <p className="font-semibold text-base text-gray-900">
                          ৳{parseFloat(contrib.amount).toLocaleString()}
                        </p>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            contrib.status === "approved"
                              ? "bg-green-100 text-green-700"
                              : contrib.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {contrib.status === "approved"
                            ? "অনুমোদিত"
                            : contrib.status === "pending"
                            ? "অপেক্ষমাণ"
                            : "প্রত্যাখ্যাত"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(contrib.date).toLocaleDateString("bn-BD")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getMonthName(
                            contrib.month ||
                              new Date(contrib.date).toISOString().slice(0, 7)
                          )}
                        </span>
                      </div>
                    </div>
                    {contrib.status === "approved" && (
                      <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    )}
                    {contrib.status === "pending" && (
                      <Clock className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 font-medium">
                  আপনার এখনও কোন জমা নেই
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
