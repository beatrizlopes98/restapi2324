const Alumni = require('../models/alumniModel');

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
            { $group: { _id: "$localizacao.pais", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, data: locationStats });
    } catch (err) {
        handleErrors(res, err);
    }
};

exports.getEmploymentStatistics = async (req, res) => {
    try {
        const currentYear = new Date().getFullYear();
        const employmentStats = await Alumni.aggregate([
            { $unwind: "$percurso" },
            {
                $group: {
                    _id: {
                        isEmployed: {
                            $cond: [{ $or: [{ $eq: ["$percurso.endYear", ""] }, { $gt: ["$percurso.endYear", currentYear] }] }, true, false]
                        }
                    },
                    count: { $sum: 1 }
                }
            }
        ]);
        res.status(200).json({ success: true, data: employmentStats });
    } catch (err) {
        handleErrors(res, err);
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
