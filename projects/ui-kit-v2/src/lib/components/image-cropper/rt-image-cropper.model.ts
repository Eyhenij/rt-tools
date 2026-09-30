/**
 * Контракты обрезки изображения. Один корневой неймспейс с префиксом `I`.
 */
export namespace IRtImageCropper {
    /** Прямоугольник в пикселях исходника: рамка, границы картинки */
    export interface Rect {
        readonly x: number;
        readonly y: number;
        readonly width: number;
        readonly height: number;
    }

    /** Размер исходника или поля */
    export interface Size {
        readonly width: number;
        readonly height: number;
    }

    /**
     * Как исходник вписан в поле: масштаб — сколько пикселей поля приходится на
     * пиксель исходника, отступы — где картинка начинается внутри поля.
     */
    export interface Fit {
        readonly scale: number;
        readonly offsetX: number;
        readonly offsetY: number;
        readonly width: number;
        readonly height: number;
    }

    /** Сдвиг в пикселях исходника */
    export interface Delta {
        readonly dx: number;
        readonly dy: number;
    }

    /** Направление ручки по осям: −1 — к началу оси, 1 — к концу, 0 — ось ручкой не тянется */
    export interface Direction {
        readonly x: number;
        readonly y: number;
    }

    /** Ручка рамки: четыре угла и четыре стороны, по сторонам света */
    export type Handle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

    /** Форматы результата */
    export type Format = 'png' | 'jpeg' | 'webp';

    /** Результат обрезки: файл и рамка, которой он вырезан */
    export interface Result {
        readonly file: File;
        readonly frame: Rect;
    }
}
