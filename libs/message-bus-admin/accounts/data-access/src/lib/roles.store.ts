import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RolesApiService } from '@rt/message-bus-admin/accounts/api';
import { IRole, ROLES_PATH, RoleShortMapper } from '@rt/message-bus-admin/accounts/util';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { AdminTextService, spokenFaultText } from '@rt/message-bus-admin/common/core/util';
import { IRoleInput, IRoleView } from '@rt/message-bus-common';
import { NotificationBus } from '@rt-tools/ui-kit-v2';
import { catchError, EMPTY, exhaustMap, map, Observable, Subject, tap } from 'rxjs';

/**
 * Список ролей приёмника, одна роль для панели, заведение, правка и удаление.
 *
 * От общей основы отличается адресом операции, переводом строки и тремя правками: страницу,
 * порядок, гонку ответов и отказ чтения с повтором держит она.
 *
 * Заведение и правка отвечают потоком, а удаление — нет, и разница не случайна: первые два зовёт
 * панель, и исход ей нужен ответом — занятость панели и текст её отказа держит основа панели;
 * удаление зовёт меню строки, которому от ответа ничего не надо.
 *
 * Удаление — правка над уже лежащей записью. `exhaustMap`, а не `switchMap`: два нажатия подряд
 * не должны давать два запроса — второе удаление отвечает «не найдено» на удавшееся первое.
 *
 * Об исходе говорит общая шина оповещений, а не своя разметка экрана. Всякая удавшаяся правка
 * перечитывает список целиком: число людей у ролей и их состав могли смениться.
 *
 * Один экземпляр на приложение: список читает экран, а правки зовут его панель и меню строки.
 */
@Injectable({ providedIn: 'root' })
export class RolesStore extends AdminListStoreBase<IRole.Short.State, IRole.Short.Api> {
    readonly #api: RolesApiService = inject(RolesApiService);
    readonly #text: AdminTextService = inject(AdminTextService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #mapper: RoleShortMapper = new RoleShortMapper();
    readonly #removeSource: Subject<IRole.Short.State> = new Subject<IRole.Short.State>();

    protected readonly path: string = ROLES_PATH;

    constructor() {
        super();

        this.#removeSource
            .pipe(
                exhaustMap((role: IRole.Short.State): Observable<unknown> =>
                    this.#api.remove(role.key).pipe(
                        tap((): void => {
                            this.#notifications.success(this.#text.text('roleDeleteDone', { name: role.name }));
                            this.retry();
                        }),
                        catchError((fault: unknown): Observable<never> => {
                            // Слово приёмника — роль держат, роли нет — уходит в тост как есть:
                            // повторить человек может тем же пунктом, а причину должен прочитать сразу
                            this.#notifications.error(spokenFaultText(fault, this.#text.text('roleDeleteFailed')));

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Одна роль по ключу — для панели, открытой по адресу. */
    public one(key: string): Observable<IRole.Short.State> {
        return this.#api.one(key).pipe(map((raw: IRole.Short.Api): IRole.Short.State => this.#mapper.mapFrom(raw)));
    }

    /** Все роли разом — для выбора роли человеку. */
    public all(): Observable<readonly IRole.Short.State[]> {
        return this.#api
            .all()
            .pipe(
                map((rows: readonly IRoleView[]): readonly IRole.Short.State[] =>
                    rows.map((raw: IRoleView): IRole.Short.State => this.#mapper.mapFrom(raw))
                )
            );
    }

    /** Завести роль. Удавшееся заведение перечитывает список: новая строка встаёт в него сразу. */
    public create(role: IRoleInput): Observable<IRole.Short.State> {
        return this.#api.create(role).pipe(
            map((raw: IRole.Short.Api): IRole.Short.State => this.#mapper.mapFrom(raw)),
            tap((): void => this.retry())
        );
    }

    /** Сменить имя и права роли. Список перечитывается: пока панель была открыта, строки могли смениться. */
    public replace(key: string, role: IRoleInput): Observable<IRole.Short.State> {
        return this.#api.replace(key, role).pipe(
            map((raw: IRole.Short.Api): IRole.Short.State => this.#mapper.mapFrom(raw)),
            tap((): void => this.retry())
        );
    }

    /** Удалить роль. Что делать с ещё не отвеченным запросом, решает подписка. */
    public remove(role: IRole.Short.State): void {
        this.#removeSource.next(role);
    }

    protected rowOf(raw: IRole.Short.Api): IRole.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
