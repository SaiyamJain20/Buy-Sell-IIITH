import jwt from 'jsonwebtoken';
import User from '../models/userModels.js';

// Get all users
export const getAllUsers = async (req, res) => {
  console.log("Fetching all users...");
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(400).json({ error: 'Error fetching users', details: err });
  }
};

// Register a new user
export const registerUser = async (req, res) => {
  const { firstName, lastName, email, age, contactNumber, password } = req.body;

  // Validate request body
  if (!firstName || !lastName || !email || !age || !contactNumber || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  // Email and contact number validations
  if (!/^[a-zA-Z0-9._%+-]+@students.iiit.ac.in$/.test(email)) {
    return res.status(400).json({ error: 'Email must be a valid IIIT email.' });
  }

  if (!/^[0-9]{10}$/.test(contactNumber)) {
    return res.status(400).json({ error: 'Contact number must be a 10-digit number.' });
  }

  // Check if the user already exists
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Create a new user
    const newUser = new User({
      firstName,
      lastName,
      email,
      age,
      contactNumber,
      password, // Assuming password is hashed via schema pre-save hook
    });

    
    // Save the user to MongoDB
    await newUser.save();
    
    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );
    
    const refreshToken = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );
    
    console.log(newUser);
    // Set refresh token in a secure HTTP-only cookie
    res
      .status(201)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: 'User registered successfully!',
        accessToken,
        user: {
          id: newUser._id,
        },
      });

  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Login Controller
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Validate request body
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    // Find user by email and include the password in the query result
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Compare provided password with the stored hashed password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT tokens
    const accessToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const refreshToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // Respond with tokens and user details
    res
      .status(200)
      .cookie('refreshToken', refreshToken, {
        httpOnly: true, // Prevent JavaScript access to cookies
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        sameSite: 'strict', // Prevent CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .json({
        message: 'Login successful!',
        accessToken,
        user: {
          id: user._id,
        },
      });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'Server error. Please try again later.' });
  }
};

// Refresh Token Controller
export const refreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token is missing.' });
  }

  try {
    // Verify the refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    // Generate a new access token
    const accessToken = jwt.sign(
      { id: decoded.id, email: decoded.email },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.status(200).json({ accessToken });
  } catch (error) {
    console.error('Error refreshing token:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token.' });
  }
};

// Logout Controller
export const logoutUser = (req, res) => {
  res
    .clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Ensures secure cookies in production
      sameSite: 'strict', // Prevents CSRF attacks
    })
    .status(200)
    .json({ message: 'Logged out successfully.' });
};

// Profile Get Controller
export const getProfile = async (req, res) => {
  try {
    // Fetch the user by their ID from the decoded token
    const user = await User.findById(req.user.id).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Server error.' });
  }
};

// Profile Update Controller
export const updateProfile = async (req, res) => {
  const { firstName, lastName, contactNumber, age } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, contactNumber, age },
      { new: true, runValidators: true }
    ).select('-password'); // Exclude password from response

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ message: 'Profile updated successfully.', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ error: 'Invalid input or server error.' });
  }
};
