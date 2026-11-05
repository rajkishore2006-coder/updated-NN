const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "nn-supermarket-secret";

// Check whether the user has a valid JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    const token =
        authHeader && authHeader.startsWith("Bearer ") ?
        authHeader.split(" ")[1] :
        null;

    if (!token) {
        return res.status(401).json({
            message: "Authentication required",
        });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        req.user = decoded;

        next();
    } catch (error) {
        return res.status(403).json({
            message: "Invalid or expired token",
        });
    }
}

// Check whether the logged-in user is an admin
function requireAdmin(req, res, next) {
    if (!req.user || req.user.role !== "admin") {
        return res.status(403).json({
            message: "Admin access required",
        });
    }

    next();
}

module.exports = {
    authenticateToken,
    requireAdmin,
};