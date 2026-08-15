import { Module } from '@nestjs/common';

import { TreeCommandsService } from './tree-commands.service';

/**
 * Команды деревьев подключаются отдельно от операций запроса.
 *
 * Операции запроса живут в `TreesModule`; команды каркаса отдачи не касаются вовсе — их
 * поднимают без единой операции запроса, и порт при этом не слушают. Один модуль на двоих привёл
 * бы контроллер чтения туда, где нет ни запросов, ни того, что он отдаёт.
 */
@Module({
    providers: [TreeCommandsService],
    exports: [TreeCommandsService],
})
export class TreeCommandsModule {}
