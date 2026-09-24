import { IRtIcon } from './rt-icon.model';

/**
 * Соответствие значков первого кита значкам этого набора.
 *
 * Первый кит рисует значки шрифтом Material: имя стоит прямо в шаблоне. Здесь у каждого такого
 * имени ровно одна пара — иначе один и тот же смысл приезжает на разные экраны разными
 * рисунками, а переезжающий выбирает значок заново на каждом экране.
 *
 * Перечень закрывает имена, которые видны поиском: голое слово в шаблоне, слово в тернарнике и
 * слово внутри разбора по виду фильтра. Имена, подставляемые выражением, сюда не попадают: они
 * приезжают из данных приложения и деревом кита не видны. Это граница перечня, а не его пробел.
 *
 * Пара ведёт на имя из фрейма, а не на своё с приставкой `ico-`, там где есть оба. Имён из
 * фрейма 229 против 118, и они одной рисовки: смешанный набор дал бы разнобой на экране. Восемь
 * таких пар помечены доводом — их можно переложить на свои одним местом.
 *
 * Имя без пары стоит здесь же, с причиной: молчание об имени неотличимо от того, что о нём
 * забыли. Дорисовка недостающего — работа рисующего, и она вынесена за границу задачи.
 *
 * Держит перечень `tools/check-icon-map.mjs`: каждая пара ведёт на имя союза и на существующий
 * файл, имена не повторяются, причина у имени без пары не пуста.
 */

/** Довод самой частой пары: имя первого кита и имя набора совпали после замены подчёркиваний. */
const SAME_NAME: string = 'совпадает именем';

/** Одна запись перечня: имя первого кита и то, чем оно закрывается здесь. */
export interface IRtIconMaterialEntry {
    /** Имя значка первого кита — так, как оно стоит в его шаблоне. */
    readonly from: string;

    /** Имя этого набора либо `null`, если рисунка в наборе нет. */
    readonly to: IRtIcon.Name | null;

    /** Довод к паре либо причина, по которой пары нет. Пустым не бывает. */
    readonly why: string;
}

export const iconMaterialMap: readonly IRtIconMaterialEntry[] = [
    { from: 'add', to: 'ico-plus', why: 'простой плюс есть только в своей рисовке — во фрейме плюс лишь в круге и в составных' },
    { from: 'arrow_back', to: 'arrow-left', why: 'стрелка влево, один в один' },
    { from: 'backup', to: 'cloud-upload', why: 'у Material backup — облако со стрелкой вверх, это оно и есть' },
    { from: 'block', to: 'ban', why: 'круг с перечёркиванием, один в один' },
    { from: 'chevron_left', to: 'chevron-left', why: SAME_NAME },
    { from: 'chevron_right', to: 'chevron-right', why: SAME_NAME },
    { from: 'close', to: 'close', why: `${SAME_NAME}; есть двойник ico-close` },
    { from: 'content_copy', to: 'copy', why: 'два листа, один в один; есть двойник ico-copy' },
    { from: 'delete', to: 'trash', why: 'корзина, один в один; есть двойник ico-trash' },
    { from: 'delete_forever', to: null, why: 'корзины с крестом в наборе нет — нужен рисунок' },
    { from: 'done', to: 'check', why: 'галочка, один в один; есть двойник ico-check' },
    { from: 'email', to: 'email', why: 'конверт, один в один' },
    { from: 'download', to: 'ico-download', why: 'простая стрелка вниз есть только в своей рисовке — во фрейме лишь облако' },
    {
        from: 'drag_handle',
        to: 'equals',
        why: 'две горизонтальные полосы; рисунок дорисован по слову владельца — им таблица первого кита показывает сравнение «равно»',
    },
    { from: 'edit', to: 'pencil', why: 'карандаш, один в один' },
    { from: 'info', to: 'info-circle', why: 'круг с буквой i — так рисует Material; голое info в наборе другое' },
    { from: 'keyboard_arrow_down', to: 'chevron-down', why: 'шеврон вниз, один в один; есть двойник ico-chevron-down' },
    { from: 'local_offer', to: 'tag', why: 'ярлык, один в один' },
    { from: 'menu', to: 'bars', why: 'три полосы, один в один' },
    { from: 'more_horiz', to: 'ellipsis-h', why: 'три точки по горизонтали' },
    { from: 'more_vert', to: 'ellipsis-v', why: 'три точки по вертикали' },
    { from: 'open_in_new', to: 'external-link', why: 'квадрат со стрелкой наружу' },
    {
        from: 'open_with',
        to: 'arrows',
        why: 'четыре стрелки из центра; рисунок дорисован — им панель колонок первого кита показывает ручку перетаскивания',
    },
    { from: 'person', to: 'user', why: 'силуэт человека, один в один; есть двойник ico-user' },
    { from: 'refresh', to: 'refresh', why: SAME_NAME },
    { from: 'search', to: 'search', why: `${SAME_NAME}; есть двойник ico-search` },
    { from: 'settings', to: 'cog', why: 'шестерёнка, один в один' },
    { from: 'star', to: 'star', why: SAME_NAME },
    { from: 'sync', to: 'sync', why: SAME_NAME },
    { from: 'view_column', to: 'table', why: 'ближний: у Material это колонки, здесь таблица — решение владельца' },
    { from: 'visibility', to: 'eye', why: 'глаз, один в один; есть двойник ico-eye' },
    { from: 'visibility_off', to: 'eye-slash', why: 'перечёркнутый глаз, один в один' },
];

/**
 * Имена кита, у которых в материальном наборе лежит свой рисунок.
 *
 * Считается из перечня, а не пишется списком: свой список разошёлся бы с перечнем молча — реестр
 * ходил бы за файлом, которого нет, или не ходил бы за лежащим.
 */
export const iconMaterialDrawn: ReadonlySet<IRtIcon.Name> = new Set<IRtIcon.Name>(
    iconMaterialMap
        .map((entry: IRtIconMaterialEntry): IRtIcon.Name | null => entry.to)
        .filter((name: IRtIcon.Name | null): name is IRtIcon.Name => name !== null)
);
