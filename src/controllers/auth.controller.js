const userModel = require("./../models/user.model");

/**
 * - @desc Controller for user registration
 * - @route POST /api/auth/register
 */
function userRegisterController(req, res) {

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

}



module.exports = {
    userRegisterController
}