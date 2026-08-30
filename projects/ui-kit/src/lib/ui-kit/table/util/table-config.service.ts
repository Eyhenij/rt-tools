import { DestroyRef, Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Observable, Subject } from 'rxjs';
import { concatMap, map, switchMap, take } from 'rxjs/operators';

import { IDBStorageService } from '@rt-tools/core';
import { TNullable } from '@rt-tools/utils';
import { areArraysEqual } from '@rt-tools/utils';
import { ITable } from './table-column.interface';
import { comparePropNames } from './compare-prop-names';

/** Настройка, как её держит хранилище: столбцы там лежат частичными. */
interface IStoredConfig<ENTITY_TYPE> {
    isVerticalScrollbarShown: boolean;
    isHorizontalScrollbarShown: boolean;
    columns: Array<Partial<ITable.Column<ENTITY_TYPE>>>;
}

/** Просьба чтения: с каким составом столбцов сверять прочитанное. */
interface IConfigRead<ENTITY_TYPE> {
    readonly storageKey: string;
    readonly config: Array<ITable.Column<ENTITY_TYPE>>;
}

/** Просьба записи или снятия: обе идут одним потоком, чтобы не разойтись порядком. */
type TConfigWrite<ENTITY_TYPE> =
    | { readonly kind: 'set'; readonly storageKey: string; readonly config: ITable.Config.Data<ENTITY_TYPE> }
    | { readonly kind: 'remove'; readonly storageKey: string };

@Injectable()
export class RtTableConfigService<ENTITY_TYPE> {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #iDBStorageService: IDBStorageService<IStoredConfig<ENTITY_TYPE>> = inject(IDBStorageService);

    /** Просьбы прочитать сохранённую настройку. */
    readonly #readSource: Subject<IConfigRead<ENTITY_TYPE>> = new Subject<IConfigRead<ENTITY_TYPE>>();

    /** Просьбы записать и снять настройку — один источник на оба действия. */
    readonly #writeSource: Subject<TConfigWrite<ENTITY_TYPE>> = new Subject<TConfigWrite<ENTITY_TYPE>>();

    #tableConfig: WritableSignal<ITable.Config.Data<ENTITY_TYPE>> = signal({
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: false,
        columns: [],
    });
    public readonly tableConfig: Signal<ITable.Config.Data<ENTITY_TYPE>> = this.#tableConfig.asReadonly();

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
                switchMap((read: IConfigRead<ENTITY_TYPE>): Observable<ITable.Config.Data<ENTITY_TYPE>> =>
                    this.#iDBStorageService.get(read.storageKey).pipe(
                        take(1),
                        map((savedConfig: TNullable<IStoredConfig<ENTITY_TYPE>>): ITable.Config.Data<ENTITY_TYPE> =>
                            this.#configOf(read.config, savedConfig)
                        )
                    )
                ),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe((config: ITable.Config.Data<ENTITY_TYPE>) => {
                this.#tableConfig.set(config);
            });

        this.#writeSource
            .pipe(
                concatMap((write: TConfigWrite<ENTITY_TYPE>): Observable<unknown> => this.#writeOf(write).pipe(take(1))),
                takeUntilDestroyed(this.#destroyRef)
            )
            .subscribe();
    }

    public initConfig(storageKey: string, config: Array<ITable.Column<ENTITY_TYPE>>): void {
        this.#readSource.next({ storageKey, config });
    }

    public updateConfig(storageKey: string, config: ITable.Config.Data<ENTITY_TYPE>): void {
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

        const idbConfigColumns: Array<Partial<ITable.Column<ENTITY_TYPE>>> = write.config.columns.map((el: ITable.Column<ENTITY_TYPE>) => ({
            displayName: el.header.label ?? el.propName.toString(),
            propName: el.propName,
            width: el?.width ?? 'auto',
            orderIndex: el?.orderIndex ?? 0,
            hidden: !!el?.hidden,
            fixed: !!el?.fixed,
        }));

        return this.#iDBStorageService.set(write.storageKey, { ...write.config, columns: idbConfigColumns });
    }

    /**
     * Настройка, которую показывает таблица: сохранённая, если она сходится с нынешним составом
     * столбцов, иначе — собранная из самого состава.
     */
    #configOf(
        config: Array<ITable.Column<ENTITY_TYPE>>,
        savedConfig: TNullable<IStoredConfig<ENTITY_TYPE>>
    ): ITable.Config.Data<ENTITY_TYPE> {
        if (!savedConfig?.columns || !this.#checkIsSavedConfigConsistent(config, savedConfig.columns)) {
            return {
                isVerticalScrollbarShown: false,
                isHorizontalScrollbarShown: true,
                columns: config.map((el: ITable.Column<ENTITY_TYPE>, index: number) => ({
                    ...el,
                    orderIndex: index,
                    displayName: el?.header?.label?.length ? el.header.label : el.propName.toString(),
                })),
            };
        }

        const updatedColumns: Array<ITable.Column<ENTITY_TYPE> & { orderIndex: number }> = savedConfig.columns.map(
            (el: Partial<ITable.Column<ENTITY_TYPE> & { orderIndex: number }>) => {
                const oldConfigIem: TNullable<ITable.Column<ENTITY_TYPE>> = config.find(
                    (item: ITable.Column<ENTITY_TYPE>) => el.propName === item.propName
                );

                return {
                    ...(oldConfigIem as ITable.Column<ENTITY_TYPE>),
                    displayName: oldConfigIem?.header?.label?.length ? oldConfigIem.header.label : el?.propName?.toString(),
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

    #checkIsSavedConfigConsistent(
        defaultConfig: Array<ITable.Column<ENTITY_TYPE>>,
        savedConfig: Array<Partial<ITable.Column<ENTITY_TYPE>>>
    ): boolean {
        return (
            !!defaultConfig?.length &&
            !!savedConfig?.length &&
            defaultConfig.length === savedConfig.length &&
            areArraysEqual(
                defaultConfig.map((el: ITable.Column<ENTITY_TYPE>) => el.propName).toSorted(comparePropNames),
                savedConfig.map((el: Partial<ITable.Column<ENTITY_TYPE>>) => el.propName).toSorted(comparePropNames)
            )
        );
    }
}
