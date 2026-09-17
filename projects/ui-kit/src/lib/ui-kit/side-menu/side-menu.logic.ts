import { ISideMenu } from './side-menu.types';

/**
 * Отбор пунктов подменю по подстроке подписи.
 *
 * Считается здесь, а не в шаблоне: разметка меню держит две раскладки разом, и ветвление отбора
 * в ней читается хуже вызова.
 *
 * Отбор спускается внутрь папок на любую глубину: потребитель кладёт в `submenu` папки то, что
 * человек и ищет по имени, и по одному верхнему уровню такой пункт совпасть не мог по построению —
 * поиск находил только саму папку.
 *
 * В выдаче стоят только строки, содержащие запрос. Папка — не исключение из этого, а путь к
 * совпавшим детям: она остаётся, чтобы человек видел, где найденное лежит, а её состав отбирается
 * тем же правилом. Иначе одно совпадение по имени папки вытаскивает на экран весь её состав, и
 * человек читает как найденное то, в чём запроса нет.
 *
 * Совпавшая по имени папка, внутри которой не совпал никто, остаётся одной строкой без детей: её
 * искали по имени, и она должна найтись. Пункт без детей в исходном наборе так и остаётся пунктом
 * — пустого списка ему не приписывается.
 *
 * Отобранная папка — новый объект: правка `submenu` на месте переписала бы набор, который дал
 * потребитель, и стёртый запрос вернул бы урезанное меню.
 */
export function filterSubMenuItems(items: ReadonlyArray<ISideMenu.Item>, query: string): ISideMenu.Item[] {
    const needle: string = query.trim().toLowerCase();

    if (needle === '') {
        return [...items];
    }

    return items.reduce((kept: ISideMenu.Item[], item: ISideMenu.Item): ISideMenu.Item[] => {
        const isFolder: boolean = Boolean(item.submenu?.length);
        const inside: ISideMenu.Item[] = isFolder ? filterSubMenuItems(item.submenu ?? [], query) : [];

        if (inside.length) {
            kept.push({ ...item, submenu: inside });

            return kept;
        }

        if (item.name?.toLowerCase().includes(needle)) {
            kept.push(isFolder ? { ...item, submenu: [] } : item);
        }

        return kept;
    }, []);
}

/**
 * Папки отобранного списка — те, что должны стоять раскрытыми.
 *
 * Считается по уже отобранному списку, а не по исходному: в отобранном остались ровно те папки, в
 * которых что-то нашлось, и раскрывать больше нечего. Пустой запрос сюда не попадает вовсе — тогда
 * раскрытость берётся прежняя, та, что была до набора.
 *
 * Возвращаются номера, а не сами пункты: отобранный список пересобирается на каждую букву запроса,
 * и ссылка на пункт такой пересборки не переживает.
 */
export function subMenuIdsToExpand(items: ReadonlyArray<ISideMenu.Item>): Array<string | number> {
    return items.reduce((ids: Array<string | number>, item: ISideMenu.Item): Array<string | number> => {
        if (item.submenu?.length) {
            ids.push(item.id, ...subMenuIdsToExpand(item.submenu));
        }

        return ids;
    }, []);
}

/**
 * Ключ, под которым хранится выбор человека.
 *
 * Назван приставкой кита: хранилище браузера общее на весь адрес, и короткое имя вроде `mode`
 * столкнулось бы с ключом потребителя молча — оба пишут в одно место.
 */
export const SUB_MENU_MODE_KEY: string = 'rtui-side-menu-sub-menu-mode';

/**
 * Чтение сохранённого выбора.
 *
 * Мода подменю — настройка человека, а не состояние экрана: она обязана переживать перезагрузку.
 * Хранит её потребитель — кит не знает, где у приложения лежат настройки человека, — а эти две
 * функции дают ему готовый и одинаковый способ, чтобы ключ не расходился от приложения к
 * приложению.
 *
 * Отказ хранилища работу не останавливает: браузер отдаёт его закрытым в приватном окне и при
 * запрете данных сайта, и упавшее чтение оставило бы человека без меню вовсе. Незнакомое значение
 * читается так же, как пустое, — прежней модой.
 */
export function readSubMenuMode(storage: Storage | null): ISideMenu.SubMenuMode {
    if (storage === null) {
        return 'hover';
    }

    try {
        return storage.getItem(SUB_MENU_MODE_KEY) === 'pinned' ? 'pinned' : 'hover';
    } catch {
        return 'hover';
    }
}

