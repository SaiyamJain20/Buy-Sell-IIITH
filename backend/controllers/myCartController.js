// controllers/cartController.js
import User from '../models/userModels.js';
import Item from '../models/itemsModels.js';

// Get user's cart items
export const getCartItems = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).populate('cartItems.itemId');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({
            message: 'Cart items fetched successfully.',
            cartItems: user.cartItems,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
};

// Add item to the user's cart
export const addItemToCart = async (req, res) => {
    let { itemId, quantity } = req.body;

    if (!itemId || !quantity || quantity <= 0) {
        return res.status(400).json({ error: 'Item ID and quantity are required, and quantity must be greater than 0.' });
    }

    quantity = Number(quantity);
    if (isNaN(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Invalid quantity provided.' });
    }

    try {
        const item = await Item.findById(itemId);
        if (!item) {
            return res.status(404).json({ error: 'Item not found.' });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        if (user.role === 'seller') {
            return res.status(403).json({ error: 'Sellers cannot add items to the cart.' });
        }

        const cartItemIndex = user.cartItems.findIndex(cartItem => cartItem.itemId.toString() === itemId);

        if (cartItemIndex !== -1) {
            user.cartItems[cartItemIndex].quantity += quantity;
        } else {
            user.cartItems.push({ itemId, quantity });
        }

        await user.save();

        res.json({ message: 'Item added to cart successfully.', cart: user.cartItems });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error.', details: error.message });
    }
};

// Remove item from the user's cart
export const removeItemFromCart = async (req, res) => {
    const { itemId } = req.params;
    const { quantity } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const cartItemIndex = user.cartItems.findIndex(item => item.itemId.toString() === itemId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart.' });
        }

        if (quantity) {
            if (user.cartItems[cartItemIndex].quantity <= quantity) {
                user.cartItems.splice(cartItemIndex, 1);
            } else {
                user.cartItems[cartItemIndex].quantity -= quantity;
            }
        } else {
            user.cartItems.splice(cartItemIndex, 1);
        }

        await user.save();

        res.json({ message: 'Item removed from cart successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error removing item from cart.', details: error.message });
    }
};

// Completely delete an item from the cart
export const deleteItemFromCart = async (req, res) => {
    const { itemId } = req.params;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const cartItemIndex = user.cartItems.findIndex(item => item.itemId.toString() === itemId);

        if (cartItemIndex === -1) {
            return res.status(404).json({ error: 'Item not found in cart.' });
        }

        user.cartItems.splice(cartItemIndex, 1);

        await user.save();

        res.json({ message: 'Item removed from cart successfully.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error removing item from cart.', details: error.message });
    }
};
