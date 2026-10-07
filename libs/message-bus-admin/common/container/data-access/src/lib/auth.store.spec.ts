import { computed, provideZonelessChangeDetection, signal, WritableSignal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ICaller, TPermission } from '@rt-tools/auth-contract';
import { RtAuthService } from '@rt-tools/auth-angular';

import { AuthStore } from './auth.store';

/** Модуль входа подменён: вошедшего называет Keycloak, и спека ставит его таким, каким его отдал бы токен. */
const caller: WritableSignal<ICaller | null> = signal<ICaller | null>(null);

describe('AuthStore', (): void => {
    let store: AuthStore;

    beforeEach((): void => {
        caller.set(null);
        TestBed.configureTestingModule({
            providers: [
                provideZonelessChangeDetection(),
                {
                    provide: RtAuthService,
                    useValue: {
                        caller,
                        authenticated: computed((): boolean => caller() !== null),
                        logout: (): Promise<void> => Promise.resolve(),
                    },
                },
            ],
        });
        store = TestBed.inject(AuthStore);
    });

    it('SC-MB-296 — права вошедшего — ровно роли клиента из его токена, имя — имя из токена', (): void => {
        const permissions: ReadonlySet<TPermission> = new Set<TPermission>(['postmortems:read', 'chat:read']);
        caller.set({ name: 'Анна', subject: 'p-1', email: 'anna@example.com', emailVerified: true, permissions });

        expect(store.session()).toEqual({ name: 'Анна', rights: ['postmortems:read', 'chat:read'] });
        expect(store.allows('chat:read')).toBe(true);
        expect(store.allows('invites:manage')).toBe(false);
    });

    it('SC-MB-296 — без имени в токене шапка называет почту', (): void => {
        caller.set({ name: null, subject: 'p-1', email: 'anna@example.com', emailVerified: true, permissions: new Set<TPermission>() });

        expect(store.session()?.name).toBe('anna@example.com');
    });

    it('SC-MB-301 — пока вошедшего нет, не скрывается ничего', (): void => {
        expect(store.allows('invites:manage')).toBe(true);
    });
});
