/**
 * Чем раздел предложений отличается от двух других: столбцы, поля порядка и адрес операций.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и спека
 * — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IRtTable } from '@rt-tools/ui-kit-v2';

/** Адрес операций чтения предложений. */
export const PROPOSALS_PATH: string = '/api/proposals';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в разделе
 * разборов на предложения.
 */
export const PROPOSALS_TABLE_ID: string = 'admin-proposals';

/**
 * Столбцы таблицы. Подписи идут из словаря, а порядок — тот, в котором они здесь стоят.
 *
 * Закреплён ресурс: им предложение и опознаётся — ради счёта «сколько деревьев правят это место»
 * раздел и заведён, и список без этого столбца перестаёт отвечать на свой вопрос.
 */
export const PROPOSALS_COLUMNS: readonly IRtTable.ColumnConfig[] = Object.freeze([
    { key: 'tree', label: adminLabel('columnTree'), sortable: true },
    { key: 'resource', label: adminLabel('columnResource'), sortable: true, locked: true },
    { key: 'address', label: adminLabel('columnAddress'), sortable: true },
    { key: 'state', label: adminLabel('columnState') },
    { key: 'arrivedAt', label: adminLabel('columnArrivedAt'), sortable: true },
]);
