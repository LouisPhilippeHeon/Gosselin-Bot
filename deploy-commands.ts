import { ApplicationCommand, REST, Routes } from 'discord.js';
import fs = require('node:fs');
import path = require('node:path');
import { clientId, guildId, token } from './config';

const commands = [];
// Grab all the command files from the commands directory
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath).filter((folder: string) => !folder.endsWith('.DS_Store'));

for (const file of commandFolders) {
	const filePath = path.join(foldersPath, file);
	const command = require(filePath);
	
	if ('data' in command && 'execute' in command)
		commands.push(command.data.toJSON());
	else
		console.error(`La commande ${filePath} n'a pas les propriétés « data » ou « execute ».`);
}

// Construct and prepare an instance of the REST module
const rest = new REST().setToken(token);

// Refresh all commands in the guild with the current set
rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands }).catch((e) =>
	console.error(e)
).then((data: ApplicationCommand[]) =>
	console.log(`${data.length} commandes rafraichies avec succès.`)
)