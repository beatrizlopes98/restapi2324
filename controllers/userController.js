const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const Alumni = require("../models/alumniModel");



exports.register = async (req, res) => {
    try {
        if (!req.body || !req.body.username || !req.body.password || !req.body.type || !req.body.email)
            return res.status(400).json({ success: false, msg: "Username, password, type, and email are mandatory" });

        let user = await User.findOne({ email: req.body.email });
        if (user)
            return res.status(409).json({ success: false, msg: "User already exists." });

        user = await User.create({
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10),
            type: req.body.type,
        });

        // Automatically create alumni profile if user type is 'alumni'
        if (req.body.type === 'alumni') {
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

        return res.status(201).json({ success: true, msg: "User was registered successfully!" });

    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Some error occurred while signing up."
        });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ success: false, msg: "Must provide email and password." });

        let user = await User.findOne({ email });
        if (!user)
            return res.status(404).json({ success: false, msg: "User not found." });

        const check = await bcrypt.compare(password, user.password);
        if (!check) {
            return res.status(401).json({ success: false, accessToken: null, msg: "Invalid credentials!" });
        }

        const token = jwt.sign({ id: user._id.toString(), type: user.type }, process.env.SECRET, { expiresIn: '24h' });

        return res.status(200).json({ success: true, accessToken: token, type: user.type });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, msg: "Some error occurred at login." });
    }
};

exports.verifyToken = (req, res, next) => {
    const header = req.headers.authorization;
    console.log(header);

    if (!header) {
        return res.status(401).json({ success: false, msg: "No token provided!" });
    }

    let token;
    const bearer = header.split(' ');
    token = (bearer.length === 2) ? bearer[1] : header;

    try {
        const decoded = jwt.verify(token, process.env.SECRET);
        req.loggedUserId = decoded.id;
        req.loggedUserType = decoded.type;
        next();

    } catch (err) {
        console.error(err);
        if (err.name === 'TokenExpiredError')
            return res.status(401).json({ success: false, msg: "Whoops, your token has expired! Please login again." });
        if (err.name === 'JsonWebTokenError')
            return res.status(401).json({ success: false, msg: "Malformed JWT" });

        return res.status(401).json({ success: false, msg: "Unauthorized!" });
    }
};
