const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        validate: {
            validator: function(v) {
                return /^[A-Za-z]+$/.test(v); // Regular expression to match alphabetic characters only
            },
            message: props => `${props.value} is not a valid username! Only alphabetic characters are allowed.`
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Invalid email format']
    },
    type: {
        type: String,
        enum: ['admin', 'alumni'],
        required: true
    },
    profilePicture: {
        type: String,
        required: false, // Assuming this is optional and can be filled later
    }
}, {
    collection: 'user'
});

const User = mongoose.model('User', userSchema);

module.exports = User;
