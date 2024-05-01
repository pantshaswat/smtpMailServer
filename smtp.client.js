'use strict';

/*
 * require installation of smtp-connection and its dependancies:
 * # npm install nodemailer-direct-transport nodemailer-smtp-transport nodemailer-smtp-pool smtp-connection
 */
var SMTPConnection = require('smtp-connection');

var connectionConfig = {
    host: 'localhost', // remote SMTP server address
    port: 25,
    ignoreTLS: true,
    secure: false,

    
    //debug: true,
    
    name: 'mylocalcomputer.provider.com' // local connection address (for EHLO message)
};

var connectionAuth = {
	user: 'username',
	pass: 'password'
};

var sender = {
	name: 'shaswat pant', // please use [a-zA-Z0-9.- ]
	email: 'me@sender.com'
};

var recipient = {
	name: 'Test recipient', // please use [a-zA-Z0-9.- ]
	email: 'test@recipient.net'
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
	
	
			connection.send({
				from: sender.email,
				to: recipient.email
			}, testMsg, function(err) {
				console.log('Message sent');
				connection.quit();
			});
		
});

// works only if connectionConfig.debug === true
connection.on('log', function(data) {
	console.dir(data);
});

connection.on('error', function(err) {
	console.log('Error occurred: '+err);
});
