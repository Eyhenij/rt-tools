export namespace IRtImageUpload {
    /** Что стоит в месте загрузчика: одно состояние за раз */
    export type State = 'loading' | 'cropping' | 'image' | 'empty';

    /** Форма кнопки скачивания: круглая, как у первого кита, или квадратная */
    export type DownloadShape = 'circle' | 'square';

    /** Угол картинки, у которого стоят кнопки удаления и скачивания */
    export type ButtonsCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

    /** Вид кнопок: выступают за угол картинки или стоят внутри неё */
    export type ButtonsPlacement = 'overhang' | 'inside';

    /**
     * Когда кнопки видны: `auto` — крестик при наведении и фокусе, скачивание всегда; `hover` — обе
     * только при наведении и фокусе; `always` — обе всегда. На касании кнопки видны при любом значении.
     */
    export type ButtonsVisibility = 'auto' | 'hover' | 'always';
}
