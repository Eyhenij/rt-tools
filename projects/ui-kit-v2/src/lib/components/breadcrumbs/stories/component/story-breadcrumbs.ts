import { IRtBreadcrumbs } from '../../rt-breadcrumbs.model';

/** Путь для витрины: от раздела до записи, шесть звеньев. Обёртки режут его до нужной длины. */
export const STORY_BREADCRUMBS_PATH: readonly IRtBreadcrumbs.Crumb[] = [
    { label: 'Настройки', link: '/settings' },
    { label: 'Объекты', link: '/settings/objects' },
    { label: 'Побережье', link: '/settings/objects/coast' },
    { label: 'Вилла «Морской бриз»', link: '/settings/objects/coast/7' },
    { label: 'Тарифы', link: '/settings/objects/coast/7/rates' },
    { label: 'Летний сезон' },
];

/** Раздел и запись с длинным именем — как у страницы записи, куда пришли из списка. */
export const STORY_BREADCRUMBS_RECORD: readonly IRtBreadcrumbs.Crumb[] = [
    { label: 'Пользователи', link: '/users' },
    { label: 'Александра Константиновна Преображенская-Воскресенская' },
];

/** Путь из двух предков и записи — как у карточки в списке. */
export const STORY_BREADCRUMBS_SHORT: readonly IRtBreadcrumbs.Crumb[] = [
    { label: 'Настройки', link: '/settings' },
    { label: 'Объекты', link: '/settings/objects' },
    { label: 'Вилла «Морской бриз»' },
];
