import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { TreeTokenGuard } from './tree-token.guard';

/**
 * Проверка токена ставится на всё приложение сразу, а не на каждый контроллер приёма.
 *
 * Так операция закрыта с того мгновения, как объявлена: чтобы открыть её, нужно написать
 * `@Public()`, а чтобы закрыть — не нужно ничего. При обратном порядке новая операция уезжала
 * бы наружу открытой ровно до того дня, когда кто-нибудь это заметит.
 *
 * Модуль подключается приложением: цепочка проверок — его решение, а не решение домена.
 */
const OWN_PROVIDERS: Provider[] = [TreeTokenGuard, { provide: APP_GUARD, useExisting: TreeTokenGuard }];

@Module({
    providers: OWN_PROVIDERS,
    exports: [TreeTokenGuard],
})
export class TreesModule {}
