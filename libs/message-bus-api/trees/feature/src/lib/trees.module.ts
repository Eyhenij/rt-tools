import { Module } from '@nestjs/common';

import { AccessModule } from '@rt/message-bus-api/access/feature';

import { EnrollController } from './enroll.controller';
import { InvitesReadController } from './invites-read.controller';
import { TreesReadController } from './trees-read.controller';

/**
 * Деревья, какими их видит админка: список имён и признаков для отбора.
 *
 * Отдельно от `TreeCommandsModule` потому, что команды каркаса отдачи не касаются вовсе — их
 * поднимают без единой операции запроса. Один модуль на двоих принёс бы контроллер туда, где
 * порт не слушают.
 */
@Module({
    imports: [AccessModule],
    controllers: [TreesReadController, EnrollController, InvitesReadController],
})
export class TreesModule {}
