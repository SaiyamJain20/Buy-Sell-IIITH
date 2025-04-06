import express from 'express';
import cookieParser from "cookie-parser";
import cors from "cors";

import connectDB from "./config/db.js";
import userRouters from "./routes/userRouters.js";
import orderRouters from "./routes/ordersRouters.js";
import itemsRouters from "./routes/itemsRouters.js";
import cartRouters from "./routes/myCartRouters.js";

const port = process.env.PORT || 8080;
connectDB();

const app = express();

// CORS configuration
app.use(cors({
    origin: 'http://localhost:5173', // Allow requests from your frontend
    credentials: true,  // Allow cookies to be sent
    allowedHeaders: ['Authorization', 'Content-Type'], // Ensure Authorization is allowed
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify the allowed HTTP methods
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Route handlers
app.use("/api/user", userRouters);
app.use("/api/order", orderRouters);
app.use("/api/item", itemsRouters);
app.use("/api/cart", cartRouters);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(500).json({ message: 'Something went wrong!' }); // Send a generic error response
});

// Start the server
app.listen(port, () => console.log(`Server running on port: ${port}`));