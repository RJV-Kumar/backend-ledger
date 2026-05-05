const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Email is required for creating an account"],
        unique: [true, "Email already exists, please use a different email address"],
        match: [/\S+@\S+\.\S+/, "Please provide a valid email address"],
        trim: true,
        lowercase: true,
    },
    name: {
        type: String,
        required: [true, "Name is required for creating an account"],
        trim: true
    },
    password: {
        type: String,
        required: [true, "Password is required for creating an account"],
        minlength: [6, "Password must be at least 6 characters long"],
        select: false
    }
}, {
    timestamps:true
})


userSchema.pre("save", async function(next) {
    if(!this.isModified("password")) {
        return next();
    }

    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
    return next();
})

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
}

const userModel = monogoose.model("User", userSchema);
module.exports = userModel;