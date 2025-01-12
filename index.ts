import { token } from './config';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import fs = require('node:fs');
import { ClientWithCommands } from './models/client-with-commands';
import { syncTags } from './services/storage';

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] }) as ClientWithCommands;
client.commands = new Collection();

loadCommand();

(async () =>
	await client.login(token)
)();

client.once(Events.ClientReady, async readyClient => {
	await syncTags();
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

function loadCommand() {
	client.commands = new Collection();
	const commands = fs.readdirSync("./commands").filter(file => file.endsWith(".js") || file.endsWith(".ts"));

	for (const file of commands) {
		const commandName = file.split(".")[0];
		const command = require(`./commands/${file}`);
		client.commands.set(commandName, command);
		console.log(`La commande « ${commandName} » a été chargée.`);
	}
}

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`Commande non trouvée : ${interaction.commandName}`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(`Erreur lors de l'exécution de ${interaction.commandName}:`, error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "Une erreur s'est produite lors de l'exécution de la commande.", ephemeral: true });
        } else {
            await interaction.reply({ content: "Une erreur s'est produite lors de l'exécution de la commande.", ephemeral: true });
        }
    }
});