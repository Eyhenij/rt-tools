import { IRtSideMenu } from './rt-side-menu.model';

/**
 * Отбор пунктов подменю по подстроке подписи.
 *
 * Отбор спускается внутрь папок на любую глубину: потребитель кладёт в папки то, что человек и ищет
 * по имени, и по одному верхнему уровню такой пункт не нашёлся бы.
 *
 * В выдаче стоят только строки, содержащие запрос. Папка остаётся путём к совпавшим детям, а её
 * состав отбирается тем же правилом: иначе одно совпадение по имени папки вытаскивало бы весь её
 * состав. Папка, совпавшая только по имени, остаётся одной строкой без детей.
 *
 * Отобранная папка — новый объект: правка на месте переписала бы набор потребителя, и стёртый
 * запрос вернул бы урезанное меню.
 */
export function filterSubMenuItems(items: ReadonlyArray<IRtSideMenu.Item>, query: string): IRtSideMenu.Item[] {
    const needle: string = query.trim().toLowerCase();

    if (needle === '') {
        return [...items];
    }

    return items.reduce((kept: IRtSideMenu.Item[], item: IRtSideMenu.Item): IRtSideMenu.Item[] => {
        const isFolder: boolean = Boolean(item.submenu?.length);
        const inside: IRtSideMenu.Item[] = isFolder ? filterSubMenuItems(item.submenu ?? [], query) : [];

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
 * Папки отобранного списка — те, что должны стоять раскрытыми. Возвращаются номера, а не пункты:
 * отобранный список пересобирается на каждую букву запроса, и ссылка на пункт этого не переживает.
 */
export function subMenuIdsToExpand(items: ReadonlyArray<IRtSideMenu.Item>): Array<string | number> {
    return items.reduce((ids: Array<string | number>, item: IRtSideMenu.Item): Array<string | number> => {
        if (item.submenu?.length) {
            ids.push(item.id, ...subMenuIdsToExpand(item.submenu));
        }

        return ids;
    }, []);
}

/**
 * Пределы ширины подменю в пикселях. Уже нижнего не помещается ни одна подпись пункта, шире
 * верхнего подменю закрывает содержимое страницы.
 */
export const SUB_MENU_WIDTH_MIN: number = 120;
export const SUB_MENU_WIDTH_MAX: number = 480;

/** Шаг ширины с клавиатуры: стрелку держат нажатой, и крупный шаг проскакивал бы подпись целиком. */
export const SUB_MENU_WIDTH_STEP: number = 16;

/** Приведение ширины к пределам. */
export function clampSubMenuWidth(width: number): number {
    return Math.min(SUB_MENU_WIDTH_MAX, Math.max(SUB_MENU_WIDTH_MIN, width));
}

/**
 * Резка подписи на совпавшие и несовпавшие куски.
 *
 * Отмечаются все вхождения: отмеченное одно первое читается как «второго нет». Сравнение без учёта
 * регистра, а куски режутся из оригинала — приведение к нижнему регистру переписало бы названия.
 */
export function splitSubMenuTitle(name: string, query: string): IRtSideMenu.TitlePart[] {
    if (name === '') {
        return [];
    }

    const needle: string = query.trim().toLowerCase();

    if (needle === '') {
        return [{ text: name, matched: false }];
    }

    const haystack: string = name.toLowerCase();
    const parts: IRtSideMenu.TitlePart[] = [];
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
 * Пункты подменю в том порядке, в каком они стоят на экране. Внутрь папки список спускается, только
 * если та раскрыта: ходьба стрелками идёт по видимому, а не по всему набору.
 */
export function walkSubMenuItems(items: ReadonlyArray<IRtSideMenu.Item>, expandedIds: ReadonlyArray<string | number>): IRtSideMenu.Item[] {
    return items.reduce((walk: IRtSideMenu.Item[], item: IRtSideMenu.Item): IRtSideMenu.Item[] => {
        walk.push(item);

        if (item.submenu?.length && expandedIds.includes(item.id)) {
            walk.push(...walkSubMenuItems(item.submenu, expandedIds));
        }

        return walk;
    }, []);
}

/**
 * Куда уходит подсветка на шаг стрелкой. Считается по номеру пункта: видимый список пересобирается
 * на каждую букву запроса. Без подсветки вниз берёт первый пункт, вверх — последний. У краёв ходьба
 * останавливается: заворот уводил бы взгляд через всю панель.
 */
export function stepSubMenuHighlight(
    walk: ReadonlyArray<IRtSideMenu.Item>,
    highlightedId: string | number | null,
    step: number
): string | number | null {
    if (walk.length === 0) {
        return null;
    }

    const at: number = walk.findIndex((item: IRtSideMenu.Item): boolean => item.id === highlightedId);

    if (at === -1) {
        return step > 0 ? walk[0].id : walk[walk.length - 1].id;
    }

    return walk[Math.min(walk.length - 1, Math.max(0, at + step))].id;
}

/** Чем вешается слушатель. У кита это `Renderer2.listen`, у проверки — своя функция. */
export type TRtPointerListen = (target: HTMLElement, event: string, handler: (event: PointerEvent) => void) => () => void;

/** Что тяга сообщает меню: новую ширину по ходу и конец — отпусканием или отнятием указателя. */
export interface IRtSubMenuWidthDragHooks {
    readonly onWidth: (width: number) => void;
    readonly onEnd: () => void;
}

/**
 * Тяга ширины подменю указательными событиями: мышиных палец и перо не дают. Слушатели висят на
 * ручке, а держит их захват указателя — слушатель на документе терял бы движение над чужим кадром.
 * Указатель, отнятый средой, кончает тягу так же, как отпускание.
 *
 * Возвращает снятие слушателей. Пустое значение — тянуть нечем.
 */
export function startSubMenuWidthDrag(
    event: PointerEvent,
    startWidth: number,
    listen: TRtPointerListen,
    hooks: IRtSubMenuWidthDragHooks
): (() => void) | null {
    const handle: EventTarget | null = event.currentTarget;

    // Тянет только основная кнопка: отпускание правой над меню среды ручке не приходит.
    if (!(handle instanceof HTMLElement) || event.button !== 0) {
        return null;
    }

    const pointerId: number = event.pointerId;
    const startX: number = event.clientX;

    // Захвата нет у среды, где идут проверки.
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
    // Захват снимается и без отпускания — ручку убрали из разметки; тогда конец тяги — сама потеря.
    const stopLost: () => void = listen(handle, 'lostpointercapture', (): void => hooks.onEnd());

    return (): void => {
        stopMove();
        stopUp();
        stopCancel();
        stopLost();

        if (typeof handle.releasePointerCapture === 'function' && handle.hasPointerCapture(pointerId)) {
            handle.releasePointerCapture(pointerId);
        }
    };
}

/**
 * Ширина, которой панель нарисована. Панели нет или раскладка не посчитана — нижний предел: с нуля
 * тяга уводила бы ширину в отрицательные числа.
 */
export function drawnSubMenuWidth(panel: HTMLElement | null): number {
    const width: number = panel?.getBoundingClientRect().width ?? 0;

    return width > 0 ? width : SUB_MENU_WIDTH_MIN;
}

/**
 * Число, которое уходит наружу по концу тяги: большее из натянутого и нарисованного. Нижний предел
 * держит оформление, и панель не бывает уже его, даже если рука ушла левее.
 */
export function reportedSubMenuWidth(dragged: number, panel: HTMLElement | null): number {
    return Math.max(dragged, drawnSubMenuWidth(panel));
}

/**
 * Новая ширина по нажатой клавише. Пустое значение — клавиша не о ширине, и умолчание не отменяется:
 * иначе ручка съедала бы табуляцию. Влево значит уже при любом направлении письма: ручка стоит у
 * правого края панели.
 */
export function subMenuWidthByKey(key: string, width: number): number | null {
    switch (key) {
        case 'ArrowRight':
            return clampSubMenuWidth(width + SUB_MENU_WIDTH_STEP);
        case 'ArrowLeft':
            return clampSubMenuWidth(width - SUB_MENU_WIDTH_STEP);
        case 'Home':
            return SUB_MENU_WIDTH_MIN;
        case 'End':
            return SUB_MENU_WIDTH_MAX;
        default:
            return null;
    }
}

/**
 * Что показывает закреплённое подменю: выбранный человеком раздел, а пока выбора нет — раздел
 * активного адреса. Выбор впереди активности: иначе до соседнего раздела не добраться.
 */
export function pinnedSubMenuItems(
    picked: IRtSideMenu.Item[] | null | undefined,
    activeIds: ReadonlyArray<string | number>,
    items: ReadonlyArray<IRtSideMenu.Item>
): IRtSideMenu.Item[] {
    if (picked?.length) {
        return picked;
    }

    return items.find((item: IRtSideMenu.Item): boolean => activeIds.includes(item.id) && !!item.submenu?.length)?.submenu ?? [];
}
