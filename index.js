var wa = require('@open-wa/wa-automate');
async function main() {
    var client = await wa.create({
        sessionId: "azkauserbot",
        multiDevice: true,
        authTimeout: 60,
        blockCrashLogs: true,
        disableSpins: true,
        headless: true,
        hostNotificationLang: 'PT_BR',
        logConsole: false,
        popup: true,
        qrTimeout: 0,
    });

    client.onAnyMessage(async function (update) {

        if (update["text"]) {
            if (update["text"] == "/start"){
            return await client.sendText(update["chatId"], "Bot run normal");
            }
        }
    })


}

main();