import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface bansAttributes {
  banId: string;
  guildId: string;
  target: string;
  moderator: string;
  reason?: string;
  expiry: Date;
}

export type bansPk = 'banId';
export type bansId = bans[bansPk];
export type bansOptionalAttributes = bansPk | 'reason';
export type bansCreationAttributes = Optional<bansAttributes, bansOptionalAttributes>;

export class bans extends Model<bansAttributes, bansCreationAttributes> implements bansAttributes {
  declare banId: string;
  declare guildId: string;
  declare target: string;
  declare moderator: string;
  declare reason?: string;
  declare expiry: Date;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof bans {
    return bans.init(
      {
        banId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          comment: 'UUID V4',
          defaultValue: DataTypes.UUIDV4
        },
        guildId: {
          type: DataTypes.TEXT,
          allowNull: false,
          comment: 'Snowflake'
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
      },
      {
        sequelize,
        tableName: 'bans',
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'banId' }]
          }
        ]
      }
    );
  }
}
