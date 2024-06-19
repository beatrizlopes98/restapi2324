const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 10; // Default limit to 10 if not provided
        const skip = (page - 1) * limit;

        // Build filter object based on query parameters
        const filter = { recipient: req.userId, read: false }; // Default filter for unread notifications
        if (req.query.type) {
            filter.type = req.query.type;
        }

        // Query notifications with pagination and filters
        const notifications = await Notification.find(filter)
                                               .skip(skip)
                                               .limit(limit)
                                               .select('type read');

        // Count total number of notifications (for pagination metadata)
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
