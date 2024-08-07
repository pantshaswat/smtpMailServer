'use strict';

/*
 * require installation of smtp-connection and its dependancies:
 * # npm install nodemailer-direct-transport nodemailer-smtp-transport nodemailer-smtp-pool smtp-connection
 */
var SMTPConnection = require('smtp-connection');

var connectionConfig = {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    requireTLS: true,

    
    //debug: true,
    
    name: 'mylocalcomputer.provider.com' // local connection address (for EHLO message)
};

var connectionAuth = {
	user: 'pantshaswat@gmail.com',
	pass: 'your pass'
};

var sender = {
	name: 'Shaswat Pant', // please use [a-zA-Z0-9.- ]
	email: 'pantshaswat@gmail.com'
};

var recipient = {
	name: 'Shaswat Pant', // please use [a-zA-Z0-9.- ]
	email: 'pantshaswat61@gmail.com'
};

// below you don't have to configure anything

var now = new Date();
var testMsg = 'From: '+sender.name+' <'+sender.email+'>\r\n'
	+ 'To: '+recipient.name+' <'+recipient.email+'>\r\n'
	+ 'Subject: Test message on '+now+'\r\n'
	+ '\r\n'
	+'This is a test message\n\n'
	

var connection = new SMTPConnection(connectionConfig);

connection.connect(function() {
    console.log('Connected');
    
    connection.login(connectionAuth, function(err) {
        if (err) {
            console.log('Authentication failed:', err);
            return;
        }
        
        connection.send({
            from: sender.email,
            to: recipient.email
        }, testMsg, function(err) {
            if (err) {
                console.log('Failed to send email:', err);
            } else {
                console.log('Message sent');
            }
            connection.quit();
        });
    });
});

// works only if connectionConfig.debug === true
connection.on('log', function(data) {
	console.dir(data);
});

connection.on('error', function(err) {
	console.log('Error occurred: '+err);
});
