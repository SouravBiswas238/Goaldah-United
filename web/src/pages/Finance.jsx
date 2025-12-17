import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { API_BASE_URL } from "../config/api";
import {
  DollarSign,
  TrendingDown,
  Calendar,
  FileText,
  Plus,
  CreditCard,
  Wallet,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Swal from "sweetalert2";

const Finance = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [activeTab, setActiveTab] = useState("contributions");
  const [myContributions, setMyContributions] = useState([]);
  const [allContributions, setAllContributions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [summary, setSummary] = useState({
    totalFund: 0,
    totalExpenses: 0,
    currentBalance: 0,
  });
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showContributionModal, setShowContributionModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showUserContributionModal, setShowUserContributionModal] =
    useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState(null);

  // Form States
  const [contributionForm, setContributionForm] = useState({
    userId: "",
    amount: "",
    method: "cash",
    referenceId: "",
    note: "",
  });
  const [expenseForm, setExpenseForm] = useState({
    amount: "",
    purpose: "",
    withdrawnByUserId: user?.id || "",
    receiptUrl: "",
    note: "",
  });
  const [userContributionForm, setUserContributionForm] = useState({
    month: new Date().toISOString().slice(0, 7), // Current month in YYYY-MM format
    amount: "",
    method: "bkash",
    referenceId: "",
  });
  const [members, setMembers] = useState([]);
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [pendingContributions, setPendingContributions] = useState([]);

  // Payment numbers configuration
  const paymentNumbers = {
    bkash: "01700-000000", // Replace with actual bKash number
    nagad: "01800-000000", // Replace with actual Nagad number
    rocket: "01900-000000", // Replace with actual Rocket number
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]);

  const fetchData = async () => {
    try {
      const promises = [
        api.get("/finance/contributions/me"),
        api.get("/finance/expenses"),
        api.get("/finance/summary"),
      ];

      if (isAdmin) {
        promises.push(api.get("/finance/contributions"));
        promises.push(api.get("/members")); // For selecting user in manual contribution
        promises.push(api.get("/finance/contributions?status=pending")); // Fetch pending contributions
      }

      const results = await Promise.all(promises);

      setMyContributions(results[0].data);
      setExpenses(results[1].data);
      setSummary(results[2].data);

      if (isAdmin) {
        setAllContributions(results[3].data);
        setMembers(results[4].data);
        setPendingContributions(results[5].data);
      }
    } catch (error) {
      console.error("Failed to fetch finance data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddContribution = async (e) => {
    e.preventDefault();
    try {
      await api.post("/finance/contributions/manual", contributionForm);
      Swal.fire("Success", "Contribution added successfully", "success");
      setShowContributionModal(false);
      setContributionForm({
        userId: "",
        amount: "",
        method: "cash",
        referenceId: "",
        note: "",
      });
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add contribution", "error");
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/finance/expenses", {
        ...expenseForm,
        withdrawnByUserId: user.id,
      });
      Swal.fire("Success", "Expense added successfully", "success");
      setShowExpenseModal(false);
      setExpenseForm({
        amount: "",
        purpose: "",
        withdrawnByUserId: user.id,
        receiptUrl: "",
        note: "",
      });
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Failed to add expense", "error");
    }
  };

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUserContribution = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("amount", userContributionForm.amount);
      formData.append("method", userContributionForm.method);
      formData.append("referenceId", userContributionForm.referenceId);
      formData.append("month", userContributionForm.month);
      if (screenshotFile) {
        formData.append("screenshot", screenshotFile);
      }

      await api.post("/finance/contributions/user", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire({
        icon: "success",
        title: "সফল!",
        text: "আপনার অবদান পর্যালোচনার জন্য জমা দেওয়া হয়েছে। অনুমোদনের পরে এটি দেখানো হবে।",
        confirmButtonText: "ঠিক আছে",
      });

      setShowUserContributionModal(false);
      setUserContributionForm({
        month: new Date().toISOString().slice(0, 7),
        amount: "",
        method: "bkash",
        referenceId: "",
      });
      setScreenshotFile(null);
      setScreenshotPreview(null);
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: error.response?.data?.message || "অবদান জমা দিতে ব্যর্থ হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });
    }
  };

  const handleApproveContribution = async (id) => {
    try {
      await api.put(`/finance/contributions/${id}/status`, {
        status: "approved",
      });

      Swal.fire({
        icon: "success",
        title: "অনুমোদিত!",
        text: "অবদান সফলভাবে অনুমোদিত হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });

      setShowReviewModal(false);
      setSelectedContribution(null);
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "অবদান অনুমোদন করতে ব্যর্থ হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });
    }
  };

  const handleRejectContribution = async (id) => {
    try {
      await api.put(`/finance/contributions/${id}/status`, {
        status: "rejected",
      });

      Swal.fire({
        icon: "success",
        title: "প্রত্যাখ্যাত!",
        text: "অবদান প্রত্যাখ্যান করা হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });

      setShowReviewModal(false);
      setSelectedContribution(null);
      fetchData();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "ত্রুটি!",
        text: "অবদান প্রত্যাখ্যান করতে ব্যর্থ হয়েছে",
        confirmButtonText: "ঠিক আছে",
      });
    }
  };

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
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
              আর্থিক রেকর্ড
            </h1>
            <div className="flex flex-wrap gap-2">
              {!isAdmin && (
                <button
                  onClick={() => setShowUserContributionModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>টাকা জমা দিন</span>
                </button>
              )}
              {isAdmin && (
                <>
                  <button
                    onClick={() => setShowContributionModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>অবদান যোগ করুন</span>
                  </button>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>খরচ যোগ করুন</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">মোট তহবিল</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  ৳{summary.totalFund.toLocaleString()}
                </p>
              </div>
              <div className="p-1.5 bg-emerald-50 rounded-lg">
                <Wallet className="h-4 w-4 text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">মোট খরচ</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  ৳{summary.totalExpenses.toLocaleString()}
                </p>
              </div>
              <div className="p-1.5 bg-orange-50 rounded-lg">
                <TrendingDown className="h-4 w-4 text-orange-600" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">বর্তমান ব্যালেন্স</p>
                <p className="text-lg sm:text-xl font-semibold text-gray-900">
                  ৳{summary.currentBalance.toLocaleString()}
                </p>
              </div>
              <div className="p-1.5 bg-blue-50 rounded-lg">
                <CreditCard className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 p-3 sm:p-4">
            <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setActiveTab("contributions")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "contributions"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                আমার অবদান
              </button>
              {isAdmin && (
                <>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap relative ${
                      activeTab === "pending"
                        ? "bg-orange-500 text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    অপেক্ষমাণ অবদান
                    {pendingContributions.length > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                        {pendingContributions.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("all_contributions")}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                      activeTab === "all_contributions"
                        ? "bg-blue-500 text-white shadow-sm"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    সকল অবদান
                  </button>
                </>
              )}
              <button
                onClick={() => setActiveTab("expenses")}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  activeTab === "expenses"
                    ? "bg-blue-500 text-white shadow-sm"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                গ্রামের খরচ
              </button>
            </div>
          </div>
          <div>
            {activeTab === "contributions" && (
              <ContributionsTable data={myContributions} />
            )}
            {activeTab === "pending" && isAdmin && (
              <PendingContributionsTable
                data={pendingContributions}
                onReview={(contribution) => {
                  setSelectedContribution(contribution);
                  setShowReviewModal(true);
                }}
              />
            )}
            {activeTab === "all_contributions" && isAdmin && (
              <ContributionsTable data={allContributions} showMember />
            )}
            {activeTab === "expenses" && <ExpensesTable data={expenses} />}
          </div>
        </div>

        {/* Add Contribution Modal */}
        {showContributionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-4 sm:p-6 shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                অবদান যোগ করুন
              </h2>
              <form onSubmit={handleAddContribution} className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    সদস্য
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 transition-all"
                    value={contributionForm.userId}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        userId: e.target.value,
                      })
                    }
                  >
                    <option value="">সদস্য নির্বাচন করুন</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.phone})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    পরিমাণ
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 transition-all"
                    value={contributionForm.amount}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        amount: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    পদ্ধতি
                  </label>
                  <select
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 transition-all"
                    value={contributionForm.method}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        method: e.target.value,
                      })
                    }
                  >
                    <option value="cash">নগদ</option>
                    <option value="bkash">বিকাশ</option>
                    <option value="nagad">নগদ</option>
                    <option value="bank">ব্যাংক ট্রান্সফার</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    রেফারেন্স আইডি (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 transition-all"
                    value={contributionForm.referenceId}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        referenceId: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white text-gray-900 transition-all"
                    rows="2"
                    value={contributionForm.note}
                    onChange={(e) =>
                      setContributionForm({
                        ...contributionForm,
                        note: e.target.value,
                      })
                    }
                  ></textarea>
                </div>
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setShowContributionModal(false)}
                    className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm text-white bg-blue-500 hover:bg-blue-600 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    অবদান যোগ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showExpenseModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-md p-4 sm:p-6 shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                খরচ যোগ করুন
              </h2>
              <form onSubmit={handleAddExpense} className="space-y-3">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    পরিমাণ
                  </label>
                  <input
                    type="number"
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white text-gray-900 transition-all"
                    value={expenseForm.amount}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, amount: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    উদ্দেশ্য
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white text-gray-900 transition-all"
                    value={expenseForm.purpose}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        purpose: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    রসিদ URL (ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white text-gray-900 transition-all"
                    value={expenseForm.receiptUrl}
                    onChange={(e) =>
                      setExpenseForm({
                        ...expenseForm,
                        receiptUrl: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                    নোট (ঐচ্ছিক)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 bg-white text-gray-900 transition-all"
                    rows="2"
                    value={expenseForm.note}
                    onChange={(e) =>
                      setExpenseForm({ ...expenseForm, note: e.target.value })
                    }
                  ></textarea>
                </div>
                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => setShowExpenseModal(false)}
                    className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm text-white bg-red-400 hover:bg-red-500 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    খরচ যোগ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* User Contribution Modal */}
        {showUserContributionModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-full sm:max-w-2xl p-4 sm:p-6 shadow-lg border border-gray-200 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowUserContributionModal(false);
                  setScreenshotPreview(null);
                }}
                className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                type="button"
              >
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2 text-center pr-8">
                টাকা জমা দিন
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 text-center mb-4 sm:mb-6">
                নিচের তথ্য পূরণ করুন
              </p>

              <form
                onSubmit={handleUserContribution}
                className="space-y-3 sm:space-y-5"
              >
                {/* Month Selection */}
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg border border-blue-100">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                    📅 কোন মাসের জন্য?
                  </label>
                  <div className="relative cursor-pointer">
                    <input
                      type="month"
                      required
                      onClick={(e) => e.target.showPicker?.()}
                      className="w-full rounded-lg border-2 border-blue-200 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 cursor-pointer transition-all bg-white"
                      value={userContributionForm.month}
                      onChange={(e) =>
                        setUserContributionForm({
                          ...userContributionForm,
                          month: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Amount */}
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg border border-green-100">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                    💰 কত টাকা জমা দিচ্ছেন?
                  </label>
                  <div className="relative cursor-pointer">
                    <input
                      type="number"
                      required
                      placeholder="যেমনঃ 500"
                      className="w-full rounded-lg border-2 border-green-200 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:border-green-500 focus:ring-2 focus:ring-green-200 cursor-text transition-all bg-white"
                      value={userContributionForm.amount}
                      onChange={(e) =>
                        setUserContributionForm({
                          ...userContributionForm,
                          amount: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg border border-purple-100">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                    📱 কোন মাধ্যমে পাঠাচ্ছেন?
                  </label>
                  <div className="relative cursor-pointer">
                    <select
                      className="w-full rounded-lg border-2 border-purple-200 px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base focus:border-purple-500 focus:ring-2 focus:ring-purple-200 cursor-pointer transition-all appearance-none pr-10 bg-white"
                      value={userContributionForm.method}
                      onChange={(e) =>
                        setUserContributionForm({
                          ...userContributionForm,
                          method: e.target.value,
                        })
                      }
                    >
                      <option value="bkash">বিকাশ</option>
                      <option value="nagad">নগদ</option>
                      <option value="rocket">রকেট</option>
                      <option value="bank">ব্যাংক ট্রান্সফার</option>
                    </select>
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-purple-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>

                  {paymentNumbers[userContributionForm.method] && (
                    <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border border-purple-200">
                      <p className="text-xs sm:text-sm font-medium text-gray-600">
                        এই নম্বরে টাকা পাঠান:
                      </p>
                      <p className="text-base sm:text-xl font-bold text-purple-700 tracking-wider">
                        {paymentNumbers[userContributionForm.method]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Screenshot Upload */}
                <div className="bg-pink-50 p-3 sm:p-4 rounded-lg border border-pink-100">
                  <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-2">
                    📸 ট্রানজেকশনের ছবি তুলুন
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    required
                    className="hidden"
                    id="screenshot-upload"
                    onChange={handleScreenshotChange}
                  />
                  <label
                    htmlFor="screenshot-upload"
                    className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-pink-300 rounded-lg cursor-pointer hover:bg-pink-100 transition-colors bg-white"
                  >
                    {screenshotPreview ? (
                      <img
                        src={screenshotPreview}
                        alt="Preview"
                        className="max-h-28 sm:max-h-36 rounded-lg"
                      />
                    ) : (
                      <div className="text-center px-4">
                        <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">
                          📷
                        </div>
                        <p className="text-xs sm:text-sm font-medium text-gray-700">
                          ছবি তুলতে ট্যাপ করুন
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          ট্রানজেকশনের স্ক্রিনশট
                        </p>
                      </div>
                    )}
                  </label>
                </div>

                <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserContributionModal(false);
                      setScreenshotPreview(null);
                    }}
                    className="flex-1 px-4 py-2.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors shadow-sm"
                  >
                    জমা দিন ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review Modal */}
        {showReviewModal && selectedContribution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-lg w-full max-w-full sm:max-w-2xl p-4 sm:p-6 shadow-lg border border-gray-200 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6 text-center">
                অবদান পর্যালোচনা
              </h2>

              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">সদস্যের নাম</p>
                    <p className="text-sm font-semibold text-gray-900 break-words">
                      {selectedContribution.member_name}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">ফোন নম্বর</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {selectedContribution.member_phone}
                    </p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="text-xs text-gray-500 mb-1">পরিমাণ</p>
                    <p className="text-lg font-bold text-green-700">
                      ৳
                      {parseFloat(selectedContribution.amount).toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <p className="text-xs text-gray-500 mb-1">মাস</p>
                    <p className="text-sm font-semibold text-blue-700">
                      {selectedContribution.month}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-500 mb-1">পেমেন্ট পদ্ধতি</p>
                    <p className="text-sm font-semibold text-purple-700 capitalize">
                      {selectedContribution.method === "bkash"
                        ? "বিকাশ"
                        : selectedContribution.method === "nagad"
                        ? "নগদ"
                        : selectedContribution.method === "rocket"
                        ? "রকেট"
                        : "ব্যাংক"}
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-xs text-gray-500 mb-1">
                      ট্রানজেকশন আইডি
                    </p>
                    <p className="text-xs font-semibold text-yellow-700 font-mono break-all">
                      {selectedContribution.reference_id}
                    </p>
                  </div>
                </div>

                {selectedContribution.screenshot_url && (
                  <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs text-gray-500 mb-2 font-semibold">
                      ট্রানজেকশন স্ক্রিনশট
                    </p>
                    <img
                      src={`${API_BASE_URL}${selectedContribution.screenshot_url}`}
                      alt="Transaction Screenshot"
                      className="w-full rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() =>
                        window.open(
                          `${API_BASE_URL}${selectedContribution.screenshot_url}`,
                          "_blank"
                        )
                      }
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+";
                      }}
                    />
                    <p className="text-xs text-center text-gray-500 mt-2">
                      বড় করতে ছবিতে ক্লিক করুন
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                <button
                  onClick={() => {
                    setShowReviewModal(false);
                    setSelectedContribution(null);
                  }}
                  className="w-full sm:flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  বন্ধ করুন
                </button>
                <button
                  onClick={() =>
                    handleRejectContribution(selectedContribution.id)
                  }
                  className="w-full sm:flex-1 px-4 py-2 text-sm text-white bg-red-400 hover:bg-red-500 rounded-lg font-medium transition-colors shadow-sm"
                >
                  ❌ প্রত্যাখ্যান
                </button>
                <button
                  onClick={() =>
                    handleApproveContribution(selectedContribution.id)
                  }
                  className="w-full sm:flex-1 px-4 py-2 text-sm text-white bg-green-500 hover:bg-green-600 rounded-lg font-medium transition-colors shadow-sm"
                >
                  ✓ অনুমোদন
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const PendingContributionsTable = ({ data, onReview }) => {
  if (data.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-gray-50">
        <div className="flex flex-col items-center">
          <DollarSign className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            কোন অপেক্ষমাণ অবদান নেই।
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card View */}
      <div className="block sm:hidden p-3 space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-semibold text-base text-gray-900">
                  {item.member_name}
                </p>
                <p className="text-xs text-gray-500">{item.member_phone}</p>
              </div>
              <span className="font-semibold text-base text-green-700">
                ৳{parseFloat(item.amount).toLocaleString()}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <p>
                <span className="font-medium">মাস:</span> {item.month}
              </p>
              <p>
                <span className="font-medium">তারিখ:</span>{" "}
                {new Date(item.created_at || item.date).toLocaleDateString(
                  "bn-BD"
                )}
              </p>
            </div>
            <button
              onClick={() => onReview(item)}
              className="w-full mt-3 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
            >
              পর্যালোচনা করুন
            </button>
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                সদস্য
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                মাস
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                পরিমাণ
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                জমার তারিখ
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                পদক্ষেপ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-orange-50 transition-colors"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900">
                  {item.member_name}
                  <span className="block text-xs text-gray-500">
                    {item.member_phone}
                  </span>
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900 font-medium">
                  {item.month}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold text-green-700">
                  ৳{parseFloat(item.amount).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-600">
                  {new Date(item.created_at || item.date).toLocaleDateString(
                    "bn-BD"
                  )}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs">
                  <button
                    onClick={() => onReview(item)}
                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-medium shadow-sm transition-colors"
                  >
                    পর্যালোচনা করুন
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const ContributionsTable = ({ data, showMember = false }) => {
  if (data.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-gray-50">
        <div className="flex flex-col items-center">
          <DollarSign className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            কোন অবদান পাওয়া যায়নি।
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card View */}
      <div className="block sm:hidden p-3 space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-semibold text-base text-gray-900">
                  ৳{parseFloat(item.amount).toLocaleString()}
                </p>
                {showMember && (
                  <div className="mt-1">
                    <p className="text-xs font-medium text-gray-900">
                      {item.member_name}
                    </p>
                    <p className="text-xs text-gray-500">{item.member_phone}</p>
                  </div>
                )}
              </div>
              <span
                className={`px-2 py-0.5 inline-flex text-xs font-medium rounded ${
                  item.status === "approved"
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {item.status === "approved" ? "অনুমোদিত" : "বিচারাধীন"}
              </span>
            </div>
            <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <p>
                <span className="font-medium">তারিখ:</span>{" "}
                {new Date(item.date).toLocaleDateString("bn-BD")}
              </p>
              {item.reference_id && (
                <p>
                  <span className="font-medium">রেফারেন্স:</span>{" "}
                  <span className="font-mono">{item.reference_id}</span>
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                তারিখ
              </th>
              {showMember && (
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                  সদস্য
                </th>
              )}
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                পরিমাণ
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                রেফারেন্স
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                স্ট্যাটাস
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">
                  {new Date(item.date).toLocaleDateString("bn-BD")}
                </td>
                {showMember && (
                  <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900">
                    {item.member_name}
                    <span className="block text-xs text-gray-500">
                      {item.member_phone}
                    </span>
                  </td>
                )}
                <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold text-gray-900">
                  ৳{parseFloat(item.amount).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-500 font-mono">
                  {item.reference_id || "-"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap">
                  <span
                    className={`px-2 py-0.5 inline-flex text-xs font-medium rounded ${
                      item.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status === "approved" ? "অনুমোদিত" : "বিচারাধীন"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

const ExpensesTable = ({ data }) => {
  if (data.length === 0) {
    return (
      <div className="p-8 sm:p-12 text-center bg-gray-50">
        <div className="flex flex-col items-center">
          <TrendingDown className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500 font-medium">
            কোন খরচ রেকর্ড করা হয়নি।
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile: Card View */}
      <div className="block sm:hidden p-3 space-y-2">
        {data.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-lg p-3 shadow-sm border border-gray-200"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <p className="font-semibold text-base text-red-600">
                  -৳{parseFloat(item.amount).toLocaleString()}
                </p>
                <p className="text-xs font-medium text-gray-900 mt-1">
                  {item.purpose}
                </p>
              </div>
              {item.receipt_url && (
                <a
                  href={item.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 text-xs"
                >
                  <FileText className="h-3 w-3" /> দেখুন
                </a>
              )}
            </div>
            <div className="space-y-1 text-xs text-gray-600 pt-2 border-t border-gray-100">
              <p>
                <span className="font-medium">তারিখ:</span>{" "}
                {new Date(item.date).toLocaleDateString("bn-BD")}
              </p>
              <p>
                <span className="font-medium">উত্তোলনকারী:</span>{" "}
                {item.withdrawn_by_name || "অজানা"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden sm:block overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                তারিখ
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                উদ্দেশ্য
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                উত্তোলনকারী
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                পরিমাণ
              </th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold text-gray-700">
                রসিদ
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((item) => (
              <tr
                key={item.id}
                className="hover:bg-orange-50 transition-colors"
              >
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">
                  {new Date(item.date).toLocaleDateString("bn-BD")}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-900">
                  {item.purpose}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-600">
                  {item.withdrawn_by_name || "অজানা"}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs font-semibold text-red-600">
                  -৳{parseFloat(item.amount).toLocaleString()}
                </td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs text-blue-600">
                  {item.receipt_url ? (
                    <a
                      href={item.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-center gap-1"
                    >
                      <FileText className="h-3 w-3" /> দেখুন
                    </a>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default Finance;
