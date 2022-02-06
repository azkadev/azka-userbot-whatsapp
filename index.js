var makeWASocket = require('@adiwajshing/baileys');

async function connectToWhatsApp() {
    const sock = makeWASocket.default({
        // can provide additional config here
        printQRInTerminal: true
    });
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update
        if (connection === 'close') {
            connectToWhatsApp();

        } else if (connection === 'open') {
            console.log('opened connection')
        }
    })
    sock.ev.on('messages.upsert', async function (update) {
        console.log(update);
    });
}
// run in main file
connectToWhatsApp()