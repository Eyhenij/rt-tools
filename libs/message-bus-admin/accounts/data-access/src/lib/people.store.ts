import { inject, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PeopleApiService } from '@rt/message-bus-admin/accounts/api';
import { IPerson, PEOPLE_PATH, PersonShortMapper } from '@rt/message-bus-admin/accounts/util';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { adminLabel, spokenFaultText } from '@rt/message-bus-admin/common/core/util';
import { NotificationBus } from '@rt-tools/ui-kit-v2';
import { catchError, EMPTY, exhaustMap, map, Observable, Subject, tap } from 'rxjs';

/**
 * Список людей приёмника, заведение записи, новый пароль и отключение.
 *
 * От общей основы отличается адресом операции, переводом строки и тремя правками: страницу,
 * порядок, гонку ответов и отказ чтения с повтором держит она.
 *
 * Заведение и новый пароль отвечают потоком, а отключение — нет, и разница не случайна: первые
 * два зовёт панель, и исход ей нужен ответом — занятость панели и текст её отказа держит основа
 * панели; отключение зовёт меню строки, которому от ответа ничего не надо.
 *
 * Отключение — правка над уже лежащей записью. `exhaustMap`, а не `switchMap`: два нажатия
 * подряд не должны давать два запроса — первый уже отключает, а отключённое второй раз отвечает
 * отказом, и человек прочитал бы отказ на удавшееся действие.
 *
 * Об исходе говорит общая шина оповещений, а не своя разметка экрана. Всякая удавшаяся правка
 * перечитывает список целиком: за время, пока человек смотрел на экран, соседние записи могли
 * измениться тоже.
 *
 * Один экземпляр на приложение: список читает экран, а правки зовут его панели и меню строки.
 */
@Injectable({ providedIn: 'root' })
export class PeopleStore extends AdminListStoreBase<IPerson.Short.State, IPerson.Short.Api> {
    readonly #api: PeopleApiService = inject(PeopleApiService);
    readonly #notifications: NotificationBus = inject(NotificationBus);
    readonly #mapper: PersonShortMapper = new PersonShortMapper();
    readonly #disableSource: Subject<string> = new Subject<string>();

    protected readonly path: string = PEOPLE_PATH;

    constructor() {
        super();

        this.#disableSource
            .pipe(
                exhaustMap((name: string): Observable<unknown> =>
                    this.#api.disable(name).pipe(
                        tap((): void => {
                            this.#notifications.success(adminLabel('personDisableDone', { name }));
                            this.retry();
                        }),
                        catchError((fault: unknown): Observable<never> => {
                            // Слово приёмника — своя запись, уже отключённая — уходит в тост как
                            // есть: повторить человек может тем же пунктом меню, а причину должен
                            // прочитать сразу
                            this.#notifications.error(spokenFaultText(fault, adminLabel('personDisableFailed')));

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /** Завести запись. Удавшееся заведение перечитывает список: новая строка встаёт в него сразу. */
    public create(name: string, password: string): Observable<IPerson.Short.State> {
        return this.#api.create(name, password).pipe(
            map((raw: IPerson.Short.Api): IPerson.Short.State => this.#mapper.mapFrom(raw)),
            tap((): void => this.retry())
        );
    }

    /** Сменить пароль записи. Список перечитывается: пока панель была открыта, строки могли смениться. */
    public replacePassword(name: string, password: string): Observable<IPerson.Short.State> {
        return this.#api.replacePassword(name, password).pipe(
            map((raw: IPerson.Short.Api): IPerson.Short.State => this.#mapper.mapFrom(raw)),
            tap((): void => this.retry())
        );
    }

    /** Отключить запись. Что делать с ещё не отвеченным запросом, решает подписка. */
    public disable(name: string): void {
        this.#disableSource.next(name);
    }

    protected rowOf(raw: IPerson.Short.Api): IPerson.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
