const express = require('express');
const router = express.Router();
const {
    getSummary,
    getContributions,
    getMyContributions,
    addManualContribution,
    addExpense,
    getExpenses,
} = require('../controllers/financeController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/summary', protect, getSummary);
router.get('/contributions', protect, admin, getContributions);
router.get('/contributions/me', protect, getMyContributions);
router.post('/contributions/manual', protect, admin, addManualContribution);
router.post('/expenses', protect, admin, addExpense);
router.get('/expenses', protect, getExpenses);

module.exports = router;
