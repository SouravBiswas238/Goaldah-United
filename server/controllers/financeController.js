const db = require("../config/db");

// @desc    Get financial summary (Total Fund, Total Expenses)
// @route   GET /api/finance/summary
// @access  Private
const getSummary = async (req, res) => {
  try {
    const fundResult = await db.query(
      "SELECT SUM(amount) as total_fund FROM contributions WHERE status = 'approved'"
    );
    const expenseResult = await db.query(
      "SELECT SUM(amount) as total_expenses FROM expenses"
    );

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
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get all contributions
// @route   GET /api/finance/contributions
// @access  Private (All users can see approved, only admin can see pending)
const getContributions = async (req, res) => {
  try {
    const { status } = req.query;
    const isAdmin = req.user.role === "admin";

    let query = `
            SELECT c.*, u.name as member_name, u.phone as member_phone 
            FROM contributions c 
            LEFT JOIN users u ON c.user_id = u.id
        `;

    const params = [];

    // If status is specified (like pending), only admins can see it
    if (status) {
      if (!isAdmin && status !== "approved") {
        return res
          .status(403)
          .json({ message: "Only admins can view non-approved contributions" });
      }
      query += ` WHERE c.status = $1`;
      params.push(status);
    } else {
      // If no status specified, non-admins only see approved
      if (!isAdmin) {
        query += ` WHERE c.status = 'approved'`;
      }
    }

    query += ` ORDER BY c.date DESC`;

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get my contributions
// @route   GET /api/finance/contributions/me
// @access  Private
const getMyContributions = async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM contributions WHERE user_id = $1 ORDER BY date DESC",
      [req.user.id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add manual contribution (Admin)
// @route   POST /api/finance/contributions/manual
// @access  Private/Admin
const addManualContribution = async (req, res) => {
  const { userId, amount, method, referenceId, note } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO contributions (user_id, amount, method, reference_id, note, status) VALUES ($1, $2, $3, $4, $5, 'approved') RETURNING *",
      [userId, amount, method, referenceId, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add expense (Admin)
// @route   POST /api/finance/expenses
// @access  Private/Admin
const addExpense = async (req, res) => {
  const { amount, purpose, withdrawnByUserId, receiptUrl, note } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO expenses (amount, purpose, withdrawn_by_user_id, receipt_url, note) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [amount, purpose, withdrawnByUserId, receiptUrl, note]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
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
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Add user contribution with screenshot
// @route   POST /api/finance/contributions/user
// @access  Private
const addUserContribution = async (req, res) => {
  const { amount, method, referenceId, month } = req.body;
  const userId = req.user.id;

  try {
    // Get screenshot URL if file was uploaded
    let screenshotUrl = null;
    if (req.file) {
      screenshotUrl = `/uploads/screenshots/${req.file.filename}`;
    }

    const result = await db.query(
      `INSERT INTO contributions (user_id, amount, method, reference_id, month, screenshot_url, status) 
             VALUES ($1, $2, $3, $4, $5, $6, 'pending') 
             RETURNING *`,
      [userId, amount, method, referenceId, month, screenshotUrl]
    );

    res.status(201).json({
      success: true,
      message: "Contribution submitted for approval",
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// @desc    Update contribution status (Approve/Reject)
// @route   PUT /api/finance/contributions/:id/status
// @access  Private/Admin
const updateContributionStatus = async (req, res) => {
  const { id } = req.params;
  const { status, rejectedReason } = req.body;
  const adminId = req.user.id;

  try {
    // Validate status
    if (!["approved", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    let query, params;

    if (status === "approved") {
      query = `
                UPDATE contributions 
                SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP
                WHERE id = $3
                RETURNING *
            `;
      params = [status, adminId, id];
    } else {
      query = `
                UPDATE contributions 
                SET status = $1, approved_by = $2, approved_at = CURRENT_TIMESTAMP, rejected_reason = $3
                WHERE id = $4
                RETURNING *
            `;
      params = [status, adminId, rejectedReason || null, id];
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Contribution not found",
      });
    }

    res.json({
      success: true,
      message: `Contribution ${status} successfully`,
      data: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

module.exports = {
  getSummary,
  getContributions,
  getMyContributions,
  addManualContribution,
  addExpense,
  getExpenses,
  addUserContribution,
  updateContributionStatus,
};
