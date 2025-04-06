import mongoose from "mongoose";
import bcrypt from "bcrypt";

// Define the order schema
const orderSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true, // Ensures every transaction ID is unique
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  sellers: [
    {
      sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      items: [
        {
          itemId: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: 'Item', 
            required: true 
          },
          quantity: { 
            type: Number, 
            required: true,
            min: 1 // Ensures quantity is at least 1
          },
        },
      ],
    },
  ],
  amount: {
    type: Number,
    required: true,
    min: 0, // Ensures amount cannot be negative
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Cancelled'],
    default: 'Pending', // New orders start as pending
  },
}, {
  timestamps: true,
});

// Middleware to hash the OTP before saving
orderSchema.pre('save', async function (next) {
  if (!this.isModified('hashedOtp')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.hashedOtp = await bcrypt.hash(this.hashedOtp, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare the OTPs
orderSchema.methods.compareOtp = async function (candidateOtp) {
  return bcrypt.compare(candidateOtp, this.hashedOtp);
};

// Create the Order model
const Order = mongoose.model('Order', orderSchema, 'Orders');

export default Order;
