const SMTPServer = require("smtp-server").SMTPServer;
const UserModel = require('./models/user.model');
const EmailModel = require('./models/email.model');
const simpleParser = require('mailparser').simpleParser;
const connectMongoDb = require('./services/mongodb.connect');
const dkim = require('dkim');
const spfCheck = require('spf-check');

const server = new SMTPServer({
    allowInsecureAuth: true,
    authOptional: true,
    onConnect(session, callback) {
        console.log("Connected with s id: " + session.id);
        return callback();
    },
    onMailFrom(address, session, callback) {
        console.log("Mail from: " + address.address);
        return callback();
    },
    onRcptTo: async function (address, session, callback) {
        const email = address.address;
        console.log('recptttt:' + email)
        try {
            const user = await UserModel.findOne({ email: email }).exec();
            if (!user) {
                const error = new Error("Email doesn't exist in the server: " + email);
                error.responseCode = 550;
                return callback(error);
            }
            console.log("Sent to address: " + email);
            return callback();
        } catch (err) {
            console.error("Error finding user:", err);
            return callback(err);
        }
    },
    onData: async function (stream, session, callback) {
        let message = "";

        async function processData() {
            try {
                stream.on("data", (data) => {
                    console.log('data incoming: '+ data.toString())
                    message += data.toString();
                });

                stream.on("end", async () => {
                    try {
                        const parsedEmail = await simpleParser(message);
                        
                        // DKIM verification
                        const dkimResult = await dkim.verify(parsedEmail.raw);

                        // SPF verification
                        const spfResult = await spfCheck.check(parsedEmail.headers.get('Received-SPF'));

                        // If DKIM and SPF checks pass, save the email
                        if (dkimResult && spfResult) {
                            const emailData = {
                                recipient: parsedEmail.to.text,
                                sender: parsedEmail.from.text,
                                subject: parsedEmail.subject,
                                html: parsedEmail.html,
                                content: parsedEmail.text
                            };
                            await EmailModel.create(emailData);
                            console.log("Email saved in the database");
                        } else {
                            console.error("DKIM or SPF check failed for the email");
                        }

                        callback(); 
                    } catch (err) {
                        console.error("Error parsing or saving email:", err);
                        callback(err); 
                    }
                });
            } catch (err) {
                console.error("Error processing email data:", err);
                callback(err); 
            }
        }

        await processData();
    }
});

(async () => {
    try {
        await connectMongoDb();
        server.listen(25, () => {
            console.log("smtp server is up on port 25");
        });
    } catch (error) {
        console.error("Error connecting to the database:", error);
    }
})();
