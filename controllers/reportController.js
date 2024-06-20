const Report = require('../models/reportModel');
const Post = require('../models/postModel');
const mongoose = require('mongoose');
const Alumni= require('../models/alumniModel');

exports.createReport = async (req, res) => {
    try {
        const { itemType, itemId, reason } = req.body;
        const reporterId = new mongoose.Types.ObjectId(req.userId); // Convert reporterId to ObjectId

        // Validate request payload
        if (!itemType || !itemId || !reason) {
            return res.status(400).json({ success: false, msg: 'Item type, item ID, and reason are required' });
        }

        let authorId;

        if (itemType === 'Post') {
            // Find the post by ID
            const post = await Post.findById(itemId);
            if (!post) {
                return res.status(404).json({ success: false, msg: 'Post not found' });
            }
            authorId = post.user_id;
        } else if (itemType === 'Comment') {
            // Find the post containing the comment
            const post = await Post.findOne({ 'comments._id': itemId });
            if (!post) {
                return res.status(404).json({ success: false, msg: 'Comment not found' });
            }
            // Find the specific comment
            const comment = post.comments.id(itemId);
            if (!comment) {
                return res.status(404).json({ success: false, msg: 'Comment not found' });
            }
            authorId = comment.user_id;
        } else {
            return res.status(400).json({ success: false, msg: 'Invalid item type' });
        }

        // Check if the reporter is the same as the author
        if (reporterId.equals(authorId)) {
            return res.status(400).json({ success: false, msg: 'You cannot report your own post or comment' });
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

exports.getAllReports = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Default to page 1 if not provided
        const limit = parseInt(req.query.limit) || 20; // Default limit to 20 if not provided
        const skip = (page - 1) * limit;

        // Build filter object based on query parameters
        const filter = { status: "Pending" }; // Default filter for pending reports
        if (req.query.type) {
            filter['reportedItem.itemType'] = req.query.type;
        }

        // Query reports with pagination and filters
        const reports = await Report.find(filter)
                                    .skip(skip)
                                    .limit(limit)
                                    .populate('reporter', 'username email');

        // Count total number of reports (for pagination metadata)
        const totalCount = await Report.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: reports,
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

// Update report and manage reported item (Admin only)
exports.updateReport = async (req, res) => {
    try {
        const { status, action, content } = req.body;

        // Find the report by ID
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ success: false, msg: 'Report not found' });
        }

        // Check if the report is already reviewed
        if (report.status === 'Reviewed') {
            return res.status(400).json({ success: false, msg: 'This report has already been reviewed and cannot be modified again.' });
        }

        // Update the report status if provided
        if (status && ['Pending', 'Reviewed'].includes(status)) {
            report.status = status;
        }

        // Handle actions on the reported item
        let updatedItem;
        if (action) {
            switch (action) {
                case 'review':
                    break;
                case 'delete':
                    if (report.reportedItem.itemType === 'Post') {
                        const postToDelete = await Post.findByIdAndDelete(report.reportedItem.itemId);

                        // Also remove the post from alumni's posts array
                        await Alumni.updateMany(
                            { posts: report.reportedItem.itemId },
                            { $pull: { posts: report.reportedItem.itemId } }
                        );

                        updatedItem = postToDelete;
                    } else if (report.reportedItem.itemType === 'Comment') {
                        const post = await Post.findOneAndUpdate(
                            { 'comments._id': report.reportedItem.itemId },
                            { $pull: { comments: { _id: report.reportedItem.itemId } } },
                            { new: true }
                        );

                        // Remove the comment ID from alumni's comments array if such an array exists
                        await Alumni.updateMany(
                            { comments: report.reportedItem.itemId },
                            { $pull: { comments: report.reportedItem.itemId } }
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

        res.status(200).json({ success: true, data: report.status });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message });
    }
};
