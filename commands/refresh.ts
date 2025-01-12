import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { displayNewDeals } from '../services/message';

export const data = new SlashCommandBuilder()
	.setName('refresh')
	.setDescription('Vérifier si de nouveaux équipements usagés sont disponibles.');

export async function execute(interaction: ChatInputCommandInteraction) {
	displayNewDeals(interaction);
}

