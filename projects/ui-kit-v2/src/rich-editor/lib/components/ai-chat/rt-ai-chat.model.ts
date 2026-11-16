import { Type } from '@angular/core';

import { IRtAiRunStatus, IRtTag, IRtTimeline } from '@rt-tools/ui-kit-v2';

export namespace IRtAiChat {
    /** Кто написал сообщение. */
    export type Role = 'user' | 'assistant';

    /** Оценка ответа человеком; `null` — не оценён. */
    export type Feedback = 'liked' | 'disliked' | null;

    /** Ход работы над ответом: строка `rt-ai-run-status` над текстом ответа. */
    export interface Run {
        readonly state: IRtAiRunStatus.State;
        readonly label: string;
        readonly meta?: string;
        readonly steps?: readonly IRtTimeline.Step[];
    }

    /** Текст ответа в markdown. */
    export interface MarkdownBlock {
        readonly type: 'markdown';
        readonly text: string;
    }

    /** Плашка `rt-message` в ответе: предупреждение, справка, ошибка части данных. */
    export interface NoticeBlock {
        readonly type: 'notice';
        readonly severity: IRtTag.Severity;
        readonly text: string;
    }

    /**
     * Блок, который кит сам не рисует: график, таблица и другие. Его рисует отрисовщик,
     * зарегистрированный приложением; без отрисовщика блок показан заглушкой.
     */
    export interface CustomBlock {
        readonly type: string;
        readonly [field: string]: unknown;
    }

    /** Часть ответа. Список типов открыт: кит знает `markdown` и `notice`, остальные регистрирует приложение. */
    export type Block = MarkdownBlock | NoticeBlock | CustomBlock;

    /** Отрисовщик блока, которого кит сам не знает: компонент с обязательным входом `block`. */
    export interface BlockRenderer {
        readonly type: string;
        readonly component: Type<unknown>;
    }

    /** Что рисует лента для одного блока; собирается чистой функцией из блока и реестра. */
    export type BlockView =
        | { readonly kind: 'markdown'; readonly text: string }
        | { readonly kind: 'notice'; readonly severity: IRtTag.Severity; readonly text: string }
        | { readonly kind: 'custom'; readonly component: Type<unknown>; readonly block: Block }
        | { readonly kind: 'unsupported'; readonly type: string };

    /** Вопрос человека: строка в пузыре справа. */
    export interface UserMessage {
        readonly id: string;
        readonly role: 'user';
        readonly text: string;
        /** Время под пузырём вопроса; пусто — не рисуется. */
        readonly time?: string;
    }

    /** Ответ ассистента: ход работы и блоки по порядку. Пустой список рисует только ход работы. */
    export interface AssistantMessage {
        readonly id: string;
        readonly role: 'assistant';
        readonly blocks: readonly Block[];
        /** Ход работы над этим ответом. */
        readonly run?: Run;
        /** Ответ ещё пишется: оценка не рисуется. */
        readonly streaming?: boolean;
        readonly feedback?: Feedback;
    }

    export type Message = UserMessage | AssistantMessage;

    /** Ответ оборвался: текст ошибки, номер обращения и можно ли спросить снова. */
    export interface RunError {
        readonly message: string;
        readonly referenceId?: string;
        readonly retryable?: boolean;
    }

    /** Беседа в списке бесед. */
    export interface Thread {
        readonly id: string;
        readonly title: string;
        /** Время последнего сообщения, готовой строкой. */
        readonly time?: string;
        /** Непрочитанных ответов; больше нуля — строка помечена и показывает число. */
        readonly unreadCount?: number;
    }

    /** Оценка ответа: какое сообщение и какая оценка. */
    export interface FeedbackChange {
        readonly messageId: string;
        readonly feedback: Feedback;
    }

    /** Контекст шаблона вложений ответа. */
    export interface ExtraContext {
        readonly $implicit: AssistantMessage;
    }
}
