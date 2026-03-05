import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface BansAttributes {
  banId: string;
  guildId: string;
  userId: string;
  modId: string;
  expiry: Date;
  reason: string;
}

export type BansPk = "banId";
export type BansId = Bans[BansPk];
export type BansOptionalAttributes = "banId";
export type BansCreationAttributes = Optional<BansAttributes, BansOptionalAttributes>;

export class Bans extends Model<BansAttributes, BansCreationAttributes> implements BansAttributes {
  declare banId: string;
  declare guildId: string;
  declare userId: string;
  declare modId: string;
  declare expiry: Date;
  declare reason: string;
  declare createdAt: Date;
  declare updatedAt: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Bans {
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
      expiry: {
        type: DataTypes.DATE,
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
