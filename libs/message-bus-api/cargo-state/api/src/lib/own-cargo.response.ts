/**
 * Ответ приёма на чтение своих записей деревом.
 *
 * Род записи едет полем, а не двумя разными ответами: дерево спрашивает судьбу всего, что
 * отправляло, и разбор с предложением ложатся у него в один список. Имя записи тоже одно поле —
 * у разбора это имя файла, у предложения ресурс, — и разводить их значило бы отдавать читающему
 * два вида строки на один список.
 */
import { ECargoKind, ECargoState } from '@rt/message-bus-common';

/** Одна своя запись, как её читает дерево. */
export interface IOwnCargoRow {
    /** Признак записи в приёме: им же она называется при правке состояния. */
    readonly id: string;
    readonly kind: ECargoKind;
    /** Чем запись названа: имя файла у разбора, имя ресурса у предложения. */
    readonly name: string;
    readonly state: ECargoState;
    /** Чем недочёт исправлен. Пусто у записи, которую никто не чинил. */
    readonly fixNote: string | null;
    /** В какой версии искать починку. Пусто у записи, которую никто не выпускал. */
    readonly releaseVersion: string | null;
    /** Текст записи: по нему дерево сводит запись со своей надстройкой. */
    readonly text: string;
}

/** Страница своих записей. */
export interface IOwnCargoResponse {
    readonly rows: readonly IOwnCargoRow[];
    readonly total: number;
    readonly page: number;
    readonly size: number;
}
