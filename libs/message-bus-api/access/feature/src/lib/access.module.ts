import { Module, Provider } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';

import { AccessGuard } from './access.guard';

/**
 * Проверка доступа ставится на всё приложение сразу, а не на каждый контроллер.
 *
 * Так операция закрыта с того мгновения, как объявлена: чтобы её открыть, нужно написать метку,
 * а чтобы закрыть — не нужно ничего. При обратном порядке новая операция уезжала бы наружу
 * открытой ровно до того дня, когда кто-нибудь это заметит.
 *
 * Модуль подключается приложением: цепочка проверок — его решение, а не решение домена.
 */
const OWN_PROVIDERS: Provider[] = [AccessGuard, { provide: APP_GUARD, useExisting: AccessGuard }];

@Module({
    providers: OWN_PROVIDERS,
    exports: [AccessGuard],
})
export class AccessModule {}
