const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    gender: {
        type: String,
        required: false // Initially optional
    },
    cargo: {
        type: String,
        required: false // Initially optional
    },
    competencias: {
        type: [String],
        required: false // Initially optional
    },
    percurso: {
        type: [{
            company: String,
            startYear: Number,
            endYear: Number
        }],
        required: false // Initially optional
    },
    sobre: {
        type: String,
        required: false // Initially optional
    },
    localizacao: {
        cidade: {
            type: String,
            required: false // Initially optional
        },
        pais: {
            type: String,
            required: false // Initially optional
        }
    },
    info_contactos: {
        telefone: {
            type: String,
            required: false // Initially optional
        },
        linkedin: {
            type: String,
            required: false // Initially optional
        }
    },
    recomendacoes: {
        type: [String],
        required: false // Initially optional
    },
    followers: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: false // Initially optional
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'User',
        required: false // Initially optional
    },
    notificacoes: {
        type: [String],
        required: false // Initially optional
    },
    pontos_xp: {
        type: Number,
        required: false // Initially optional
    },
    posts: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Post',
        required: false // Initially optional
    }
});

const Alumni = mongoose.model('Alumni', alumniSchema);

module.exports = Alumni;


