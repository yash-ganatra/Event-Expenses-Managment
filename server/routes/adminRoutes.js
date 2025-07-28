const express = require('express');
const adminMiddleware = require('../middleware/adminVerification');
const router = express.Router();
const Expense = require('../models/Expense');
const User = require('../models/User');
const Event = require('../models/Events'); // Import the Event model



router.get('/admin/dashboard', adminMiddleware, (req, res) => {
  res.json({ message: 'Welcome to the Admin Dashboard!' });
});


router.get('/admin/pending-expenses', adminMiddleware, async (req, res) => {
  try {
    const pendingExpenses = await Expense.find({ status: 'pending' })
      .populate('user', 'team billImage') // Populate user's team and billImage
      .exec();

    const formattedExpenses = pendingExpenses.map(expense => ({
      id: expense._id,
      title: expense.category,
      department: expense.user.team,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      billImage: expense.billImage ? `http://localhost:5000/uploads/${expense.billImage}` : null, // Include bill image link
    }));

    res.json(formattedExpenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch pending expenses' });
  }
});

router.post('/admin/approve-expense/:id', adminMiddleware, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { status: 'approved' },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense approved successfully', expense: updatedExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to approve expense' });
  }
});

router.post('/admin/reject-expense/:id', adminMiddleware, async (req, res) => {
  try {
    const expenseId = req.params.id;
    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      { status: 'rejected' },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    res.json({ message: 'Expense rejected successfully', expense: updatedExpense });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to reject expense' });
  }
});


router.post('/admin/events', adminMiddleware, async (req, res) => {
  try {
    const { title, description, date, team, budget } = req.body;

    // Validate required fields
    if (!title || !date || !team || !budget) {
      return res.status(400).json({ error: 'All required fields must be filled' });
    }

    // Create and save the event
    const newEvent = new Event({ title, description, date, team, budget });
    const savedEvent = await newEvent.save();

    res.status(201).json({ message: 'Event created successfully', event: savedEvent });
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

router.get('/admin/events', adminMiddleware, async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

router.get('/admin/departments', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find(); // Fetch all users
    const expenses = await Expense.find(); // Fetch all expenses

    const departments = users.reduce((acc, user) => {
      const team = user.team;

      if (!acc[team]) {
        acc[team] = {
          name: team,
          head: user.name, // Assuming the first user in the team is the head
          members: 0,
          totalExpenses: 0,
          pendingExpenses: 0,
          approvedExpenses: 0,
          status: 'active',
        };
      }

      acc[team].members += 1;

      const teamExpenses = expenses.filter((expense) => expense.user.toString() === user._id.toString());
      acc[team].totalExpenses += teamExpenses.reduce((sum, expense) => sum + expense.amount, 0);
      acc[team].pendingExpenses += teamExpenses.filter((expense) => expense.status === 'pending').length;
      acc[team].approvedExpenses += teamExpenses.filter((expense) => expense.status === 'approved').length;

      return acc;
    }, {});

    res.json(Object.values(departments));
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ error: 'Failed to fetch departments' });
  }
});

module.exports = router;