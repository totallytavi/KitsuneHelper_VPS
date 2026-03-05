import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface KicksAttributes {
  kickId: string;
  guildId: string;
  userId: string;
  modId: string;
  reason: string;
}

export type KicksPk = "kickId";
export type KicksId = Kicks[KicksPk];
export type KicksOptionalAttributes = "kickId";
export type KicksCreationAttributes = Optional<KicksAttributes, KicksOptionalAttributes>;

export class Kicks extends Model<KicksAttributes, KicksCreationAttributes> implements KicksAttributes {
  declare kickId: string;
  declare guildId: string;
  declare userId: string;
  declare modId: string;
  declare reason: string;
  declare createdAt: Date;
  declare updatedAt: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Kicks {
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
