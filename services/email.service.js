const nodemailer = require('nodemailer');
const dkim = require('nodemailer-dkim');

async function sendEmailWithDKIM(from, to, subject, text, domain, dkimPrivateKey, dkimSelector) {
    let transporter = nodemailer.createTransport({
        host: 'your-smtp-host',
        port: 587,
        secure: false, // Use TLS
        auth: {
            user: 'your-smtp-username',
            pass: 'your-smtp-password'
        }
    });

    transporter.use('stream', dkim.signer({
        domainName: domain,
        keySelector: dkimSelector,
        privateKey: dkimPrivateKey
    }));

    let mailOptions = {
        from: from,
        to: to,
        subject: subject,
        text: text
    };

    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}

module.exports = { sendEmailWithDKIM };
