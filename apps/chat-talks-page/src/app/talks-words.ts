/**
 * Слова страницы переписок.
 *
 * Свои, а не словарь админки приёмника: та говорит с оператором сервиса, а страница — с человеком
 * потребителя, и язык у них разный. Словарь админки привёл бы за собой и её службу языка, то есть
 * выбор, который делает не тот человек.
 *
 * Язык пока один. Восемь наборов, обещанных описанием, страница получит вместе со словарём набора —
 * это названо владельцу и стоит отдельной строкой в описании подобласти.
 */

import { RT_KIT_LABELS_EN, TRtKitLabelKey, TRtKitTranslator } from '@rt-tools/ui-kit-v2';

/** Ключи подписей страницы: набор закрыт, и слово вне его на экран не попадает. */
export type TTalksWord =
    'talksEmpty' | 'feedUnchosen' | 'answerPlaceholder' | 'close' | 'reopen' | 'sideOperator' | 'sideVisitor' | 'stateLive' | 'stateClosed';

/** Подписи страницы: их читает человек потребителя. Набор полон по ключам. */
export const TALKS_WORDS: Readonly<Record<TTalksWord, string>> = {
    talksEmpty: 'Переписок пока нет',
    feedUnchosen: 'Выберите разговор слева',
    answerPlaceholder: 'Ответить посетителю',
    close: 'Закрыть разговор',
    reopen: 'Открыть снова',
    sideOperator: 'Мы',
    sideVisitor: 'Посетитель',
    stateLive: 'Живой',
    stateClosed: 'Закрыт',
};

/**
 * Подписи набора по-русски: их показывают его готовые части — лента, поле ответа, поиск списка.
 *
 * Названы только те ключи, которые страница показывает. Об остальных набор отвечает своим
 * английским умолчанием: пустой кнопки на экране не бывает, а перевод всего словаря набора — работа
 * не этой страницы.
 */
export const TALKS_KIT_WORDS: Readonly<Partial<Record<TRtKitLabelKey, string>>> = {
    chatPlaceholder: 'Ответить посетителю',
    chatSendLabel: 'Отправить',
    chatSendAria: 'Отправить реплику',
    chatComposerAria: 'Поле ответа',
    chatEmptyThread: 'Реплик пока нет',
    chatEmptyHint: 'Разговор пока пуст',
    chatRetryTooltip: 'Отправить снова',
    chatRetryAria: 'Отправить реплику снова',
    chatStatusFailed: 'Не отправлено',
    uiSearch: 'Поиск',
};

/** Переводчик подписей набора: названное берётся отсюда, остальное — английским умолчанием набора. */
export const talksKitTranslator: TRtKitTranslator = (key: TRtKitLabelKey): string => TALKS_KIT_WORDS[key] ?? RT_KIT_LABELS_EN[key];
