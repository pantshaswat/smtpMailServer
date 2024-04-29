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
        callback();
    },
    onMailFrom(address, session, callback) {
        console.log("Mail from: " + address.address);
  callback();
    },
    onRcptTo:  async function (address, session, callback) {
        const email = address.address;
        console.log('recptttt:' + email)
       
      
        try {
            const user = await UserModel.findOne({ email: email }).exec();
            if (!user) {
                const error = new Error("Email doesn't exist in the server: " + email);
                error.responseCode = 550;
               callback(error);
            }
            console.log("Sent to address: " + email);
            callback();
        } catch (err) {
            console.error("Error finding user:", err);
             callback(err);
        }
    },
    onData(stream, session, callback) {
        stream.pipe(process.stdout); // print message to console
        stream.on("end", callback);
      },
    onData: async function (stream, session, callback) {
        let message = "";
        console.log('data aayo')
        stream.pipe(process.stdout);
        async function processData() {
            try {
                stream.on("data", (data) => {
                    
                    message += data.toString();
                });

                stream.on("end", async () => {
                    try {
                        const parsedEmail = await simpleParser(message);
                        
                        // DKIM verification
                        // const dkimResult = await dkim.verify(parsedEmail.raw);

                        // SPF verification
                        // const spfResult = await spfCheck.check(parsedEmail.headers.get('Received-SPF'));

                        // If DKIM and SPF checks pass, save the email
                        // if (dkimResult && spfResult) {
                            
                           try {
                            const recipientEmail = session.envelope.rcptTo[0].address;
                            const user = await UserModel.findOne({ email: recipientEmail }).exec();
            if (!user) {
                // If the user is not found, handle the error
                const error = new Error("User not found for recipient email: " + recipientEmail);
                error.responseCode = 550;
                callback(error)
            }
                            const emailData = {
                                recipient: user._id,
                                sender: session.envelope.mailFrom.address,
                                subject: parsedEmail.subject,
                                html: parsedEmail.html,
                                content: parsedEmail.text
                            };
                            await EmailModel.create(emailData);
                            console.log("Email saved in the database");}
                            catch(err){
                                const error = new Error("invaild email");
                                error.responseCode = 550;
                                callback(error);
                            }
                        // } else {
                        //     console.error("DKIM or SPF check failed for the email");
                        // }

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
