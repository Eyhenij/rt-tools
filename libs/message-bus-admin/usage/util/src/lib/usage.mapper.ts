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

/** День сводки. */
export class UsageDayMapper extends BaseMapper<IUsage.Day.State> {
    public override mapFrom(data: IUsage.Day.Api): IUsage.Day.State {
        return {
            day: this.typeCast.getAsString(data.day),
            loads: this.typeCast.getAsNumber(data.loads, 0),
            sessions: this.typeCast.getAsNumber(data.sessions, 0),
            denials: this.typeCast.getAsNumber(data.denials, 0),
        };
    }
}

/** Загрузки одного рода. */
export class UsageKindMapper extends BaseMapper<IUsage.Kind.State> {
    public override mapFrom(data: IUsage.Kind.Api): IUsage.Kind.State {
        return { kind: usageKindOf(this.typeCast.getAsString(data.kind)), loads: this.typeCast.getAsNumber(data.loads, 0) };
    }
}

/** Сводка периода целиком: четыре списка переводятся своими мапперами, период — строками. */
export class UsageDigestMapper extends BaseMapper<IUsage.Digest.State> {
    readonly #row: UsageRowMapper = new UsageRowMapper();
    readonly #day: UsageDayMapper = new UsageDayMapper();
    readonly #kind: UsageKindMapper = new UsageKindMapper();

    public override mapFrom(data: IUsage.Digest.Api): IUsage.Digest.State {
        return {
            from: this.typeCast.getAsString(data.from),
            to: this.typeCast.getAsString(data.to),
            days: this.#list(data.days).map((row: IUsage.Day.Api): IUsage.Day.State => this.#day.mapFrom(row)),
            kinds: this.#list(data.kinds).map((row: IUsage.Kind.Api): IUsage.Kind.State => this.#kind.mapFrom(row)),
            top: this.#list(data.top).map((row: IUsage.Row.Api): IUsage.Row.State => this.#row.mapFrom(row)),
            denied: this.#list(data.denied).map((row: IUsage.Row.Api): IUsage.Row.State => this.#row.mapFrom(row)),
        };
    }

    /** Список ответа: не список — пустой, а не падение экрана. */
    #list<T>(value: readonly T[] | undefined): readonly T[] {
        return Array.isArray(value) ? value : [];
    }
}
