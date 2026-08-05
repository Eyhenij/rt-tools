/**
 * Готовая начинка `<picture>`: источники по форматам и запасной кадр на `<img>`.
 *
 * Кит не знает про хранилище и не решает, какие форматы существуют и какой из
 * них запасной, — адреса собирает вызывающая сторона. Разделение неслучайно:
 * шаблон рисует не N источников, а N−1 источник плюс `<img>`, и знание «avif
 * идёт первым, webp остаётся запасным» иначе пришлось бы повторить в каждом
 * шаблоне.
 */
export interface IRtPictureSource {
    /** MIME-тип формата: попадает в `<source type="…">` */
    readonly type: string;
    readonly srcset: string;
}

export interface IRtPicture {
    readonly sources: readonly IRtPictureSource[];
    readonly fallbackType: string;
    readonly fallbackSrcset: string;
    readonly fallbackSrc: string;
}
