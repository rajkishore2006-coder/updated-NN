const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    unit: {
        type: String,
        default: "1 unit",
    },
}, { _id: false });

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true,
        trim: true,
    },

    customerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },

    customerPhone: {
        type: String,
        default: "",
        trim: true,
    },

    deliveryAddress: {
        type: String,
        required: true,
        trim: true,
    },

    items: {
        type: [orderItemSchema],
        required: true,
    },

    subtotal: {
        type: Number,
        required: true,
        min: 0,
    },

    discount: {
        type: Number,
        default: 0,
        min: 0,
    },

    deliveryFee: {
        type: Number,
        default: 0,
        min: 0,
    },

    total: {
        type: Number,
        required: true,
        min: 0,
    },

    status: {
        type: String,
        enum: [
            "pending",
            "confirmed",
            "packed",
            "out_for_delivery",
            "delivered",
            "cancelled",
        ],
        default: "pending",
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Order", orderSchema);