const db = require('../config/db');

// @desc    Get financial summary (Total Fund, Total Expenses)
// @route   GET /api/finance/summary
// @access  Private
const getSummary = async (req, res) => {
    try {
        const fundResult = await db.query('SELECT SUM(amount) as total_fund FROM contributions WHERE status = \'approved\'');
        const expenseResult = await db.query('SELECT SUM(amount) as total_expenses FROM expenses');

        const totalFund = fundResult.rows[0].total_fund || 0;
        const totalExpenses = expenseResult.rows[0].total_expenses || 0;
        const currentBalance = totalFund - totalExpenses;

        res.json({
            totalFund: parseFloat(totalFund),
            totalExpenses: parseFloat(totalExpenses),
            currentBalance: parseFloat(currentBalance),
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all contributions (Admin)
// @route   GET /api/finance/contributions
// @access  Private/Admin
const getContributions = async (req, res) => {
    try {
        const result = await db.query(`
      SELECT c.*, u.name as member_name, u.phone as member_phone 
      FROM contributions c 
      LEFT JOIN users u ON c.user_id = u.id 
      ORDER BY c.date DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get my contributions
// @route   GET /api/finance/contributions/me
// @access  Private
const getMyContributions = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM contributions WHERE user_id = $1 ORDER BY date DESC', [req.user.id]);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add manual contribution (Admin)
// @route   POST /api/finance/contributions/manual
// @access  Private/Admin
const addManualContribution = async (req, res) => {
    const { userId, amount, method, referenceId, note } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO contributions (user_id, amount, method, reference_id, note, status) VALUES ($1, $2, $3, $4, $5, \'approved\') RETURNING *',
            [userId, amount, method, referenceId, note]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Add expense (Admin)
// @route   POST /api/finance/expenses
// @access  Private/Admin
const addExpense = async (req, res) => {
    const { amount, purpose, withdrawnByUserId, receiptUrl, note } = req.body;

    try {
        const result = await db.query(
            'INSERT INTO expenses (amount, purpose, withdrawn_by_user_id, receipt_url, note) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [amount, purpose, withdrawnByUserId, receiptUrl, note]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get all expenses
// @route   GET /api/finance/expenses
// @access  Private
const getExpenses = async (req, res) => {
    try {
        const result = await db.query(`
      SELECT e.*, u.name as withdrawn_by_name 
      FROM expenses e 
      LEFT JOIN users u ON e.withdrawn_by_user_id = u.id 
      ORDER BY e.date DESC
    `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    getSummary,
    getContributions,
    getMyContributions,
    addManualContribution,
    addExpense,
    getExpenses,
};
