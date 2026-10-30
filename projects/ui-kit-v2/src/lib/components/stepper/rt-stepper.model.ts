export namespace IRtStepper {
    export interface Step {
        label: string;
        /** Пояснение шага. В вертикальном списке его может и не быть: там шаг — строка инструкции. */
        description?: string;
    }

    /** `horizontal` — полоса прогресса с подписью текущего шага, `vertical` — все шаги списком. */
    export type Orientation = 'horizontal' | 'vertical';

    /** Состояние шага в вертикальном списке; `neutral` — у всех шагов, когда текущего нет. */
    export type StepState = 'complete' | 'current' | 'upcoming' | 'neutral';

    /** Обстановка шаблона подписи: шаг и его номер с нуля. */
    export interface LabelContext {
        readonly $implicit: Step;
        readonly index: number;
    }
}
