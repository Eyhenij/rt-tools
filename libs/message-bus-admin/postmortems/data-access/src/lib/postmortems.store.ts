import { Injectable } from '@angular/core';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { IPostmortem, PostmortemShortMapper, POSTMORTEMS_PATH } from '@rt/message-bus-admin/postmortems/util';

/**
 * Список разборов происшествий.
 *
 * От общей основы он отличается ровно двумя вещами — адресом операции и переводом строки:
 * страницу, порядок, отбор, гонку ответов и отказ с повтором держит она.
 *
 * Один экземпляр на приложение: список делят экран и панель подробностей, и закрытая панель
 * возвращает тот же список, а не перечитывает его заново.
 */
@Injectable({ providedIn: 'root' })
export class PostmortemsStore extends AdminListStoreBase<IPostmortem.Short.State, IPostmortem.Short.Api> {
    readonly #mapper: PostmortemShortMapper = new PostmortemShortMapper();

    protected readonly path: string = POSTMORTEMS_PATH;

    constructor() {
        super();
    }

    protected rowOf(raw: IPostmortem.Short.Api): IPostmortem.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
