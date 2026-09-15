import { HttpClient } from '@angular/common/http';
import { computed, inject, Signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { readPage } from '@rt/message-bus-admin/common/core/api';
import { IAdminListQuery, IReadFault } from '@rt/message-bus-admin/common/core/util';
import { IPage } from '@rt/message-bus-common';
import { BASE_INITIAL_STATE, BaseAsyncStoreService, IStateBase } from '@rt-tools/store';
import { catchError, EMPTY, Observable, Subject, switchMap, tap } from 'rxjs';

/** Что знает списочный экран: строки, сколько их всего, чем читались и чем кончилось чтение. */
export interface IAdminListState<TRow> extends IStateBase.Async {
    rows: readonly TRow[];
    total: number;
    /** Выборка, которой читали. Пусто — не читали ещё ни разу. */
    query: IAdminListQuery | null;
    fault: IReadFault | null;
}

/** Сообщения шины стора: по ним экран узнаёт, что страница прочитана. */
export type TAdminListMessage = 'page-read';

/** Начальное состояние. Общее всем разделам: расходиться в нём нечему. */
export function initialListState<TRow>(): IAdminListState<TRow> {
    return { ...BASE_INITIAL_STATE.ASYNC, rows: [], total: 0, query: null, fault: null };
}

/**
 * Общая основа списочного стора: чтение страницы, её состояние и отказ.
 *
 * Наследнику остаётся назвать адрес операции — всё остальное здесь. Три раздела читают груз
 * одним и тем же способом, и переписанное заново расходилось бы молча: у одного отбор пережил
 * бы гонку ответов, у другого нет.
 *
 * Запросы складываются в источник действия, а подписка объявлена один раз, в конструкторе.
 * `switchMap`, а не `exhaustMap`: человек меняет отбор, не дожидаясь ответа, и показать он хочет
 * последний названный, а не первый запрошенный. Ответ, догнавший свой список позже, до состояния
 * не доходит вовсе — его гасит сам оператор.
 */
export abstract class AdminListStoreBase<TRow, TApi = TRow> extends BaseAsyncStoreService<IAdminListState<TRow>, TAdminListMessage> {
    readonly #http: HttpClient = inject(HttpClient);
    readonly #readSource: Subject<IAdminListQuery> = new Subject<IAdminListQuery>();

    /** Адрес операции чтения списка: `/api/postmortems` и подобные. Называет наследник. */
    protected abstract readonly path: string;

    public readonly rows: Signal<readonly TRow[]> = computed(() => this.store().rows);
    public readonly total: Signal<number> = computed(() => this.store().total);
    public readonly query: Signal<IAdminListQuery | null> = computed(() => this.store().query);
    public readonly fault: Signal<IReadFault | null> = computed(() => this.store().fault);

    protected constructor() {
        super(initialListState<TRow>());

        this.#readSource
            .pipe(
                tap((query: IAdminListQuery): void => {
                    this.patchState((state: IAdminListState<TRow>) => ({ ...state, query, fault: null }));
                    this.startLoading();
                }),
                switchMap((query: IAdminListQuery): Observable<IPage<TApi>> =>
                    readPage<TApi>(this.#http, this.path, query).pipe(
                        tap((page: IPage<TApi>): void => {
                            const rows: readonly TRow[] = page.rows.map((raw: TApi): TRow => this.rowOf(raw));

                            this.patchState((state: IAdminListState<TRow>) => ({ ...state, rows, total: page.total }));
                            this.pageRead(page);
                            this.setLoadingSuccess();
                            this.dispatch({ type: 'page-read' });
                        }),
                        catchError((fault: IReadFault): Observable<never> => {
                            this.#refuse(fault);

                            return EMPTY;
                        })
                    )
                ),
                takeUntilDestroyed()
            )
            .subscribe();
    }

    /**
     * Прочитать страницу. Что делать с незавершённым запросом, решает подписка, а не вызывающий.
     *
     * Строки прежней выборки при этом остаются на экране до ответа: убранные сразу, они дают
     * мигание пустотой на каждом переходе по страницам.
     */
    public read(query: IAdminListQuery): void {
        this.#readSource.next(query);
    }

    /**
     * Повторить последнее чтение — то самое «одним действием», которого просит отказ.
     *
     * Не читавшийся ещё стор молчит: повторять нечего, и выдуманная выборка показала бы не то,
     * за чем человек пришёл.
     */
    public retry(): void {
        const asked: IAdminListQuery | null = this.query();

        if (asked !== null) {
            this.#readSource.next(asked);
        }
    }

    /**
     * Страница прочитана — для раздела, чей ответ несёт сверх строк и общего числа что-то своё.
     *
     * Разделу использования приёмник называет период, который считал, и экран показывает его в
     * отборе; остальным разделам ответ ничего сверх строк не приносит, и они не переопределяют
     * ничего. Зовётся до сообщения о прочитанной странице: тот, кто ждёт сообщения, видит уже
     * положенное.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, sonarjs/no-unused-function-argument -- параметр объявлен ради наследника: основа сама из страницы не читает ничего
    protected pageRead(page: IPage<TApi>): void {}

    /**
     * Перевод строки ответа в строку экрана.
     *
     * Стоит основой, а не своим чтением у каждого раздела: перевод обязан случиться до того, как
     * строки лягут в состояние, — иначе на экран попадает приехавшее по сети, со временем строкой
     * и полями контракта. Разделу, которому переводить нечего, остаётся вернуть пришедшее.
     */
    protected abstract rowOf(raw: TApi): TRow;

    /**
     * Отказ в состояние. Строки прежнего чтения снимаются: показанное под отказом — ложь.
     *
     * Основа зовётся без оповещения: отказ чтения человек видит на месте списка вместе с
     * повтором, а строка в журнале браузера рядом с ним ничего не прибавляет.
     */
    #refuse(fault: IReadFault): void {
        this.patchState((state: IAdminListState<TRow>) => ({ ...state, rows: [], total: 0, fault }));
        this.setLoadingFailureVoid(fault, { showNotification: false });
    }
}
