import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AccessModule } from '@rt/message-bus-api/access/feature';
import { AccountsModule } from '@rt/message-bus-api/accounts/feature';
import { ObservationsModule } from '@rt/message-bus-api/observations/feature';
import { AppLoggerService } from '@rt/message-bus-api/observability/feature';
import { PrismaModule } from '@rt/message-bus-api/persistence/feature';
import { PostmortemsModule } from '@rt/message-bus-api/postmortems/feature';
import { ProposalsModule } from '@rt/message-bus-api/proposals/feature';
import { TreesModule } from '@rt/message-bus-api/trees/feature';

import { HealthController } from './health/health.controller';
import { FailureFilter } from './failure.filter';

/**
 * Состав приёмника.
 *
 * Домен объявления доступа подключается раньше остальных, потому что он ставит единственную
 * проверку на всё приложение: она закрыта по умолчанию, и операция, объявленная позже, закрыта с
 * того мгновения, как объявлена.
 *
 * Разбор отказов ставится приложением, а не доменом: операции решали бы порознь, что считать
 * поломкой хранилища, и разошлись бы на первой же незнакомой ошибке.
 *
 * Журнал объявлен здесь же, а его вид выбирает точка входа: строку пишут и домены, и сам
 * каркас, и вторая служба журнала рядом писала бы вывод, расходящийся с первым.
 */
@Module({
    imports: [PrismaModule, AccessModule, AccountsModule, ObservationsModule, ProposalsModule, PostmortemsModule, TreesModule],
    controllers: [HealthController],
    providers: [AppLoggerService, { provide: APP_FILTER, useClass: FailureFilter }],
})
export class AppModule {}
