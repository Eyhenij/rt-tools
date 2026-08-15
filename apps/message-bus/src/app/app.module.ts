import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AccessModule } from '@rt/message-bus-api/access/feature';
import { AccountsModule } from '@rt/message-bus-api/accounts/feature';
import { ObservationsModule } from '@rt/message-bus-api/observations/feature';
import { PrismaModule } from '@rt/message-bus-api/persistence/feature';
import { PostmortemsModule } from '@rt/message-bus-api/postmortems/feature';
import { ProposalsModule } from '@rt/message-bus-api/proposals/feature';

import { HealthController } from './health/health.controller';
import { IntakeFailureFilter } from './intake-failure.filter';

/**
 * Состав приёмника.
 *
 * Домен объявления доступа подключается раньше остальных, потому что он ставит единственную
 * проверку на всё приложение: она закрыта по умолчанию, и операция, объявленная позже, закрыта с
 * того мгновения, как объявлена.
 *
 * Разбор отказов ставится приложением, а не доменом: три операции решали бы порознь, что считать
 * поломкой хранилища, и разошлись бы на первой же незнакомой ошибке.
 */
@Module({
    imports: [PrismaModule, AccessModule, AccountsModule, ObservationsModule, ProposalsModule, PostmortemsModule],
    controllers: [HealthController],
    providers: [{ provide: APP_FILTER, useClass: IntakeFailureFilter }],
})
export class AppModule {}
