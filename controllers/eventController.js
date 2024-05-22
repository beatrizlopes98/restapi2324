const Event = require('../models/eventModel');
const jwt = require('jsonwebtoken');

// Middleware to verify token
exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header) {
        return res.status(401).json({ success: false, msg: "No token provided!" });
    }

    let token = header.split(' ')[1];
    if (!token) {
        return res.status(401).json({ success: false, msg: "Unauthorized access!" });
    }

    jwt.verify(token, process.env.SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ success: false, msg: "Failed to authenticate token." });
        }
        req.userId = decoded.id;
        req.userType = decoded.type; // Assuming the token includes user type
        next();
    });
};

// Middleware to check if the user is an admin
exports.verifyAdmin = (req, res, next) => {
    if (req.userType !== 'admin') {
        return res.status(403).json({ success: false, msg: "Access denied: Admins only" });
    }
    next();
};

// Get all events
exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json({ success: true, data: events });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Get event by ID
exports.getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Create an event (Admin only)
exports.createEvent = [exports.verifyAdmin, async (req, res) => {
    try {
        const { name, description, datetime, location, date, time } = req.body;
        const newEvent = new Event({
            name,
            description,
            datetime,
            location,
            date,
            time
        });
        const savedEvent = await newEvent.save();
        res.status(201).json({ success: true, data: savedEvent });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
}];

// Update an event (Admin only)
exports.updateEvent = [exports.verifyAdmin, async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }
        res.status(200).json({ success: true, data: updatedEvent });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
}];

// Delete an event (Admin only)
exports.deleteEvent = [exports.verifyAdmin, async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }
        res.status(200).json({ success: true, msg: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
}];