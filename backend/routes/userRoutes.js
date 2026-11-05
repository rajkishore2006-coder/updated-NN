const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Order = require("../models/Order");

const {
    authenticateToken,
    requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

const JWT_SECRET =
    process.env.JWT_SECRET || "nn-supermarket-secret";

// ============================================
// REGISTER
// ============================================

router.post("/register", async(req, res) => {
    try {
        const {
            name,
            email,
            phone,
            password,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email and password are required",
            });
        }

        const cleanEmail =
            email.toLowerCase().trim();

        const existingUser =
            await User.findOne({
                email: cleanEmail,
            });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 10);

        const user = await User.create({
            name: name.trim(),
            email: cleanEmail,
            phone: phone || "",
            passwordHash,
            role: "customer",
        });

        const token = jwt.sign({
                id: user._id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET, {
                expiresIn: "7d",
            }
        );

        res.status(201).json({
            message: "Registration successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "REGISTER ERROR:",
            error
        );

        res.status(500).json({
            message: "Registration failed",
        });
    }
});

// ============================================
// LOGIN
// ============================================

router.post("/login", async(req, res) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const cleanEmail =
            email.toLowerCase().trim();

        const user =
            await User.findOne({
                email: cleanEmail,
            });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.passwordHash
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign({
                id: user._id,
                email: user.email,
                role: user.role,
            },
            JWT_SECRET, {
                expiresIn: "7d",
            }
        );

        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        res.status(500).json({
            message: "Login failed",
        });
    }
});

// ============================================
// GET CURRENT USER
// AUTHENTICATED USER
// IMPORTANT: KEEP BEFORE /:id
// ============================================

router.get(
    "/me",
    authenticateToken,
    async(req, res) => {
        try {
            const user =
                await User.findById(
                    req.user.id
                )
                .select("-passwordHash")
                .lean();

            if (!user) {
                return res.status(404).json({
                    message: "User not found",
                });
            }

            res.json({
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
            });
        } catch (error) {
            console.error(
                "GET CURRENT USER ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch current user",
            });
        }
    }
);

// ============================================
// GET ALL CUSTOMERS
// ADMIN ONLY
// ============================================

router.get(
    "/customers",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            const users =
                await User.find({
                    role: "customer",
                })
                .select("-passwordHash")
                .sort({
                    createdAt: -1,
                })
                .lean();

            const customers =
                await Promise.all(
                    users.map(
                        async(user) => {
                            const orders =
                                await Order.find({
                                    customerEmail: user.email,
                                    status: {
                                        $ne: "cancelled",
                                    },
                                })
                                .select(
                                    "total"
                                )
                                .lean();

                            const totalOrders =
                                orders.length;

                            const totalSpent =
                                orders.reduce(
                                    (
                                        sum,
                                        order
                                    ) =>
                                    sum +
                                    (order.total ||
                                        0),
                                    0
                                );

                            return {
                                ...user,
                                orders: totalOrders,
                                spent: totalSpent,
                                status: "Active",
                            };
                        }
                    )
                );

            res.json(customers);
        } catch (error) {
            console.error(
                "FETCH CUSTOMERS ERROR:",
                error
            );

            res.status(500).json({
                message: "Failed to fetch customers",
            });
        }
    }
);

// ============================================
// GET USER BY ID
// ============================================

router.get("/:id", async(req, res) => {
    try {
        const user =
            await User.findById(
                req.params.id
            )
            .select("-passwordHash")
            .lean();

        if (!user) {
            return res.status(404).json({
                message: "User not found",
            });
        }

        res.json(user);
    } catch (error) {
        console.error(
            "GET USER ERROR:",
            error
        );

        res.status(500).json({
            message: "Failed to fetch user",
        });
    }
});

module.exports = router;