/** Запись выбора. Отказ хранилища глушится по той же причине, что и при чтении. */
export function writeSubMenuMode(storage: Storage | null, mode: ISideMenu.SubMenuMode): void {
    if (storage === null) {
        return;
    }

    try {
        storage.setItem(SUB_MENU_MODE_KEY, mode);
    } catch {
        // хранилище закрыто настройками браузера — выбор просто не переживёт перезагрузку
    }
}

/** Ключ ширины закреплённого подменю. Назван приставкой кита по той же причине, что и ключ моды. */
export const SUB_MENU_WIDTH_KEY: string = 'rtui-side-menu-sub-menu-width';

/**
 * Пределы ширины подменю в пикселях.
 *
 * Взяты половиной и двойным от оформления по умолчанию: уже нижнего не помещается ни одна подпись
 * пункта, шире верхнего подменю закрывает содержимое страницы, ради которого меню и открывали.
 */
export const SUB_MENU_WIDTH_MIN: number = 120;
export const SUB_MENU_WIDTH_MAX: number = 480;

/** Приведение ширины к пределам. Тянут её мышью, и рука уходит за край экрана раньше, чем за предел. */
export function clampSubMenuWidth(width: number): number {
    return Math.min(SUB_MENU_WIDTH_MAX, Math.max(SUB_MENU_WIDTH_MIN, width));
}

/**
 * Чтение сохранённой ширины.
 *
 * Ширины нет — возвращается пустота, и ширину ставит оформление: своё число здесь подменило бы
 * значение из набора токенов, и правка токена перестала бы что-либо менять.
 *
 * Отказ хранилища и нечисловое значение читаются одинаково — как отсутствие выбора, по той же
 * причине, что и при чтении моды.
 */
export function readSubMenuWidth(storage: Storage | null): number | null {
    if (storage === null) {
        return null;
    }

    try {
        const stored: string | null = storage.getItem(SUB_MENU_WIDTH_KEY);

        if (stored === null || stored.trim() === '') {
            return null;
        }

        const width: number = Number(stored);

        return Number.isFinite(width) ? clampSubMenuWidth(width) : null;
    } catch {
        return null;
    }
}

/** Запись ширины. Пишется приведённая: за пределы её уводит и рука, и чужая правка ключа. */
export function writeSubMenuWidth(storage: Storage | null, width: number): void {
    if (storage === null) {
        return;
    }

    try {
        storage.setItem(SUB_MENU_WIDTH_KEY, String(clampSubMenuWidth(width)));
    } catch {
        // хранилище закрыто настройками браузера — ширина просто не переживёт перезагрузку
    }
}

/** Кусок подписи: отмеченный — тот, которым она совпала с запросом. */
export interface ISubMenuTitlePart {
    text: string;
    matched: boolean;
}

/**
 * Резка подписи на совпавшие и несовпавшие куски.
 *
 * Отмечается найденное, а не вся подпись: подсвеченная целиком, она говорит ровно то же, что и её
 * присутствие в списке. Отмечаются все вхождения — подпись раздела повторяет слово в себе чаще,
 * чем кажется, и отмеченное одно первое читается как «второго нет».
 *
 * Сравнение регистронезависимое, как и отбор, а куски режутся из оригинала: приведение к нижнему
 * регистру переписало бы чужие названия разделов.
 */
export function splitSubMenuTitle(name: string, query: string): ISubMenuTitlePart[] {
    if (name === '') {
        return [];
    }

    const needle: string = query.trim().toLowerCase();

    if (needle === '') {
        return [{ text: name, matched: false }];
    }

    const haystack: string = name.toLowerCase();
    const parts: ISubMenuTitlePart[] = [];
    let from: number = 0;

    for (let at: number = haystack.indexOf(needle, from); at !== -1; at = haystack.indexOf(needle, from)) {
        if (at > from) {
            parts.push({ text: name.slice(from, at), matched: false });
        }

        parts.push({ text: name.slice(at, at + needle.length), matched: true });
        from = at + needle.length;
    }

    if (from < name.length) {
        parts.push({ text: name.slice(from), matched: false });
    }

    return parts;
}

/**
 * Пункты подменю в том порядке, в каком они стоят на экране.
 *
 * Внутрь папки список спускается, только если та раскрыта: закрытая папка — одна строка, и ходьба
 * стрелками обязана идти по видимому, а не по всему набору. Иначе подсветка пропадает внутри
 * свёрнутого раздела, и человек нажимает стрелку в пустоту.
 */
