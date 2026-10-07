import { describe, expect, it } from 'vitest';

import { RIGHTS } from '@rt/message-bus-common';

import { EntrySettingsController } from './entry-settings.controller';

describe('настройки входа админки', () => {
    it('SC-MB-417 — называют Keycloak, область и клиент, чьи токены проверяет приёмник', () => {
        const controller: EntrySettingsController = new EntrySettingsController({
            issuer: 'https://sso.test/realms/rt',
            clientId: 'rt-message-bus-admin',
            catalog: RIGHTS,
        });

        expect(controller.settings()).toEqual({ url: 'https://sso.test', realm: 'rt', clientId: 'rt-message-bus-admin' });
    });

    it('SC-MB-417 — в ответе нет ничего сверх трёх полей', () => {
        const controller: EntrySettingsController = new EntrySettingsController({
            issuer: 'https://sso.test/realms/rt',
            clientId: 'rt-message-bus-admin',
            catalog: RIGHTS,
            sync: { baseUrl: 'https://sso.test', realm: 'rt', syncClientId: 'rt-catalog-sync', syncClientSecret: 'secret' },
        });

        expect(Object.keys(controller.settings()).sort()).toEqual(['clientId', 'realm', 'url']);
    });
});
