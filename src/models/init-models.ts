import type { Sequelize } from "sequelize";
import { Bans as _Bans } from "./Bans.js";
import type { BansAttributes, BansCreationAttributes } from "./Bans.js";
import { Kicks as _Kicks } from "./Kicks.js";
import type { KicksAttributes, KicksCreationAttributes } from "./Kicks.js";

export {
  _Bans as Bans,
  _Kicks as Kicks,
};

export type {
  BansAttributes,
  BansCreationAttributes,
  KicksAttributes,
  KicksCreationAttributes,
};

export function initModels(sequelize: Sequelize) {
  const Bans = _Bans.initModel(sequelize);
  const Kicks = _Kicks.initModel(sequelize);


  return {
    Bans: Bans,
    Kicks: Kicks,
  };
}
