import { NgComponentOutlet } from '@angular/common';
import { inject, ChangeDetectionStrategy, Component, Injector, InputSignal, Signal, Type, computed, input } from '@angular/core';

import { RtDialogRef } from '../../../dialog/rt-dialog-ref';
import { RT_DIALOG_DATA } from '../../../dialog/rt-dialog.tokens';
import { IRtPhotoViewer } from '../../rt-photo-viewer.model';
import { RtPhotoViewerComponent } from '../../rt-photo-viewer.component';
import { STORY_PHOTOS } from './test-photo-viewer.component';

/** Случай просмотрщика в ячейке матрицы. */
export type TPhotoViewerCase = 'first' | 'last' | 'single';

/** Ссылка на окно, ничего не закрывающая: настоящая убрала бы показ от первого нажатия. */
const STORY_DIALOG_REF: Pick<RtDialogRef, 'close'> = { close: (): void => undefined };

/**
 * Данные окна в каждом случае. Первый кадр — стрелка «назад» есть, но листать назад некуда;
 * последний — счётчик показывает конец набора; один кадр — стрелок нет вовсе.
 */
const CASE_DATA: Record<TPhotoViewerCase, IRtPhotoViewer.Data> = {
    first: { photos: STORY_PHOTOS, startIndex: 0 },
    last: { photos: STORY_PHOTOS, startIndex: STORY_PHOTOS.length - 1 },
    single: { photos: STORY_PHOTOS.slice(0, 1), startIndex: 0 },
};

/**
 * Одна ячейка матрицы `rt-photo-viewer`: просмотрщик со своими данными окна.
 *
 * Данные приходят внедрением, поэтому у каждой ячейки свой инжектор, собранный по входу.
 */
@Component({
    selector: 'app-photo-viewer-case',
    templateUrl: './test-photo-viewer-case.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [NgComponentOutlet],
})
export class TestRtPhotoViewerCaseComponent {
    readonly #parent: Injector = inject(Injector);

    protected readonly viewer: Type<RtPhotoViewerComponent> = RtPhotoViewerComponent;

    protected readonly injector: Signal<Injector> = computed((): Injector =>
        Injector.create({
            parent: this.#parent,
            providers: [
                { provide: RtDialogRef, useValue: STORY_DIALOG_REF },
                { provide: RT_DIALOG_DATA, useValue: CASE_DATA[this.kind()] },
            ],
        })
    );

    public readonly kind: InputSignal<TPhotoViewerCase> = input.required<TPhotoViewerCase>();
}
