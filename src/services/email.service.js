const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN
    },
});

//verify connection configuration
transporter.verify((error, success) => {
    if (error) {
        console.log("Error connecting to email service: ", error);
    } else {
        console.log("Email service is ready to send messages");
    }
});


//function to send email
const sendEmail = async (to, subject, text, html) => {
    try{
        const info = await transporter.sendMail({
            from: `"RK Test Project - Backend_Ledger" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });

        console.log("Email sent: %s", info.messageId);
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email: ", error);
    }
};

async function sendRegistrationEmail(userEmail, name) {
    const subject = "Welcome to RK Test Project - Backend_Ledger";
    const text = `Hi ${name},\n\nThank you for registering at RK Test Project - Backend_Ledger. 
    We're excited to have you on board!\n\nBest regards,\nRK Test Project Team`;
    const html = `<p>Hi ${name},</p><p>Thank you for registering at <strong>RK Test Project - Backend_Ledger</strong>. 
    We're excited to have you on board!</p><p>Best regards,<br/>RK Test Project Team</p>`;
    
    await sendEmail(userEmail, subject, text, html);
}

module.exports = { sendRegistrationEmail };