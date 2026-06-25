export type Realm = {
	name: string;
	color: string;
};

export const RealmEnum = {
	MARERIJK: 'Marerijk',
	REIZENRIJK: 'Reizenrijk',
	RUIGRIJK: 'Ruigrijk',
	FANTASIERIJK: 'Fantasierijk',
	ANDERRIJK: 'Anderrijk',
	SPROOKJESBOS: 'Sprookjesbos',
} as const;

export type RealmEnum = typeof RealmEnum[keyof typeof RealmEnum];

export const RealmConfig: Record<RealmEnum, Realm> = {
	[RealmEnum.MARERIJK]: {
		name: 'Marerijk',
		color: '#276147'
	},
	[RealmEnum.REIZENRIJK]: {
		name: 'Reizenrijk',
		color: '#DD9115'
	},
	[RealmEnum.RUIGRIJK]: {
		name: 'Ruigrijk',
		color: '#CE0B14'
	},
	[RealmEnum.FANTASIERIJK]: {
		name: 'Fantasierijk',
		color: '#6D4293'
	},
	[RealmEnum.ANDERRIJK]: {
		name: 'Anderrijk',
		color: '#007BBE'
	},
	[RealmEnum.SPROOKJESBOS]: {
		name: 'Sprookjesbos',
		color: '#7CBE70'
	}
};

export const getRealm = (region: string): Realm => {
	return RealmConfig[region as RealmEnum];
};