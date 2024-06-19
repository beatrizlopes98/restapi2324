const Notification = require('../models/notificationModel');

exports.getNotifications = async (req, res) => {
    try {
        console.log(`Fetching notifications for user: ${req.userId}`);
        // Use select to only fetch the type and read fields
        const notifications = await Notification.find({ recipient: req.userId, read: false }).select('type read');

        res.status(200).json({ success: true, data: notifications });
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
