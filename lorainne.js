const mc = require('minecraft-protocol')
const rp = require('request-promise');
const fs = require("fs")
const path = require('path');
const https = require('https');

if (!fs.existsSync("config.json")) {
  fs.readFile('config.json', (err, data) => {
    if (err) {
      const url = "https://raw.githubusercontent.com/CraftYun83/Lorainne/main/config.json";
      https.get(url, (res) => {
        const fpath = path.join(__dirname, 'config.json');
        const writeStream = fs.createWriteStream(fpath);
        res.pipe(writeStream);
        writeStream.on("finish", () => {
          writeStream.close();
          console.log("config.json file created! Please configure it before running again!")
          process.exit();
        });
      });
    }
  })
} else {
  const states = mc.states
  let serverHost = "mc.hypixel.net"
  let email = ""
  let serverPort = 25565
  let clientPort = 25565
  let version = "1.8.9"
  let whitelist = []
  let players = []
  let gameinfo = {server: 'dynamiclobby13D', gametype: 'DUELS', lobbyname: 'duelslobby30'}
  let useragents = ['Mozilla/5.0 (X11; CrOS x86_64 10066.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.88 Safari/537.36']

  var options = {
    method: 'GET',
    uri: 'https://gist.githubusercontent.com/pzb/b4b6f57144aea7827ae4/raw/cf847b76a142955b1410c8bcef3aabe221a63db1/user-agents.txt'
  };

  rp(options).then(function(html){
    useragents = html.split("\n")
    console.log("User agents loaded.")
  })

  function readJsonFile() {
    let bufferData = fs.readFileSync("config.json")
    let stData = bufferData.toString()
    let data = JSON.parse(stData)
    clientPort = data.port
    version = data.version
    email = data.microsoftEMAIL
    console.log("Config file loaded.")
  }

  readJsonFile()

  function sbdDataCanPass(data, client) {
    if (gameinfo.lobbyname == undefined && !gameinfo.server.includes("lobby") && data.players != undefined && gameinfo.gametype === "DUELS") {
      if (data.players[0] != undefined) {
        if (data.players[0].length > 2 && data.players[0] != client.username && !players.includes(data.players[0]) && !whitelist.includes(data.players[0])) {
          players.push(data.players[0])
          return true
        }
      }
    }
      return false
  }

  function arremove(arr, value) { 
      
    return arr.filter(function(ele){ 
        return ele != value; 
    });
  }

  function writeStats(name, client, debug) {
    var agent = useragents[Math.floor(Math.random()*useragents.length)]
    var options = {
        method: 'GET',
        uri: 'https://plancke.io/hypixel/player/stats/'+name,
        headers: {
            'User-Agent': agent
        }
    };

    rp(options).then(function(html){

      // Player data variables

      var ptag = html.toString().substring(html.toString().indexOf('"https://plancke.io/assets/images/avatar.png" /><meta name="description" content="')+82, html.toString().indexOf('" /><meta name="keywords" content="Plancke,Hypixel,Stats,Statistics"'))
      var plvl = html.toString().substring(html.toString().indexOf("Level:")+11, html.toString().indexOf("Karma:")-9)
      var ptempHTML = html.toString().substring(html.toString().indexOf("Bombs Defused:"), html.toString().indexOf("MW"))
      var pwins = ptempHTML.substring(ptempHTML.indexOf("Wins:")+10, ptempHTML.indexOf("Losses:")-12)
      var pwlr = ptempHTML.toString().substring(ptempHTML.toString().indexOf("Win/Loss Ratio:")+20, ptempHTML.toString().indexOf("Arrows Shot:")-18)

      ptag = ptag.replace("[VIP]", "§a[VIP]")
      ptag = ptag.replace("[VIP+]", "§a[VIP§6+§a]")
      ptag = ptag.replace("[MVP]","§b[MVP]")
      ptag = ptag.replace("[MVP+]", "§b[MVP§c+§b]")
      ptag = ptag.replace("[MVP++]", "§6[MVP§c++§6]")
      ptag = ptag.replace("[ADMIN]", "§c[ADMIN]")
      ptag = ptag.replace("[OWNER]", "§c[OWNER]")

      var pdatamsg1 = {
        translate: 'chat.type.announcement',
        "with": [
            "",
            "§7"+ptag+"§r Lvl: §6"+plvl
        ]
      };
      var pdatamsg2 = {
        translate: 'chat.type.announcement',
        "with": [
            "",
            "W/L: §7"+pwlr+"§r, W: §7"+pwins
        ]
      };

      client.write("chat", { message: JSON.stringify(pdatamsg1), position: 0, sender: '0' })
      client.write("chat", { message: JSON.stringify(pdatamsg2), position: 0, sender: '0' })

    }).catch(function(err){
      if (debug) {
        var nog = {
          translate: 'chat.type.announcement',
          "with": [
              "",
              "This player does not exist!"
          ]
        };
        client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
      }
    });
  }

  const srv = mc.createServer({
    'online-mode': true,
    port: clientPort,
    version: version
  })
  srv.on('login', function (client) {
    const addr = client.socket.remoteAddress
    console.log(client.username+" has connected.")
    let endedClient = false
    let endedTargetClient = false
    client.on('end', function () {
      endedClient = true
      if (!endedTargetClient) { targetClient.end('End') }
    })
    client.on('error', function (err) {
      endedClient = true
      if (!endedTargetClient) { targetClient.end('Error') }
    })
    const targetClient = mc.createClient({
      host: serverHost,
      port: serverPort,
      username: email,
      auth: "microsoft",
      version: version
    })
    client.on('packet', function (data, meta) {
      if (targetClient.state === states.PLAY && meta.state === states.PLAY) {
        if (!endedTargetClient) { 
          
          if (data.message != undefined) {
            if (data.message.length > 2) {
              if (data.message.substring(0, 3) === "/sc") {
                writeStats(data.message.substring(4, data.message.length), client, true)
              } if (data.message.substring(0, 10) === "/whitelist") {
                if (data.message.substring(11, 14) === "add") {
                  if (data.message.substring(15, data.message.length) !== "") {
                    var nog = {
                      translate: 'chat.type.announcement',
                      "with": [
                          "Whitelist",
                          "Added "+data.message.substring(15, data.message.length)+" to the whitelist."
                      ]
                    };
                    client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
                    whitelist.push(data.message.substring(15, data.message.length))
                  } else {
                    var nog = {
                      translate: 'chat.type.announcement',
                      "with": [
                          "Whitelist",
                          "Please specify a player name!"
                      ]
                    };
                    client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
                  }
                } if (data.message.substring(11, 17) === "remove") {
                  if (data.message.substring(18, data.message.length) !== "") {
                    var nog = {
                      translate: 'chat.type.announcement',
                      "with": [
                          "Whitelist",
                          "Removed "+data.message.substring(18, data.message.length)+" from the whitelist."
                      ]
                    };
                    client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
                    whitelist = arremove(whitelist, data.message.substring(18, data.message.length))
                  } else {
                    var nog = {
                      translate: 'chat.type.announcement',
                      "with": [
                          "Whitelist",
                          "Please specify a player name!"
                      ]
                    };
                    client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
                  }
                } if (data.message.substring(11, 14) === "") {
                  client.write("chat", {"message": "Whitelist"})
                  whitelist.forEach((x, i) => {
                    var nog = {
                      translate: 'chat.type.announcement',
                      "with": [
                          (i+1).toString(),
                          x
                      ]
                    };

                    client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
                  });
                }
              } else if (data.message.substring(0, 3) === "/rq") {
                if (gameinfo.lobbyname == undefined && !gameinfo.server.includes("lobby") && gameinfo.gametype === "DUELS") {
                  targetClient.write("chat", {"message":"/play "+gameinfo.mode.toLowerCase()})
                } else {
                  var nog = {
                    translate: 'chat.type.announcement',
                    "with": [
                        "",
                        "You aren't in a game right now!"
                    ]
                  };
                  client.write("chat", { message: JSON.stringify(nog), position: 0, sender: '0' })
                }
              } if (data.message.substring(0, 8) === "/lreload") {
                readJsonFile()
              } else {
                targetClient.write(meta.name, data)
              }
            }
          } else {
            targetClient.write(meta.name, data)
          }
        }
      }
    })
    targetClient.on('packet', function (data, meta) {
      if (meta.state === states.PLAY && client.state === states.PLAY) {
        if (!endedClient) {
          client.write(meta.name, data)
          if (meta.name === 'set_compression') {
            client.compressionThreshold = data.threshold
          } if (meta.name === "scoreboard_team" && sbdDataCanPass(data, client)) {
            writeStats(data.players[0], client, false)
          } if (meta.name === "player_info") {
            if (data.data[0].name != undefined && data.data[0].properties != undefined) {
              if (players.includes(data.data[0].name)) {
                if (JSON.parse(Buffer.from(data.data[0].properties[0].value, 'base64')).profileName !== data.data[0].name) {
                  players.push(data.data[0].name)
                  writeStats(data.data[0].name, client, false)
                }
              }
            }
          } if (meta.name === "chat") {
              let message = data.message
              if (message.includes("server") && message.includes("gametype")) {
                  gameinfo = JSON.parse(JSON.parse(data.message).text)
              }
          }
        }
      }
    })
    targetClient.on('login', function (client) {
      gameinfo = {server: 'dynamiclobby13D', gametype: 'DUELS', lobbyname: 'duelslobby30'}
      players = []
      targetClient.write("chat", {message: "/locraw"})
    })
    const bufferEqual = require('buffer-equal')
    targetClient.on('raw', function (buffer, meta) {
      if (client.state !== states.PLAY || meta.state !== states.PLAY) { return }
      const packetData = targetClient.deserializer.parsePacketBuffer(buffer).data.params
      const packetBuff = client.serializer.createPacketBuffer({ name: meta.name, params: packetData })
    })
    client.on('raw', function (buffer, meta) {
      if (meta.state !== states.PLAY || targetClient.state !== states.PLAY) { return }
      const packetData = client.deserializer.parsePacketBuffer(buffer).data.params
      const packetBuff = targetClient.serializer.createPacketBuffer({ name: meta.name, params: packetData })
    })
    targetClient.on('end', function () {
      endedTargetClient = true
      console.log(client.username+" has disconnected.")
      if (!endedClient) { client.end('End') }
    })
    targetClient.on('error', function (err) {
      endedTargetClient = true
      console.log(client.username+" has disconnected.")
      console.log(err.stack)
      if (!endedClient) { client.end('Error') }
    })
  })
}
