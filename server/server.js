const express = require('express');

const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to DB
connectDB();

// Initialize app
const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // For parsing JSON

// Sample route
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const protectedRoutes = require('./routes/protectedRoutes');
app.use('/api', protectedRoutes);

const expenseRoutes = require('./routes/expenseRoutes');
app.use('/api', expenseRoutes);


const dashboardRoutes = require('./routes/dashboardRoutes');
app.use('/api', dashboardRoutes);

const adminRoutes = require('./routes/adminRoutes');
app.use('/api', adminRoutes);


const path = require('path');

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
