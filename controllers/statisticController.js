const Alumni = require('../models/alumniModel');

// Helper function to handle common errors
const handleErrors = (res, error) => {
    console.error(error);
    res.status(500).json({ success: false, msg: error.message });
};

exports.getGenderStatistics = async (req, res) => {
    try {
        const totalAlumni = await Alumni.countDocuments();
        const genderStats = await Alumni.aggregate([
            { $group: { _id: "$gender", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, totalAlumni, data: genderStats });
    } catch (err) {
        handleErrors(res, err);
    }
};

exports.getLocationStatistics = async (req, res) => {
    try {
        const { cidade, pais } = req.query;
        const matchCondition = {};

        if (cidade !== undefined) {
            if (cidade) {
                matchCondition["localizacao.cidade"] = cidade;
            } else {
                matchCondition["localizacao.cidade"] = { $exists: true, $ne: null };
            }
        }
        if (pais !== undefined) {
            if (pais) {
                matchCondition["localizacao.pais"] = pais;
            } else {
                matchCondition["localizacao.pais"] = { $exists: true, $ne: null };
            }
        }

        const totalAlumni = await Alumni.countDocuments(matchCondition);
        const locationStats = await Alumni.aggregate([
            { $match: matchCondition },
            { $group: { _id: pais !== undefined ? "$localizacao.pais" : "$localizacao.cidade", count: { $sum: 1 } } }
        ]);

        res.status(200).json({ success: true, totalAlumni, data: locationStats });
    } catch (err) {
        handleErrors(res, err);
    }
};


exports.getEmploymentStatistics = async (req, res) => {
    try {
        const alumni = await Alumni.find({}, 'percurso');
        const totalAlumni = alumni.length;

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
            totalAlumni,
            data: {
                currentlyEmployed,
                notEmployed
            }
        });
    } catch (err) {
        handleErrors(res, err);
    }
};

exports.getRoleStatistics = async (req, res) => {
    try {
        const totalAlumni = await Alumni.countDocuments();
        const roleStats = await Alumni.aggregate([
            { $group: { _id: "$cargo", count: { $sum: 1 } } }
        ]);
        res.status(200).json({ success: true, totalAlumni, data: roleStats });
    } catch (err) {
        handleErrors(res, err);
    }
};

