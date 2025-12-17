const express = require("express");
const router = express.Router();
const {
  getSummary,
  getContributions,
  getMyContributions,
  addManualContribution,
  addExpense,
  getExpenses,
  addUserContribution,
  updateContributionStatus,
} = require("../controllers/financeController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../config/multer");

// Summary
router.get("/summary", protect, getSummary);

// Contributions
router.get("/contributions", protect, getContributions); // Public for transparency - Supports ?status=pending query
router.get("/contributions/me", protect, getMyContributions);
router.post("/contributions/manual", protect, admin, addManualContribution);
router.post(
  "/contributions/user",
  protect,
  upload.single("screenshot"),
  addUserContribution
);
router.put(
  "/contributions/:id/status",
  protect,
  admin,
  updateContributionStatus
);

// Expenses
router.post("/expenses", protect, admin, addExpense);
router.get("/expenses", protect, getExpenses);

module.exports = router;
