/**
 * Словарь админки: подписи её экранов и подписи, которые рисует кит.
 *
 * Оба набора лежат здесь, а не в разметке: разложенные по шаблонам, они правятся в десяти местах
 * и расходятся друг с другом. Кит при этом рисует часть текста сам — переключатель страниц,
 * пустое состояние, настройку столбцов, — и без своего набора ставит английское умолчание рядом
 * с русскими заголовками. Видно это только на собранном экране.
 *
 * Язык один — русский. Второй заводится вторым таким объектом и сменой функции-переводчика:
 * ставить ради одного языка загрузчик словарей значит завести настройку, которую нечем наполнить.
 *
 * Ключей у кита сто тридцать один, и переведены здесь не все: неназванный он берёт английским
 * умолчанием, и пустой подписи на экране не бывает никогда. Переводится то, что админка
 * показывает, — таблица, страницы, столбцы, панель.
 */
import { RtKitLabelKey, RtKitLabelParams } from '@rt-tools/ui-kit-v2';

/** Подписи экранов админки. Ключ читается в шаблоне, значение правится здесь. */
// eslint-disable-next-line @typescript-eslint/typedef -- аннотация стёрла бы литеральный тип, на котором стоит TAdminLabelKey
export const ADMIN_LABELS = {
    appTitle: 'Приёмник',
    signOut: 'Выйти',

    sectionPostmortems: 'Разборы происшествий',
    sectionProposals: 'Предложения',
    sectionSummaries: 'Сводки деревьев',

    filterTree: 'Дерево',
    filterTreeAll: 'Все деревья',

    columnTree: 'Дерево',
    columnFile: 'Файл',
    columnArrivedAt: 'Приехал',
    columnUpdatedAt: 'Обновлён',
    columnResource: 'Ресурс',
    columnAddress: 'Адрес',
    columnMonth: 'Месяц',
    columnSessions: 'Заходов',
    columnRanAt: 'Прогон',

    listEmpty: 'Записей нет: ни одно дерево их пока не присылало',
    listEmptyByFilter: 'По этому отбору записей нет',
    listFailed: 'Прочитать не удалось',
    listSessionEnded: 'Вход кончился: представьтесь заново',
    listRefresh: 'Прочитать заново',
    listRetry: 'Повторить',
    listIncident: 'Обращение {{incident}}',

    detailsMissing: 'Записи нет: она могла быть удалена',
    detailsFailed: 'Прочитать запись не удалось',
    detailsClose: 'Закрыть',
    detailsPostmortem: 'Разбор происшествия',
    detailsProposal: 'Предложение',
    detailsText: 'Текст',
    detailsSummary: 'Сводка',
} as const;

/** Ключ подписи админки. Опечатка в шаблоне не доживает до собранного экрана. */
export type TAdminLabelKey = keyof typeof ADMIN_LABELS;

/**
 * Подписи кита по-русски.
 *
 * Набор неполный намеренно: кит подставляет английское умолчание тому, чего здесь нет, и
 * пустой подписи на экране не бывает. Дописывается он тогда, когда админка начинает показывать
 * ещё один его компонент, — а не наперёд.
 */
const RT_KIT_LABELS_RU: Partial<Record<RtKitLabelKey, string>> = Object.freeze({
    bottomSheetClose: 'Закрыть',
    fieldErrorEmail: 'Неверный адрес почты',
    fieldErrorMax: 'Значение слишком велико',
    fieldErrorMaxLength: 'Значение слишком длинное',
    fieldErrorMin: 'Значение слишком мало',
    fieldErrorMinLength: 'Значение слишком короткое',
    fieldErrorPattern: 'Неверный формат',
    fieldErrorRequired: 'Обязательное поле',
    themeToggleLabel: 'Сменить тему',
    uiActions: 'Действия',
    uiBack: 'Назад',
    uiBackToList: 'К списку',
    uiCancel: 'Отмена',
    uiClear: 'Очистить',
    uiClose: 'Закрыть',
    uiColumnLocked: 'Столбец закреплён',
    uiColumnSettings: 'Настройка столбцов',
    uiColumnSettingsTitle: 'Какие столбцы показывать',
    uiConfirm: 'Подтвердить',
    uiCopied: 'Скопировано',
    uiCopy: 'Скопировать',
    uiDetails: 'Подробности',
    uiDragColumn: 'Перетащить столбец',
    uiFilters: 'Отбор',
    uiHideColumn: 'Скрыть столбец',
    uiItemsPerPage: 'Строк на странице',
    uiMore: 'Ещё',
    uiMoreActions: 'Другие действия',
    uiNextPage: 'Следующая страница',
    uiNoRows: 'Записей нет',
    uiPageOf: 'Страница {{page}} из {{last}}',
    uiPrevPage: 'Предыдущая страница',
    uiRangeOf: '{{from}}–{{to}} из {{total}}',
    uiSearch: 'Поиск',
});

/** Места вида `{{name}}` — их заполняет `fill`. Тот же вид, что у подписей кита. */
const PLACEHOLDER: RegExp = /\{\{\s*([A-Za-z0-9_]+)\s*\}\}/g;

/**
 * Подставляет параметры в подпись.
 *
 * Место, для которого параметра не дали, остаётся как есть: пустота на его месте прочиталась бы
 * как законченная фраза, а `{{name}}` виден и чинится.
 */
export function fill(text: string, params?: RtKitLabelParams): string {
    if (params === undefined) {
        return text;
    }

    return text.replace(PLACEHOLDER, (match: string, name: string): string => {
        const value: string | number | undefined = params[name];

        return value === undefined ? match : String(value);
    });
}

/** Подпись админки с подстановками. */
export function adminLabel(key: TAdminLabelKey, params?: RtKitLabelParams): string {
    return fill(ADMIN_LABELS[key], params);
}

/**
 * Функция, которой кит получает подписи.
 *
 * Ключа, которого в русском наборе нет, она не отвечает вовсе — кит берёт своё английское
 * умолчание. Пустая строка тут и означает «ответа нет»: так договорился сам кит.
 */
export function rtKitLabelsRu(key: RtKitLabelKey, params?: RtKitLabelParams): string {
    const found: string | undefined = RT_KIT_LABELS_RU[key];

    return found === undefined ? '' : fill(found, params);
}

/** Локаль админки. Ею кит форматирует даты, и ею же они показываются в поясе смотрящего. */
export const ADMIN_LOCALE: string = 'ru';
