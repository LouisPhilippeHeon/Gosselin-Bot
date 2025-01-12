import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { fetchUsedItems } from "../services/http";
import { getAllIds, saveIds } from "../services/storage";

export const data = new SlashCommandBuilder()
	.setName('refresh')
	.setDescription("Vérifier si de nouveaux items usagés sont disponibles.");

export async function execute(interaction: ChatInputCommandInteraction) {
	const usedItems = await fetchUsedItems();
	const oldIds = await getAllIds();

	if (oldIds.length !== 0) {
		const newItems = usedItems.filter(item => !oldIds.includes(item.id));

		if (newItems.length === 0) {
			await interaction.reply("Aucun nouvel équipement usagé.");
		} else {
			const embeds = [];
			for (const item of newItems) {
				embeds.push(new EmbedBuilder({ title: item.name, description: `${item.price} $`, url: item.url }));
			}

			await interaction.reply({ content: `${newItems.length} nouveaux équipements usagés disponibles.`, embeds: embeds.slice(0, 10) });
			// Max 10 embeds per messages
			if (embeds.length > 10) {
				let numberOfMessages = Math.ceil(embeds.length / 10);

				for (let i = 1; i < numberOfMessages; i++) {
					let startingIndex = i * 10;
					await interaction.followUp({ embeds: embeds.slice(startingIndex, startingIndex + 10) });
				}
			}
		}
	}
	else
		await interaction.reply("Aucun équipement n'est déjà en mémoire, il est donc impossible d'indiquer lesquels sont nouveaux.");

	await saveIds(usedItems.map(i => i.id));
}