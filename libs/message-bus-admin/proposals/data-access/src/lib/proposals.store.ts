import { Injectable } from '@angular/core';
import { AdminListStoreBase } from '@rt/message-bus-admin/common/core/data-access';
import { IProposal, ProposalShortMapper, PROPOSALS_PATH } from '@rt/message-bus-admin/proposals/util';

/**
 * Список предложений по слою правил.
 *
 * От общей основы он отличается ровно двумя вещами — адресом операции и переводом строки:
 * страницу, порядок, отбор, гонку ответов и отказ с повтором держит она.
 *
 * Один экземпляр на приложение: список делят экран и панель подробностей, и закрытая панель
 * возвращает тот же список, а не перечитывает его заново.
 */
@Injectable({ providedIn: 'root' })
export class ProposalsStore extends AdminListStoreBase<IProposal.Short.State, IProposal.Short.Api> {
    readonly #mapper: ProposalShortMapper = new ProposalShortMapper();

    protected readonly path: string = PROPOSALS_PATH;

    constructor() {
        super();
    }

    protected rowOf(raw: IProposal.Short.Api): IProposal.Short.State {
        return this.#mapper.mapFrom(raw);
    }
}
