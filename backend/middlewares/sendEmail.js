const nodeMailer = require('nodemailer');

exports.sendEmail = async(options) => {
    const transporter = nodeMailer.createTransport({
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
            user: "d2f1a2383475e2",
            pass: "********8596"
        }
    })

    const mailOptions = {
        from: 'from',
        to: 'to',
        subject: options.subject,
        text: options.message
    }

    await transporter.sendMail(mailOptions);
}