const express = require("express");
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");

const {
    authenticateToken,
    requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET DASHBOARD DATA - ADMIN ONLY
router.get(
    "/",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            // Total products
            const totalProducts =
                await Product.countDocuments();

            // Total customers
            const totalCustomers =
                await User.countDocuments({
                    role: "customer",
                });

            // Get non-cancelled orders
            const orders = await Order.find({
                    status: { $ne: "cancelled" },
                })
                .sort({ createdAt: -1 })
                .lean();

            // Total orders
            const totalOrders = orders.length;

            // Total revenue
            const revenue = orders.reduce(
                (sum, order) =>
                sum + (order.total || 0),
                0
            );

            // Recent 5 orders
            const recentOrders = orders
                .slice(0, 5)
                .map((order) => ({
                    id: order._id,
                    customer: order.customerName,
                    items: order.items ?
                        order.items.reduce(
                            (sum, item) =>
                            sum + item.quantity,
                            0
                        ) :
                        0,
                    total: order.total || 0,
                    status: order.status,
                }));

            // Calculate top products
            const productSales = {};

            orders.forEach((order) => {
                if (!order.items) return;

                order.items.forEach((item) => {
                    const productId =
                        item.productId ?
                        item.productId.toString() :
                        null;

                    if (!productId) return;

                    if (!productSales[productId]) {
                        productSales[productId] = {
                            name: item.name,
                            sold: 0,
                            revenue: 0,
                        };
                    }

                    productSales[productId].sold +=
                        item.quantity;

                    productSales[productId].revenue +=
                        item.price * item.quantity;
                });
            });

            const topProducts =
                Object.values(productSales)
                .sort(
                    (a, b) =>
                    b.sold - a.sold
                )
                .slice(0, 5);

            res.json({
                stats: {
                    totalProducts,
                    totalOrders,
                    totalCustomers,
                    revenue,
                },
                recentOrders,
                topProducts,
            });
        } catch (error) {
            console.error(
                "DASHBOARD ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch dashboard data",
            });
        }
    }
);

module.exports = router;