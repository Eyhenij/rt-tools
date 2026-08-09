import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtPhotoViewer } from '../../rt-photo-viewer.model';
import { RtPhotoViewerComponent } from '../../rt-photo-viewer.component';

/**
 * Кадр витрины рисуется байтами в адресе, а не грузится из сети: кадр снимка обязан повторяться,
 * а запрос по сети успевает завершиться не всегда.
 */
function plate(caption: string, background: string): string {
    const svg: string = [
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">',
        `<rect width="1200" height="800" fill="${background}"/>`,
        `<text x="600" y="420" font-family="sans-serif" font-size="64" fill="#ffffff" text-anchor="middle">${caption}</text>`,
        '</svg>',
    ].join('');

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function photo(id: string, caption: string, background: string): IRtPhotoViewer.Photo {
    const src: string = plate(caption, background);

    return {
        id,
        alt: caption,
        aspectRatio: '1200 / 800',
        picture: {
            sources: [],
            fallbackType: 'image/svg+xml',
            fallbackSrcset: src,
            fallbackSrc: src,
        },
    };
}

/** Три кадра: по ним видно и счётчик, и стрелки, и прилипание при листании. */
export const STORY_PHOTOS: readonly IRtPhotoViewer.Photo[] = [
    photo('1', 'Фасад', '#2f5d8c'),
    photo('2', 'Холл', '#3f7a52'),
    photo('3', 'Номер', '#8c4f2f'),
];

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входов у просмотрщика нет вовсе — кадры приходят данными
 * открытия, то есть внедрением, поэтому их раздаёт обёртка. В пакет обёртка не уезжает.
 *
 * Ссылка на окно подменена: настоящая убрала бы просмотрщик из показа от первого же нажатия
 * на крестик.
 */
@Component({
    selector: 'app-photo-viewer',
    template: '<rt-photo-viewer />',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtPhotoViewerComponent,
    ],
    providers: [
        { provide: RtDialogRef, useValue: { close: (): void => undefined } },
        { provide: RT_DIALOG_DATA, useValue: { photos: STORY_PHOTOS, startIndex: 0 } satisfies IRtPhotoViewer.Data },
    ],
})
export class TestRtPhotoViewerComponent {}
