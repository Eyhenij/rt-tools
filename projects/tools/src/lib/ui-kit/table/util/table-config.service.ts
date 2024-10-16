import { DestroyRef, Injectable, Signal, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { take } from 'rxjs/operators';

import { IDBStorageService } from '../../../idb-storage';
import { Nullable } from '../../../util';
import { ITable } from './index';

@Injectable()
export class RtTableConfigService<ENTITY_TYPE> {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);
    readonly #iDBStorageService: IDBStorageService<{
        isVerticalScrollbarShown: boolean;
        isHorizontalScrollbarShown: boolean;
        columns: Array<Partial<ITable.Column<ENTITY_TYPE>>>;
    }> = inject(IDBStorageService);

    #tableConfig: WritableSignal<ITable.Config.Data<ENTITY_TYPE>> = signal({
        isVerticalScrollbarShown: false,
        isHorizontalScrollbarShown: false,
        columns: [],
    });
    public readonly tableConfig: Signal<ITable.Config.Data<ENTITY_TYPE>> = this.#tableConfig.asReadonly();

    public initConfig(storageKey: string, config: Array<ITable.Column<ENTITY_TYPE>>): void {
        this.#iDBStorageService
            .get(storageKey)
            .pipe(take(1), takeUntilDestroyed(this.#destroyRef))
            .subscribe(
                (
                    savedConfig: Nullable<{
                        isVerticalScrollbarShown: boolean;
                        isHorizontalScrollbarShown: boolean;
                        columns: Array<Partial<ITable.Column<ENTITY_TYPE>>>;
                    }>
                ) => {
                    if (savedConfig?.columns) {
                        const updatedColumns: Array<ITable.Column<ENTITY_TYPE> & { orderIndex: number }> = savedConfig?.columns.map(
                            (el: Partial<ITable.Column<ENTITY_TYPE> & { orderIndex: number }>) => {
                                const oldConfigIem: Nullable<ITable.Column<ENTITY_TYPE>> = config.find(
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
                        this.#tableConfig.set({
                            isVerticalScrollbarShown: !!savedConfig?.isVerticalScrollbarShown,
                            isHorizontalScrollbarShown: !!savedConfig?.isHorizontalScrollbarShown,
                            columns: updatedColumns,
                        });
                    } else {
                        this.#tableConfig.set({
                            isVerticalScrollbarShown: false,
                            isHorizontalScrollbarShown: true,
                            columns: config.map((el: ITable.Column<ENTITY_TYPE>, index: number) => ({
                                ...el,
                                orderIndex: index,
                                displayName: el?.header?.label?.length ? el.header.label : el.propName.toString(),
                            })),
                        });
                    }
                }
            );
    }

    public updateConfig(storageKey: string, config: ITable.Config.Data<ENTITY_TYPE>): void {
        const idbConfigColumns: Array<Partial<ITable.Column<ENTITY_TYPE>>> = config.columns.map((el: ITable.Column<ENTITY_TYPE>) => ({
            displayName: el.header.label ?? el.propName.toString(),
            propName: el.propName,
            width: el?.width ?? 'auto',
            orderIndex: el?.orderIndex ?? 0,
            hidden: !!el?.hidden,
            fixed: !!el?.fixed,
        }));
        this.#iDBStorageService
            .set(storageKey, { ...config, columns: idbConfigColumns })
            .pipe(take(1), takeUntilDestroyed(this.#destroyRef))
            .subscribe();
        this.#tableConfig.set(config);
    }

    public deleteConfig(storageKey: string): void {
        this.#iDBStorageService.remove(storageKey).pipe(take(1), takeUntilDestroyed(this.#destroyRef)).subscribe();
    }
}
