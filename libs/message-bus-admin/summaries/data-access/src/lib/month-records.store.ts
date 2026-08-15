import { Injectable } from '@angular/core';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { IMonthRecord, MonthRecordShortMapper, SUMMARIES_PATH } from '@rt/message-bus-admin/summaries/util';

/**
 * Список записей месяца.
 *
 * От общей основы он отличается ровно двумя вещами — адресом операции и переводом строки:
 * страницу, порядок, отбор, гонку ответов и отказ с повтором держит она.
 *
 * Один экземпляр на приложение: список делят экран и панель подробностей, и закрытая панель
 * возвращает тот же список, а не перечитывает его заново.
 */
@Injectable({ providedIn: 'root' })
export class MonthRecordsStore extends AdminListStoreBase<IMonthRecord.Short.State, IMonthRecord.Short.Api> {
    readonly #mapper: MonthRecordShortMapper = new MonthRecordShortMapper();

    protected readonly path: string = SUMMARIES_PATH;

    constructor() {
        super();
    }

    protected rowOf(raw: IMonthRecord.Short.Api): IMonthRecord.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
