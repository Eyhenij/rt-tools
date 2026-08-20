/**
 * Ответ правки состояния: чем она кончилась для дерева.
 *
 * Лежит в слое, которым домен говорит с чужими: эти же поля читает команда строки запуска
 * пакета, и вторая их копия при ней разошлась бы с этой молча.
 */
import { ECargoStateKind } from '@rt/message-bus-api/cargo-state/util';

/** Почему строка не исполнена. Причин две, и по ним исполнитель видит, что делать дальше. */
export enum ECargoStateDenial {
    /** Записи с таким ключом у дерева нет. Запись соседа отвечает так же. */
    Missing = 'missing',
    /** Порядок переходов такого шага не разрешает. */
    Forbidden = 'forbidden',
}

/** Отбитая строка: место в пакете, род записи, ключ и причина. */
export interface ICargoStateDeniedLine {
    readonly at: number;
    readonly kind: ECargoStateKind;
    readonly key: string;
    readonly denial: ECargoStateDenial;
}

/** Чем кончилась правка: признак дерева, два числа и список отбитых строк. */
export interface ICargoStateResponse {
    /** Признак дерева, взятый из токена, а не из тела запроса. */
    readonly tree: string;
    /** Сколько записей переведено. */
    readonly changed: number;
    /** Сколько уже стояло в названном состоянии: переходом это не считается. */
    readonly same: number;
    /** Строки, которые приёмник не исполнил. */
    readonly denied: readonly ICargoStateDeniedLine[];
}
