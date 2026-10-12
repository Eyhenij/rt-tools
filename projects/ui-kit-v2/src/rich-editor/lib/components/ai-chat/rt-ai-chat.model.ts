import { IRtAiRunStatus, IRtTimeline } from '@rt-tools/ui-kit-v2';

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

    export interface Message {
        readonly id: string;
        readonly role: Role;
        /** Текст сообщения; у ответа — markdown. Пустой ответ рисует только ход работы. */
        readonly text: string;
        /** Время под пузырём вопроса; пусто — не рисуется. */
        readonly time?: string;
        /** Ход работы над этим ответом. */
        readonly run?: Run;
        /** Ответ ещё пишется: оценка не рисуется. */
        readonly streaming?: boolean;
        readonly feedback?: Feedback;
    }

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
        readonly $implicit: Message;
    }
}
