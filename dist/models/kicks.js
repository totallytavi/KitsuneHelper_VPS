import { DataTypes, Model } from 'sequelize';
export class kicks extends Model {
    static initModel(sequelize) {
        return kicks.init({
            kickId: {
                type: DataTypes.UUID,
                allowNull: false,
                primaryKey: true,
                comment: 'UUID V4',
                defaultValue: DataTypes.UUIDV4
            },
            target: {
                type: DataTypes.CHAR(18),
                allowNull: false,
                comment: 'Snowflake'
            },
            moderator: {
                type: DataTypes.CHAR(18),
                allowNull: false,
                comment: 'Snowflake'
            },
            reason: {
                type: DataTypes.TEXT,
                allowNull: true
            }
        }, {
            sequelize,
            tableName: 'kicks',
            timestamps: true,
            indexes: [
                {
                    name: 'PRIMARY',
                    unique: true,
                    using: 'BTREE',
                    fields: [{ name: 'kickId' }]
                }
            ]
        });
    }
}
