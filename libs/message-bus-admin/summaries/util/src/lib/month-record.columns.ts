/**
 * Чем раздел сводок отличается от двух других: столбцы, поля порядка и адрес операций.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и спека
 * — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IRtTable } from '@rt-tools/ui-kit-v2';

/** Адрес операций чтения записей месяца. */
export const SUMMARIES_PATH: string = '/api/summaries';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в одном
 * разделе на остальные.
 */
export const SUMMARIES_TABLE_ID: string = 'admin-summaries';

/**
 * Столбцы таблицы. Подписи идут из словаря, а порядок — тот, в котором они здесь стоят.
 *
 * Закреплён месяц: запись одна на пару «дерево — месяц», и без месяца список перестаёт называть
 * свои строки.
 */
export const SUMMARIES_COLUMNS: readonly IRtTable.ColumnConfig[] = Object.freeze([
    { key: 'tree', label: adminLabel('columnTree'), sortable: true },
    { key: 'month', label: adminLabel('columnMonth'), sortable: true, locked: true },
    { key: 'sessions', label: adminLabel('columnSessions') },
    { key: 'ranAt', label: adminLabel('columnRanAt'), sortable: true },
]);
