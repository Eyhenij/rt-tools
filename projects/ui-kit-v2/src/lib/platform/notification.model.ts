import type { Type } from '@angular/core';

import type { IRtIcon } from '../components/icon/rt-icon.model';

import type { Observable } from 'rxjs';

import { IMessageBusEvent } from './message-bus';

/**
 * Контракт уведомлений (toast'ов). Отправитель кладёт в событие готовый текст и
 * семантику — потребитель (`rt-toaster`) отрисовывает, ничего не зная о том,
 * кто событие послал.
 */
export namespace INotification {
    /** Семантическая палитра уведомления; совпадает по значениям с `rt-message`. */
    export type Severity = 'info' | 'success' | 'warning' | 'danger';

    /**
     * Почему тост ушёл не по действию: крестик, истёкший таймер или вытеснение новым в режиме
     * `replace`. Ушедший по действию причины не сообщает — его обработчик уже вызван.
     */
    export type DismissReason = 'close' | 'timeout' | 'replaced';

    /**
     * Почему тост ушёл — всё, что сообщает `afterDismissed()` ручки: причины ухода без действия,
     * нажатое действие, `dismiss()` самого приложения и `destroyed` — тост ушёл вместе с тостером,
     * например при смене страницы: ждущий ухода иначе ждал бы вечно.
     */
    export type CloseReason = DismissReason | 'action' | 'dismiss' | 'destroyed';

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
        /**
         * Сообщает один раз, почему тост ушёл без действия. Приложению это нужно, когда тост
         * держит ожидание — вход, подтверждение, — и закрытый крестиком должен его отменить.
         */
        readonly onDismiss?: (reason: DismissReason) => void;
        /**
         * Живая доля задачи, 0–100: под сообщением встаёт полоса прогресса. Меняется ручкой —
         * `update({ progressValue })` — по мере того, как доля приходит из потока задачи.
         */
        readonly progressValue?: number | null;
        /** Подробности, которые раскрываются по нажатию и копируются целиком: текст ошибки, журнал. */
        readonly details?: string;
        /**
         * Свой компонент вместо сообщения и описания. Значок, крестик и сроки остаются у тоста;
         * компонент получает `data` токеном `RT_TOAST_DATA` и ручку — `NotificationRef`.
         */
        readonly component?: Type<unknown>;
        /** Данные своего компонента. */
        readonly data?: unknown;
        /**
         * Тостер, который покажет тост: тот, у кого вход `channel` с этим именем. Не задано —
         * `'default'`, его слушает тостер без входа. Свой канал держит закреплённые тосты отдельно:
         * обычный тост в режиме `replace` их не вытесняет.
         */
        readonly channel?: string;
    }

    export type Options = Pick<
        Payload,
        | 'description'
        | 'meta'
        | 'action'
        | 'secondaryAction'
        | 'filled'
        | 'duration'
        | 'progress'
        | 'icon'
        | 'onDismiss'
        | 'progressValue'
        | 'details'
        | 'channel'
    >;

    /** Что меняет ручка показанного тоста: текст, важность, долю, подробности и данные компонента. */
    export type Update = Partial<Pick<Payload, 'message' | 'description' | 'meta' | 'severity' | 'progressValue' | 'details' | 'data'>>;

    /** Тост из своего компонента: важность по умолчанию `info`, сообщение — имя для чтения с экрана. */
    export type ComponentOptions = Options & Partial<Pick<Payload, 'severity' | 'message' | 'data'>>;

    /**
     * Событие шины уведомлений. `type` — строковый дискриминатор (доменные
     * action-перечисления вроде «обновление записи успешно»/«ошибка загрузки
     * списка» приводятся к строке), `payload` несёт текст и severity.
     */
    export interface Event extends IMessageBusEvent<string> {
        readonly payload: Payload;
        /** Ручка показанного тоста; шина кладёт её сама при отправке. */
        readonly ref?: IRef;
    }

    /** Ручка показанного тоста: закрыть, обновить и узнать, когда и почему он ушёл. */
    export interface IRef {
        update(patch: Update): void;
        dismiss(): void;
        afterDismissed(): Observable<CloseReason>;
    }
}
