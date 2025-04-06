import express from 'express';
import { 
  getOrders, 
  createOrder, 
  getOrderById,
  completeOrder,
  getMyOrders,
  getTotalOrders,
  getTotalSales,
  getTotalSalesByDate,
  getPendingOrdersForSeller,
  getCompletedOrdersForBuyer,
  getSoldCompletedOrders,
  getPendingOrdersForBuyer,
} from '../controllers/orderController.js';
import verifyToken from '../middleware/authMiddleware.js';

const router = express.Router();

// Route to get all orders
router.route('/').get(getOrders);

// Route to create a new order
router.route('/').post(verifyToken, createOrder);

// Route to get a single order by its ID
router.route('/:id').get(verifyToken, getOrderById);

// Route to complete an order
router.post('/:transactionId/pay', verifyToken, completeOrder);

// Route to get the logged-in user's orders
router.get('/bought/mine', verifyToken, getMyOrders);

// Route to get the total number of orders
router.get('/total-orders', verifyToken, getTotalOrders);

// Route to get the total sales amount
router.get('/total-sales', verifyToken, getTotalSales);

// Route to get total sales by date
router.get('/total-sales-by-date', verifyToken, getTotalSalesByDate);

// Route to get pending orders for a seller
router.get('/sold/pending', verifyToken, getPendingOrdersForSeller);

// Route to get completed (delivered) orders for a buyer
router.get('/bought/completed', verifyToken, getCompletedOrdersForBuyer);

// Route to get all items sold by the logged-in seller
router.get('/sold/completed', verifyToken, getSoldCompletedOrders);

// Route to get all pending orders placed by the logged-in buyer
router.get('/bought/pending', verifyToken, getPendingOrdersForBuyer);

export default router;
