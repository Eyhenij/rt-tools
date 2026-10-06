import { bootstrapApplication } from '@angular/platform-browser';

import { App } from './app/app';
import { appConfig, IEntrySettings } from './app/app.config';

/**
 * Где входить, админка спрашивает у приёмника до подъёма: модуль входа ставится с адресом
 * Keycloak, а внедрения зависимостей ещё нет. Копии адреса в сборке нет намеренно — Keycloak прода
 * стоит на отдельном сервере, и копия разошлась бы с приёмником.
 *
 * Отказ подъёма не перехватывается: перехваченный, он превращается в строку журнала браузера и
 * пустую страницу, а неперехваченный доходит до слушателей ошибок, объявленных в настройке
 * приложения, и виден целиком — со стеком и причиной.
 */
async function start(): Promise<void> {
    const answer: Response = await fetch('/api/auth/settings');
    if (!answer.ok) {
        throw new Error(`the receiver did not name where to sign in: ${answer.status}`);
    }
    const settings: IEntrySettings = (await answer.json()) as IEntrySettings;

    await bootstrapApplication(App, appConfig(settings));
}

void start();
