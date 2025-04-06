import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Use the MONGODB_URI environment variable
const url = process.env.MONGODB_URI;

const connectDB = async () => {
  try {
    // Connect to the MongoDB database (Buy-Sell-IIITH)
    await mongoose.connect(url);
    console.log(`Successfully connected to Buy-Sell-IIITH database 👍`);
  } catch (error) {
    console.error(`ERROR: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

export default connectDB;
