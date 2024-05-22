const Alumni = require('../models/alumniModel');
const User = require('../models/userModel');

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
        const updatedAlumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('user_id', 'username email profilePicture');
        if (!updatedAlumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }
        res.status(200).json({ success: true, data: updatedAlumni });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Delete alumni by ID
exports.deleteAlumniById = async (req, res) => {
    try {
        const deletedAlumni = await Alumni.findByIdAndDelete(req.params.id);
        if (!deletedAlumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found' });
        }
        res.status(200).json({ success: true, msg: 'Alumni deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};