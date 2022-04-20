# Lorainne
Lorainne is currently in early beta testing and is one of the best open-source overall utility overlay available for Hypixel that works on any of your favorite clients. Lorainne is currently only available for migrated accounts.

Installation Process:

1. Clone the Repository: `https://github.com/CraftYun83/Lorainne.git`
2. Go Into the Cloned Repository: `cd Lorainne`
3. Download Dependencies:

`npm install minecraft-protocol request-promise`

4. Run the script using `node lorainne.js`
5. Edit the generated `config.json` file with the required values
6. Run the script again using `node lorainne.js`
7. You can now join Hypixel through `localhost`
(This is only for the default port (25565) inside `config.json`, if you changed it, join using `localhost:<port_number>`)

Use with caution, anything could happen. Try not starting a winstreak while using Lorainne, you might get kicked without warning!

Update of 20/4/2022:

I have completely rewritten the code of Lorainne, I have switched to a fully locraw-oriented system, meaning, it will use the locraw command when finding whether you are in a game, or what game to teleport you to when you use the /rq command. Still haven't added the denicker, still figuring out how to make that work. Another huge change: Instead of using the Hypixel API directly, I am web scraping plancke. This allows the client to not have to put an API key, and is also safer for the client. The one disadvantage is that you can't get the current winstreak through plancke, but, personally, I think it is worth it for the convenience and safety. I will start consistently fix bugs with Lorainne. Speaking of bugs, there is a slightly big issue where, if you join a game later than the other person you are duelling, it will not show stats until after the round has started. I have already started trying to fix the issue.
