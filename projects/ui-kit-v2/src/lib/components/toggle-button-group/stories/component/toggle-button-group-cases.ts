import { IRtToggleButtonGroup } from '../../rt-toggle-button-group.model';

/**
 * Данные матрицы `rt-toggle-button-group`: случаи осей и наборы сегментов. Отдельным файлом, чтобы
 * обёртка истории оставалась в пределе длины файла.
 */

/** Раскладка и ширина, в которую группа поставлена: перенос виден только в узком месте. */
export interface IGroupLayoutCase {
    readonly name: string;
    readonly layout: IRtToggleButtonGroup.Layout;
    readonly width: string;
    readonly fullWidth?: boolean;
}

/** Набор сегментов: подписи, подписи с иконками, две штуки против пяти. */
export interface IGroupOptionsCase {
    readonly name: string;
    readonly options: ReadonlyArray<IRtToggleButtonGroup.Option>;
    readonly value: string;
}

/** Что выбрано в множественной группе: пусто, один, часть, всё. */
export interface IGroupMultipleCase {
    readonly name: string;
    readonly values: ReadonlyArray<string>;
}

/** Какой сегмент выбран: край группы и середина скругляются по-разному. */
export interface IGroupValueCase {
    readonly name: string;
    readonly value: string | undefined;
}

export const PERIOD: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
];

/** Недоступен средний сегмент: видно, что группа не схлопывается и края остаются прежними. */
export const PERIOD_WITH_DISABLED: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День' },
    { value: 'week', label: 'Неделя', disabled: true },
    { value: 'month', label: 'Месяц' },
];

/** Недоступен выбранный сегмент: подсветка выбранного и приглушённость показаны вместе. */
export const PERIOD_DISABLED_CHOSEN: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'day', label: 'День', disabled: true },
    { value: 'week', label: 'Неделя' },
    { value: 'month', label: 'Месяц' },
];

/** Форматы выгрузки: значок формата в сегменте нарисован своей разметкой. */
export const FORMATS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'pdf', label: 'PDF', icon: 'attach-pdf' },
    { value: 'xlsx', label: 'Excel', icon: 'attach-xlsx-xls' },
    { value: 'docx', label: 'Word', icon: 'attach-docx-doc' },
    { value: 'zip', label: 'Архив', icon: 'attach-zip-rar' },
];

export const DAYS: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'mon', label: 'Понедельник' },
    { value: 'tue', label: 'Вторник' },
    { value: 'wed', label: 'Среда' },
    { value: 'thu', label: 'Четверг' },
    { value: 'fri', label: 'Пятница' },
    { value: 'sat', label: 'Суббота' },
    { value: 'sun', label: 'Воскресенье' },
];

export const VIEW: ReadonlyArray<IRtToggleButtonGroup.Option> = [
    { value: 'list', label: 'Списком', icon: 'ico-listing', title: 'Показать списком' },
    { value: 'grid', label: 'Плиткой', icon: 'bars', title: 'Показать плиткой' },
];
