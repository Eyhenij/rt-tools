/**
 * Чем раздел разборов отличается от двух других: столбцы, поля порядка и адрес операций.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и спека
 * — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IRtTable } from '@rt-tools/ui-kit-v2';

/** Адрес операций чтения разборов. */
export const POSTMORTEMS_PATH: string = '/api/postmortems';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в разделе
 * разборов на предложения.
 */
export const POSTMORTEMS_TABLE_ID: string = 'admin-postmortems';

/** Столбцы таблицы. Подписи идут из словаря, а порядок — тот, в котором они здесь стоят. */
export const POSTMORTEMS_COLUMNS: readonly IRtTable.ColumnConfig[] = Object.freeze([
    { key: 'tree', label: adminLabel('columnTree'), sortable: true },
    { key: 'file', label: adminLabel('columnFile'), sortable: true, locked: true },
    { key: 'state', label: adminLabel('columnState'), sortable: true },
    { key: 'arrivedAt', label: adminLabel('columnArrivedAt'), sortable: true },
    { key: 'updatedAt', label: adminLabel('columnUpdatedAt'), sortable: true },
]);
