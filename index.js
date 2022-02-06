var { Whatsapp } = require("whatsapp_client");
var wa = new Whatsapp();
wa.on("update", async function (update, update_origin) {
    if (typeof update == "object") {
        if (typeof update["message"] == "object") {
            var msg = update["message"];
            var chat_id = msg["chat_id"];
            var text = msg["text"] ?? "";
            var is_outgoing = msg["is_outgoing"];
            if (text) {
                if (RegExp("^/start$", "i").exec(text)) {
                    return await wa.request("sendMessage", {
                        "chat_id": chat_id,
                        "text": "Hay saya adalah robot"
                    });
                }
            }
        }
    }
});