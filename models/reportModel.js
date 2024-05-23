const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reportedItem: {
        itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
        itemType: { type: String, enum: ['Post', 'Comment'], required: true }
    },
    reason: { type: String, required: true },
    status: { type: String, enum: ['Pending', 'Reviewed'], default: 'Pending', required: true },
    created_at: { type: Date, default: Date.now }
}, {
    collection: 'report'
});

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
