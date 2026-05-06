const userModel = require('../models/user.model');
const jwt = require('jsonwebtoken');


async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authrization?.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorized, token is missing",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId);
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized, token is invalid",
        })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authrization?.split(" ")[1];

    if(!token) {
        return res.status(401).json({
            message: "Unauthorized, token is missing",
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await userModel.findById(decoded.userId).select("+systemUser");
        if(!user.systemUser) {
            return res.status(403).json({
                message: "Forbidden, only system users can access this route",
            })
        }
        req.user = user;
        return next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized access, token is invalid",
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
};