export function walkSubMenuItems(items: ReadonlyArray<ISideMenu.Item>, expandedIds: ReadonlyArray<string | number>): ISideMenu.Item[] {
    return items.reduce((walk: ISideMenu.Item[], item: ISideMenu.Item): ISideMenu.Item[] => {
        walk.push(item);

        if (item.submenu?.length && expandedIds.includes(item.id)) {
            walk.push(...walkSubMenuItems(item.submenu, expandedIds));
        }

        return walk;
    }, []);
}

/**
 * Куда уходит подсветка на шаг стрелкой.
 *
 * Считается по номеру пункта, а не по его месту в массиве: видимый список пересобирается на каждую
 * букву запроса, и место переживает такую пересборку иначе, чем номер.
 *
 * Подсветки ещё нет — стрелка вниз берёт первый пункт, стрелка вверх последний: человек нажал
 * стрелку, чтобы попасть в список, и обе стороны у него равноправны. У краёв ходьба
 * останавливается и не заворачивается на другой конец: заворот уводит взгляд через всю панель
 * тогда, когда человек всего лишь дошёл до низа.
 */
export function stepSubMenuHighlight(
    walk: ReadonlyArray<ISideMenu.Item>,
    highlightedId: string | number | null,
    step: number
): string | number | null {
    if (walk.length === 0) {
        return null;
    }

    const at: number = walk.findIndex((item: ISideMenu.Item): boolean => item.id === highlightedId);

    if (at === -1) {
        return step > 0 ? walk[0].id : walk[walk.length - 1].id;
    }

    const next: number = Math.min(walk.length - 1, Math.max(0, at + step));

    return walk[next].id;
}

/** Чем вешается слушатель. У кита это `Renderer2.listen`, у проверки — своя пара функций. */
export type TPointerListen = (target: HTMLElement, event: string, handler: (event: PointerEvent) => void) => () => void;

/** Что тяга сообщает меню: новую ширину по ходу и конец — отпусканием или отнятием указателя. */
export interface ISubMenuWidthDragHooks {
    readonly onWidth: (width: number) => void;
    readonly onEnd: () => void;
}

/**
 * Тяга ширины подменю: считается здесь, а не в компоненте, и меню остаётся тонким.
 *
 * Идёт указательными событиями: мышиных палец и перо не дают вовсе, и ручка на нажатии мыши
 * берётся одной мышью. Слушатели висят на самой ручке, а держит их за ней захват указателя:
 * слушатель на документе теряет движение, как только указатель уходит на кадр чужого адреса, и
 * панель застревает на ширине той минуты.
 *
 * Указатель, отнятый средой — жестом системы, звонком, — кончает тягу так же, как отпускание.
 *
 * Возвращает снятие слушателей. Пустое значение — тянуть нечем: ручка не элемент разметки.
 */
export function startSubMenuWidthDrag(
    event: PointerEvent,
    startWidth: number,
    listen: TPointerListen,
    hooks: ISubMenuWidthDragHooks
): (() => void) | null {
    const handle: EventTarget | null = event.currentTarget;

    if (!(handle instanceof HTMLElement)) {
        return null;
    }

    const pointerId: number = event.pointerId;
    const startX: number = event.clientX;

    // Захвата нет у среды, где идут проверки; без него слушатели остаются на ручке как есть.
    if (typeof handle.setPointerCapture === 'function') {
        handle.setPointerCapture(pointerId);
    }

    const stopMove: () => void = listen(handle, 'pointermove', (moveEvent: PointerEvent): void => {
        if (moveEvent.pointerId === pointerId) {
            hooks.onWidth(clampSubMenuWidth(startWidth + moveEvent.clientX - startX));
        }
    });
    const stopUp: () => void = listen(handle, 'pointerup', (): void => hooks.onEnd());
    const stopCancel: () => void = listen(handle, 'pointercancel', (): void => hooks.onEnd());

    return (): void => {
        stopMove();
        stopUp();
        stopCancel();

        if (typeof handle.releasePointerCapture === 'function' && handle.hasPointerCapture(pointerId)) {
            handle.releasePointerCapture(pointerId);
        }
    };
}

/**
 * Ширина, которой панель нарисована. От неё отсчитывается тяга, когда своего выбора ещё нет.
 *
 * Панели нет или раскладка ещё не посчитана — берётся нижний предел: с нуля тяга уводила бы
 * ширину в отрицательные числа с первого же движения.
 */
export function drawnSubMenuWidth(panel: HTMLElement | null): number {
    const width: number = panel?.getBoundingClientRect().width ?? 0;

    return width > 0 ? width : SUB_MENU_WIDTH_MIN;
}
