/** Признак материального набора в разметке: атрибут или класс, которые ставит приложение. */
export const RT_MATERIAL_PRESET_SELECTOR: string = "[data-preset='material'],.rt-preset-material";

/** Класс набора, который несёт узел вне поддерева, где набор объявлен. */
export const RT_MATERIAL_PRESET_CLASS: string = 'rt-preset-material';

/**
 * Классы набора для панели наложения, открытой от `origin`. Панель лежит в конце страницы, вне
 * контейнера с признаком набора, и назначения набора до неё не доходят: она берёт класс набора
 * сама, если признак стоит над узлом, от которого она открыта. Кит читает признак приложения, а не
 * ставит свой.
 */
export function materialPresetClassesOf(origin: Element): string[] {
    return origin.closest(RT_MATERIAL_PRESET_SELECTOR) ? [RT_MATERIAL_PRESET_CLASS] : [];
}

/**
 * Классы набора для панели, которую открывает сервис без узла-источника: диалог, боковая панель.
 * Источником служит узел в фокусе в момент открытия — нажатая кнопка. Панель, открытая не по
 * нажатию, набор от фокуса не берёт; для неё остаётся `panelClass` приложения.
 */
export function materialPresetClassesOfFocus(document: Document): string[] {
    const focused: Element | null = document.activeElement;
    return focused ? materialPresetClassesOf(focused) : [];
}

/** Атрибут местного куска темы — его ставит `rtTheme` и читают правила куска в стилях кита. */
export const RT_THEME_SCOPE_ATTRIBUTE: string = 'data-theme';

/**
 * Тема местного куска, от которого открыта панель, — значение ближайшего `data-theme` над `origin`.
 * Панель лежит в конце страницы, вне куска, и без этого рисуется темой страницы: список тёмной
 * карточки на светлой странице выходил светлым. Тема корня страницы не возвращается: её панель
 * наследует и так, а признак на панели повторил бы весь набор назначений ещё раз.
 */
export function themeScopeOf(origin: Element): string | null {
    const scope: Element | null = origin.closest(`[${RT_THEME_SCOPE_ATTRIBUTE}]`);
    if (scope === null || scope === origin.ownerDocument.documentElement) {
        return null;
    }

    return scope.getAttribute(RT_THEME_SCOPE_ATTRIBUTE) || null;
}

function applyThemeScope(pane: HTMLElement, theme: string | null): void {
    if (theme === null) {
        pane.removeAttribute(RT_THEME_SCOPE_ATTRIBUTE);
    } else {
        pane.setAttribute(RT_THEME_SCOPE_ATTRIBUTE, theme);
    }
}

/** Атрибут части страницы со своим набором значков — его пишет `rtIconSet`. */
export const RT_ICON_SET_ATTRIBUTE: string = 'data-rt-icon-set';

/** Набор значков части, от которой открыта панель, — значение ближайшего `data-rt-icon-set` над `origin`. */
export function iconSetScopeOf(origin: Element): string | null {
    return origin.closest(`[${RT_ICON_SET_ATTRIBUTE}]`)?.getAttribute(RT_ICON_SET_ATTRIBUTE) || null;
}

/**
 * Набор значков для окна, которое открывает сервис без узла-источника: диалог, боковая панель.
 * Источником служит узел в фокусе в момент открытия, как у `themeScopeOfFocus`.
 */
export function iconSetScopeOfFocus(document: Document): string | null {
    const focused: Element | null = document.activeElement;
    return focused ? iconSetScopeOf(focused) : null;
}

/** Пишет на коробку панели набор значков или снимает его. */
export function applyIconSetScope(pane: HTMLElement, set: string | null): void {
    if (set === null) {
        pane.removeAttribute(RT_ICON_SET_ATTRIBUTE);
    } else {
        pane.setAttribute(RT_ICON_SET_ATTRIBUTE, set);
    }
}

/**
 * Переносит на коробку панели то, что объявила часть страницы вокруг `origin`: тему куска и набор
 * значков. Чего у части нет, с коробки снимается. Зовётся на каждом открытии: коробка переживает
 * закрытие, а часть вокруг источника могла смениться.
 */
export function carryThemeScope(pane: HTMLElement, origin: Element): void {
    applyThemeScope(pane, themeScopeOf(origin));
    applyIconSetScope(pane, iconSetScopeOf(origin));
}

/**
 * Тема местного куска для панели, которую открывает сервис без узла-источника: диалог, боковая
 * панель. Источником служит узел в фокусе в момент открытия — нажатая кнопка, как у
 * `materialPresetClassesOfFocus`. Без фокуса, как и под темой корня, возвращает `null`.
 */
export function themeScopeOfFocus(document: Document): string | null {
    const focused: Element | null = document.activeElement;
    return focused ? themeScopeOf(focused) : null;
}

/**
 * Переносит на коробку панели тему куска и набор значков части, где стоит фокус. Зовётся до того,
 * как панель заберёт фокус себе: после этого `activeElement` уже внутри панели, в конце страницы.
 */
export function carryThemeScopeOfFocus(pane: HTMLElement, document: Document): void {
    applyThemeScope(pane, themeScopeOfFocus(document));
    applyIconSetScope(pane, iconSetScopeOfFocus(document));
}
