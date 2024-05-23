const Alumni = require('../models/alumniModel');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const Post= require('../models/postModel');
const Event = require('../models/eventModel');

// Get all alumni (public)
exports.getAllAlumni = async (req, res) => {
    try {
        const alumni = await Alumni.find().populate('user_id', 'username email profilePicture');
        const response = alumni.map(alumnus => ({
            username: alumnus.user_id.username,
            email: alumnus.user_id.email,
            profilePicture: alumnus.user_id.profilePicture
        }));

        res.status(200).json({ success: true, data: response });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "An error occurred while fetching alumni." });
    }
};

// Get alumni by ID
exports.getAlumniById = async (req, res) => {
    try {
        console.log('Alumni ID:', req.params.id); // Log the ID
        const alumni = await Alumni.findById(req.params.id).populate('user_id', 'username email');
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }
        res.status(200).json({ success: true, data: alumni });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};
// Update alumni by ID
exports.updateAlumniById = async (req, res) => {
    try {
        const alumniId = req.params.id;
        const { username, email, password, ...alumniData } = req.body;

        // Find the alumni by ID
        let alumni = await Alumni.findById(alumniId);
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        // Check if the logged-in user is the alumni or an admin
        if (!(req.userId === alumni.user_id.toString() || req.isAdmin)) {
            return res.status(403).json({ success: false, msg: 'Unauthorized' });
        }

        // Update alumni data
        alumni = await Alumni.findByIdAndUpdate(alumniId, alumniData, { new: true, runValidators: true });

        // Update user data if provided
        if (username || email || password) {
            let user = await User.findById(alumni.user_id);
            if (!user) {
                return res.status(404).json({ success: false, msg: 'User not found' });
            }

            // Update fields if they are provided in the request body
            if (username) user.username = username;
            if (email) user.email = email;
            if (password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(password, salt);
            }

            await user.save();
        }

        res.status(200).json({ success: true, data: { alumni, user: alumni.user_id ? await User.findById(alumni.user_id) : null } });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Delete alumni by ID
exports.deleteAlumniById = async (req, res) => {
    try {
        const alumniId = req.params.id;

        // Find the alumni by ID
        let alumni = await Alumni.findById(alumniId);
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        // Check if the logged-in user is the alumni or an admin
        if (!(req.userId === alumni.user_id.toString() || req.isAdmin)) {
            return res.status(403).json({ success: false, msg: 'Unauthorized' });
        }

        // Delete related data in posts
        await Post.deleteMany({ user_id: alumni.user_id });

        // Delete related data in events
        await Event.updateMany({}, { $pull: { likes: alumni._id } });

        // Delete the alumni
        const deletedAlumni = await Alumni.findByIdAndDelete(alumniId);
        if (!deletedAlumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }

        res.status(200).json({ success: true, msg: 'Alumni deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};