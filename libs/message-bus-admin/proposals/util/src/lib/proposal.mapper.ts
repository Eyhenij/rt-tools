/**
 * Перевод предложения из ответа приёмника в то, чем пользуется экран.
 *
 * Маппер свой на каждый уровень: полный наследует короткий и добавляет к нему текст и месяц — так
 * поля, общие обоим, переводятся одним объявлением и не расходятся при правке.
 *
 * Время приезжает строкой и становится временем здесь: дальше по экрану ходит уже `Date`, и
 * разбор строки не повторяется в каждой ячейке таблицы.
 */
import { cargoStateLabel } from '@rt/message-bus-admin/common/core/util';
import { cargoStateOf, ECargoState, ITreeChoice } from '@rt/message-bus-common';
import { BaseMapper } from '@rt-tools/utils';

import { IProposal } from './proposal.model';

/** Дерево из ответа. Поля читаются по одному: чужой объект приводить целиком нельзя. */
function treeOf(mapper: BaseMapper<unknown>, raw: ITreeChoice): ITreeChoice {
    return { slug: mapper.typeCast.getAsString(raw?.slug), name: mapper.typeCast.getAsString(raw?.name) };
}

/** Строка списка. */
export class ProposalShortMapper extends BaseMapper<IProposal.Short.State> {
    public override mapFrom(data: IProposal.Short.Api): IProposal.Short.State {
        // Состояние сверяется с набором явно: `getAsType` умолчания не принимает, а значение вне
        // набора отдаёт строкой, которой на экране не бывает.
        const cargoState: ECargoState = cargoStateOf(this.typeCast.getAsString(data.state));

        return {
            id: this.typeCast.getAsString(data.id),
            tree: treeOf(this, data.tree),
            resource: this.typeCast.getAsString(data.resource),
            address: this.typeCast.getAsString(data.address),
            state: cargoState,
            stateLabel: cargoStateLabel(cargoState),
            arrivedAt: new Date(this.typeCast.getAsString(data.arrivedAt)),
        };
    }
}

/** Запись целиком. */
export class ProposalMapper extends BaseMapper<IProposal.State> {
    readonly #short: ProposalShortMapper = new ProposalShortMapper();

    public override mapFrom(data: IProposal.Api): IProposal.State {
        return {
            ...this.#short.mapFrom(data),
            text: this.typeCast.getAsString(data.text),
            month: this.typeCast.getAsString(data.month),
            fixNote: this.typeCast.getAsString(data.fixNote),
            releaseVersion: this.typeCast.getAsString(data.releaseVersion),
        };
    }
}
