const Report = require('../models/reportModel');
const Post = require('../models/postModel');

// Create a report
exports.createReport = async (req, res) => {
    try {
        const { itemType, itemId, reason } = req.body;
        const reporterId = req.userId; // Extract reporter's ID from the token

        // Validate request payload
        if (!itemType || !itemId || !reason) {
            return res.status(400).json({ success: false, msg: 'Item type, item ID, and reason are required' });
        }

        // Create the report object
        const report = new Report({
            reportedItem: {
                itemType,
                itemId
            },
            reason,
            reporter: reporterId // Include reporter's ID in the report
        });

        // Save the report to the database
        const savedReport = await report.save();

        res.status(201).json({ success: true, data: savedReport });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Get all reports (Admin only)
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find().populate('reporter', 'username email');
        res.status(200).json({ success: true, data: reports });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};

// Update report and manage reported item (Admin only)
exports.updateReport = async (req, res) => {
    try {
        const { status, action, content } = req.body;

        // Find the report by ID
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, msg: 'Report not found' });
        }

        // Update the report status if provided
        if (status && ['Pending', 'Reviewed'].includes(status)) {
            report.status = status;
        }

        // Handle actions on the reported item
        let updatedItem;
        if (action) {
            switch (action) {
                case 'update':
                    if (!content) {
                        return res.status(400).json({ success: false, msg: 'Content is required to update the item' });
                    }
                    if (report.reportedItem.itemType === 'Post') {
                        updatedItem = await Post.findByIdAndUpdate(report.reportedItem.itemId, { text: content }, { new: true });
                    } else if (report.reportedItem.itemType === 'Comment') {
                        const post = await Post.findOneAndUpdate(
                            { 'comments._id': report.reportedItem.itemId },
                            { $set: { 'comments.$.content': content } },
                            { new: true }
                        );
                        updatedItem = post ? post.comments.id(report.reportedItem.itemId) : null;
                    }
                    break;
                case 'delete':
                    if (report.reportedItem.itemType === 'Post') {
                        updatedItem = await Post.findByIdAndDelete(report.reportedItem.itemId);
                    } else if (report.reportedItem.itemType === 'Comment') {
                        const post = await Post.findOneAndUpdate(
                            { 'comments._id': report.reportedItem.itemId },
                            { $pull: { comments: { _id: report.reportedItem.itemId } } },
                            { new: true }
                        );
                        updatedItem = post ? { deleted: true, postId: post._id, commentId: report.reportedItem.itemId } : null;
                    }
                    // Also delete the report since the item has been deleted
                    await Report.findByIdAndDelete(req.params.id);
                    break;
                default:
                    return res.status(400).json({ success: false, msg: 'Invalid action' });
            }
        }

        // Save the updated report if it hasn't been deleted
        if (report.isNew || report.isModified()) {
            await report.save();
        }

        res.status(200).json({ success: true, data: { report, updatedItem } });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};