import { Module } from '@nestjs/common';

import { TreeCommandsService } from './tree-commands.service';

/**
 * Команды деревьев подключаются отдельно от проверки токена.
 *
 * Проверка ставится на всё приложение и живёт в `TreesModule`; команды каркаса отдачи не
 * касаются вовсе — их поднимают без единой операции запроса. Один модуль на двоих привёл бы
 * глобальную проверку туда, где нет ни запросов, ни того, что она защищает.
 */
@Module({
    providers: [TreeCommandsService],
    exports: [TreeCommandsService],
})
export class TreeCommandsModule {}
