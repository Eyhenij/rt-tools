/**
 * Перевод использования из ответа приёмника в то, чем пользуется экран.
 *
 * Маппер свой на каждую форму: строка таблицы и сессия читаются разными операциями и общих
 * полей не имеют. Числа приводятся через `typeCast` с нулём про запас: пустой счёт на экране
 * читался бы как `NaN` в ячейке.
 */
import { BaseMapper } from '@rt-tools/utils';

import { ESkillKind, IUsage } from './usage.model';

/** Набор родов целиком: по нему судится приехавшее слово. */
const SKILL_KINDS: readonly ESkillKind[] = Object.values(ESkillKind);

/**
 * Род скила из слова контракта. Слово вне набора — правило: строка без рода приезжает у скила,
 * о котором есть только отказы гейта, а гейт правил отказывает по правилу.
 */
export function usageKindOf(raw: string): ESkillKind {
    return SKILL_KINDS.find((kind: ESkillKind): boolean => kind === raw) ?? ESkillKind.Rule;
}

/** Строка таблицы скилов. */
export class UsageRowMapper extends BaseMapper<IUsage.Row.State> {
    public override mapFrom(data: IUsage.Row.Api): IUsage.Row.State {
        return {
            skill: this.typeCast.getAsString(data.skill),
            kind: usageKindOf(this.typeCast.getAsString(data.kind)),
            loads: this.typeCast.getAsNumber(data.loads, 0),
            sessions: this.typeCast.getAsNumber(data.sessions, 0),
            denials: this.typeCast.getAsNumber(data.denials, 0),
        };
    }
}

/** Сессия одного скила. */
export class UsageSessionMapper extends BaseMapper<IUsage.Session.State> {
    public override mapFrom(data: IUsage.Session.Api): IUsage.Session.State {
        return {
            day: this.typeCast.getAsString(data.day),
            sid: this.typeCast.getAsString(data.sid),
            count: this.typeCast.getAsNumber(data.count, 0),
        };
    }
}
