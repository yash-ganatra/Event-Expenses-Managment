const express = require('express');
const multer = require('multer'); // Import multer for file uploads
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminVerification');
const { execFile } = require('child_process'); // Import child_process to execute Python script
const path = require('path');
const Expense = require('../models/Expense');
const router = express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to store uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});
const upload = multer({ storage });
// Add Expense with file upload
router.post('/expenses', authMiddleware, upload.single('bill'), async (req, res) => {
    try {
        const { amount, category, description, date } = req.body;
        const billImage = req.file ? req.file.filename : null; // Get uploaded file's name

        if (!billImage) {
            return res.status(400).json({ message: 'No image uploaded.' });
        }

        const imagePath = path.resolve('uploads', billImage);

        // Run the Python script to validate the image
        execFile('python', ['e:\\S4DS Project\\expense-manager\\server\\fakeimagedetection.py', imagePath], (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing Python script:', error.message);
                return res.status(500).json({ message: 'Internal server error.' });
            }

            const verdict = stdout.trim(); // Get the verdict from the script output
            if (verdict.includes('❌ FAKE')) {
                return res.status(400).json({ message: 'Image detected as fake. Expense not added.' });
            }

            // If the image is real, proceed with saving the expense
            const expense = new Expense({
                user: req.user.id,
                amount,
                category,
                description,
                date,
                billImage, // Save the file name in the database
            });

            expense.save()
                .then(() => res.status(201).json(expense))
                .catch((err) => {
                    console.error(err);
                    res.status(500).json({ message: 'Error adding expense', error: err.message });
                });
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding expense', error: err.message });
    }
});

// Get All Expenses
router.get('/expenses', authMiddleware, async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user.id });
        res.json(expenses);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching expenses', error: err.message });
    }
});

// Delete Expense
router.delete('/expenses/:id', authMiddleware, async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense || expense.user.toString() !== req.user.id) {
            return res.status(404).json({ message: 'Expense not found or unauthorized' });
        }

        // Use deleteOne() to delete the expense
        await expense.deleteOne();
        res.json({ message: 'Expense deleted' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting expense', error: err.message });
    }
});

module.exports = router;