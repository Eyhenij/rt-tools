import type { IRtIcon } from '../components/icon/rt-icon.model';

import { IMessageBusEvent } from './message-bus';

/**
 * Контракт уведомлений (toast'ов). Отправитель кладёт в событие готовый текст и
 * семантику — потребитель (`rt-toaster`) отрисовывает, ничего не зная о том,
 * кто событие послал.
 */
export namespace INotification {
    /** Семантическая палитра уведомления; совпадает по значениям с `rt-message`. */
    export type Severity = 'info' | 'success' | 'warning' | 'danger';

    export interface Action {
        readonly label: string;
        readonly handler: () => void;
    }

    /** Полезная нагрузка toast'а. */
    export interface Payload {
        readonly message: string;
        readonly severity: Severity;
        readonly description?: string;
        /** Надстрочник над сообщением: автор, источник и время события */
        readonly meta?: string;
        readonly action?: Action;
        /**
         * Второе действие. Событию журнала их нужно два — перейти к записи и
         * отметить прочитанным, не переходя, — и одного тоста на оба не хватает.
         */
        readonly secondaryAction?: Action;
        readonly filled?: boolean;
        /**
         * Сколько тост живёт, в миллисекундах. Не задано — столько, сколько велит тостер;
         * `null` — таймера нет, тост держится до крестика.
         */
        readonly duration?: number | null;
        /** Полоса срока под тостом: сжимается вместе с таймером и встаёт вместе с ним. */
        readonly progress?: boolean;
        /** Свой значок вместо значка severity; `null` — тост без значка. */
        readonly icon?: IRtIcon.Name | null;
    }

    export type Options = Pick<
        Payload,
        'description' | 'meta' | 'action' | 'secondaryAction' | 'filled' | 'duration' | 'progress' | 'icon'
    >;

    /**
     * Событие шины уведомлений. `type` — строковый дискриминатор (доменные
     * action-перечисления вроде «обновление записи успешно»/«ошибка загрузки
     * списка» приводятся к строке), `payload` несёт текст и severity.
     */
    export interface Event extends IMessageBusEvent<string> {
        readonly payload: Payload;
    }
}
