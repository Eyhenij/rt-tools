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
export abstract class AdminListStoreBase<TRow> extends BaseAsyncStoreService<IAdminListState<TRow>, TAdminListMessage> {
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
                switchMap((query: IAdminListQuery): Observable<IPage<TRow>> =>
                    readPage<TRow>(this.#http, this.path, query).pipe(
                        tap((page: IPage<TRow>): void => {
                            this.patchState((state: IAdminListState<TRow>) => ({ ...state, rows: page.rows, total: page.total }));
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

    /** Отказ в состояние. Строки прежнего чтения снимаются: показанное под отказом — ложь. */
    #refuse(fault: IReadFault): void {
        this.patchState((state: IAdminListState<TRow>) => ({ ...state, rows: [], total: 0, fault }));
        this.setLoadingFailure();
    }
}
