const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    datetime: { type: Date, default: Date.now, required: true }
});

const likeSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    datetime: { type: Date, default: Date.now, required: true }
});

const postSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    image: { type: String, required: false },
    datetime: { type: Date, default: Date.now, required: true },
    comments: [commentSchema],
    likes: [likeSchema]
});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;
