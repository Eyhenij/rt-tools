import { Module } from '@nestjs/common';

import { TreesReadController } from './trees-read.controller';

/**
 * Деревья, какими их видит админка: список имён и признаков для отбора.
 *
 * Отдельно от `TreeCommandsModule` потому, что команды каркаса отдачи не касаются вовсе — их
 * поднимают без единой операции запроса. Один модуль на двоих принёс бы контроллер туда, где
 * порт не слушают.
 */
@Module({
    controllers: [TreesReadController],
})
export class TreesModule {}
