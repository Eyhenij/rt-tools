export namespace IRtImageUpload {
    /** Что стоит в месте загрузчика: одно состояние за раз */
    export type State = 'loading' | 'cropping' | 'image' | 'empty';

    /** Форма кнопки скачивания: круглая, как у первого кита, или квадратная */
    export type DownloadShape = 'circle' | 'square';

    /** Угол картинки, у которого стоят кнопки удаления и скачивания */
    export type ButtonsCorner = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

    /** Вид кнопок: выступают за угол картинки или стоят внутри неё */
    export type ButtonsPlacement = 'overhang' | 'inside';
}
