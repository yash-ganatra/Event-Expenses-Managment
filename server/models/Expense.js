const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    date: { type: Date, default: Date.now },
    billImage: { type: String }, // Field to store the image filename or URL
     status: { 
        type: String, 
        enum: ['approved', 'pending', 'rejected'], 
        default: 'pending' // Default value set to 'pending'
    },
});

module.exports = mongoose.model('Expense', expenseSchema);