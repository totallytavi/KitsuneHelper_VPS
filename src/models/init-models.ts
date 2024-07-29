import type { Sequelize } from 'sequelize';
import { bans as _bans } from './bans';
import type { bansAttributes, bansCreationAttributes } from './bans';
import { kicks as _kicks } from './kicks';
import type { kicksAttributes, kicksCreationAttributes } from './kicks';
import { warnings as _warnings } from './warnings';
import type { warningsAttributes, warningsCreationAttributes } from './warnings';

export { _bans as bans, _kicks as kicks, _warnings as warnings };

export type {
  bansAttributes,
  bansCreationAttributes,
  kicksAttributes,
  kicksCreationAttributes,
  warningsAttributes,
  warningsCreationAttributes
};

export function initModels(sequelize: Sequelize) {
  const bans = _bans.initModel(sequelize);
  const kicks = _kicks.initModel(sequelize);
  const warnings = _warnings.initModel(sequelize);

  return {
    bans: bans,
    kicks: kicks,
    warnings: warnings
  };
}
