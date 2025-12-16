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
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">আর্থিক রেকর্ড</h1>
        <div className="flex gap-2">
          {!isAdmin && (
            <button
              onClick={() => setShowUserContributionModal(true)}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              টাকা জমা দিন
            </button>
          )}
          {isAdmin && (
            <>
              <button
                onClick={() => setShowContributionModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                অবদান যোগ করুন
              </button>
              <button
                onClick={() => setShowExpenseModal(true)}
                className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                খরচ যোগ করুন
              </button>
            </>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">মোট তহবিল</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ৳{summary.totalFund}
              </p>
            </div>
            <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Wallet className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">মোট খরচ</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ৳{summary.totalExpenses}
              </p>
            </div>
            <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <TrendingDown className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                বর্তমান ব্যালেন্স
              </p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ৳{summary.currentBalance}
              </p>
            </div>
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab("contributions")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "contributions"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          আমার অবদান
        </button>
        {isAdmin && (
          <>
            <button
              onClick={() => setActiveTab("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap relative ${
                activeTab === "pending"
                  ? "bg-orange-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              অপেক্ষমাণ অবদান
              {pendingContributions.length > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {pendingContributions.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab("all_contributions")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                activeTab === "all_contributions"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              সকল অবদান
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
            activeTab === "expenses"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          গ্রামের খরচ
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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

      {/* Add Contribution Modal */}
      {showContributionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              অবদান যোগ করুন
            </h2>
            <form onSubmit={handleAddContribution} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  সদস্য
                </label>
                <select
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পরিমাণ
                </label>
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পদ্ধতি
                </label>
                <select
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  রেফারেন্স আইডি (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowContributionModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              খরচ যোগ করুন
            </h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  পরিমাণ
                </label>
                <input
                  type="number"
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  উদ্দেশ্য
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  value={expenseForm.purpose}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, purpose: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  রসিদ URL (ঐচ্ছিক)
                </label>
                <input
                  type="url"
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  নোট (ঐচ্ছিক)
                </label>
                <textarea
                  className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  rows="2"
                  value={expenseForm.note}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, note: e.target.value })
                  }
                ></textarea>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-full sm:max-w-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
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

            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 sm:mb-2 text-center pr-8">
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
              <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
                  📅 কোন মাসের জন্য?
                </label>
                <input
                  type="month"
                  required
                  className="w-full rounded-lg sm:rounded-xl border-2 border-blue-200 px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={userContributionForm.month}
                  onChange={(e) =>
                    setUserContributionForm({
                      ...userContributionForm,
                      month: e.target.value,
                    })
                  }
                />
              </div>

              {/* Amount */}
              <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
                  💰 কত টাকা জমা দিচ্ছেন?
                </label>
                <input
                  type="number"
                  required
                  placeholder="যেমনঃ 500"
                  className="w-full rounded-lg sm:rounded-xl border-2 border-green-200 px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg focus:border-green-500 focus:ring-2 focus:ring-green-200"
                  value={userContributionForm.amount}
                  onChange={(e) =>
                    setUserContributionForm({
                      ...userContributionForm,
                      amount: e.target.value,
                    })
                  }
                />
              </div>

              {/* Payment Method */}
              <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
                  📱 কোন মাধ্যমে পাঠাচ্ছেন?
                </label>
                <select
                  className="w-full rounded-lg sm:rounded-xl border-2 border-purple-200 px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200"
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

                {paymentNumbers[userContributionForm.method] && (
                  <div className="mt-2 sm:mt-3 p-2 sm:p-3 bg-white rounded-lg border-2 border-purple-300">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">
                      এই নম্বরে টাকা পাঠান:
                    </p>
                    <p className="text-lg sm:text-2xl font-bold text-purple-700 tracking-wider">
                      {paymentNumbers[userContributionForm.method]}
                    </p>
                  </div>
                )}
              </div>

              {/* Screenshot Upload */}
              <div className="bg-pink-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                <label className="block text-sm sm:text-base font-semibold text-gray-800 mb-2">
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
                  className="flex flex-col items-center justify-center w-full h-32 sm:h-40 border-2 border-dashed border-pink-300 rounded-lg sm:rounded-xl cursor-pointer hover:bg-pink-100 transition-colors"
                >
                  {screenshotPreview ? (
                    <img
                      src={screenshotPreview}
                      alt="Preview"
                      className="max-h-28 sm:max-h-36 rounded-lg"
                    />
                  ) : (
                    <div className="text-center px-4">
                      <div className="text-3xl sm:text-4xl mb-1 sm:mb-2">
                        📷
                      </div>
                      <p className="text-sm sm:text-lg font-medium text-gray-700">
                        ছবি তুলতে ট্যাপ করুন
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        ট্রানজেকশনের স্ক্রিনশট
                      </p>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-2 sm:gap-3 mt-4 sm:mt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserContributionModal(false);
                    setScreenshotPreview(null);
                  }}
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 sm:px-6 py-3 sm:py-4 text-white bg-green-600 hover:bg-green-700 rounded-lg sm:rounded-xl font-bold text-sm sm:text-lg shadow-lg"
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
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl w-full max-w-full sm:max-w-2xl p-4 sm:p-6 shadow-2xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 text-center">
              অবদান পর্যালোচনা
            </h2>

            <div className="space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500">
                    সদস্যের নাম
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900 break-words">
                    {selectedContribution.member_name}
                  </p>
                </div>
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500">ফোন নম্বর</p>
                  <p className="text-sm sm:text-lg font-bold text-gray-900">
                    {selectedContribution.member_phone}
                  </p>
                </div>
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500">পরিমাণ</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-700">
                    ৳{selectedContribution.amount}
                  </p>
                </div>
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500">মাস</p>
                  <p className="text-sm sm:text-lg font-bold text-blue-700">
                    {selectedContribution.month}
                  </p>
                </div>
                <div className="bg-purple-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500">
                    পেমেন্ট পদ্ধতি
                  </p>
                  <p className="text-sm sm:text-lg font-bold text-purple-700 capitalize">
                    {selectedContribution.method === "bkash"
                      ? "বিকাশ"
                      : selectedContribution.method === "nagad"
                      ? "নগদ"
                      : selectedContribution.method === "rocket"
                      ? "রকেট"
                      : "ব্যাংক"}
                  </p>
                </div>
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500">
                    ট্রানজেকশন আইডি
                  </p>
                  <p className="text-xs sm:text-lg font-bold text-yellow-700 font-mono break-all">
                    {selectedContribution.reference_id}
                  </p>
                </div>
              </div>

              {selectedContribution.screenshot_url && (
                <div className="bg-gray-50 p-3 sm:p-4 rounded-lg sm:rounded-xl">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3 font-semibold">
                    ট্রানজেকশন স্ক্রিনশট
                  </p>
                  <img
                    src={`${API_BASE_URL}${selectedContribution.screenshot_url}`}
                    alt="Transaction Screenshot"
                    className="w-full rounded-lg shadow-md cursor-pointer hover:shadow-xl transition-shadow"
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

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-8">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setSelectedContribution(null);
                }}
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base"
              >
                বন্ধ করুন
              </button>
              <button
                onClick={() =>
                  handleRejectContribution(selectedContribution.id)
                }
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 text-white bg-red-600 hover:bg-red-700 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base"
              >
                ❌ প্রত্যাখ্যান
              </button>
              <button
                onClick={() =>
                  handleApproveContribution(selectedContribution.id)
                }
                className="w-full sm:flex-1 px-4 sm:px-6 py-2 sm:py-3 text-white bg-green-600 hover:bg-green-700 rounded-lg sm:rounded-xl font-bold text-sm sm:text-base"
              >
                ✓ অনুমোদন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const PendingContributionsTable = ({ data, onReview }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-orange-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            সদস্য
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            মাস
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            পরিমাণ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            পদ্ধতি
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            জমার তারিখ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            পদক্ষেপ
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-orange-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.member_name}
              <span className="block text-xs text-gray-500">
                {item.member_phone}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
              {item.month}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-700">
              ৳{item.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
              {item.method === "cash"
                ? "নগদ"
                : item.method === "bkash"
                ? "বিকাশ"
                : item.method === "nagad"
                ? "নগদ"
                : item.method === "bank"
                ? "ব্যাংক"
                : item.method}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(item.created_at || item.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm">
              <button
                onClick={() => onReview(item)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                পর্যালোচনা করুন
              </button>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                <p>কোন অপেক্ষমাণ অবদান নেই।</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const ContributionsTable = ({ data, showMember = false }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            তারিখ
          </th>
          {showMember && (
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              সদস্য
            </th>
          )}
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            পরিমাণ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            পদ্ধতি
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            রেফারেন্স
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            স্ট্যাটাস
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString()}
            </td>
            {showMember && (
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {item.member_name}
                <span className="block text-xs text-gray-500">
                  {item.member_phone}
                </span>
              </td>
            )}
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
              ৳{item.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
              {item.method === "cash"
                ? "নগদ"
                : item.method === "bkash"
                ? "বিকাশ"
                : item.method === "nagad"
                ? "নগদ"
                : item.method === "bank"
                ? "ব্যাংক"
                : item.method}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
              {item.reference_id || "-"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  item.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.status === "approved" ? "অনুমোদিত" : "বিচারাধীন"}
              </span>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td
              colSpan={showMember ? 6 : 5}
              className="px-6 py-12 text-center text-gray-500"
            >
              <div className="flex flex-col items-center">
                <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                <p>কোন অবদান পাওয়া যায়নি।</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

const ExpensesTable = ({ data }) => (
  <div className="overflow-x-auto">
    <table className="w-full">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            তারিখ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            উদ্দেশ্য
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            উত্তোলনকারী
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            পরিমাণ
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            রসিদ
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">
        {data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {new Date(item.date).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {item.purpose}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {item.withdrawn_by_name || "অজানা"}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
              -৳{item.amount}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
              {item.receipt_url ? (
                <a
                  href={item.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center"
                >
                  <FileText className="h-4 w-4 mr-1" /> দেখুন
                </a>
              ) : (
                <span className="text-gray-400">-</span>
              )}
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center">
                <TrendingDown className="h-12 w-12 text-gray-300 mb-3" />
                <p>কোন খরচ রেকর্ড করা হয়নি।</p>
              </div>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

export default Finance;
