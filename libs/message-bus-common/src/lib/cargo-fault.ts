/**
 * Чем груз не прошёл проверку формы — и как об этом сказать дереву.
 *
 * Разбор чистый и отказа не бросает: отказ — это код ответа, а код знает только принимающая
 * сторона. Здесь решается, что именно не сошлось, и собирается текст, который дерево напечатает
 * владельцу.
 *
 * Отказ называет причину дереву, а не подробности устройства приёмника: «внутренняя ошибка» в
 * напечатанном владельцу означает потерянный прогон, и разбирать его будет некому.
 */
import { cargoSchemaOf, cargoTreeOf, isCargoBody, missingCargoFields, TCargoBody } from './cargo-shape';

/** Чем именно груз не прошёл проверку. */
export enum ECargoFault {
    /** Тело запроса не читается как груз вовсе. */
    Body = 'body',
    /** Версия схемы груза не названа: разбирать запрос нечем. */
    Schema = 'schema',
    /** Признак дерева в грузе не сошёлся с деревом токена. */
    Tree = 'tree',
    /** Не хватает полей, обязательных для своего рода. */
    Fields = 'fields',
}

export interface ICargoFault {
    readonly kind: ECargoFault;
    /** Недостающие поля — только у отказа по форме рода. */
    readonly fields: readonly string[];
}

/**
 * Что не сошлось у приехавшего груза. Пусто — форма принята.
 *
 * Порядок проверок значим: версия говорит, чем разбирать запрос, и без неё судить о полях
 * рано. Признак дерева сверяется до полей по той же причине, по какой он сверяется вообще, —
 * груз чужого дерева не разбирают, его отбивают.
 */
export function cargoFault(body: unknown, treeSlug: string, required: readonly string[]): ICargoFault | null {
    if (!isCargoBody(body)) {
        return { kind: ECargoFault.Body, fields: [] };
    }
    if (!cargoSchemaOf(body)) {
        return { kind: ECargoFault.Schema, fields: [] };
    }
    if (cargoTreeOf(body) !== treeSlug) {
        return { kind: ECargoFault.Tree, fields: [] };
    }

    const missing: string[] = missingCargoFields(body, required);

    return missing.length > 0 ? { kind: ECargoFault.Fields, fields: missing } : null;
}

/** Текст отказа для дерева. Род груза называется словом: дерево шлёт три рода и должно знать, какой отбит. */
export function cargoFaultMessage(fault: ICargoFault, kind: string): string {
    switch (fault.kind) {
        case ECargoFault.Body:
            return `груз рода «${kind}» не читается: в теле запроса ожидается набор полей`;
        case ECargoFault.Schema:
            return 'версия схемы груза обязательна';
        case ECargoFault.Tree:
            return 'признак дерева в грузе принадлежит другому дереву';
        case ECargoFault.Fields:
            return `в грузе рода «${kind}» не хватает полей: ${fault.fields.join(', ')}`;
    }
}

/** Одна запись списка не прошла проверку формы: список отбивается целиком, но место называется. */
export function cargoItemFaultMessage(kind: string, at: number, fields: readonly string[]): string {
    return `в грузе рода «${kind}» записи ${at + 1} не хватает полей: ${fields.join(', ')}`;
}

/** Названные записи груза, у которых не хватает полей. Пусто — список принят целиком. */
export function faultyCargoItems(
    items: readonly TCargoBody[],
    required: readonly string[]
): { readonly at: number; readonly fields: string[] }[] {
    return items
        .map((item: TCargoBody, at: number) => ({ at, fields: missingCargoFields(item, required) }))
        .filter((found: { at: number; fields: string[] }): boolean => found.fields.length > 0);
}
