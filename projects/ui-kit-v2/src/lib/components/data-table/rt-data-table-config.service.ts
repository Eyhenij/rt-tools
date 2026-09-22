import { DestroyRef, Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject } from 'rxjs';
import { concatMap, map, switchMap, take } from 'rxjs/operators';

import { IDBStorageService } from '@rt-tools/core';
import { areArraysEqual, TNullable } from '@rt-tools/utils';

import { IRtDataTable } from './rt-data-table.model';

/** Настройка, как её держит хранилище: столбцы там лежат частичными. Форма — первого кита. */
interface IStoredConfig<ENTITY_TYPE> {
    isVerticalScrollbarShown: boolean;
    isHorizontalScrollbarShown: boolean;
    columns: Array<Partial<IRtDataTable.Column<ENTITY_TYPE>>>;
}

/** Просьба чтения: с каким составом столбцов сверять прочитанное. */
interface IConfigRead<ENTITY_TYPE> {
    readonly storageKey: string;
    readonly config: Array<IRtDataTable.Column<ENTITY_TYPE>>;
}

/** Просьба записи или снятия: обе идут одним потоком, чтобы не разойтись порядком. */
type TConfigWrite<ENTITY_TYPE> =
    | { readonly kind: 'set'; readonly storageKey: string; readonly config: IRtDataTable.Config.Data<ENTITY_TYPE> }
    | { readonly kind: 'remove'; readonly storageKey: string };

/**
 * Порядок имён колонок для сверки двух наборов.
 *
 * Какой именно порядок, значения не имеет: оба набора выстраиваются одним и тем же и сравниваются
 * на равенство. Важно лишь, чтобы порядок был один и не зависел от вида значения, — умолчание
 * `sort()` приводит элементы к строке по-своему и на числовых ключах даёт лексикографический.
 */
export function comparePropNames(a: PropertyKey | undefined, b: PropertyKey | undefined): number {
    return String(a).localeCompare(String(b));
}

/**
 * Настройки таблицы в хранилище браузера: порядок и видимость столбцов, полосы прокрутки.
 *
 * Перенесено из первого кита как есть: ключ — тот, что дало приложение, форма записи — та же.
 * Поэтому настройки, сохранённые таблицей первого кита, читаются здесь без переделки.
 */
@Injectable()
export class RtDataTableConfigService<ENTITY_TYPE> {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #iDBStorageService: IDBStorageService<IStoredConfig<ENTITY_TYPE>> = inject(IDBStorageService);

    /** Просьбы прочитать сохранённую настройку. */
    readonly #readSource: Subject<IConfigRead<ENTITY_TYPE>> = new Subject<IConfigRead<ENTITY_TYPE>>();

    /** Просьбы записать и снять настройку — один источник на оба действия. */
    readonly #writeSource: Subject<TConfigWrite<ENTITY_TYPE>> = new Subject<TConfigWrite<ENTITY_TYPE>>();

