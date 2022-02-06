var { Whatsapp } = require("whatsapp_client");
var wa = new Whatsapp();
wa.on("update", async function(message){
    var msg = message.messages[0]
    if (!msg.key.fromMe && message.type === 'notify') {
        var chat_id = msg.key.remoteJid;
        return await wa.request("sendMessage", {
            "chat_id": chat_id,
            "text": "hello world"
        });
    }
});