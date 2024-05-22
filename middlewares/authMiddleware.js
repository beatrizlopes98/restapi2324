const jwt = require('jsonwebtoken');

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