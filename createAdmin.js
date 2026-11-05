const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");

async function createAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("MongoDB connected");

        const email = "admin@gmail.com";
        const password = "admin123";

        const passwordHash = await bcrypt.hash(password, 10);

        const existingAdmin = await User.findOne({ email });

        if (existingAdmin) {
            existingAdmin.name = "NN Supermarket Admin";
            existingAdmin.passwordHash = passwordHash;
            existingAdmin.role = "admin";

            await existingAdmin.save();

            console.log("Admin account updated successfully");
        } else {
            await User.create({
                name: "NN Supermarket Admin",
                email,
                phone: "",
                passwordHash,
                role: "admin",
            });

            console.log("Admin account created successfully");
        }

        console.log("Email:", email);
        console.log("Password:", password);

        await mongoose.disconnect();
    } catch (error) {
        console.error("Admin creation failed:", error.message);
        process.exit(1);
    }
}

createAdmin();