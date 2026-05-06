const userModel = require("./../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");


/**
 * - Controller for user registration
 * - POST /api/auth/register
 */
async function userRegisterController(req, res) {

    const {email, name, password} = req.body;
    const isExists = await userModel.findOne({
        email: email
    })

    if(isExists) {
        return res.status(422).json({
            message: "Email already exists, please use a different email address",
            status: "fail"
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    })

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {expiresIn: "3d"})
    res.cookie("token", token)

    res.status(201).json({
        message: "User registered successfully",
        status: "success",
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })

    await emailService.sendRegistrationEmail(user.email, user.name);

}


/**
 * - User login controller
 * - POST /api/auth/login
 */
async function userLoginController(req, res) {
    const {email, password} = req.body;

    const user = await userModel.findOne({email}).select("+password")

    if(!user) {
        return res.status(401).json({
            message: "Invalid email or password",
            status: "fail"
        })
    }

    const isValidPassword = await user.comparePassword(password)
    if(!isValidPassword) {
        return res.status(401).json({
            message: "Invalid email or password",
            status: "fail"
        })
    }

    const token = jwt.sign({ userId: user._id}, process.env.JWT_SECRET, {expiresIn: "3d"})
    res.cookie("token", token)

    res.status(200).json({
        message: "User logged in successfully",
        status: "success",
        user: {
            _id: user._id,
            email: user.email,
            name: user.name
        },
        token
    })
}



module.exports = {
    userRegisterController,
    userLoginController
}