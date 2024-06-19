const Event = require('../models/eventModel');
const Alumni = require('../models/alumniModel');


const validateDate = (date) => {
    const parsedDate = new Date(date);
    const currentDate = new Date();
    // Check if the parsed date is valid and in the future
    return !isNaN(parsedDate) && parsedDate >= currentDate.setHours(0, 0, 0, 0);
};

// Function to validate time format (HH:mm)
const validateTime = (time) => {
    const timePattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
    return timePattern.test(time);
};

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();
        res.status(200).json({ success: true, data: events });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


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


exports.createEvent = async (req, res) => {
    try {
        const { name, description, datetime, location, date, time } = req.body;

        // Validate date and time
        if (!validateDate(date)) {
            return res.status(400).json({ success: false, msg: 'Invalid date format or date is in the past. Please use YYYY-MM-DD format and ensure the date is in the future.' });
        }
        if (!validateTime(time)) {
            return res.status(400).json({ success: false, msg: 'Invalid time format. Please use HH:mm format.' });
        }

        const newEvent = new Event({
            name,
            description,
            datetime,
            location,
            date,
            time
        });
        const savedEvent = await newEvent.save();
        res.status(201).json({ success: true, data: savedEvent._id, msg: "Event created successfully." });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


exports.updateEventById = async (req, res) => {
    try {
        const { date, time, likes, ...updatedFields } = req.body; // Exclude likes from updatedFields

        // Validate date if provided
        if (date && !validateDate(date)) {
            return res.status(400).json({ success: false, msg: 'Invalid date format or date is in the past. Please use YYYY-MM-DD format and ensure the date is in the future.' });
        }

        // Validate time if provided
        if (time && !validateTime(time)) {
            return res.status(400).json({ success: false, msg: 'Invalid time format. Please use HH:mm format.' });
        }

        const updatedEvent = await Event.findByIdAndUpdate(req.params.id, updatedFields, { new: true });
        if (!updatedEvent) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }
        res.status(200).json({ success: true, msg: "Event updated successfully" });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

exports.deleteEventById = async (req, res) => {
    try {
        const deletedEvent = await Event.findByIdAndDelete(req.params.id);
        if (!deletedEvent) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }

        // Remove the event ID from all Alumni documents' likes and applied_events arrays
        await Alumni.updateMany(
            {},
            {
                $pull: {
                    likes: { like_id: deletedEvent._id, like_type: 'Event' },
                    applied_events: deletedEvent._id
                }
            }
        );

        res.status(200).json({ success: true, msg: 'Event deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


exports.likeEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }

        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        // Check if the alumni already liked the event
        const existingLike = alumni.likes.find(like => like.like_id.equals(event._id));
        if (existingLike) {
            return res.status(400).json({ success: false, msg: 'You have already liked this event' });
        }

        // Add the like to the alumni
        alumni.likes.push({ like_type: 'Event', like_id: event._id });
        // Save the alumni
        alumni.pontos_xp += 2;
        await alumni.save();

        // Update the event's likes
        event.likes.push({ user_id: alumni._id });
        // Save the event
        await event.save();

        res.status(200).json({ success: true, msg: "Event liked successfully" });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


exports.applyForEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }

        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        // Ensure the applications array is initialized
        if (!Array.isArray(event.applications)) {
            event.applications = [];
        }

        // Check if the alumni has already applied for the event
        if (event.applications.some(applicantId => applicantId.equals(alumni._id))) {
            return res.status(400).json({ success: false, msg: 'You have already applied for this event' });
        }

        // Add the alumni's ID to the event's applications array
        event.applications.push(alumni._id);

        // Add the event's ID to the alumni's applied_events array
        alumni.applied_events.push(event._id);

        alumni.pontos_xp += 15;
        // Save both the event and alumni documents
        await Promise.all([event.save(), alumni.save()]);

        res.status(200).json({ success: true, msg:"Event applied successfully" });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

exports.deleteLikeEvent = async (req, res) => {
    try {
        // Find the event by ID
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, msg: 'Event not found' });
        }

        // Find the alumni by user ID
        const alumni = await Alumni.findOne({ user_id: req.userId });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        // Check if the alumni has liked the event
        const likeIndex = alumni.likes.findIndex(like => like.like_id.equals(event._id));
        if (likeIndex === -1) {
            return res.status(400).json({ success: false, msg: 'You have not liked this event' });
        }

        // Remove the like from the alumni's likes array
        alumni.likes.splice(likeIndex, 1);
        await alumni.save();

        // Remove the like from the event's likes array
        event.likes = event.likes.filter(like => !like.user_id.equals(alumni._id));
        await event.save();

        res.status(200).json({ success: true, msg: 'Like removed successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};



