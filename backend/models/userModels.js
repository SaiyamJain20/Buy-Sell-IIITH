import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const Schema = mongoose.Schema;

const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: [true, 'This email is already registered'],
      match: [ /^[a-zA-Z0-9._%+-]+@students.iiit.ac.in$/, 'Invalid email format' ],
      index: true, // Adds an index to email
    },
    age: {
      type: Number,
      required: true,
    },
    contactNumber: {
      type: String,
      required: true,
      match: /^[0-9]{10}$/, // 10-digit mobile number format
    },
    password: {
      type: String,
      required: true,
      select: false,
    },    
    cartItems: [{
      itemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Item',
          required: true,
      },
      quantity: {
          type: Number,
          required: true,
          min: 1,
      }
    }],
    sellerReviews: [
      {
        reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reviewText: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        reviewDate: { type: Date, default: Date.now },
      },
    ],
  }, {
    timestamps: true,
});

userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
  
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (error) {
      next(error);
    }
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Set the custom collection name here: 'Buy-Sell-IIITH'
const User = mongoose.model('User', userSchema, 'Users');

export default User;
