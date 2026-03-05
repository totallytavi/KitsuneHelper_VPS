import { type Client, type Collection } from 'discord.js';
import { type Sequelize } from 'sequelize';

export interface KitsuneClient extends Client {
  commands: Collection<string, any>;
  sequelize: Sequelize;
  models: ReturnType<typeof import('./models/init-models.ts').initModels>;
}