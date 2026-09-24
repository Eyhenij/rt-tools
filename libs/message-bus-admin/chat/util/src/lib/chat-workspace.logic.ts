/**
 * Чем разговор представляется рабочему столу: свойства, заголовок ленты и действия над разговором.
 *
 * Их показывают два экрана — панель оператора и встраиваемая страница потребителя, — и написанные
 * у каждого места рисования они разошлись бы молча: так уже вышло с площадкой, которую панель в
 * строке показывает, а страница нет.
 *
 * Функции чистые и подписей у себя не держат: слова приезжают доводом из набора подписей экрана.
 * Словарь у панели и у страницы один, но берут они его разными службами, и чтение словаря отсюда
 * связало бы общую часть с одной из них.
 */
import { IRtWorkspaceDetails } from '@rt-tools/ui-kit-v2';

import { EChatTalkState } from '@rt/message-bus-common';

import { chatMomentText } from './chat-send.logic';
import { IChat } from './chat.model';

/** Что делают с разговором из панели подробностей. */
export enum EChatTalkAction {
    Close = 'close',
    Reopen = 'reopen',
}

/** Подписи, которыми рабочий стол говорит о разговоре. Их даёт набор подписей экрана. */
export interface IChatTalkWords {
    readonly site: string;
    readonly state: string;
    readonly lastMessageAt: string;
    readonly stateLive: string;
    readonly stateClosed: string;
    readonly close: string;
    readonly reopen: string;
    /** Чем зовётся разговор, у которого последняя реплика пуста. */
    readonly untitled: string;
    /** Как зовутся стороны разговора в строке списка. */
    readonly sideOperator: string;
    readonly sideVisitor: string;
}

/** Закрыт ли разговор. Слово состояния читается в трёх местах, и судится оно одним. */
export function chatTalkClosed(talk: IChat.Talk.State | null): boolean {
    return talk?.state === EChatTalkState.Closed;
}

/** Слово состояния разговора: им подписан и тег строки, и свойство подробностей. */
export function chatTalkStateWord(talk: IChat.Talk.State | null, words: IChatTalkWords): string {
    return chatTalkClosed(talk) ? words.stateClosed : words.stateLive;
}

/**
 * Заголовок ленты — последняя реплика разговора одной строкой.
 *
 * Своего имени у разговора здесь нет, а заголовок из опознавателя человеку не говорит ничего.
 * Пустая последняя реплика бывает у разговора, начатого стёртой репликой, и пустой заголовок
 * читался бы как незагруженный экран.
 */
export function chatTalkTitle(talk: IChat.Talk.State | null, words: IChatTalkWords): string {
    if (talk === null) {
        return '';
    }

    return talk.lastMessage.trim() || words.untitled;
}

/**
 * Свойства разговора для панели подробностей.
 *
 * Показывается то, что чтение уже отдаёт: площадка, состояние и минута последней реплики. Имени
 * посетителя, языка и непрочитанного в моделях приёмника нет вовсе, и строка под них стояла бы
 * пустой на каждом разговоре.
 */
export function chatTalkDetailRows(talk: IChat.Talk.State | null, words: IChatTalkWords, locale: string): IRtWorkspaceDetails.Row[] {
    if (talk === null) {
        return [];
    }

    return [
        { label: words.site, value: talk.siteId },
        { label: words.state, value: chatTalkStateWord(talk, words) },
        { label: words.lastMessageAt, value: chatMomentText(talk.lastMessageAt, locale) },
    ];
}

/**
 * Действия над разговором для панели подробностей.
 *
 * Оно ровно одно и в каждый миг одно: живой закрывают, закрытый открывают снова. Без выбранного
 * разговора действий нет — панель подробностей тогда пуста.
 */
export function chatTalkActions(talk: IChat.Talk.State | null, words: IChatTalkWords): IRtWorkspaceDetails.Action[] {
    if (talk === null) {
        return [];
    }

    const closed: boolean = chatTalkClosed(talk);

    return [
        {
            id: closed ? EChatTalkAction.Reopen : EChatTalkAction.Close,
            label: closed ? words.reopen : words.close,
            icon: closed ? 'refresh' : 'check',
            appearance: 'outlined',
        },
    ];
}

/** Состояние, в которое переводит нажатое действие. */
export function chatTalkStateAfter(action: string): EChatTalkState {
    return action === EChatTalkAction.Reopen ? EChatTalkState.Live : EChatTalkState.Closed;
}
