import User from '../models/userModels.js';
import Order from '../models/ordersModels.js';

export const getOrders = async (req, res) => {
  try {
    console.log("Fetching all orders...");
    const orders = await Order.find();
    res.json(orders);
  } catch (err) {
    res.status(400).json({ error: 'Error fetching orders', details: err });
  }
};

export const createOrder = async (req, res) => {
  try {
    // Find the logged-in user based on the token
    const user = await User.findById(req.user.id).populate('cartItems.itemId');
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    // Ensure the user has items in their cart
    if (!user.cartItems || user.cartItems.length === 0) {
      return res.status(400).json({ error: 'Your cart is empty.' });
    }

    // Prepare the order data
    const sellersMap = new Map();
    let totalAmount = 0;

    // Group items by seller and calculate the total amount
    for (const cartItem of user.cartItems) {
      const { itemId, quantity } = cartItem;
      const sellerId = itemId.sellerId; // Assuming `sellerId` is a field in the `Item` schema
      const price = itemId.price; // Assuming `price` is a field in the `Item` schema

      if (!sellersMap.has(sellerId)) {
        sellersMap.set(sellerId, []);
      }

      sellersMap.get(sellerId).push({ itemId: itemId._id, quantity });
      totalAmount += price * quantity;
    }

    // Create sellers array for the order
    const sellers = Array.from(sellersMap, ([sellerId, items]) => ({
      sellerId,
      items,
    }));

    // Generate a unique transaction ID
    const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

    // Hash a mock OTP for demonstration purposes
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP

    // Create a new order
    const newOrder = new Order({
      transactionId,
      buyerId: user._id,
      sellers,
      amount: totalAmount,
      hashedOtp: otp,
    });

    // Save the order to the database
    await newOrder.save();

    // Clear the user's cart
    user.cartItems = [];
    await user.save();

    res.json({ 
      message: 'Order placed successfully.', 
      order: newOrder, 
      otp: otp // Return OTP for demonstration (remove in production) 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("buyerId", "username")  // Populate buyer details
      .populate("sellers.sellerId", "username")  // Populate seller details
      .populate("sellers.items.itemId", "name price");  // Populate product details

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    // Check if the logged-in user is either the buyer or one of the sellers in the order
    const userId = req.user.id;
    const isBuyer = order.buyerId._id.toString() === userId;

    if (!isBuyer) {
      return res.status(403).json({ error: "Unauthorized access to this order" });
    }

    // Format the response
    const formattedOrder = {
      _id: order._id,
      transactionId: order.transactionId,
      buyer: {
        id: order.buyerId._id,
        username: order.buyerId.username,
      },
      sellers: order.sellers.map(seller => ({
        seller: {
          id: seller.sellerId._id,
          username: seller.sellerId.username,
        },
        items: seller.items.map(item => ({
          product: {
            id: item.itemId._id,
            name: item.itemId.name,
            price: item.itemId.price,
          },
          quantity: item.quantity,  // Include the quantity for each item
        })),
      })),
      totalAmount: order.amount,  // Overall order amount
      orderStatus: order.status || "Pending",  // Default status if not provided
    };

    res.json(formattedOrder);
  } catch (error) {
    res.status(500).json({ error: "Server error", details: error.message });
  }
};

export const completeOrder = async (req, res) => {
  const { buyerId, otp } = req.body;
  const { transactionId } = req.params;

  if (!transactionId || !buyerId || !otp) {
    return res.status(400).json({ error: 'Transaction ID, buyer ID, and OTP are required.' });
  }

  try {
    // Find the order by transaction ID
    const order = await Order.findOne({ transactionId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found.' });
    }

    // Verify that the buyer ID matches
    if (order.buyerId.toString() !== buyerId) {
      return res.status(403).json({ error: 'You are not authorized to complete this order.' });
    }

    // Verify the OTP
    const isOtpValid = await order.compareOtp(otp);
    if (!isOtpValid) {
      return res.status(401).json({ error: 'Invalid OTP. Please try again.' });
    }

    // Mark the order as completed (optional: add a status field to the order schema if not already present)
    order.status = 'Completed';
    await order.save();

    res.json({ message: 'Order completed successfully.', order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({});
    res.json({ totalOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch total orders.', details: error.message });
  }
};

export const getTotalSales = async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.json({ totalSales: totalSales[0]?.totalAmount || 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch total sales.', details: error.message });
  }
};

export const getTotalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          totalSales: { $sum: '$amount' },
          orderCount: { $sum: 1 }
        },
      },
      { $sort: { _id: 1 } }, // Sort by date ascending
    ]);

    res.json(salesByDate);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch total sales by date.', details: error.message });
  }
};

export const getPendingOrdersForSeller = async (req, res) => {
  const sellerId = req.user.id; // The sellerId matches the logged-in user's ID

  try {
    // Find orders where the seller is involved and status is "Pending"
    const pendingOrders = await Order.find({
      'sellers.sellerId': sellerId, // Match sellerId within the sellers array
      status: 'Pending',
    }).populate({
      path: 'sellers.items.itemId',
      select: 'name price', // Include item name and price
    });

    if (pendingOrders.length === 0) {
      return res.status(404).json({ message: 'No pending orders found.' });
    }

    res.json({ pendingOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
};

export const getCompletedOrdersForBuyer = async (req, res) => {
  const buyerId = req.user.id; // The buyerId is derived from the logged-in user's ID

  try {
    // Fetch orders where the buyer is involved and the status is "Delivered"
    const completedOrders = await Order.find({
      buyerId: buyerId, // Match buyerId
      status: 'Completed', // Only completed (delivered) orders
    }).populate({
      path: 'sellers.items.itemId',
      select: 'name price', // Include item name and price
    });

    if (completedOrders.length === 0) {
      return res.status(404).json({ message: 'No completed orders found.' });
    }

    res.json({ completedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
};

export const getSoldCompletedOrders = async (req, res) => {
  const sellerId = req.user.id; // The sellerId is derived from the logged-in user's ID

  try {
    // Fetch completed orders where the seller is involved and order status is 'Completed'
    const completedOrders = await Order.find({
      'sellers.sellerId': sellerId, // Match orders where the seller is involved
      status: 'Completed' // Only fetch completed orders
    }).populate({
      path: 'sellers.items.itemId',
      select: 'name price', // Include item name and price
    });

    if (completedOrders.length === 0) {
      return res.status(404).json({ message: 'No completed orders found.' });
    }

    res.json({ completedOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
};

export const getPendingOrdersForBuyer = async (req, res) => {
  const buyerId = req.user.id; // The buyerId is derived from the logged-in user's ID

  try {
    // Fetch pending orders where the buyer is involved and the order status is 'Pending'
    const pendingOrders = await Order.find({
      buyerId: buyerId, // Match orders where the buyer is the logged-in user
      status: 'Pending' // Only fetch pending orders
    }).populate({
      path: 'sellers.items.itemId',
      select: 'name price', // Include item name and price
    });

    if (pendingOrders.length === 0) {
      return res.status(404).json({ message: 'No pending orders found.' });
    }

    res.json({ pendingOrders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error.', details: error.message });
  }
};
