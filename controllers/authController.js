const Users = require('../models/users')
const Login = require('../models/login')
const Password = require("node-php-password");
const { JWT_SECRET } = require("../constants/constant")
const jwt = require("jsonwebtoken");
const moment = require('moment');

const invalidatedTokens = new Set();

const signupUser = async (req, res) => {
  try {
    const { name, email, password, profile_pic } = req.body;

    const preUser = await Users.getUserByEmail(email);
    if (preUser) {
      return res.status(406).send("User already exists");
    }

    const hashedPassword = Password.hash(password);

    const userData = {
      name,
      email,
      password: hashedPassword,
      profile_pic: profile_pic || 'https://example.com/default-avatar.jpg',
      user_type: 3,
      role: 'user',
      status: 1,
      timestamp: Math.floor(Date.now() / 1000),
      added_by: 1,
      updated_on: Math.floor(Date.now() / 1000),
    };

    const newUser = await Users.addUser(userData);

    if (newUser) {
      res.send({ status: 1, message: 'User added successfully' });
    } else {
      res.status(401).send({ message: 'Failed to add user' });
    }

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).send({ message: 'Server error' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Login.userLogin(email);

    if (!user) {
      return res.status(401).send({ error: 'User not found or inactive' });
    }

    const verified = Password.verify(password, user.password.replace('$2b$', '$2y$'));

    if (!verified) {
      return res.status(401).send({ error: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user.user_id }, JWT_SECRET, { expiresIn: '24h' });

    res.cookie('accessToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
    });

    const userData = await Users.getUserById(user.user_id);

    res.status(200).send({
      user: {
        ...userData, // includes profile_pic if getUserById returns it
      },
      message: 'Login successful'
    });

  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).send({ error: 'Server error' });
  }
};

const authMe = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token || invalidatedTokens.has(token)) {
      return res.status(401).send({ message: 'No token provided or token invalidated' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const userData = await Users.getUserById(decoded.userId);

    if (!userData) {
      return res.status(404).send({ message: 'User not found' });
    }

    res.send({ user: userData });

  } catch (err) {
    console.error('Auth Me Error:', err);
    res.status(500).send({ message: 'Server error' });
  }
};

const logOut = async (req, res) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).send({ message: 'No token provided' });
    }

    invalidatedTokens.add(token);

    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      path: '/',
    });

    res.send({ status: 1, message: 'Logout successfully' });

  } catch (error) {
    console.error('Logout Error:', error);
    res.status(500).send({ message: 'Server error' });
  }
};

module.exports = {
  signupUser,
  loginUser,
  authMe,
  logOut,
}