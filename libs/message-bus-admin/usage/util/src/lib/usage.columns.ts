/**
 * Чем раздел использования отличается от разделов груза: столбцы, адрес операций и подписи родов.
 *
 * Лежит отдельно от экрана: тот же набор читают и таблица, и панель настройки столбцов, и спека
 * — объявленный в шаблоне, он был бы известен только шаблону.
 */
import { adminLabel, IAdminColumn, TAdminLabelKey } from '@rt/message-bus-admin/common/core/util';

import { ESkillKind } from './usage.model';

/** Адрес операций чтения использования. Сессии скила читаются под ним: `/api/usage/<skill>/sessions`. */
export const USAGE_PATH: string = '/api/usage';

/** Последний сегмент адреса сессий одного скила. */
export const USAGE_SESSIONS_SEGMENT: string = 'sessions';

/** Сегмент адреса сводки периода: `/api/usage/digest`. */
export const USAGE_DIGEST_SEGMENT: string = 'digest';

/**
 * Ключ, под которым хранится выбор столбцов.
 *
 * Свой у каждого раздела: столбцы у них разные, и общий ключ переносил бы скрытое в одном
 * разделе на остальные.
 */
export const USAGE_TABLE_ID: string = 'admin-usage';

/**
 * Столбцы таблицы. Подписи идут из словаря, а порядок — тот, в котором они здесь стоят.
 *
 * Закреплён скил: строка одна на скил, и без него список перестаёт называть свои строки. Род не
 * сортируется: приёмник его не считает полем порядка.
 */
export const USAGE_COLUMNS: readonly IAdminColumn[] = Object.freeze([
    { key: 'skill', label: 'columnSkill', sortable: true, locked: true },
    { key: 'kind', label: 'columnKind' },
    { key: 'loads', label: 'columnLoads', sortable: true },
    { key: 'sessions', label: 'columnUsageSessions', sortable: true },
    { key: 'denials', label: 'columnDenials', sortable: true },
]);

/** Ключ подписи по роду скила: род приезжает словом набора, а человеку показывается словом словаря. */
const KIND_LABEL_KEYS: Readonly<Record<ESkillKind, TAdminLabelKey>> = Object.freeze({
    [ESkillKind.Rule]: 'kindRule',
    [ESkillKind.Pattern]: 'kindPattern',
    [ESkillKind.Skill]: 'kindSkill',
    [ESkillKind.Own]: 'kindOwn',
});

/** Подпись рода скила. */
export function skillKindLabel(kind: ESkillKind): string {
    return adminLabel(KIND_LABEL_KEYS[kind]);
}
