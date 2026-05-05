const mongoose = require('mongoose');



function connectDB() {
    const uri = process.env.MONGODB_URI;
    mongoose.connect(uri).then(() => {
        console.log("server is connected to DB");
    })
    .catch((err) => {
        console.error("Error connecting to DB:", err);
        process.exit(1); // Exit the process with an error code
    });
}


module.exports = connectDB;