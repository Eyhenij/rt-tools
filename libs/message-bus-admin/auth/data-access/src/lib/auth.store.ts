import { computed, inject, Injectable, Signal } from '@angular/core';
import { ICaller } from '@rt-tools/auth-contract';
import { RtAuthService } from '@rt-tools/auth-angular';
import { IAdminSession } from '@rt/message-bus-admin/auth/util';

/**
 * Вошедший админки — тот, кого назвал Keycloak.
 *
 * Вход, его продление и выход ведёт модуль входа; здесь вошедший только переводится в слова
 * админки: имя для шапки и права для меню, стражей и кнопок. Права — роли клиента шины в токене,
 * приёмник читает их из того же токена, и второго источника у них нет.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
    readonly #auth: RtAuthService = inject(RtAuthService);

    public readonly session: Signal<IAdminSession | null> = computed((): IAdminSession | null => {
        const caller: ICaller | null = this.#auth.caller();

        return caller ? { name: caller.name ?? caller.email ?? caller.subject, rights: [...caller.permissions] } : null;
    });

    public readonly signedIn: Signal<boolean> = this.#auth.authenticated;

    /** Права вошедшего, как их выдал Keycloak. У невошедшего их нет ни одного. */
    public readonly rights: Signal<readonly string[]> = computed((): readonly string[] => this.session()?.rights ?? []);

    /** Известны ли права. Подъём ждёт ответа Keycloak, так что у вошедшего они известны всегда. */
    public readonly rightsKnown: Signal<boolean> = this.signedIn;

    /**
     * Показывать ли то, что закрыто правом.
     *
     * Пока вошедшего нет, не скрывается ничего: страж входа уводит такого человека в Keycloak
     * раньше, чем меню успевает что-то спрятать. Закрывает раздел приёмник, а этот ответ решает
     * только, показывать ли пункт.
     */
    public allows(right: string): boolean {
        return !this.rightsKnown() || this.rights().includes(right);
    }

    /** Выход обрывает вход в Keycloak и возвращает человека на его экран входа. */
    public signOut(): Promise<void> {
        return this.#auth.logout();
    }
}
