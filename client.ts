import { Client, Collection, GatewayIntentBits } from 'discord.js';
import { ClientWithCommands } from './models/client-with-commands';

export const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] }) as ClientWithCommands;
client.commands = new Collection();