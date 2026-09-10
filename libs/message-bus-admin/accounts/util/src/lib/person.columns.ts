/**
 * Чем раздел людей отличается от остальных: столбцы, адрес операции и ключ настройки столбцов.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и
 * описание — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { adminLabel } from '@rt/message-bus-admin/common/core/util';
import { IRtTable } from '@rt-tools/ui-kit-v2';

/** Адрес операции чтения списка людей. */
export const PEOPLE_PATH: string = '/api/accounts';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в одном
 * разделе на остальные.
 */
export const PEOPLE_TABLE_ID: string = 'admin-people';

/**
 * Столбцы таблицы. Подписи идут из словаря, а порядок — тот, в котором они здесь стоят.
 *
 * Закреплено имя: человек зовётся им, и без него список перестаёт называть свои строки.
 * Роль порядка не принимает: у приёмника она вложенной записью, и порядок по ней означал бы
 * порядок по чужой таблице.
 */
export const PEOPLE_COLUMNS: readonly IRtTable.ColumnConfig[] = Object.freeze([
    { key: 'name', label: adminLabel('columnPersonName'), sortable: true, locked: true },
    { key: 'role', label: adminLabel('columnPersonRole') },
    { key: 'state', label: adminLabel('columnPersonState'), sortable: true },
    { key: 'lastLoginAt', label: adminLabel('columnLastLoginAt'), sortable: true },
]);
