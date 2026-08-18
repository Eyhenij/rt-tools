import { BASE_INITIAL_STATE, IStateBase } from '@rt-tools/store';

import { IReadFault } from './read-fault';

/**
 * Что знает панель подробностей: запись, чем кончилось её чтение.
 *
 * Общее у всех разделов, показывающих одну запись: список отдаёт короткую модель, а панель
 * читает полную своей операцией, и её исход — либо запись, либо отказ чтения. Своя копия в
 * каждом домене расходилась бы полем за раз, а заметить это нечем: каждая копия сама по себе
 * исправна.
 */
export interface IDetailsState<T> extends IStateBase.Async {
    entity: T | null;
    fault: IReadFault | null;
}

/**
 * Начальное состояние панели подробностей: записи нет, чтение не начиналось.
 *
 * Функция, а не объект: общий объект уехал бы во все сторы одной ссылкой, и правка состояния в
 * одном разделе меняла бы начальное состояние остальных.
 */
export function detailsInitialState<T>(): IDetailsState<T> {
    return { ...BASE_INITIAL_STATE.ASYNC, entity: null, fault: null };
}
