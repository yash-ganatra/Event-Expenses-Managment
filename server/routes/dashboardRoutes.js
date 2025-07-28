// filepath: routes/dashboardRoutes.js
const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const Expense = require('../models/Expense');
const router = express.Router();

router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const categories = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});
        res.json({ totalSpent, categories });
    } catch (err) {
        res.status(500).json({ message: 'Error fetching dashboard data', error: err.message });
    }
});

module.exports = router;