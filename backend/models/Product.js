const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    price: {
        type: Number,
        required: true,
        min: 0,
    },

    originalPrice: {
        type: Number,
        default: null,
        min: 0,
    },

    category: {
        type: String,
        required: true,
        trim: true,
    },

    image: {
        type: String,
        default: "",
    },

    unit: {
        type: String,
        default: "1 unit",
    },

    stockQuantity: {
        type: Number,
        default: 0,
        min: 0,
    },

    description: {
        type: String,
        default: "",
    },

    featured: {
        type: Boolean,
        default: false,
    },

    offer: {
        type: Boolean,
        default: false,
    },

    // Offer text shown for products on sale
    offerLabel: {
        type: String,
        default: "",
        trim: true,
    },

    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model(
    "Product",
    productSchema
);