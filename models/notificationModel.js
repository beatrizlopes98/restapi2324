const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'Alumni', required: true },
    type: { type: String, enum: ['follow', 'post', 'comment', 'like'], required: true },
    postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    read: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;

