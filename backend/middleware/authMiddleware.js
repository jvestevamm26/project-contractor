const jwt = require("jsonwebtoken");


const verifyToken = (token) => {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    return { id: payload.id, role: payload.role };
};


const authenticate = (req, res, next) => {

    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Missing or invalid Authorization header"
        });
    }

    const token = header.slice("Bearer ".length);

    try {
        req.user = verifyToken(token);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }

};


const authorize = (...roles) => (req, res, next) => {

    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            message: "You do not have permission to perform this action"
        });
    }

    next();

};


module.exports = {
    authenticate,
    authorize,
    verifyToken
};
