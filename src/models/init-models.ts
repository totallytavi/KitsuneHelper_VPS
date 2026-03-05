import type { Sequelize } from "sequelize";
import { Bans as _Bans } from "./Bans.js";
import type { BansAttributes, BansCreationAttributes } from "./Bans.js";
import { Config as _Config } from "./Config.js";
import type { ConfigAttributes, ConfigCreationAttributes } from "./Config.js";
import { Kicks as _Kicks } from "./Kicks.js";
import type { KicksAttributes, KicksCreationAttributes } from "./Kicks.js";

export {
  _Bans as Bans,
  _Config as Config,
  _Kicks as Kicks,
};

export type {
  BansAttributes,
  BansCreationAttributes,
  ConfigAttributes,
  ConfigCreationAttributes,
  KicksAttributes,
  KicksCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Bans = _Bans.initModel(sequelize);
  const Config = _Config.initModel(sequelize);
  const Kicks = _Kicks.initModel(sequelize);


  return {
    Bans: Bans,
    Config: Config,
    Kicks: Kicks,
  };
}
