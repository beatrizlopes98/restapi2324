const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const skip = (page - 1) * limit;

        const filter = { recipient: req.userId, read: false }; 
        if (req.query.type) {
            filter.type = req.query.type;
        }

        const notifications = await Notification.find(filter)
                                               .skip(skip)
                                               .limit(limit)
                                               .select('type read');


        const totalCount = await Notification.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: notifications,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalCount / limit),
                totalItems: totalCount
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};


exports.markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) {
            return res.status(404).json({ success: false, msg: 'Notification not found' });
        }

        if (notification.recipient.toString() !== req.userId) {
            return res.status(403).json({ success: false, msg: 'Unauthorized' });
        }

        notification.read = true;
        await notification.save();

        res.status(200).json({ success: true, msg: "Notification seen" });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};
