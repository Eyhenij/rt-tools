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
