import { DataTypes, Model } from 'sequelize';
export class bans extends Model {
    static initModel(sequelize) {
        return bans.init({
            banId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                comment: 'UUID V4',
                defaultValue: DataTypes.UUIDV4
            },
            target: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: 'Snowflake'
            },
            moderator: {
                type: DataTypes.TEXT,
                allowNull: false,
                comment: 'Snowflake'
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: true
            },
            expiry: {
                type: DataTypes.DATE,
                allowNull: false
            }
        }, {
            sequelize,
            tableName: 'bans',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'banId' }]
                }
            ]
        });
    }
}
