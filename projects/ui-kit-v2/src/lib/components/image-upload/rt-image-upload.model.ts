export namespace IRtImageUpload {
    /** Что стоит в месте загрузчика: одно состояние за раз */
    export type State = 'loading' | 'cropping' | 'image' | 'empty';

    /** Форма кнопки скачивания: круглая, как у первого кита, или квадратная */
    export type DownloadShape = 'circle' | 'square';
}
