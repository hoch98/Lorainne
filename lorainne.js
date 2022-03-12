const mc = require('minecraft-protocol')
const fs = require("fs")
const https = require("https")

const states = mc.states
var players = []
var pcount;
var game = "lobby"
var gameinfo;
var cache = {};
const games = ["UHC", "Bridge", "Sumo", "Parkour", "Classic", "SkyWars", "Boxing", "Bow", "NoDebuff", "Combo", "OP", "MegaWalls", "Blitz", "Spleef"]
var pc = 0
var apikey;
var port;
var version;
var email;
var debug = false;

function add_player(name, data) {

	cache.name = data;
	return true;

}

function get_player(name) {

	return cache.name

}

fs.readFile('config.json', (err, data) => {
	if (err) {
		const url = "https://raw.githubusercontent.com/CraftYun83/Lorainne/main/config.json";

		https.get(url, (res) => {
			const path = "config.json";
			const writeStream = fs.createWriteStream(path);

			res.pipe(writeStream);

			writeStream.on("finish", () => {
				writeStream.close();
				console.log("config.json file created! Please configure it before running again!")
				process.exit();
			});
		});
	} else {

		let configurations = JSON.parse(data);
		email = configurations.email
		port = configurations.port
		apikey = configurations.apikey
		version = configurations.mcversion
		debug = configurations.debug

		if (email === "<Email Account of MC Account>" || apikey === "<Type /api in Hypixel chat and copy and paste the result here!>") {

			console.log("Please configure config.json before running!")
			process.exit();
		} else {
			const srv = mc.createServer({
				'online-mode': true,
				port: port,
				keepAlive: false,
				version: version
			})


			if (port == 25565) {
				console.log("Proxy server is now UP, connect to Hypixel using the following URLs: 127.0.0.1 or localhost")
			} else {
				console.log("Proxy server is now UP, connect to Hypixel using the following URLs: 127.0.0.1:" + port + " or localhost:" + port)
			}

			srv.on('login', function(client) {
				const addr = client.socket.remoteAddress
				console.log('Incoming connection', '(' + addr + ')')
				let endedClient = false
				let endedTargetClient = false
				client.on('end', function() {
					endedClient = true
					console.log('Connection closed by client', '(' + addr + ')')
					game = "lobby";
					pc = 0;
					players = [];
					if (!endedTargetClient) {
						targetClient.end('End')
					}
				})
				client.on('error', function(err) {
					endedClient = true
					console.log('Connection error by client', '(' + addr + ')')
					game = "lobby";
					pc = 0;
					players = [];
					console.log(err.stack)
					if (!endedTargetClient) {
						targetClient.end('Error')
					}
				})
				const targetClient = mc.createClient({
					host: "mc.hypixel.net",
					port: "25565",
					username: email,
					keepAlive: false,
					version: version,
					auth: "microsoft"
				})

				client.on('packet', function(data, meta) {
					if (targetClient.state === states.PLAY && meta.state === states.PLAY) {
						if (!endedTargetClient) {
							targetClient.write(meta.name, data)
						}
					}
				})
				targetClient.on("login", function(client) {

					targetClient.write("chat", {
						message: "/locraw"
					})

				})
				targetClient.on('packet', function(data, meta) {
					if (meta.state === states.PLAY && client.state === states.PLAY) {
						if (!endedClient) {
							client.write(meta.name, data)
							if (meta.name === 'set_compression') {
								client.compressionThreshold = data.threshold
							} else if (meta.name === "chat") {

								if (JSON.stringify(data.message).replaceAll(/§[a-z\d]/ig, '').includes(client.username + " joined the lobby!") && game != "lobby") {

									game = "lobby";
									pc = 0;
									players = [];

								} else if (data.message.includes("server") && data.message.includes("gametype") && data.message.includes("mode")) {

									gameinfo = JSON.parse(data.message);
									pc = 0;
									players = [];

								}

							}
							if (meta.name === "scoreboard_team") {
								if (data.players != undefined) {

									if (data.players[0] != undefined) {

										if (!(players.includes(data.players[0])) && data.players[0] != client.username && data.players[0].length > 2) {

											if (pc != 0) {

												players.push(data.players[0])
												if (game != "lobby") {

													if (get_player(data.players[0]) != undefined) {

														let playerdata = get_player(data.players[0])

														if (playerdata.wlr == NaN || playerdata.wlr == undefined) {

															if (game != "lobby") {
																client.write("chat", {
																	message: data.players[0] + "has no duel stats!",
																	position: 0,
																	sender: '0'
																})
															}

														} else {
															if (game != "lobby") {
																var msg1 = {
																	translate: 'chat.type.announcement',
																	"with": [
																		"§l§aLorainne",
																		"[" + playerdata.rank + "] " + data.players[0].toString() + "§r Lvl: §6" + playerdata.level + "§r, W: §7" + playerdata.wins
																	]
																};
																client.write("chat", {
																	message: JSON.stringify(msg1),
																	position: 0,
																	sender: '0'
																})

																var msg2 = {
																	translate: 'chat.type.announcement',
																	"with": [
																		"§l§aLorainne",
																		"W/L: §8" + playerdata.wlr + "§r, CWS: §8" + playerdata.current_winstreak + "§r, BWS: " + playerdata.bws
																	]
																};
																client.write("chat", {
																	message: JSON.stringify(msg2),
																	position: 0,
																	sender: '0'
																})
															}
														}

													} else {

														let url = "https://api.mojang.com/users/profiles/minecraft/" + data.players[0];

														https.get(url, (res) => {
															let body = "";

															res.on("data", (chunk) => {
																body += chunk;
															});

															res.on("end", () => {
																try {
																	let json = JSON.parse(body);

																	let url = "https://api.hypixel.net/player?key=" + apikey + "&name=" + data.players[0];

																	https.get(url, (res) => {
																		let body = "";

																		res.on("data", (chunk) => {
																			body += chunk;
																		});

																		res.on("end", () => {
																			let json = JSON.parse(body);
																			if (json.success == true) {

																				// Runs when got Hypixel data succesfully

																				var player1Rank = (json.player.newPackageRank ? json.player.newPackageRank : 'DEFAULT')
																				var playerRankPlus = player1Rank.replace(/_PLUS/g, '+')
																				pk = json.player.monthlyPackageRank ? playerRankPlus += '+' : playerRankPlus

																				let playerdata = {
																					wlr: (((Math.round(json.player.stats.Duels.wins / json.player.stats.Duels.losses * 100) / 100) == NaN) ? 'None' : (Math.round(json.player.stats.Duels.wins / json.player.stats.Duels.losses * 100) / 100)),
																					level: Math.round(((2 * json.player.networkExp) + 30625) ** (1 / 2) / 50) - 2.5,
																					wins: ((json.player.stats.Duels.wins == undefined) ? "None" : json.player.stats.Duels.wins),
																					current_winstreak: ((json.player.stats.Duels.current_winstreak == undefined) ? "None" : json.player.stats.Duels.current_winstreak),
																					bws: ((json.player.stats.Duels.best_overall_winstreak == undefined) ? 'None' : json.player.stats.Duels.best_overall_winstreak),
																					rank: pk
																				}
																				if (playerdata.wlr == NaN || playerdata.wlr == undefined) {

																					if (game != "lobby") {
																						client.write("chat", {
																							message: data.players[0] + "has no duel stats!",
																							position: 0,
																							sender: '0'
																						})
																					}

																				} else {
																					if (game != "lobby") {
																						var msg1 = {
																							translate: 'chat.type.announcement',
																							"with": [
																								"§l§aLorainne",
																								"[" + playerdata.rank + "] " + data.players[0].toString() + "§r Lvl: §6" + playerdata.level + "§r, W: §7" + playerdata.wins
																							]
																						};
																						client.write("chat", {
																							message: JSON.stringify(msg1),
																							position: 0,
																							sender: '0'
																						})

																						var msg2 = {
																							translate: 'chat.type.announcement',
																							"with": [
																								"§l§aLorainne",
																								"W/L: §8" + playerdata.wlr + "§r, CWS: §8" + playerdata.current_winstreak + "§r, BWS: " + playerdata.bws
																							]
																						};
																						client.write("chat", {
																							message: JSON.stringify(msg2),
																							position: 0,
																							sender: '0'
																						})

																						add_player(data.players[0], playerdata)
																					}
																				}

																			} else {
																				// Runs when cannot get player data
																				console.log(json.cause)
																			}
																		});

																	}).on("error", (error) => {
																		console.log
																	});

																} catch (error) {
																	console.log
																};
															});

														}).on("error", (error) => {
															console.error(error.message);
														});

													}

												}

											} else {
												pc++
											}
										}
									}
								}
								if (data.prefix != undefined) {

									if (data.prefix.toString().includes("Mode: ")) {

										for (let i = 0; i < games.length; i++) {

											if (data.prefix.toString().includes(games[i])) {

												game = games[i]
												break

											}

										}

									}

								}
							}
						}
					}
				})
				const bufferEqual = require('buffer-equal')
				targetClient.on('raw', function(buffer, meta) {
					if (client.state !== states.PLAY || meta.state !== states.PLAY) {
						return
					}
					const packetData = targetClient.deserializer.parsePacketBuffer(buffer).data.params
					const packetBuff = client.serializer.createPacketBuffer({
						name: meta.name,
						params: packetData
					})
					if (!bufferEqual(buffer, packetBuff)) {
						console.log('client<-server: Error in packet ' + meta.state + '.' + meta.name)
						console.log('received buffer', buffer.toString('hex'))
						console.log('produced buffer', packetBuff.toString('hex'))
						console.log('received length', buffer.length)
						console.log('produced length', packetBuff.length)
					}
				})
				client.on('raw', function(buffer, meta) {
					if (meta.state !== states.PLAY || targetClient.state !== states.PLAY) {
						return
					}
					const packetData = client.deserializer.parsePacketBuffer(buffer).data.params
					const packetBuff = targetClient.serializer.createPacketBuffer({
						name: meta.name,
						params: packetData
					})
					if (!bufferEqual(buffer, packetBuff)) {
						console.log('client->server: Error in packet ' + meta.state + '.' + meta.name)
						console.log('received buffer', buffer.toString('hex'))
						console.log('produced buffer', packetBuff.toString('hex'))
						console.log('received length', buffer.length)
						console.log('produced length', packetBuff.length)
					}
				})
				targetClient.on('end', function() {
					endedTargetClient = true
					console.log('Connection closed by server', '(' + addr + ')')
					game = "lobby";
					pc = 0;
					players = [];
					if (!endedClient) {
						client.end('End')
					}
				})
				targetClient.on('error', function(err) {
					endedTargetClient = true
					console.log('Connection error by server', '(' + addr + ') ', err)
					console.log(err.stack)
					game = "lobby";
					pc = 0;
					players = [];
					if (!endedClient) {
						client.end('Error')
					}
				})
			})
		}
	}
})
