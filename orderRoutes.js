const express = require("express");
const mongoose = require("mongoose");

const Order = require("../models/Order");
const Product = require("../models/Product");

const {
    authenticateToken,
    requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// ============================================
// GET ALL ORDERS - ADMIN ONLY
// ============================================

router.get(
    "/",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            const orders = await Order.find()
                .sort({ createdAt: -1 });

            res.json(orders);
        } catch (error) {
            console.error(
                "GET ORDERS ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch orders",
            });
        }
    }
);

// ============================================
// GET SINGLE ORDER - ADMIN ONLY
// IMPORTANT: Keep before POST-related logic
// ============================================

router.get(
    "/:id",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            if (!mongoose.Types.ObjectId.isValid(
                    req.params.id
                )) {
                return res.status(400).json({
                    message: "Invalid order id",
                });
            }

            const order =
                await Order.findById(
                    req.params.id
                );

            if (!order) {
                return res.status(404).json({
                    message: "Order not found",
                });
            }

            res.json(order);
        } catch (error) {
            console.error(
                "GET ORDER ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch order",
            });
        }
    }
);

// ============================================
// CREATE ORDER - CUSTOMER CHECKOUT
// Uses MongoDB transaction + atomic stock
// ============================================

router.post("/", async(req, res) => {
    const session =
        await mongoose.startSession();

    try {
        const {
            customerName,
            customerEmail,
            customerPhone,
            deliveryAddress,
            items,
            discount = 0,
            deliveryFee = 0,
        } = req.body;

        // ----------------------------------------
        // Basic validation
        // ----------------------------------------

        if (!customerName ||
            !customerEmail ||
            !deliveryAddress ||
            !Array.isArray(items) ||
            items.length === 0
        ) {
            return res.status(400).json({
                message: "Customer details, delivery address and items are required",
            });
        }

        const cleanName =
            String(customerName).trim();

        const cleanEmail =
            String(customerEmail)
            .trim()
            .toLowerCase();

        const cleanPhone = customerPhone ?
            String(customerPhone).trim() :
            "";

        const cleanAddress =
            String(deliveryAddress).trim();

        if (!cleanName ||
            !cleanEmail ||
            !cleanAddress
        ) {
            return res.status(400).json({
                message: "Customer name, email and address are required",
            });
        }

        // ----------------------------------------
        // Start transaction
        // ----------------------------------------

        session.startTransaction();

        const orderItems = [];
        let subtotal = 0;

        // ----------------------------------------
        // Validate + atomically reserve stock
        // ----------------------------------------

        for (const item of items) {
            if (!item.productId ||
                item.quantity === undefined
            ) {
                throw new Error(
                    "Invalid order item"
                );
            }

            if (!mongoose.Types.ObjectId.isValid(
                    item.productId
                )) {
                throw new Error(
                    "Invalid product id"
                );
            }

            const quantity =
                Number(item.quantity);

            if (!Number.isInteger(quantity) ||
                quantity <= 0
            ) {
                throw new Error(
                    "Invalid product quantity"
                );
            }

            /*
             * Atomic stock check + decrement.
             *
             * This prevents two simultaneous orders
             * from buying more stock than available.
             */
            const product =
                await Product.findOneAndUpdate({
                    _id: item.productId,
                    stockQuantity: {
                        $gte: quantity,
                    },
                }, {
                    $inc: {
                        stockQuantity:
                            -quantity,
                    },
                }, {
                    new: true,
                    session,
                    runValidators: true,
                });

            if (!product) {
                const existingProduct =
                    await Product.findById(
                        item.productId
                    ).session(session);

                if (!existingProduct) {
                    throw new Error(
                        `Product not found: ${item.productId}`
                    );
                }

                throw new Error(
                    `Not enough stock for ${existingProduct.name}. Available: ${existingProduct.stockQuantity}`
                );
            }

            const itemTotal =
                product.price * quantity;

            subtotal += itemTotal;

            orderItems.push({
                productId: product._id,
                name: product.name,
                price: product.price,
                quantity,
                unit: product.unit ||
                    "1 unit",
            });
        }

        // ----------------------------------------
        // Sanitize discount / delivery fee
        // ----------------------------------------

        let safeDiscount =
            Number(discount);

        if (!Number.isFinite(
                safeDiscount
            ) ||
            safeDiscount < 0
        ) {
            safeDiscount = 0;
        }

        // Discount cannot exceed subtotal
        safeDiscount = Math.min(
            safeDiscount,
            subtotal
        );

        let safeDeliveryFee =
            Number(deliveryFee);

        if (!Number.isFinite(
                safeDeliveryFee
            ) ||
            safeDeliveryFee < 0
        ) {
            safeDeliveryFee = 0;
        }

        const total = Math.max(
            0,
            subtotal -
            safeDiscount +
            safeDeliveryFee
        );

        // ----------------------------------------
        // Create order inside transaction
        // ----------------------------------------

        const createdOrders =
            await Order.create(
                [{
                    customerName: cleanName,

                    customerEmail: cleanEmail,

                    customerPhone: cleanPhone,

                    deliveryAddress: cleanAddress,

                    items: orderItems,

                    subtotal,

                    discount: safeDiscount,

                    deliveryFee: safeDeliveryFee,

                    total,

                    status: "pending",
                }, ], {
                    session,
                }
            );

        const order =
            createdOrders[0];

        // ----------------------------------------
        // Commit transaction
        // ----------------------------------------

        await session.commitTransaction();

        res.status(201).json({
            message: "Order created successfully",
            order,
        });
    } catch (error) {
        // ----------------------------------------
        // Rollback everything on failure
        // ----------------------------------------

        await session.abortTransaction();

        console.error(
            "CREATE ORDER ERROR:",
            error
        );

        const message =
            error instanceof Error ?
            error.message :
            "Failed to create order";

        res.status(400).json({
            message,
        });
    } finally {
        await session.endSession();
    }
});

