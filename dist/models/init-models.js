import { Bans as _Bans } from "./Bans.js";
import { Kicks as _Kicks } from "./Kicks.js";
export { _Bans as Bans, _Kicks as Kicks, };
export function initModels(sequelize) {
    const Bans = _Bans.initModel(sequelize);
    const Kicks = _Kicks.initModel(sequelize);
    return {
        Bans: Bans,
        Kicks: Kicks,
    };
}
