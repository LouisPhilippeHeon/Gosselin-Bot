import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { fetchUsedItems } from '../services/http';
import { getAllIds, saveIds } from '../services/storage';

const maxEmbedsPerMessage = 10;

export const data = new SlashCommandBuilder()
	.setName('refresh')
	.setDescription('Vérifier si de nouveaux items usagés sont disponibles.');

export async function execute(interaction: ChatInputCommandInteraction) {
	const usedItems = await fetchUsedItems();
	const oldIds = await getAllIds();

	if (oldIds.length === 0)
		await interaction.reply('Aucun équipement n\'est déjà en mémoire, il est donc impossible d\'indiquer lesquels sont nouveaux.');
	else {
		const newItems = usedItems.filter(item => !oldIds.includes(item.id));

		if (newItems.length === 0)
			await interaction.reply('Aucun nouvel équipement usagé.');
		else {
			const embeds = [];
			for (const item of newItems) {
				embeds.push(new EmbedBuilder({ title: item.name, description: `${item.price} $`, url: item.url }));
			}

			await interaction.reply({ content: `${newItems.length} nouveaux équipements usagés disponibles.`, embeds: embeds.slice(0, maxEmbedsPerMessage) });
			// Max 10 embeds per messages
			if (embeds.length > maxEmbedsPerMessage) {
				let numberOfMessages = Math.ceil(embeds.length / maxEmbedsPerMessage);

				for (let i = 1; i < numberOfMessages; i++) {
					let startingIndex = i * maxEmbedsPerMessage;
					await interaction.followUp({ embeds: embeds.slice(startingIndex, startingIndex + maxEmbedsPerMessage) });
				}
			}
		}
	}

	await saveIds(usedItems.map(i => i.id));
}