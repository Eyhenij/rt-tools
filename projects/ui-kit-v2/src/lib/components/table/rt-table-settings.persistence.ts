import { DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { mergeMap, Observable, Subject } from 'rxjs';

import { IDBStorageService } from '@rt-tools/core';

import { ERtStorageKeys } from '../../platform';
import { IRtTable } from './rt-table.model';

/** Запрос на запись настроек колонок — то, что уезжает в объявленный поток записи. */
interface IRtTablePersistRequest {
    tableId: string;
    settings: IRtTable.ColumnSettings;
}

/** Ключ настроек одной таблицы в хранилище браузера. */
function settingsKey(tableId: string): string {
    return `${ERtStorageKeys.TableColumnsPrefix}${tableId}`;
}

/**
 * Хранение настроек колонок одной таблицы.
 *
 * Запись объявлена одним потоком, а не подпиской в методе: запросы приходят по одному на
 * каждое движение панели настроек, и каждый из них — своя независимая запись. Зависимости
 * приходят доводами, потому что заводится это в конструкторе компонента, где внедрение уже
 * доступно, а сам класс службой не объявлен — он живёт ровно столько, сколько таблица.
 */
export class RtTableSettingsPersistence {
    readonly #storage: IDBStorageService<IRtTable.ColumnSettings>;
    readonly #requestsSource: Subject<IRtTablePersistRequest> = new Subject<IRtTablePersistRequest>();

    constructor(storage: IDBStorageService<IRtTable.ColumnSettings>, destroyRef: DestroyRef) {
        this.#storage = storage;
        this.#requestsSource
            .pipe(
                mergeMap((request: IRtTablePersistRequest): Observable<void> =>
                    this.#storage.set(settingsKey(request.tableId), request.settings)
                ),
                takeUntilDestroyed(destroyRef)
            )
            .subscribe();
    }

    /** Сохранённые настройки этой таблицы. Записи может не быть — тогда применять нечего. */
    public load(tableId: string): Observable<IRtTable.ColumnSettings | undefined> {
        return this.#storage.get(settingsKey(tableId));
    }

    /** Кладёт настройки в очередь записи: сама запись идёт объявленным потоком. */
    public save(tableId: string, settings: IRtTable.ColumnSettings): void {
        this.#requestsSource.next({ tableId, settings });
    }
}
