import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0, // Price is non-negative
  },
  description: {
    type: String,
    trim: true,
    default: 'No description provided.',
  },
  category: {
    type: String,
    required: true,
    enum: ['clothing', 'grocery', 'electronics', 'furniture', 'books', 'others'], // Categories
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

const Item = mongoose.model('Item', itemSchema, 'Items');

export default Item;

