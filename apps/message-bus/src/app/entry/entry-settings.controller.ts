import { Controller, Get, Inject } from '@nestjs/common';

import { PublicOperation } from '@rt/message-bus-api/access/util';
import { AUTH_SERVER_OPTIONS, clientSettingsOf, IAuthClientSettings, IAuthServerOptions } from '@rt-tools/auth-server';

/**
 * С чем админка входит в Keycloak: адрес, область и клиент — те же, чьи токены проверяет приёмник.
 *
 * Админка спрашивает их при запуске, а не держит свою копию в сборке: Keycloak прода стоит на
 * отдельном сервере, и копия в странице разошлась бы с приёмником при первом же переезде. Открыта
 * без токена: токен и получают по этим настройкам. Секретов в ответе нет — клиент публичный.
 */
@Controller('auth')
export class EntrySettingsController {
    readonly #settings: IAuthClientSettings;

    constructor(@Inject(AUTH_SERVER_OPTIONS) options: IAuthServerOptions) {
        this.#settings = clientSettingsOf(options);
    }

    @Get('settings')
    @PublicOperation()
    public settings(): IAuthClientSettings {
        return this.#settings;
    }
}
