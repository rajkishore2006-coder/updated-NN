const express = require("express");
const Product = require("../models/Product");

const {
    authenticateToken,
    requireAdmin,
} = require("../middleware/authMiddleware");

const router = express.Router();

// GET all products
// Public - customers can view products
router.get("/", async(req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });

        res.status(200).json(products);
    } catch (error) {
        console.error("FETCH PRODUCTS ERROR:", error);

        res.status(500).json({
            message: "Failed to fetch products",
            error: error.message,
        });
    }
});

// GET single product
// Public - customers can view a product
router.get("/:id", async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error) {
        console.error("GET PRODUCT ERROR:", error);

        res.status(400).json({
            message: "Invalid product ID",
            error: error.message,
        });
    }
});

// CREATE product
// Admin only
router.post(
    "/",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            const {
                name,
                price,
                originalPrice,
                category,
                image,
                unit,
                stockQuantity,
                description,
                featured,
                offer,
                offerLabel,
                rating,
            } = req.body;

            // Required fields
            if (!name || price === undefined || !category) {
                return res.status(400).json({
                    message: "Name, price and category are required",
                });
            }

            // Validate price
            if (Number(price) < 0) {
                return res.status(400).json({
                    message: "Price cannot be negative",
                });
            }

            // Validate stock
            if (
                stockQuantity !== undefined &&
                Number(stockQuantity) < 0
            ) {
                return res.status(400).json({
                    message: "Stock quantity cannot be negative",
                });
            }

            const product = await Product.create({
                name: name.trim(),
                price: Number(price),

                originalPrice: originalPrice !== undefined &&
                    originalPrice !== null ?
                    Number(originalPrice) :
                    null,

                category: category.trim(),
                image: image || "",
                unit: unit || "1 unit",

                stockQuantity: stockQuantity !== undefined ?
                    Number(stockQuantity) :
                    0,

                description: description || "",
                featured: Boolean(featured),
                offer: Boolean(offer),

                offerLabel: typeof offerLabel === "string" ?
                    offerLabel.trim() :
                    "",

                rating: rating !== undefined ?
                    Number(rating) :
                    0,
            });

            res.status(201).json(product);
        } catch (error) {
            console.error("CREATE PRODUCT ERROR:", error);

            res.status(400).json({
                message: "Failed to create product",
                error: error.message,
            });
        }
    }
);

// UPDATE product
// Admin only
router.put(
    "/:id",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            const product = await Product.findByIdAndUpdate(
                req.params.id,
                req.body, {
                    new: true,
                    runValidators: true,
                }
            );

            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }

            res.status(200).json(product);
        } catch (error) {
            console.error("UPDATE PRODUCT ERROR:", error);

            res.status(400).json({
                message: "Failed to update product",
                error: error.message,
            });
        }
    }
);

// DELETE product
// Admin only
router.delete(
    "/:id",
    authenticateToken,
    requireAdmin,
    async(req, res) => {
        try {
            const product = await Product.findByIdAndDelete(
                req.params.id
            );

            if (!product) {
                return res.status(404).json({
                    message: "Product not found",
                });
            }

            res.status(200).json({
                message: "Product deleted successfully",
            });
        } catch (error) {
            console.error("DELETE PRODUCT ERROR:", error);

            res.status(400).json({
                message: "Failed to delete product",
                error: error.message,
            });
        }
    }
);

module.exports = router;