// Unimplemented /rq command (for requeueing into games)
// Will replace "if (!endedTargetClient) {targetClient.write(meta.name, data)}" inside on client packet event.

if (!endedTargetClient) {
    if (data.message === "/rq") {
        if (game != "lobby") {
            var rqm = {
                translate: 'chat.type.announcement',
                "with": [
                    "§l§aLorainne",
                    "§aRequeuing"
                ]
            };

            client.write("chat", {
                message: JSON.stringify(rqm),
                position: 0,
                sender: '0'
            })
            targetClient.write("chat", {
                message: "/play " + JSON.parse(gameinfo.text).mode.toString().toLowerCase(),
                position: 0,
                sender: '0'
            })
        } else {
            var rqm = {
                translate: 'chat.type.announcement',
                "with": [
                    "§l§aLorainne",
                    "§cYou are not currently in a game!"
                ]
            };

            client.write("chat", {
                message: JSON.stringify(rqm),
                position: 0,
                sender: '0'
            })
        }
    } else {
        targetClient.write(meta.name, data)
    }
    targetClient.write(meta.name, data)
}
