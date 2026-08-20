/**
 * Предложение по слою правил, каким его читает админка.
 *
 * Две стороны и два уровня — тем же устройством, что у разбора происшествия. Сторона контракта
 * несёт время строкой: через передачу его иначе не пронести. Сторона экрана — временем: пояс
 * смотрящего считается от него, и разбирать строку в каждой ячейке таблицы значило бы делать это
 * на каждой перерисовке.
 *
 * Уровня два, потому что их два и у приёмника: список несёт ресурс и адрес, а текста предложения
 * не несёт. Строка списка, получившая полную модель, тянула бы тексты всех своих строк — страница
 * росла бы весом без предела.
 *
 * Своей связи с деревом у предложения нет: оно приезжает при записи месяца, и дерево приходит
 * оттуда же. На стороне экрана это видно так же, как у разбора, — полем `tree`, потому что
 * отбирают им обоих одинаково.
 */
import { ECargoState, ITreeChoice } from '@rt/message-bus-common';

export namespace IProposal {
    /** Строка списка: то, что видно в таблице. */
    export namespace Short {
        /** Сторона контракта. */
        export interface Api {
            readonly id: string;
            readonly tree: ITreeChoice;
            readonly resource: string;
            readonly address: string;
            readonly state: string;
            readonly arrivedAt: string;
        }

        /** Сторона экрана. */
        export interface State {
            readonly id: string;
            readonly tree: ITreeChoice;
            /** Место слоя правил, которое предложение правит: ради счёта по нему линия работ и заведена. */
            readonly resource: string;
            /** Адрес внутри ресурса — раздел или строка, к которой предложение относится. */
            readonly address: string;
            /** На каком шаге разбора стоит запись. Пустым это поле не приходит никогда. */
            readonly state: ECargoState;
            readonly arrivedAt: Date;
        }
    }

    /** Запись целиком: то, что показывает панель подробностей. */
    export interface Api extends Short.Api {
        readonly text: string;
        readonly month: string;
    }

    export interface State extends Short.State {
        /** Текст предложения целиком. Показывается текстом, а не разметкой. */
        readonly text: string;
        /** Месяц записи, при которой предложение приехало. В строке списка его нет. */
        readonly month: string;
    }
}
