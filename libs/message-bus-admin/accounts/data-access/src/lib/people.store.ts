import { Injectable } from '@angular/core';
import { IPerson, PEOPLE_PATH, PersonShortMapper } from '@rt/message-bus-admin/accounts/util';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';

/**
 * Список людей приёмника.
 *
 * От общей основы отличается адресом операции и переводом строки: страницу, порядок, гонку
 * ответов и отказ чтения с повтором держит она.
 *
 * Правок над записями здесь нет ни одной, и это не упущение: заводит, отключает и меняет пароль
 * команда строки запуска на узле приёмника — из веба такого действия нет вовсе.
 *
 * Один экземпляр на приложение: список читает один экран, и второму его читать неоткуда.
 */
@Injectable({ providedIn: 'root' })
export class PeopleStore extends AdminListStoreBase<IPerson.Short.State, IPerson.Short.Api> {
    readonly #mapper: PersonShortMapper = new PersonShortMapper();

    protected readonly path: string = PEOPLE_PATH;

    constructor() {
        super();
    }

    protected rowOf(raw: IPerson.Short.Api): IPerson.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
