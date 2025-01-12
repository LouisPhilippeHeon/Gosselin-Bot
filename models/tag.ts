import { Model } from 'sequelize';

interface TagAttributes {
	id: number;
}

export class Tag extends Model<TagAttributes> implements TagAttributes {
	public id!: number;
}