/**
 * Чем раздел приглашений отличается от разделов груза: столбцы, адрес операций и адрес панели.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и спека
 * — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { IAdminColumn } from '@rt/message-bus-admin/common/core/util';

/** Адрес операций над приглашениями: чтение списка, выдача нового и отзыв одного. */
export const INVITES_PATH: string = '/api/invites';

/**
 * Сегмент адреса панели создания.
 *
 * Панель живёт тем же аутлетом, что и панели подробностей соседних разделов, и на месте
 * признака записи у неё стоит это слово: записи, которую панель открывает, ещё нет.
 */
export const INVITE_CREATE_ROUTE: string = 'new';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в одном
 * разделе на остальные.
 */
export const INVITES_TABLE_ID: string = 'admin-invites';

/**
 * Столбцы таблицы. Подписи идут из словаря, а порядок — тот, в котором они здесь стоят.
 *
 * Закреплено имя: приглашение зовётся именем будущего дерева, и без него список перестаёт
 * называть свои строки.
 */
export const INVITES_COLUMNS: readonly IAdminColumn[] = Object.freeze([
    { key: 'name', label: 'columnInviteName', sortable: true, locked: true },
    { key: 'state', label: 'columnInviteState' },
    { key: 'issuedAt', label: 'columnIssuedAt', sortable: true },
    { key: 'expiresAt', label: 'columnExpiresAt', sortable: true },
    { key: 'tree', label: 'columnInviteTree' },
]);
