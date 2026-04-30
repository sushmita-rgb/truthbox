const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function testEmail() {
    console.log(`Testing email for: ${process.env.EMAIL_USER}...`);
    try {
        await transporter.verify();
        console.log("✅ SMTP Connection Verified");

        const info = await transporter.sendMail({
            from: `"Verit Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Diagnostic Test",
            text: "If you are reading this, your Nodemailer is working perfectly!"
        });

        console.log("✅ Email Sent Successfully!");
        console.log("Message ID:", info.messageId);
        process.exit(0);
    } catch (err) {
        console.error("❌ Mailer Error Details:", err);
        process.exit(1);
    }
}

testEmail();
