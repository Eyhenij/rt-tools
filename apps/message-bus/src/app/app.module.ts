import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { ObservationsModule } from '@rt/message-bus-api/observations/feature';
import { PrismaModule } from '@rt/message-bus-api/persistence/feature';
import { PostmortemsModule } from '@rt/message-bus-api/postmortems/feature';
import { ProposalsModule } from '@rt/message-bus-api/proposals/feature';
import { TreesModule } from '@rt/message-bus-api/trees/feature';

import { HealthController } from './health/health.controller';
import { IntakeFailureFilter } from './intake-failure.filter';

/**
 * Состав приёмника.
 *
 * Домен деревьев подключается раньше доменов груза, потому что он ставит проверку токена на всё
 * приложение: она закрыта по умолчанию, и операция, объявленная позже, закрыта с того мгновения,
 * как объявлена.
 *
 * Разбор отказов ставится приложением, а не доменом: три операции решали бы порознь, что считать
 * поломкой хранилища, и разошлись бы на первой же незнакомой ошибке.
 */
@Module({
    imports: [PrismaModule, TreesModule, ObservationsModule, ProposalsModule, PostmortemsModule],
    controllers: [HealthController],
    providers: [{ provide: APP_FILTER, useClass: IntakeFailureFilter }],
})
export class AppModule {}
