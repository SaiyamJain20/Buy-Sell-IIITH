import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import { 
    getAllItems, 
    addItem, 
    searchFilterItems, 
    getItemById 
} from '../controllers/itemController.js';

const router = express.Router();

// Get all items
router.route('/').get(getAllItems);

// Add item (Protected Route)
router.post('/add', verifyToken, addItem);

// Search and filter items (Protected Route)
router.route('/search-filter').post(verifyToken, searchFilterItems);

// Get item by ID (Protected Route)
router.get('/:id', verifyToken, getItemById);

export default router;
