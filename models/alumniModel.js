const mongoose = require('mongoose');

const likesSchema = new mongoose.Schema({
    like_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    like_type: { type: String, enum: ['Post', 'Event'], required: true }
});

const alumniSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gender: {
        type: String,
        enum: ['feminine', 'masculine', 'other', ''],
        required: false
    },
    cargo: {
        type: String,
        required: false
    },
    competencias: {
        type: [String],
        required: false
    },
    percurso: {
        type: [{
            company: String,
            startYear: Number,
            endYear: Number
        }],
        required: false
    },
    sobre: {
        type: String,
        required: false
    },
    localizacao: {
        cidade: {
            type: String,
            required: false
        },
        pais: {
            type: String,
            required: false
        }
    },
    info_contactos: {
        telefone: {
            type: String,
            required: false
        },
        linkedin: {
            type: String,
            required: false
        }
    },
    recomendacoes: {
        type: [String],
        required: false
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: false
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: false
    },
    notificacoes: {
        type: [String],
        required: false
    },
    pontos_xp: {
        type: Number,
        required: false
    },
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post'
    }],
    likes: [likesSchema],  // Changed from liked_events to liked_items
    applied_events: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event'
    }]
});

const Alumni = mongoose.model('Alumni', alumniSchema);

module.exports = Alumni;


