// routes/cartRoutes.js
import express from 'express';
import verifyToken from '../middleware/authMiddleware.js';
import * as cartController from '../controllers/myCartController.js';

const router = express.Router();

router.get('/', verifyToken, cartController.getCartItems);
router.post('/add', verifyToken, cartController.addItemToCart);
router.delete('/remove/:itemId', verifyToken, cartController.removeItemFromCart);
router.delete('/delete/:itemId', verifyToken, cartController.deleteItemFromCart);

export default router;
