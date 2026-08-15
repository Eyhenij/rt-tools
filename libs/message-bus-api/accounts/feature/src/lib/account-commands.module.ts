import { Module } from '@nestjs/common';

import { AccountCommandsService } from './account-commands.service';

/**
 * Команды учётных записей отдельным модулем: строка запуска поднимает контекст без каркаса
 * отдачи, и контроллеры входа ей не нужны вовсе.
 */
@Module({
    providers: [AccountCommandsService],
    exports: [AccountCommandsService],
})
export class AccountCommandsModule {}
