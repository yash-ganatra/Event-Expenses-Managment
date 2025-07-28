const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /api/auth/login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user._id, name: user.name,team: user.team, isAdmin: user.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        team: user.team,
        email: user.email,
        isAdmin: user.isAdmin,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


const signupUser = async (req, res) => {
  const { name, email, password, team } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      team,
    });

    // Generate a JWT token
    const token = jwt.sign(
      { id: newUser._id, team: newUser.team },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        team: newUser.team,
        email: newUser.email,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { loginUser, signupUser };



