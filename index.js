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
                    var data = {
                        "chat_id": chat_id,
                        "text": `Hay perkenalkan saya adalah bot`,
                        "reply_markup": {
                            "inline_keyboard": [
                                [
                                    {
                                        "text": "GITHUB",
                                        "url": "https://github.com/azkadev"
                                    }
                                ],
                                [
                                    {
                                        "text": "callback",
                                        "callback_data": "callback"
                                    }
                                ]
                            ]
                        }
                    };
                    return await wa.request("sendMessage", data);
                }

                if (RegExp("^/jsondumpraw$", "i").exec(text)) {
                    return await wa.request("sendMessage", {
                        "chat_id": chat_id,
                        "text": JSON.stringify(update_origin, null, 2)
                    });
                }

                if (RegExp("^/jsondump$", "i").exec(text)) {
                    return await wa.request("sendMessage", {
                        "chat_id": chat_id,
                        "text": JSON.stringify(update, null, 2)
                    });
                }

                if (RegExp("^/ping$", "i").exec(text)) {
                    var time = (Date.now() / 1000) - msg.date;
                    var data = {
                        "chat_id": chat_id,
                        "text": `Pong ${time.toFixed(3)}`
                    };
                    return await wa.request("sendMessage", data);
                }
            }
            if (!is_outgoing) {
                var data = {
                    "chat_id": chat_id,
                    "text": `Hay perkenalkan saya adalah bot\nTolong gunakan perintah /start ya!`,
                };
                return await wa.request("sendMessage", data);
            }
        }
    }
});