const mc = require('minecraft-protocol')
const HypixelAPI = require('hypixel-api')

const states = mc.states
const username = "" // Your username
const hclient = new HypixelAPI("") // API code
var players = []
var pc = 0
var port = 25567
var game = "lobby"
var gameinfo = undefined;
var version = "1.8.9"
var usr = "" // Email
const games = ["UHC", "Bridge", "Sumo", "Parkour", "Classic", "SkyWars", "Boxing", "Bow", "NoDebuff", "Combo", "OP", "MegaWalls", "Blitz", "Spleef"]

const srv = mc.createServer({
  'online-mode': true,
  port: port,
  keepAlive: false,
  version: version
})

srv.on('login', function (client) {
  const addr = client.socket.remoteAddress
  console.log('Incoming connection', '(' + addr + ')')
  let endedClient = false
  let endedTargetClient = false
  client.on('end', function () {
    endedClient = true
    console.log('Connection closed by client', '(' + addr + ')')
    game = "lobby";
    pc = 0;
    players = [];
    if (!endedTargetClient) { targetClient.end('End') }
  })
  client.on('error', function (err) {
    endedClient = true
    console.log('Connection error by client', '(' + addr + ')')
    game = "lobby";
    pc = 0;
    players = [];
    console.log(err.stack)
    if (!endedTargetClient) { targetClient.end('Error') }
  })
  const targetClient = mc.createClient({
    host: "mc.hypixel.net",
    port: "25565",
    username: usr,
    keepAlive: false,
    version: version,
    auth: "microsoft"
  })

  client.on('packet', function (data, meta) {
    if (targetClient.state === states.PLAY && meta.state === states.PLAY) {
      if (!endedTargetClient) { targetClient.write(meta.name, data) }

    }
  })
  targetClient.on("login", function(client){

    targetClient.write("chat", { message: "/locraw"})
    console.log("Locrawed")

  })
  targetClient.on('packet', function (data, meta) {
    if (meta.state === states.PLAY && client.state === states.PLAY) {
      if (!endedClient) {
        client.write(meta.name, data)
        if (meta.name === 'set_compression') {
          client.compressionThreshold = data.threshold
        } else if (meta.name === "chat") {

          if (JSON.stringify(data.message).replaceAll(/§[a-z\d]/ig, '').includes(username+" joined the lobby!") && game != "lobby") {

            game = "lobby";
            pc = 0;
            players = [];

          } else if (data.message.includes("server") && data.message.includes("gametype") && data.message.includes("mode")) {

            var gameinfo = JSON.parse(data.message);
            // data.message = ""
          
          }

        } if (meta.name === "scoreboard_team") {
            if (game != "lobby") {
      
              if (data.players != undefined) {
      
                if (data.players[0] != undefined) {
      
                    if (!(players.includes(data.players[0])) && data.players[0] != username && data.players[0].length > 2) {

                      if (pc != 0) {

                        players.push(data.players[0])
                        hclient.getPlayer('name', data.players[0]).then((player) => {
                          if (game != "lobby") {

                            var wlrs = (Math.round(player.player.stats.Duels.wins / player.player.stats.Duels.losses * 100) / 100).toString()
                            if (wlrs == NaN || wlrs == undefined) {

                              client.write("chat", { message: data.players[0]+"has no duel stats!", position: 0, sender: '0' })
                              
                            } else {
                              
                              var playerlevel = Math.round(((2 * player.player.networkExp) + 30625) ** (1 / 2) / 50) - 2.5

                              var player1Rank = player.player.newPackageRank ? player.player.newPackageRank : 'DEFAULT'
                              var playerRankPlus = player1Rank.replace(/_PLUS/g, '+')
                              pk = player.player.monthlyPackageRank ? playerRankPlus += '+' : playerRankPlus
                              var msg1 = {
                                translate: 'chat.type.announcement',
                                "with": [
                                    "",
                                    "["+pk+"] "+data.players[0].toString()+"§r Lvl: §6"+playerlevel+"§r, W: §7"+player.player.stats.Duels.wins.toString()
                                ]
                              };
                              client.write("chat", { message: JSON.stringify(msg1), position: 0, sender: '0' })

                              var msg2 = {
                                translate: 'chat.type.announcement',
                                "with": [
                                    "",
                                    "W/L: §8"+wlrs.toString()+"§r, CWS: §8"+player.player.stats.Duels.current_winstreak.toString()+"§r, BWS: BWS"
                                ]
                              };

                              client.write("chat", { message: JSON.stringify(msg2), position: 0, sender: '0' })

                            }

                          }
                        }).catch((err) => {
                          console.log
                        })

                      } else {
                        pc++
                      }
                    }
                }
              }
            } else {
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
    } 
  })
  const bufferEqual = require('buffer-equal')
  targetClient.on('raw', function (buffer, meta) {
    if (client.state !== states.PLAY || meta.state !== states.PLAY) { return }
    const packetData = targetClient.deserializer.parsePacketBuffer(buffer).data.params
    const packetBuff = client.serializer.createPacketBuffer({ name: meta.name, params: packetData })
    if (!bufferEqual(buffer, packetBuff)) {
      console.log('client<-server: Error in packet ' + meta.state + '.' + meta.name)
      console.log('received buffer', buffer.toString('hex'))
      console.log('produced buffer', packetBuff.toString('hex'))
      console.log('received length', buffer.length)
      console.log('produced length', packetBuff.length)
    }
  })
  client.on('raw', function (buffer, meta) {
    if (meta.state !== states.PLAY || targetClient.state !== states.PLAY) { return }
    const packetData = client.deserializer.parsePacketBuffer(buffer).data.params
    const packetBuff = targetClient.serializer.createPacketBuffer({ name: meta.name, params: packetData })
    if (!bufferEqual(buffer, packetBuff)) {
      console.log('client->server: Error in packet ' + meta.state + '.' + meta.name)
      console.log('received buffer', buffer.toString('hex'))
      console.log('produced buffer', packetBuff.toString('hex'))
      console.log('received length', buffer.length)
      console.log('produced length', packetBuff.length)
    }
  })
  targetClient.on('end', function () {
    endedTargetClient = true
    console.log('Connection closed by server', '(' + addr + ')')
    game = "lobby";
    pc = 0;
    players = [];
    if (!endedClient) { client.end('End') }
  })
  targetClient.on('error', function (err) {
    endedTargetClient = true
    console.log('Connection error by server', '(' + addr + ') ', err)
    console.log(err.stack)
    game = "lobby";
    pc = 0;
    players = [];
    if (!endedClient) { client.end('Error') }
  })
})
