export namespace IRtInlineEdit {
    /** Как значение выглядит в покое: строкой текста или плашкой с рамкой. */
    export type Look = 'text' | 'chip';

    /** Что делает уход фокуса из компонента: держит поле открытым, сохраняет или отменяет. */
    export type BlurAction = 'keep' | 'save' | 'cancel';

    /** Чем кончается просьба сохранить черновик. */
    export type Outcome = { readonly kind: 'save'; readonly value: string } | { readonly kind: 'close' } | { readonly kind: 'refuse' };
}