// ============================================
// UPDATE ORDER STATUS - ADMIN ONLY
// Handles stock on cancellation / restoration
// ============================================

router.put(
    "/:id/status",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        const session =
            await mongoose.startSession();

        try {
            // ----------------------------------------
            // Validate order id
            // ----------------------------------------

            if (!mongoose.Types.ObjectId.isValid(
                    req.params.id
                )) {
                return res.status(400).json({
                    message: "Invalid order id",
                });
            }

            const { status } = req.body;

            const allowedStatuses = [
                "pending",
                "confirmed",
                "packed",
                "out_for_delivery",
                "delivered",
                "cancelled",
            ];

            if (!allowedStatuses.includes(
                    status
                )) {
                return res.status(400).json({
                    message: "Invalid order status",
                });
            }

            session.startTransaction();

            const order =
                await Order.findById(
                    req.params.id
                ).session(session);

            if (!order) {
                await session.abortTransaction();

                return res.status(404).json({
                    message: "Order not found",
                });
            }

            const oldStatus =
                order.status;

            // Same status - nothing to change
            if (oldStatus === status) {
                await session.commitTransaction();

                return res.json({
                    message: "Order status updated successfully",
                    order,
                });
            }

            // ----------------------------------------
            // NON-CANCELLED → CANCELLED
            // Restore stock
            // ----------------------------------------

            if (
                oldStatus !== "cancelled" &&
                status === "cancelled"
            ) {
                for (const item of order.items) {
                    await Product.findByIdAndUpdate(
                        item.productId, {
                            $inc: {
                                stockQuantity: item.quantity,
                            },
                        }, {
                            session,
                        }
                    );
                }
            }

            // ----------------------------------------
            // CANCELLED → NON-CANCELLED
            // Reserve stock again
            // ----------------------------------------

            if (
                oldStatus === "cancelled" &&
                status !== "cancelled"
            ) {
                for (const item of order.items) {
                    const product =
                        await Product.findOneAndUpdate({
                            _id: item.productId,
                            stockQuantity: {
                                $gte: item.quantity,
                            },
                        }, {
                            $inc: {
                                stockQuantity:
                                    -item.quantity,
                            },
                        }, {
                            new: true,
                            session,
                        });

                    if (!product) {
                        throw new Error(
                            `Not enough stock to restore this order for ${item.name}`
                        );
                    }
                }
            }

            // ----------------------------------------
            // Update order status
            // ----------------------------------------

            order.status = status;

            await order.save({
                session,
            });

            await session.commitTransaction();

            res.json({
                message: "Order status updated successfully",
                order,
            });
        } catch (error) {
            await session.abortTransaction();

            console.error(
                "UPDATE ORDER STATUS ERROR:",
                error
            );

            const message =
                error instanceof Error ?
                error.message :
                "Failed to update order status";

            res.status(400).json({
                message,
            });
        } finally {
            await session.endSession();
        }
    }
);

module.exports = router;