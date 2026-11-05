const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Product API
app.use("/api/products", productRoutes);

// Order API
app.use("/api/orders", orderRoutes);

// User / Customer API
app.use("/api/users", userRoutes);

// Dashboard API
app.use("/api/dashboard", dashboardRoutes);

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "NN Supermarket Backend is running",
    });
});

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error("MongoDB connection failed:", error.message);
    });