import * as Sequelize from 'sequelize';
import { DataTypes, Model, Optional } from 'sequelize';

export interface ConfigData {
  kickConfig: {
    days: number,
    reason: string
  },
  banConfig: {
    days: number,
    reason: string
  }
}

export interface ConfigAttributes {
  guildId: string;
  data: ConfigData;
  version: string;
}

export type ConfigPk = "guildId";
export type ConfigId = Config[ConfigPk];
export type ConfigOptionalAttributes = "data" | "version";
export type ConfigCreationAttributes = Optional<ConfigAttributes, ConfigOptionalAttributes>;

export class Config extends Model<ConfigAttributes, ConfigCreationAttributes> implements ConfigAttributes {
  declare guildId: string;
  declare data: ConfigData;
  declare version: string;
  declare createdAt: Date;
  declare updatedAt: Date;


  static initModel(sequelize: Sequelize.Sequelize): typeof Config {
    return Config.init({
      guildId: {
        type: DataTypes.CHAR(22),
        allowNull: false,
        primaryKey: true
      },
      data: {
        type: DataTypes.JSON,
        allowNull: false,
        defaultValue: {
          kickConfig: {
            days: -1,
            reason: 'Your account is too new to join this server'
          },
          banConfig: {
            days: -1,
            reason: 'Your account is too new to join this server'
          }
        }
      },
      version: {
        type: DataTypes.TEXT,
        allowNull: false,
        defaultValue: '1.0.0'
      }
    }, {
      sequelize,
      tableName: 'Config',
      timestamps: true,
      indexes: [
        {
          name: "PRIMARY",
          unique: true,
          using: "BTREE",
          fields: [
            { name: "guildId" },
          ]
        },
      ]
    });
  }
}
