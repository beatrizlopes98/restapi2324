const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Alumni = require("../models/alumniModel");
const {verifyToken} = require("../middlewares/authMiddleware");



exports.register = async (req, res) => {
    try {
        const { username, password, type, email } = req.body;
        
        if (!username || !password || !type || !email) {
            return res.status(400).json({ 
                success: false, 
                msg: "Username, password, type, and email are mandatory" 
            });
        }

        let user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ 
                success: false, 
                msg: "User already exists." 
            });
        }

        user = new User({
            username,
            email,
            password: bcrypt.hashSync(password, 10),
            type,
        });
        await user.save();


        if (type === 'alumni') {
            await Alumni.create({
                user_id: user._id,
                gender: '',
                cargo: '',
                competencias: [],
                percurso: [],
                sobre: '',
                localizacao: { cidade: '', pais: '' },
                info_contactos: { telefone: '', linkedin: '' },
                recomendacoes: [],
                followers: [],
                friends: [],
                notificacoes: [],
                pontos_xp: 0,
                posts: []
            });
        }

        return res.status(201).json({ 
            success: true, 
            msg: "User was registered successfully!" 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false, 
            msg: err.message || "Some error occurred while signing up."
        });
    }
};


exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                msg: "Must provide email and password." 
            });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                msg: "User not found." 
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ 
                success: false, 
                accessToken: null, 
                msg: "Invalid credentials!" 
            });
        }

        const token = jwt.sign(
            { id: user._id.toString(), type: user.type }, 
            process.env.SECRET, 
            { expiresIn: '24h' }
        );

        return res.status(200).json({ 
            success: true, 
            accessToken: token, 
            type: user.type 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            success: false, 
            msg: "Some error occurred at login." 
        });
    }
};

