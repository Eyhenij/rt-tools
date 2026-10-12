export namespace IRtInlineEdit {
    /**
     * Как значение выглядит в покое: строкой текста или плашкой с рамкой. `chip-field` — плашка, которая
     * всегда остаётся полем: без кнопок, Enter и уход сохраняют, Escape возвращает значение.
     */
    export type Look = 'text' | 'chip' | 'chip-field';

    /**
     * Где плашка-поле режет длинный текст вне фокуса: в конце или посередине — начало с многоточием и
     * всегда видный конец. В фокусе текст целиком прокручивается в поле.
     */
    export type Truncate = 'end' | 'middle';

    /** Текст, разрезанный посередине: начало уступает место, конец виден всегда. */
    export interface MiddleParts {
        readonly head: string;
        readonly tail: string;
    }

    /** Что делает уход фокуса из компонента: держит поле открытым, сохраняет или отменяет. */
    export type BlurAction = 'keep' | 'save' | 'cancel';

    /** Чем кончается просьба сохранить черновик. */
    export type Outcome = { readonly kind: 'save'; readonly value: string } | { readonly kind: 'close' } | { readonly kind: 'refuse' };
}
