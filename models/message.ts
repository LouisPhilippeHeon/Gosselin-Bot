import { ChannelType, ChatInputCommandInteraction, EmbedBuilder, Guild, MessageCreateOptions, MessagePayload, TextChannel } from 'discord.js';
import { fetchUsedEquipments } from '../services/http';
import { getAllIds, saveIds } from '../services/storage';
import { guildId } from '../config';
import { client } from '../client';

const maxEmbedsPerMessage = 10;

export async function displayNewDeals(interaction?: ChatInputCommandInteraction) {
	const usedEquipments = await fetchUsedEquipments();
	const oldIds = await getAllIds();

	// Use an adapter if interaction is not provided (instead of replying to interaction, send message in gosselin channel)
	let interactionOrAdapter: ChatInputCommandInteraction | ChannelInteractionAdapter;

	if (interaction) {
		interactionOrAdapter = interaction;
	} else {
		const guild = client.guilds.cache.get(guildId);
		const channel = await fetchBotChannel(guild);
		interactionOrAdapter = new ChannelInteractionAdapter(channel);
	}

	if (oldIds.length === 0)
		await interactionOrAdapter.reply('Aucun équipement n\'est déjà en mémoire, il est donc impossible d\'indiquer lesquels sont nouveaux.');
	else {
		const newEquipments = usedEquipments.filter(equipment => !oldIds.includes(equipment.id));

		if (newEquipments.length === 0 && interactionOrAdapter instanceof ChatInputCommandInteraction)
			await interactionOrAdapter.reply('Aucun nouvel équipement usagé.');
		else if (newEquipments.length !== 0) {
			const embeds = [];
			for (const Equipment of newEquipments) {
				embeds.push(new EmbedBuilder({ title: Equipment.name, description: `${Equipment.price} $`, url: Equipment.url }));
			}
	
			await interactionOrAdapter.reply({ content: `${newEquipments.length} nouveaux équipements usagés disponibles.`, embeds: embeds.slice(0, maxEmbedsPerMessage) });
			// Max 10 embeds per messages
			if (embeds.length > maxEmbedsPerMessage) {
				let numberOfMessages = Math.ceil(embeds.length / maxEmbedsPerMessage);
	
				for (let i = 1; i < numberOfMessages; i++) {
					let startingIndex = i * maxEmbedsPerMessage;
					await interactionOrAdapter.followUp({ embeds: embeds.slice(startingIndex, startingIndex + maxEmbedsPerMessage) });
				}
			}
		}
	}
		
	// Keep ids in database
	await saveIds(usedEquipments.map(i => i.id));
}

async function fetchBotChannel(guild: Guild): Promise<TextChannel> {
	const channelName = 'gosselin';
	const channel = guild.channels.cache.find(channel => channel.name === channelName) as TextChannel;
	if (channel) return channel;

	return await guild.channels.create({
		name: channelName,
		type: ChannelType.GuildText
	});
}

class ChannelInteractionAdapter {
	private channel: TextChannel;

	constructor(channel: TextChannel) {
		this.channel = channel;
	}

	async reply(content: string | MessagePayload | MessageCreateOptions) {
		await this.channel.send(content);
	}

	async followUp(content: string | MessagePayload | MessageCreateOptions) {
		await this.channel.send(content);
	}
}