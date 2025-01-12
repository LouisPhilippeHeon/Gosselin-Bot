import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { fetchUsedEquipments } from '../services/http';
import { getAllIds, saveIds } from '../services/storage';

const maxEmbedsPerMessage = 10;

export const data = new SlashCommandBuilder()
	.setName('refresh')
	.setDescription('Vérifier si de nouveaux équipements usagés sont disponibles.');

export async function execute(interaction: ChatInputCommandInteraction) {
	const usedEquipments = await fetchUsedEquipments();
	const oldIds = await getAllIds();

	if (oldIds.length === 0)
		await interaction.reply('Aucun équipement n\'est déjà en mémoire, il est donc impossible d\'indiquer lesquels sont nouveaux.');
	else {
		const newEquipments = usedEquipments.filter(equipment => !oldIds.includes(equipment.id));

		if (newEquipments.length === 0)
			await interaction.reply('Aucun nouvel équipement usagé.');
		else {
			const embeds = [];
			for (const Equipment of newEquipments) {
				embeds.push(new EmbedBuilder({ title: Equipment.name, description: `${Equipment.price} $`, url: Equipment.url }));
			}

			await interaction.reply({ content: `${newEquipments.length} nouveaux équipements usagés disponibles.`, embeds: embeds.slice(0, maxEmbedsPerMessage) });
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

	// Keep ids in database
	await saveIds(usedEquipments.map(i => i.id));
}

async function displayNewEquipments() {
	
}