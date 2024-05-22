const Alumni = require('../models/alumniModel');
const User = require('../models/userModel');

// Get all alumni (public)
exports.getAllAlumni = async (req, res) => {
    try {
        // Find all alumni users and populate only necessary fields
        const alumni = await Alumni.find().populate('user_id', 'username email profilePicture');
        
        // Map the response to include only necessary fields
        const response = alumni.map(alumni => ({
            username: alumni.user_id.username,
            email: alumni.user_id.email,
            profilePicture: alumni.user_id.profilePicture // Adjust according to your actual field name
        }));

        res.status(200).json({ success: true, data: response });
    } catch (err) {
        console.error(err); // Debugging: Log the error
        res.status(500).json({ success: false, msg: err.message || "An error occurred while fetching alumni." });
    }
};

// Get alumni by id (auth)
exports.getAlumniById = async (req, res) => {
    try {
        const alumni = await Alumni.findById(req.params.id).populate('user_id', 'username email');
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found.' });
        }
        res.status(200).json({ success: true, data: alumni });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "An error occurred while fetching the alumni profile." });
    }
};

// Update alumni by id (auth)
exports.updateAlumniById = async (req, res) => {
    try {
        const alumni = await Alumni.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found.' });
        }
        res.status(200).json({ success: true, msg: 'Alumni profile updated successfully!', data: alumni });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "An error occurred while updating the alumni profile." });
    }
};

// Delete alumni by id (auth)
exports.deleteAlumniById = async (req, res) => {
    try {
        const alumni = await Alumni.findByIdAndDelete(req.params.id);
        if (!alumni) {
            return res.status(404).json({ success: false, msg: 'Alumni not found.' });
        }
        res.status(200).json({ success: true, msg: 'Alumni profile deleted successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "An error occurred while deleting the alumni profile." });
    }
};

