import { DataTypes, Model } from 'sequelize';
export class Kicks extends Model {
    static initModel(sequelize) {
        return Kicks.init({
            kickId: {
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
            reason: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'Kicks',
            timestamps: true,
            indexes: [
                {
                    name: "PRIMARY",
                    unique: true,
                    using: "BTREE",
                    fields: [
                        { name: "kickId" },
                    ]
                },
            ]
        });
    }
}
