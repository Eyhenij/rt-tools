import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { adminLabel, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { InvitesApiService } from '@rt/message-bus-admin/invites/api';
import { IInvite, InviteIssuedMapper, InviteShortMapper, INVITES_PATH } from '@rt/message-bus-admin/invites/util';
import { NotificationBus } from '@rt-tools/ui-kit-v2';
import { catchError, EMPTY, exhaustMap, map, Observable, Subject, tap } from 'rxjs';

/**
 * Список приглашений, выдача нового и отзыв одного из них.
 *
 * От общей основы отличается адресом операции, переводом строки, выдачей и отзывом: страницу,
 * порядок, гонку ответов и отказ чтения с повтором держит она.
 *
 * Выдача отвечает потоком, а отзыв — нет, и разница не случайна: выдачу зовёт панель, и код ей
 * нужен ответом, а отзыв зовёт меню строки, которому от ответа ничего не надо. Занятость панели
 * и текст её отказа держит основа панели, поэтому здесь их нет.
 *
 * Отзыв — правка над уже лежащей записью приёмника. `exhaustMap`, а не
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
    readonly #issuedMapper: InviteIssuedMapper = new InviteIssuedMapper();
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

    /**
     * Выдать приглашение на названное имя.
     *
     * Отвечает потоком: код приезжает ответом и нужен вызывающему — второго места, где его
     * взять, нет. Удавшаяся выдача перечитывает список: за время, пока панель была открыта,
     * соседние приглашения могли и погаснуть, и просрочиться.
     */
    public issue(name: string): Observable<IInvite.Issued.State> {
        return this.#api.issue(name).pipe(
            map((raw: IInvite.Issued.Api): IInvite.Issued.State => this.#issuedMapper.mapFrom(raw)),
            tap((): void => this.retry())
        );
    }

    /** Отозвать приглашение. Что делать с ещё не отвеченным запросом, решает подписка. */
    public revoke(name: string): void {
        this.#revokeSource.next(name);
    }

    protected rowOf(raw: IInvite.Short.Api): IInvite.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
