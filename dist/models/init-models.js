import { bans as _bans } from "./bans";
import { kicks as _kicks } from "./kicks";
import { warnings as _warnings } from "./warnings";
export { _bans as bans, _kicks as kicks, _warnings as warnings, };
export function initModels(sequelize) {
    const bans = _bans.initModel(sequelize);
    const kicks = _kicks.initModel(sequelize);
    const warnings = _warnings.initModel(sequelize);
    return {
        bans: bans,
        kicks: kicks,
        warnings: warnings,
    };
}
