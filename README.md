# Lorainne
Lorainne is currently in early beta testing and is one of the best open-source overall utility overlay available for Hypixel that works on any of your favorite clients. Lorainne is currently only available for migrated accounts.

![2022-03-11_23 48 45](https://user-images.githubusercontent.com/47018858/157901170-80a1c77a-d3be-4181-9ae7-1b5b6152d07c.png)

How our stats checking works:

To avoid getting Hypixel API restricted, I first pass the username along to the Mojang API to check whether the player exists. If it does, it will pass it along to the Hypixel API. On normal servers, we wouldn't need to send it to Mojang first, but on Hypixel, they have bot accounts with names that consists of randomly generated letters and number. These are really annoying and would make your API key wear out really fast. Checking the name first with Mojang allows us to cross out 99% of the bots, and only use the Hypixel API for the players we actually want to search for.

What's happening next?

In order to make absolute sure your API key doesn't get restricted, I am currently developing a caching system, incase you fight the same person multiple times. Instead of looking at their stats every single time, it will get it once, and then save it to a temporary dictionary. And when you fight the same person again, instead of using the Hypixel API to get stats, it will just take it from the cache dictionary. It obviously wouldn't be as accurate as getting the data using the Hypixel API everytime, but it will allow you to use your API Key longer without switching, and also avoids errors that the Hypixel API gives when you search the same player too many times.

Installation Process:

1. Clone the Repository: `https://github.com/CraftYun83/Lorainne.git`
2. Go Into the Cloned Repository: `cd Lorainne`
3. Download Dependencies:

`npm install minecraft-protocol`

4. Run the script using `node lorainne.js`
5. Edit the generated `config.json` file with the required values
6. Run the script again using `node lorainne.js`
7. You can now join Hypixel through `localhost`
(This is only for the default port (25565) inside `config.json`, if you changed it, join using `localhost:<port_number>`)

Use with caution, anything could happen. Try not starting a winstreak while using Lorainne, you might get kicked without warning!
