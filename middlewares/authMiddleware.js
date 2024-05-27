const jwt = require('jsonwebtoken');
const Alumni = require('../models/alumniModel');

exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ success: false, msg: "No token provided!" });
    }

    const token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, msg: "Unauthorized access!" });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, msg: "Failed to authenticate token." });
        }
        req.userId = decoded.id;
        req.userType = decoded.type;
        next();
    });
};

exports.verifyAdmin = (req, res, next) => {
    if (req.userType !== 'admin') {
        return res.status(403).json({ success: false, msg: "Access denied: Admins only" });
    }
    next();
};

exports.verifyAlumni = async (req, res, next) => {
    try {
        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(403).json({ success: false, msg: 'Access forbidden: Not an alumni' });
        }
        req.alumni = alumni; // Attach alumni data to the request for later use
        next(); // Proceed to the next middleware
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

function validateYearPercurso(req, res, next) {
    const { startYear, endYear } = req.body.percurso;

    // Check if startYear is valid (not in the future)
    const currentYear = new Date().getFullYear();
    if (startYear > currentYear) {
        return res.status(400).json({ success: false, msg: 'Start year cannot be in the future' });
    }

    // Check if endYear is valid (not before startYear if provided)
    if (endYear && endYear < startYear) {
        return res.status(400).json({ success: false, msg: 'End year cannot be before start year' });
    }

    // If no validation errors, proceed to the next middleware or route handler
    next();
}
