import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { authOptionsFromEnv, AuthServerModule } from '@rt-tools/auth-server';

import { AccessModule } from '@rt/message-bus-api/access/feature';
import { AccountsModule } from '@rt/message-bus-api/accounts/feature';
import { ChatModule } from '@rt/message-bus-api/chat/feature';
import { ObservationsModule } from '@rt/message-bus-api/observations/feature';
import { AppLoggerService } from '@rt/message-bus-api/observability/feature';
import { PrismaModule } from '@rt/message-bus-api/persistence/feature';
import { CargoStateModule } from '@rt/message-bus-api/cargo-state/feature';
import { PostmortemsModule } from '@rt/message-bus-api/postmortems/feature';
import { ProposalsModule } from '@rt/message-bus-api/proposals/feature';
import { TreesModule } from '@rt/message-bus-api/trees/feature';
import { RIGHTS } from '@rt/message-bus-common';

import { EntrySettingsController } from './entry/entry-settings.controller';
import { HealthController } from './health/health.controller';
import { FailureFilter } from './failure.filter';

/**
 * Состав приёмника.
 *
 * Модуль входа и домен объявления доступа подключаются раньше остальных: они ставят проверки на
 * всё приложение. Модуль проверяет токен Keycloak, домен — токен дерева; обе закрыты по
 * умолчанию, и операция, объявленная позже, закрыта с того мгновения, как объявлена.
 *
 * Разбор отказов ставится приложением, а не доменом: операции решали бы порознь, что считать
 * поломкой хранилища, и разошлись бы на первой же незнакомой ошибке.
 *
 * Журнал объявлен здесь же, а его вид выбирает точка входа: строку пишут и домены, и сам
 * каркас, и вторая служба журнала рядом писала бы вывод, расходящийся с первым.
 */
@Module({
    imports: [
        PrismaModule,
        AuthServerModule.forRoot(authOptionsFromEnv(process.env, RIGHTS)),
        AccessModule,
        AccountsModule,
        ObservationsModule,
        ProposalsModule,
        PostmortemsModule,
        CargoStateModule,
        TreesModule,
        ChatModule,
    ],
    controllers: [HealthController, EntrySettingsController],
    providers: [AppLoggerService, { provide: APP_FILTER, useClass: FailureFilter }],
})
export class AppModule {}