    readonly #tableConfig: WritableSignal<IRtDataTable.Config.Data<ENTITY_TYPE>> = signal({
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: false,
        columns: [],
    });
    public readonly tableConfig: Signal<IRtDataTable.Config.Data<ENTITY_TYPE>> = this.#tableConfig.asReadonly();

    /**
     * Потоки чтения и записи объявлены один раз, а методы только толкают в них просьбы.
     *
     * Чтение — `switchMap`: отвечает последний вызов, потому что настройка, прочитанная под
     * прежний состав столбцов, к нынешнему уже не относится. Запись и снятие — один поток и
     * `concatMap`: разведённые по двум, они теряют порядок между собой, и снятие, обогнавшее
     * запись, оставляет в хранилище снятое.
     */
    constructor() {
        this.#readSource
            .pipe(
                switchMap((read: IConfigRead<ENTITY_TYPE>): Observable<IRtDataTable.Config.Data<ENTITY_TYPE>> =>
                    this.#iDBStorageService.get(read.storageKey).pipe(
                        take(1),
                        map((savedConfig: TNullable<IStoredConfig<ENTITY_TYPE>>): IRtDataTable.Config.Data<ENTITY_TYPE> =>
                            this.#configOf(read.config, savedConfig)
                        )
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((config: IRtDataTable.Config.Data<ENTITY_TYPE>) => {
                this.#tableConfig.set(config);
            });

        this.#writeSource
            .pipe(
                concatMap((write: TConfigWrite<ENTITY_TYPE>): Observable<unknown> => this.#writeOf(write).pipe(take(1))),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe();
    }

    public initConfig(storageKey: string, config: Array<IRtDataTable.Column<ENTITY_TYPE>>): void {
        this.#readSource.next({ storageKey, config });
    }

    public updateConfig(storageKey: string, config: IRtDataTable.Config.Data<ENTITY_TYPE>): void {
        this.#writeSource.next({ kind: 'set', storageKey, config });
        this.#tableConfig.set(config);
    }

    public deleteConfig(storageKey: string): void {
        this.#writeSource.next({ kind: 'remove', storageKey });
    }

    /** Обращение к хранилищу под просьбу записи или снятия. */
    #writeOf(write: TConfigWrite<ENTITY_TYPE>): Observable<unknown> {
        if (write.kind === 'remove') {
            return this.#iDBStorageService.remove(write.storageKey);
        }

        const storedColumns: Array<Partial<IRtDataTable.Column<ENTITY_TYPE>>> = write.config.columns.map(
            (el: IRtDataTable.Column<ENTITY_TYPE>) => ({
                displayName: el.header.label ?? el.propName.toString(),
                propName: el.propName,
                width: el?.width ?? 'auto',
                orderIndex: el?.orderIndex ?? 0,
                hidden: !!el?.hidden,
                fixed: !!el?.fixed,
            })
        );

        return this.#iDBStorageService.set(write.storageKey, { ...write.config, columns: storedColumns });
    }

    /**
     * Настройка, которую показывает таблица: сохранённая, если она сходится с нынешним составом
     * столбцов, иначе — собранная из самого состава.
     */
    #configOf(
        config: Array<IRtDataTable.Column<ENTITY_TYPE>>,
        savedConfig: TNullable<IStoredConfig<ENTITY_TYPE>>
    ): IRtDataTable.Config.Data<ENTITY_TYPE> {
        if (!savedConfig?.columns || !this.#isSavedConfigConsistent(config, savedConfig.columns)) {
            return {
                isVerticalScrollbarShown: false,
                isHorizontalScrollbarShown: true,
                columns: config.map((el: IRtDataTable.Column<ENTITY_TYPE>, index: number) => ({
                    ...el,
                    orderIndex: index,
                    displayName: el?.header?.label?.length ? el.header.label : el.propName.toString(),
                })),
            };
        }

        const updatedColumns: Array<IRtDataTable.Column<ENTITY_TYPE>> = savedConfig.columns.map(
            (el: Partial<IRtDataTable.Column<ENTITY_TYPE>>): IRtDataTable.Column<ENTITY_TYPE> => {
                const declared: TNullable<IRtDataTable.Column<ENTITY_TYPE>> = config.find(
                    (item: IRtDataTable.Column<ENTITY_TYPE>) => el.propName === item.propName
                );

                return {
                    // Сверка составов выше гарантирует, что столбец с этим именем объявлен.
                    ...(declared as IRtDataTable.Column<ENTITY_TYPE>),
                    displayName: declared?.header?.label?.length ? declared.header.label : el?.propName?.toString(),
                    propName: el.propName as keyof ENTITY_TYPE,
                    width: el?.width ?? 'auto',
                    orderIndex: el?.orderIndex ?? 0,
                    hidden: !!el?.hidden,
                    fixed: !!el?.fixed,
                };
            }
        );

        return {
            isVerticalScrollbarShown: !!savedConfig?.isVerticalScrollbarShown,
            isHorizontalScrollbarShown: !!savedConfig?.isHorizontalScrollbarShown,
            columns: updatedColumns,
        };
    }

    #isSavedConfigConsistent(
        declared: Array<IRtDataTable.Column<ENTITY_TYPE>>,
        saved: Array<Partial<IRtDataTable.Column<ENTITY_TYPE>>>
    ): boolean {
        return (
            !!declared?.length &&
            !!saved?.length &&
            declared.length === saved.length &&
            areArraysEqual(
                declared.map((el: IRtDataTable.Column<ENTITY_TYPE>) => el.propName).toSorted(comparePropNames),
                saved.map((el: Partial<IRtDataTable.Column<ENTITY_TYPE>>) => el.propName).toSorted(comparePropNames)
            )
        );
    }
}
