/**
 * Имена, ушедшие из набора.
 *
 * Раскладка ищет брошенный файл по каталогу пакета — а снятого ресурса в каталоге нет, и файл,
 * положенный им в дерево прошлой редакцией, не назовёт никто. Он остаётся лежать с шапкой пакета,
 * никогда не обновляется и читается агентом как действующее правило: гейт правил требует его по
 * имени, компаньон при нём продолжает проверяться, а сверка раскладки зелена — она судит по
 * выбранному, а выбрать снятое уже нельзя.
 *
 * Поэтому имя переживает свой файл: список называет его один раз при раскладке, а убирает файл
 * дерево само — в чужие файлы пакет не пишет никогда.
 */
import { TKind } from './config.js';

export interface IRetired {
    /** Идентификатор, каким ресурс звался в наборе: `rules/pricing.md`. */
    readonly id: string;
    readonly kind: TKind;
    /** Имя без рода и расширения — им ресурс ложился в дерево. */
    readonly name: string;
    /** Редакция пакета, в которой ресурс снят. */
    readonly since: string;
    /** Почему снят: строка едет читателю как есть. */
    readonly why: string;
}

const DOMAIN_LAW: string = 'закон называл предметы одного приложения и в чужом дереве неисполним';
const AT_MONEY: string = 'правило при снятом законе о деньгах';
const AT_OWNERSHIP: string = 'правило при снятом законе о владеющей сущности';
const AT_RULE: string = 'паттерн при снятом правиле';

/**
 * Список ведётся руками вместе со снятием файла: выведенный из истории системы контроля версий,
 * он был бы верен только там, где она есть, а пакет ставится из реестра.
 */
export const RETIRED: readonly IRetired[] = [
    { id: 'laws/application/money.md', kind: 'laws', name: 'application/money', since: '0.7.0', why: DOMAIN_LAW },
    { id: 'laws/application/ownership.md', kind: 'laws', name: 'application/ownership', since: '0.7.0', why: DOMAIN_LAW },
    { id: 'rules/pricing.md', kind: 'rules', name: 'pricing', since: '0.7.0', why: AT_MONEY },
    { id: 'rules/ownership-scope.md', kind: 'rules', name: 'ownership-scope', since: '0.7.0', why: AT_OWNERSHIP },
    { id: 'rules/ownership-session.md', kind: 'rules', name: 'ownership-session', since: '0.7.0', why: AT_OWNERSHIP },
    { id: 'patterns/pricing-quote.md', kind: 'patterns', name: 'pricing-quote', since: '0.7.0', why: AT_RULE },
    { id: 'patterns/ownership-scope-resolve.md', kind: 'patterns', name: 'ownership-scope-resolve', since: '0.7.0', why: AT_RULE },
    { id: 'patterns/ownership-session-procedure.md', kind: 'patterns', name: 'ownership-session-procedure', since: '0.7.0', why: AT_RULE },
];
