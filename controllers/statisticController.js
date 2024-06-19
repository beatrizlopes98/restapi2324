const Alumni = require('../models/alumniModel');

// Helper function to handle common errors
const handleErrors = (res, error) => {
    console.error(error);
    res.status(500).json({ success: false, msg: error.message });
};

exports.getGenderStatistics = async (req, res) => {
    try {
        const genderStats = await Alumni.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, data: genderStats });
    } catch (err) {
        handleErrors(res, err);
    }
};


exports.getLocationStatistics = async (req, res) => {
    try {
        const locationStats = await Alumni.aggregate([
            { $group: { _id: "$localizacao.cidade", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, data: locationStats });
    } catch (err) {
        handleErrors(res, err);
    }
};

exports.getEmploymentStatistics = async (req, res) => {
    try {
        const alumni = await Alumni.find({}, 'percurso');

        let currentlyEmployed = 0;
        let notEmployed = 0;

        alumni.forEach(alumnus => {
            const isEmployed = alumnus.percurso.some(percurso => !percurso.endYear);
            if (isEmployed) {
                currentlyEmployed++;
            } else {
                notEmployed++;
            }
        });

        res.status(200).json({
            success: true,
            data: {
                currentlyEmployed,
                notEmployed
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


exports.getRoleStatistics = async (req, res) => {
    try {
        const roleStats = await Alumni.aggregate([
            { $group: { _id: "$cargo", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, data: roleStats });
    } catch (err) {
        handleErrors(res, err);
    }
};

