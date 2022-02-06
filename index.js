var P = require('pino')
var whatsapp_baileys = require("@adiwajshing/baileys");
var store = whatsapp_baileys.makeInMemoryStore({ logger: P.default().child({ level: 'debug', stream: 'store' }) });
store.readFromFile('./baileys_store_multi.json')
// save every 10s
setInterval(() => {
	store.writeToFile('./baileys_store_multi.json')
}, 10_000)

var timers = require("timers/promises");
var { state, saveState } = whatsapp_baileys.useSingleFileAuthState('./azka.json')
var fs = require("fs/promises");



// start a connection
async function startSock() {

	var sock = whatsapp_baileys.default({
		printQRInTerminal: true,
		auth: state,
		// implement to handle retries
		getMessage: async function (key) {
			return {
				conversation: 'hello'
			}
		}
	});

	store.bind(sock.ev);

	sock.ev.on('chats.set', item => console.log(`recv ${item.chats.length} chats (is latest: ${item.isLatest})`))
	sock.ev.on('messages.set', item => console.log(`recv ${item.messages.length} messages (is latest: ${item.isLatest})`))
	sock.ev.on('contacts.set', item => console.log(`recv ${item.contacts.length} contacts`))

	class WhatsappApi {

		constructor(){
			this.api = sock;
		}

		async request(method, parameters = {}) {
			if (typeof method == "string" && typeof parameters == "object") {
				if (RegExp("^sendMessage$", "i").exec(method)) {
					return await this.api.sendMessage(parameters["chat_id"], {
						"text": parameters["text"],
						"footer": 'Hello World',
						"headerType": 1,
						"buttons": reply_markup_telegram_to_whatsapp(reply_markup)
					});
				}
			} else {
				throw {
					"message": "params is bad"
				};
			}
		}
	}
	sock.ev.on('messages.upsert', async function (m) {
		await fs.appendFile("./log.json", JSON.stringify(m, null, 2));
		/*
		var messages = {
			"messages": [
				{
					"key": {
						"remoteJid": "62859106627455@s.whatsapp.net",
						"fromMe": true,
						"id": "8CE0A7840268FC2463A3F76559B843AC"
					},
					"messageTimestamp": 1644140076,
					"pushName": "HexaMinate",
					"status": 2,
					"message": {
						"conversation": "Kont"
					}
				}
			],
			"type": "notify"
		};
		if (messages["type"]) {
			var update = messages[0];
			var json_update = {};
			if (messages["type"] == "notify") {
				json_update["is_outgoing"] = true;
			}
			if (typeof update == "object") {
	
			}
	
		}
		*/
		var msg = m.messages[0]
	
		if (!msg.key.fromMe && m.type === 'notify') {
			console.log('replying to', m.messages[0].key.remoteJid)
			var reply_markup = {
				"inline_keyboard": [
					[
						{
							"text": "telegram"
						}
					],
					[
						{
							"text": "keyboard 2"
						}
					],
					[
						{
							"text": "keyboard 2"
						}
					]
				]
			};
			function reply_markup_telegram_to_whatsapp(reply_markup) {
				var keyboards = [];
				if (typeof reply_markup == "object") {
					if (typeof reply_markup["inline_keyboard"] == "object") {
						var inline_keyboard = reply_markup["inline_keyboard"];
						for (var i = 0; i < inline_keyboard.length; i++) {
							var loop_data = inline_keyboard[i];
							if (typeof loop_data == "object") {
								var keyboardId = `id${(i == 0) ? 1 : (i + 1)}`;
								if (loop_data.length == 1) {
									keyboards.push({
										"buttonId": keyboardId,
										"buttonText": {
											"displayText": loop_data[0]["text"]
										},
										"type": 1
									});
								} else if (loop_data.length > 1) {
									for (var ii = 0; i < loop_data.length; ii++) {
										var loop_dataa = loop_data[ii];
										if (typeof loop_dataa == "object") {
											keyboards.push({
												"buttonId": keyboardId,
												"buttonText": {
													"displayText": loop_dataa["text"]
												},
												"type": 1
											});
										}
									}
								}
							}
						}
						console.log(JSON.stringify(keyboards, null, 2))
						return keyboards;
					}
					return undefined;
				} else {
					return undefined;
				}
			}
			var chat_id = msg.key.remoteJid;
			console.log(chat_id);
			const templateButtons = [
				{ index: 1, urlButton: { displayText: '⭐ Star Baileys on GitHub!', url: 'https://github.com/adiwajshing/Baileys' } },
				{ index: 2, callButton: { displayText: 'Call me!', phoneNumber: '+1 (234) 5678-901' } },
				{ index: 3, quickReplyButton: { displayText: 'This is a reply, just like normal buttons!', id: 'id-like-buttons-message' } },
			]

			const templateMessage = {
				text: "Hi it's a template message",
				footer: 'Hello World',
				templateButtons: templateButtons
			}

			await sock.sendMessage(chat_id, {
				"text": "Hi it's button message",
				"footer": 'Hello World',
				"headerType": 1,
				"buttons": reply_markup_telegram_to_whatsapp(reply_markup)
			});
		}

	})

	sock.ev.on('messages.update', m => console.log(m))
	sock.ev.on('message-receipt.update', m => console.log(m))
	sock.ev.on('presence.update', m => console.log(m))
	sock.ev.on('chats.update', m => console.log(m))
	sock.ev.on('contacts.upsert', m => console.log(m))

	sock.ev.on('connection.update', (update) => {
		var { connection, lastDisconnect } = update
		if (connection === 'close') {
			// reconnect if not logged out
			if ((lastDisconnect.error)?.output?.statusCode !== whatsapp_baileys.DisconnectReason.loggedOut) {
				startSock();
			} else {
				console.log('connection closed')
			}
		}

		console.log('connection update', update)
	})
	// listen for when the auth credentials is updated
	sock.ev.on('creds.update', saveState)
}

startSock();