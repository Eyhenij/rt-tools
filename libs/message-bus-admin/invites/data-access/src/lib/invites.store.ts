import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { adminLabel, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { InvitesApiService } from '@rt/message-bus-admin/invites/api';
import { IInvite, InviteShortMapper, INVITES_PATH } from '@rt/message-bus-admin/invites/util';
import { NotificationBus } from '@rt-tools/ui-kit-v2';
import { catchError, EMPTY, exhaustMap, Observable, Subject, tap } from 'rxjs';

/**
 * Список приглашений и отзыв одного из них.
 *
 * От общей основы отличается адресом операции, переводом строки и отзывом: страницу, порядок,
 * гонку ответов и отказ чтения с повтором держит она.
 *
 * Отзыв — единственная правка, которую админка делает над записями приёмника. `exhaustMap`, а не
 * `switchMap`: два нажатия подряд не должны давать два запроса — первый уже отзывает, а
 * отозванное второй раз отвечает «не найдено», и человек прочитал бы отказ на удавшееся
 * действие.
 *
 * Об исходе говорит общая шина оповещений, а не своя разметка экрана. Удавшийся отзыв
 * перечитывает список целиком: за время, пока человек смотрел на экран, соседние приглашения
 * могли и погаснуть, и просрочиться.
 *
 * Один экземпляр на приложение: список читает экран, а отзыв зовёт его же меню строки.
 */
@Injectable({ providedIn: 'root' })
export class InvitesStore extends AdminListStoreBase<IInvite.Short.State, IInvite.Short.Api> {
    readonly #api: InvitesApiService = inject(InvitesApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #mapper: InviteShortMapper = new InviteShortMapper();
    readonly #revokeSource: Subject<string> = new Subject<string>();

    protected readonly path: string = INVITES_PATH;

    constructor() {
        super();

        this.#revokeSource
            .pipe(
                exhaustMap((name: string): Observable<unknown> =>
                    this.#api.revoke(name).pipe(
                        tap((): void => {
                            this.#notifications.success(adminLabel('inviteRevokeDone', { name }));
                            this.retry();
                        }),
                        catchError((fault: IReadFault): Observable<never> => {
                            // Род отказа человеку ничего не прибавляет: отозвать не удалось, а
                            // повторить он может тем же пунктом меню. Номер обращения остаётся в
                            // журнале приёмника, и по нему поломка находится там.
                            this.#notifications.error(adminLabel('inviteRevokeFailed'), fault.kind);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Отозвать приглашение. Что делать с ещё не отвеченным запросом, решает подписка. */
    public revoke(name: string): void {
        this.#revokeSource.next(name);
    }

    protected rowOf(raw: IInvite.Short.Api): IInvite.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
