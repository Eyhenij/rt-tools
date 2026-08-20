/**
 * Перевод разбора происшествия из ответа приёмника в то, чем пользуется экран.
 *
 * Маппер свой на каждый уровень: полный наследует короткий и добавляет к нему текст — так поля,
 * общие обоим, переводятся одним объявлением и не расходятся при правке.
 *
 * Время приезжает строкой и становится временем здесь: дальше по экрану ходит уже `Date`, и
 * разбор строки не повторяется в каждой ячейке таблицы.
 */
import { cargoStateLabel } from '@rt/message-bus-admin/common/core/util';
import { cargoStateOf, ECargoState, ITreeChoice } from '@rt/message-bus-common';
import { BaseMapper } from '@rt-tools/utils';

import { IPostmortem } from './postmortem.model';

/** Дерево из ответа. Поля читаются по одному: чужой объект приводить целиком нельзя. */
function treeOf(mapper: BaseMapper<unknown>, raw: ITreeChoice): ITreeChoice {
    return { slug: mapper.typeCast.getAsString(raw?.slug), name: mapper.typeCast.getAsString(raw?.name) };
}

/** Строка списка. */
export class PostmortemShortMapper extends BaseMapper<IPostmortem.Short.State> {
    public override mapFrom(data: IPostmortem.Short.Api): IPostmortem.Short.State {
        // Состояние сверяется с набором явно: `getAsType` умолчания не принимает, а значение вне
        // набора отдаёт строкой, которой на экране не бывает.
        const cargoState: ECargoState = cargoStateOf(this.typeCast.getAsString(data.state));

        return {
            id: this.typeCast.getAsString(data.id),
            tree: treeOf(this, data.tree),
            file: this.typeCast.getAsString(data.file),
            state: cargoState,
            stateLabel: cargoStateLabel(cargoState),
            arrivedAt: new Date(this.typeCast.getAsString(data.arrivedAt)),
            updatedAt: new Date(this.typeCast.getAsString(data.updatedAt)),
        };
    }
}

/** Запись целиком. */
export class PostmortemMapper extends BaseMapper<IPostmortem.State> {
    readonly #short: PostmortemShortMapper = new PostmortemShortMapper();

    public override mapFrom(data: IPostmortem.Api): IPostmortem.State {
        return { ...this.#short.mapFrom(data), text: this.typeCast.getAsString(data.text) };
    }
}
