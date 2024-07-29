import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface warningsAttributes {
  warnId: string;
  guildId: string;
  target: string;
  moderator: string;
  reason?: string;
}

export type warningsPk = 'warnId';
export type warningsId = warnings[warningsPk];
export type warningsOptionalAttributes = warningsPk | 'reason';
export type warningsCreationAttributes = Optional<warningsAttributes, warningsOptionalAttributes>;

export class warnings extends Model<warningsAttributes, warningsCreationAttributes> implements warningsAttributes {
  declare warnId: string;
  declare guildId: string;
  declare target: string;
  declare moderator: string;
  declare reason?: string;
  declare createdAt: Date;
  declare updatedAt: Date;

  static initModel(sequelize: Sequelize.Sequelize): typeof warnings {
    return warnings.init(
      {
        warnId: {
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
        tableName: 'warnings',
        timestamps: true,
        indexes: [
          {
            name: 'PRIMARY',
            unique: true,
            using: 'BTREE',
            fields: [{ name: 'warnId' }]
          }
        ]
      }
    );
  }
}
