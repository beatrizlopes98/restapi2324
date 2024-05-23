const { application } = require('express');
const mongoose = require('mongoose');

const likeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    datetime: { type: Date, default: Date.now, required: true }
});

const eventSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    datetime: { type: Date, default: Date.now, required: true },
    location: { type: String, required: true },
    date: { type: String, required: true }, // or Date type if needed
    time: { type: String, required: true },  // or Time type if needed
    likes: [likeSchema],
    applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Alumni' }]
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;

