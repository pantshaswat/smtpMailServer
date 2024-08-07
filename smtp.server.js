const SMTPServer = require("smtp-server").SMTPServer;
const { simpleParser } = require('mailparser');
const UserModel = require('./models/user.model');
const DomainModel = require('./models/domain.model');
const EmailModel = require('./models/email.model');
const connectMongoDb = require('./services/mongodb.connect');

const server = new SMTPServer({
    allowInsecureAuth: true,
    authOptional: true,
    onConnect(session, callback) {
        console.log("Connected with session id: " + session.id);
        callback();
    },
    onAuth: async (auth, session, callback) => {
        try {
            const user = await UserModel.findOne({ apiKey: auth.username }).exec();
            if (user && user.apiSecret === auth.password) {
                callback(null, { user: user._id });
            } else {
                callback(new Error("Authentication failed"));
            }
        } catch (err) {
            callback(err);
        }
    },
    onMailFrom: async (address, session, callback) => {
        try {
            const domain = address.address.split('@')[1];
            const domainDoc = await DomainModel.findOne({ name: domain, user: session.user }).exec();
            if (!domainDoc) {
                return callback(new Error("Domain not verified for this user"));
            }
            callback();
        } catch (err) {
            callback(err);
        }
    },
    onRcptTo: async (address, session, callback) => {
        const email = address.address;
        try {
            const user = await UserModel.findOne({ email: email }).exec();
            if (!user) {
                const error = new Error("Email doesn't exist in the server: " + email);
                error.responseCode = 550;
                return callback(error);
            }
            callback();
        } catch (err) {
            callback(err);
        }
    },
    onData: async (stream, session, callback) => {
        let message = "";
        stream.on("data", (data) => {
            message += data.toString();
        });
        stream.on("end", async () => {
            try {
                const parsedEmail = await simpleParser(message);
                const recipientEmail = session.envelope.rcptTo[0].address;
                const user = await UserModel.findOne({ email: recipientEmail }).exec();
                if (!user) {
                    const error = new Error("User not found for recipient email: " + recipientEmail);
                    error.responseCode = 550;
                    return callback(error);
                }
                const emailData = {
                    recipient: user._id,
                    sender: session.envelope.mailFrom.address,
                    subject: parsedEmail.subject,
                    html: parsedEmail.html,
                    content: parsedEmail.text
                };
                await EmailModel.create(emailData);
                callback();
            } catch (err) {
                callback(err);
            }
        });
    }
});

(async () => {
    try {
        await connectMongoDb();
        server.listen(25, () => {
            console.log("SMTP server is up on port 25");
        });
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})();
