import { Collection, SlashCommandBuilder } from 'discord.js';


export type discordId = string | null;
export type commandsArray = Collection<string, { data: SlashCommandBuilder, execute: Function}>;


export interface ChannelType {
	_id: discordId;
	plugins: { [key: string]: boolean };
}


export interface MessageType {
	_id: discordId;
	authorId: discordId;
	channelId: discordId;
	feedMessageId?: discordId
	likes: number;
	stf: boolean;
	stt: boolean;
	str: boolean;
	removed: boolean;
	date: number;
	jumpUrl: string;
	content: string;
	memes: Array<AttachmentType>;
}


export interface AttachmentType {
	type: string;
	url: string;
}


export interface UserType {
	_id: discordId;
	level: number;
	xp: number;
	nbMsg: number;
	moisTop: number;
	xpTop: number;
}


export interface UserLimitsType {
	_id: discordId;
	lastMsg?: number;
	startTimeVocal?: number;
}


export interface RoleType {
	roleId: discordId;
	level: number;
}

export interface MoyenneType {
	_id: string,
	value: number,
}

export interface StatsType {
	_id: number,
	nom_mois: string,
	nb_memes_sent?: number,
	record_like?: number,
	id_aut_record_like?: string,
	record_likes_cumul?: number,
	id_aut_rec_likes_cumul?: string,
	total_likes?: number,
	nb_reposts: number,
	nb_memes_feed: number,
}

export interface BoostType {
	_id: string;
	dateFin: number;
	value: number;
}

export interface Mission10LikesDay {
	day: number,
	likes: number,
	missionEmbedId: discordId,
}
