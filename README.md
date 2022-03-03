# Lorainne
Lorainne is currently in early beta testing and is one of the best open-source overall utility overlay available for Hypixel that works on any of your favorite clients. Lorainne is currently only available for migrated accounts.

Installation Process:

1. Clone the Repository: `https://github.com/CraftYun83/Lorainne.git`
2. Go Into the Cloned Repository: `cd Lorainne`
3. Download Dependencies:

`npm install minecraft-protocol`
<br>
`npm install hypixel-api`

4. Edit Values of Variables Inside Script (filename: lorainne.js):

`var username = "<Name of Your Minecraft Username>"`
<br>
`var usr = "<Email for Your Minecraft>"`
<br>
`const hclient = new HypixelAPI("")`
(You can get your Hypixel API key by using `/api new` on Hypixel!)

5. Run the script using `node lorainne.js`
6. You can now join Hypixel through `localhost:25567`
(You can edit the port variable in the script to 25565 if you want to join Hypixel through `localhost` instead)

Use with caution, anything could happen. Try not starting a winstreak while using Lorainne, you might get kicked without warning!

![2022-02-03_02 55 48](https://user-images.githubusercontent.com/65894771/152222568-98468a86-1630-4d51-96b7-8463ec61b726.png)
