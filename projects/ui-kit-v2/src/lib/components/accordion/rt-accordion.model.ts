export namespace IRtAccordion {
    /** Пункт аккордеона: заголовок раскрывает текст под собой. Строки приходят уже переведёнными. */
    export interface Item {
        readonly title: string;
        readonly text: string;
    }
}
