import { TemplateRef } from '@angular/core';

import { IRtPicture } from '../../util';

/**
 * Контракты полноэкранного просмотрщика фотографий. Один корневой неймспейс с
 * префиксом `I`.
 */
export namespace IRtPhotoViewer {
    /**
     * Кадр в просмотрщике. Адреса собирает вызывающая сторона — кит не знает про
     * хранилище; он получает готовую начинку `<picture>` и не решает, какие
     * форматы существуют и какой из них запасной.
     */
    export interface Photo {
        readonly id: string;
        readonly alt: string;
        readonly picture: IRtPicture;
        /** `width / height` — резервирует место до загрузки кадра */
        readonly aspectRatio: string;
    }

    /** Контекст панели: кадр, на котором сейчас стоит просмотрщик */
    export interface PanelContext {
        readonly $implicit: Photo;
        readonly index: number;
    }

    /**
     * Данные открытия: список кадров и тот, с которого начинаем.
     *
     * `panel` — необязательный шаблон под дорожкой. Он существует ради экранов,
     * где кадр решают не только смотреть, но и править: подпись, видимость и
     * порядок правятся там же, где принимается решение, а не после закрытия
     * просмотра и поисков того же кадра в сетке. Просмотрщик
     * открывается диалогом, поэтому проекция содержимого сюда не дотягивается —
     * шаблон приходит вместе с данными.
     */
    export interface Data {
        readonly photos: readonly Photo[];
        readonly startIndex: number;
        readonly panel?: TemplateRef<PanelContext>;
    }
}
