import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface kicksAttributes {
  kickId: string;
  guildId: string;
  target: string;
  moderator: string;
  reason?: string;
}

export type kicksPk = 'kickId';
export type kicksId = kicks[kicksPk];
export type kicksOptionalAttributes = kicksPk | 'reason';
export type kicksCreationAttributes = Optional<kicksAttributes, kicksOptionalAttributes>;

export class kicks extends Model<kicksAttributes, kicksCreationAttributes> implements kicksAttributes {
  declare kickId: string;
  declare guildId: string;
  declare target: string;
  declare moderator: string;
  declare reason?: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof kicks {
    return kicks.init(
      {
        kickId: {
          type: DataTypes.UUID,
          allowNull: false,
          primaryKey: true,
          comment: 'UUID V4',
          defaultValue: DataTypes.UUIDV4
        },
        guildId: {
          type: DataTypes.CHAR(18),
          allowNull: false,
          comment: 'Snowflake'
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
      },
      {
        sequelize,
        tableName: 'kicks',
        timestamps: true,
        paranoid: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'kickId' }]
          }
        ]
      }
    );
  }
}
