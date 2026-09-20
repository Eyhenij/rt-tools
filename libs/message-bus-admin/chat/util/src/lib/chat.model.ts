/**
 * Панель чата, какой её читает админка.
 *
 * Две стороны тем же устройством, что у остальных разделов: сторона контракта — псевдоним формы
 * из общей либы, той самой, которой отвечает приёмник; сторона экрана несёт то, что показывает
 * список и лента.
 *
 * Отправленная реплика — та же форма сообщения, и своей стороны контракта у неё нет: она живёт в
 * памяти открытого экрана, пока сервис не ответил о ней.
 */
import { IChatMessageRow, IChatTalkRow } from '@rt/message-bus-common';

/** Состояние разговора закрытым набором: так его называет приёмник. */
export enum EChatTalkState {
    Live = 'live',
    Closed = 'closed',
}

/** Сторона разговора закрытым набором: посетитель или оператор. */
export enum EChatSide {
    Visitor = 'visitor',
    Operator = 'operator',
}

/** Что стало с отправленной репликой: ответа ещё нет, ответ пришёл, отправка отбита. */
export enum EChatSendState {
    Sent = 'sent',
    Taken = 'taken',
    Refused = 'refused',
}

export namespace IChat {
    /** Строка списка переписок. */
    export namespace Talk {
        /** Сторона контракта. */
        export type Api = IChatTalkRow;

        /** Сторона экрана. */
        export interface State {
            readonly id: string;
            readonly siteId: string;
            /** Состояние разговора. Чужое слово читается как живой: закрытым его делает оператор. */
            readonly state: EChatTalkState;
            readonly lastMessageAt: string;
            readonly lastMessage: string;
            readonly lastMessageSide: EChatSide;
        }
    }

    /** Сообщение ленты. */
    export namespace Message {
        /** Сторона контракта. */
        export type Api = IChatMessageRow;

        /** Сторона экрана. */
        export interface State {
            readonly id: string;
            readonly side: EChatSide;
            readonly text: string;
            readonly takenAt: string;
            /**
             * Что стало с репликой. У пришедшего из хранилища — принято: спрашивать о нём нечего,
             * оно уже лежит.
             */
            readonly send: EChatSendState;
        }
    }
}
