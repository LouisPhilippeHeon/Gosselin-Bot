import { Sequelize, DataTypes, Model } from 'sequelize';
import { Tag } from '../models/tag';

const sequelize = new Sequelize('database', 'user', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

Tag.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true
        }
    },
    {
        sequelize,
        modelName: 'tags'
    }
);

export async function syncTags() {
    await Tag.sync();
}

export async function getAllIds(): Promise<number[]> {
    const tagRecords = await Tag.findAll({
        attributes: ['id'],
    });

    return tagRecords.map((record) => record.id);
}

export async function saveIds(items: number[]) {
	await Tag.drop();
	await syncTags();
	const tagObjects = items.map((id) => ({ id }));
	await Tag.bulkCreate(tagObjects);
}