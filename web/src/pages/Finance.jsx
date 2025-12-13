import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { DollarSign, TrendingDown, Calendar, FileText, Plus, CreditCard, Wallet } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const Finance = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [activeTab, setActiveTab] = useState('contributions');
    const [myContributions, setMyContributions] = useState([]);
    const [allContributions, setAllContributions] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [summary, setSummary] = useState({ totalFund: 0, totalExpenses: 0, currentBalance: 0 });
    const [loading, setLoading] = useState(true);

    // Modal States
    const [showContributionModal, setShowContributionModal] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);

    // Form States
    const [contributionForm, setContributionForm] = useState({
        userId: '',
        amount: '',
        method: 'cash',
        referenceId: '',
        note: ''
    });
    const [expenseForm, setExpenseForm] = useState({
        amount: '',
        purpose: '',
        withdrawnByUserId: user?.id || '',
        receiptUrl: '',
        note: ''
    });
    const [members, setMembers] = useState([]);

    useEffect(() => {
        fetchData();
    }, [isAdmin]);

    const fetchData = async () => {
        try {
            const promises = [
                api.get('/finance/contributions/me'),
                api.get('/finance/expenses'),
                api.get('/finance/summary')
            ];

            if (isAdmin) {
                promises.push(api.get('/finance/contributions'));
                promises.push(api.get('/members')); // For selecting user in manual contribution
            }

            const results = await Promise.all(promises);

            setMyContributions(results[0].data);
            setExpenses(results[1].data);
            setSummary(results[2].data);

            if (isAdmin) {
                setAllContributions(results[3].data);
                setMembers(results[4].data);
            }
        } catch (error) {
            console.error('Failed to fetch finance data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddContribution = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/contributions/manual', contributionForm);
            Swal.fire('Success', 'Contribution added successfully', 'success');
            setShowContributionModal(false);
            setContributionForm({ userId: '', amount: '', method: 'cash', referenceId: '', note: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to add contribution', 'error');
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await api.post('/finance/expenses', { ...expenseForm, withdrawnByUserId: user.id });
            Swal.fire('Success', 'Expense added successfully', 'success');
            setShowExpenseModal(false);
            setExpenseForm({ amount: '', purpose: '', withdrawnByUserId: user.id, receiptUrl: '', note: '' });
            fetchData();
        } catch (error) {
            console.error(error);
            Swal.fire('Error', 'Failed to add expense', 'error');
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
                <h1 className="text-2xl font-bold text-gray-900">Financial Records</h1>
                {isAdmin && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowContributionModal(true)}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Contribution
                        </button>
                        <button
                            onClick={() => setShowExpenseModal(true)}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Expense
                        </button>
                    </div>
                )}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Fund</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">৳{summary.totalFund}</p>
                        </div>
                        <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                            <Wallet className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Expenses</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">৳{summary.totalExpenses}</p>
                        </div>
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                            <TrendingDown className="h-5 w-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Current Balance</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">৳{summary.currentBalance}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                            <CreditCard className="h-5 w-5" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
                <button
                    onClick={() => setActiveTab('contributions')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'contributions'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    My Contributions
                </button>
                {isAdmin && (
                    <button
                        onClick={() => setActiveTab('all_contributions')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'all_contributions'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                            }`}
                    >
                        All Contributions
                    </button>
                )}
                <button
                    onClick={() => setActiveTab('expenses')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${activeTab === 'expenses'
                        ? 'bg-blue-600 text-white'
                        : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                        }`}
                >
                    Village Expenses
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {activeTab === 'contributions' && (
                    <ContributionsTable data={myContributions} />
                )}
                {activeTab === 'all_contributions' && isAdmin && (
                    <ContributionsTable data={allContributions} showMember />
                )}
                {activeTab === 'expenses' && (
                    <ExpensesTable data={expenses} />
                )}
            </div>

            {/* Add Contribution Modal */}
            {showContributionModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Contribution</h2>
                        <form onSubmit={handleAddContribution} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Member</label>
                                <select
                                    required
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={contributionForm.userId}
                                    onChange={(e) => setContributionForm({ ...contributionForm, userId: e.target.value })}
                                >
                                    <option value="">Select Member</option>
                                    {members.map(member => (
                                        <option key={member.id} value={member.id}>{member.name} ({member.phone})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={contributionForm.amount}
                                    onChange={(e) => setContributionForm({ ...contributionForm, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
                                <select
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={contributionForm.method}
                                    onChange={(e) => setContributionForm({ ...contributionForm, method: e.target.value })}
                                >
                                    <option value="cash">Cash</option>
                                    <option value="bkash">Bkash</option>
                                    <option value="nagad">Nagad</option>
                                    <option value="bank">Bank Transfer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Reference ID (Optional)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={contributionForm.referenceId}
                                    onChange={(e) => setContributionForm({ ...contributionForm, referenceId: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    rows="2"
                                    value={contributionForm.note}
                                    onChange={(e) => setContributionForm({ ...contributionForm, note: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowContributionModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-medium"
                                >
                                    Add Contribution
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
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Expense</h2>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                                <input
                                    type="number"
                                    required
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={expenseForm.amount}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={expenseForm.purpose}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, purpose: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Receipt URL (Optional)</label>
                                <input
                                    type="url"
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    value={expenseForm.receiptUrl}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptUrl: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Note (Optional)</label>
                                <textarea
                                    className="w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    rows="2"
                                    value={expenseForm.note}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, note: e.target.value })}
                                ></textarea>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-2 text-white bg-red-600 hover:bg-red-700 rounded-xl font-medium"
                                >
                                    Add Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

const ContributionsTable = ({ data, showMember = false }) => (
    <div className="overflow-x-auto">
        <table className="w-full">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    {showMember && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
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
                                <span className="block text-xs text-gray-500">{item.member_phone}</span>
                            </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                            ৳{item.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                            {item.method}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {item.reference_id || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${item.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {item.status}
                            </span>
                        </td>
                    </tr>
                ))}
                {data.length === 0 && (
                    <tr>
                        <td colSpan={showMember ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                            <div className="flex flex-col items-center">
                                <DollarSign className="h-12 w-12 text-gray-300 mb-3" />
                                <p>No contributions found.</p>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Withdrawn By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Receipt</th>
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
                            {item.withdrawn_by_name || 'Unknown'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                            -৳{item.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                            {item.receipt_url ? (
                                <a href={item.receipt_url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center">
                                    <FileText className="h-4 w-4 mr-1" /> View
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
                                <p>No expenses recorded.</p>
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

export default Finance;

