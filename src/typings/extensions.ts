'use strict';

import { Client, CommandInteraction, ModalSubmitInteraction, ModalSubmitFields, ApplicationCommand } from 'discord.js';
import { initModels } from '../models/init-models.js';
import { Sequelize } from 'sequelize';

class FunctionFile {
  declare name: string;
  declare run: (client: string, ...args: unknown[]) => Promise<void>;
}
class CommandFile {
  declare name: string;
  declare data: ApplicationCommand;
  declare run: (
    client: Client,
    interaction: CommandInteraction,
    options: CommandInteraction['options']
  ) => Promise<void>;
}
class ModalFile {
  declare name: string;
  declare run: (client: Client, interaction: ModalSubmitInteraction, fields: ModalSubmitFields) => Promise<void>;
}
class CustomClient extends Client {
  declare commands: Map<string, CommandFile>;
  declare modals: Map<string, ModalFile>;
  declare functions: Map<string, FunctionFile>;
  declare sequelize: Sequelize;
  declare models: ReturnType<typeof initModels>;
}

export { CustomClient };
