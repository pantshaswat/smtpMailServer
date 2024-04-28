const SMTPServer = require("smtp-server").SMTPServer;
const server = new SMTPServer({
    onConnect(session, callback){
        console.log("Connected with s id: " + session.id);
        return callback();
    },
    onMailFrom(address,session,callback){
        console.log("Mail from: " + address.address);
        return callback();
    
    },
    onRcptTo(address, session, callback){
        console.log("sent to address" + address.address);
        return callback();
    },
    onData(stream, session, callback){
        stream.on("data", (data)=>{
            console.log('data:' +data.toString() );
        });
    }
});

server.listen(25, ()=>{
    console.log("Server started on port 25");
});