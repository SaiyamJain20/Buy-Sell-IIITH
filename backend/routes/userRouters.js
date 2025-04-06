import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { 
  getAllUsers, 
  registerUser, 
  loginUser, 
  refreshToken, 
  logoutUser, 
  getProfile, 
  updateProfile
} from '../controllers/userController.js';

const router = express.Router();

// Route to get all users
router.get('/', verifyToken, getAllUsers);

// Route to register a new user
router.post('/register', registerUser);

// Route to log in a user
router.post('/auth', loginUser);

// Route to refresh the access token
router.post('/refresh', refreshToken);

// Logout route
router.post('/logout', verifyToken, logoutUser);

// Get profile route
router.get('/profile', verifyToken, getProfile);

// Update profile route
router.put('/profile', verifyToken, updateProfile);

export default router;
