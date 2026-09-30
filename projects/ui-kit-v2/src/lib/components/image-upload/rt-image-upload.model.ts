export namespace IRtImageUpload {
    /** Что стоит в месте загрузчика: одно состояние за раз */
    export type State = 'loading' | 'cropping' | 'image' | 'empty';
}
