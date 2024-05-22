const Event = require('../models/eventModel');

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
exports.createEvent = async (req, res) => {
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
};

// Update event by ID (Admin only)
exports.updateEventById = async (req, res) => {
    try {
        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }
        res.status(200).json({ success: true, data: updatedEvent });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Delete event by ID (Admin only)
exports.deleteEventById = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }
        res.status(200).json({ success: true, msg: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};