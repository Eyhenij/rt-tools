/**
 * Чем раздел разборов отличается от двух других: столбцы, поля порядка и адрес операций.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и спека
 * — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { IAdminColumn } from '@rt/message-bus-admin/common/core/util';

/** Адрес операций чтения разборов. */
export const POSTMORTEMS_PATH: string = '/api/postmortems';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в разделе
 * разборов на предложения.
 */
export const POSTMORTEMS_TABLE_ID: string = 'admin-postmortems';

/** Столбцы таблицы. Подпись названа ключом словаря, а порядок — тот, в котором они здесь стоят. */
export const POSTMORTEMS_COLUMNS: readonly IAdminColumn[] = Object.freeze([
    { key: 'tree', label: 'columnTree', sortable: true },
    { key: 'file', label: 'columnFile', sortable: true, locked: true },
    { key: 'state', label: 'columnState', sortable: true },
    { key: 'releaseVersion', label: 'releaseVersion', sortable: true },
    { key: 'quarantineNote', label: 'quarantineNote', sortable: false },
    { key: 'arrivedAt', label: 'columnArrivedAt', sortable: true },
    { key: 'updatedAt', label: 'columnUpdatedAt', sortable: true },
]);
