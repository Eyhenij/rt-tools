import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtPhotoViewer } from '../../rt-photo-viewer.model';
import { RtPhotoViewerComponent } from '../../rt-photo-viewer.component';
import { STORY_PHOTOS } from './test-photo-viewer.component';

/** Разметка обёртки: сам просмотрщик берёт всё из данных окна. */
const VIEWER_TEMPLATE: string = '<rt-photo-viewer />';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TPhotoViewerMatrixPart = 'start' | 'single' | 'presets' | 'themes';

/** Ссылка на окно, ничего не закрывающая: настоящая убрала бы показ от первого нажатия. */
const STORY_DIALOG_REF: Pick<RtDialogRef, 'close'> = { close: (): void => undefined };

/** Просмотрщик, открытый на первом кадре: стрелка «назад» есть, но листать назад некуда. */
@Component({
    selector: 'app-photo-viewer-first',
    template: VIEWER_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPhotoViewerComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: { photos: STORY_PHOTOS, startIndex: 0 } satisfies IRtPhotoViewer.Data },
    ],
})
class PhotoViewerFirstComponent {}

/** Просмотрщик, открытый на последнем кадре: счётчик показывает конец набора. */
@Component({
    selector: 'app-photo-viewer-last',
    template: VIEWER_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPhotoViewerComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        {
            provide: RT_DIALOG_DATA,
            useValue: { photos: STORY_PHOTOS, startIndex: STORY_PHOTOS.length - 1 } satisfies IRtPhotoViewer.Data,
        },
    ],
})
class PhotoViewerLastComponent {}

/** Один кадр: стрелок нет вовсе — листать нечего. */
@Component({
    selector: 'app-photo-viewer-single',
    template: VIEWER_TEMPLATE,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtPhotoViewerComponent],
    providers: [
        { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
        { provide: RT_DIALOG_DATA, useValue: { photos: STORY_PHOTOS.slice(0, 1), startIndex: 0 } satisfies IRtPhotoViewer.Data },
    ],
})
class PhotoViewerSingleComponent {}

/**
 * Матрицы состояний `rt-photo-viewer` для витрины.
 *
 * **Ряда из ячеек здесь нет и быть не может**: просмотрщик занимает весь показ целиком —
 * 100 vw на 100 dvh, — и два экземпляра рядом наложились бы друг на друга. Поэтому каждая
 * история показывает один случай на весь кадр, а сравнивают их переключением между историями.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-photo-viewer-matrix',
    template: `
        @switch (part) {
            @case ('start') {
                <app-photo-viewer-last />
            }

            @case ('single') {
                <app-photo-viewer-single />
            }

            @case ('presets') {
                <app-story-presets caption="Просмотрщик в обоих наборах">
                    <ng-template>
                        <div style="position: relative; width: 22rem; height: 16rem; overflow: hidden">
                            <app-photo-viewer-first />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-themes caption="Просмотрщик в обеих темах">
                    <ng-template>
                        <div style="position: relative; width: 22rem; height: 16rem; overflow: hidden">
                            <app-photo-viewer-first />
                        </div>
                    </ng-template>
                </app-story-themes>
            }
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // cases
        PhotoViewerFirstComponent,
        PhotoViewerLastComponent,
        PhotoViewerSingleComponent,

        // showcase
        StoryPresetsComponent,
        StoryThemesComponent,
    ],
})
export class TestRtPhotoViewerMatrixComponent {
    public part: TPhotoViewerMatrixPart = 'start';
}
