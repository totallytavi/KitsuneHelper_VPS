import { DataTypes, Model } from 'sequelize';
export class Bans extends Model {
    static initModel(sequelize) {
        return Bans.init({
            banId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                defaultValue: DataTypes.UUIDV4
            },
            guildId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            userId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            modId: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            duration: {
                type: DataTypes.TEXT,
                allowNull: false
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'Bans',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "banId" },
                    ]
                },
            ]
        });
    }
}
