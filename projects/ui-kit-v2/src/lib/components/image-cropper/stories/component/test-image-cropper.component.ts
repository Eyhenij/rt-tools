import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal, signal, WritableSignal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { from } from 'rxjs';

import { WINDOW } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtFileDropComponent } from '../../../file-drop';
import { RtImageCropperComponent } from '../../rt-image-cropper.component';
import { IRtImageCropper } from '../../rt-image-cropper.model';
import { drawStoryCropperSample } from './story-cropper-sample';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Своё фото бросается на поле — оно обёрнуто зоной перетаскивания кита. Под полем —
 * то, что отдал компонент.
 */
@Component({
    selector: 'app-image-cropper',
    template: `
        <app-story-presets fill caption="Обрезка изображения в обоих наборах">
            <ng-template>
                <rt-file-drop accept="image/*" (filesDropped)="onDropped($event)">
                    <rt-image-cropper
                        [file]="file()"
                        [ratio]="ratio"
                        [round]="round"
                        [minSize]="minSize"
                        [format]="format"
                        [quality]="quality"
                        [disabled]="disabled"
                        (cropped)="onCropped($event)"
                        (loadFailed)="onFailed()" />
                </rt-file-drop>
                <p class="app-image-cropper__result">{{ summary() }}</p>
                @if (preview(); as src) {
                    <img class="app-image-cropper__preview" alt="" [src]="src" />
                }
            </ng-template>
        </app-story-presets>
    `,
    styles: `
        /* Подпись и превью — демонстрационные: сам компонент отдаёт только файл. */
        .app-image-cropper__result {
            margin: var(--rt-space-sm) 0;
            color: var(--rt-color-text-muted);
            font-size: var(--rt-text-sm);
        }

        .app-image-cropper__preview {
            max-width: 12rem;
            max-height: 8rem;
            border: 1px solid var(--rt-color-border-subtle);
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtFileDropComponent,
        RtImageCropperComponent,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtImageCropperComponent {
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    #previewUrl: string | null = null;

    /** Нарисованный исходник — пока на поле не бросили своё фото */
    readonly #sample: Signal<File | null> = toSignal(from(drawStoryCropperSample(inject(DOCUMENT), this.#window)), { initialValue: null });

    readonly #dropped: WritableSignal<File | null> = signal(null);

    public readonly file: Signal<Blob | null> = computed((): Blob | null => this.#dropped() ?? this.#sample());

    public readonly summary: WritableSignal<string> = signal('Результата ещё нет');

    public readonly preview: WritableSignal<string | null> = signal(null);

    public ratio: number | null = null;
    public round: boolean = false;
    public minSize: number = 16;
    public format: IRtImageCropper.Format | null = null;
    public quality: number = 92;
    public disabled: boolean = false;

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#setPreview(null));
    }

    public onDropped(files: File[]): void {
        this.#dropped.set(files[0] ?? null);
    }

    public onCropped(result: IRtImageCropper.Result): void {
        const { frame, file }: IRtImageCropper.Result = result;
        this.summary.set(
            `${file.name} · ${file.type} · ${frame.width}×${frame.height} с точки ${frame.x}, ${frame.y} · ${Math.round(file.size / 1024)} КБ`
        );
        this.#setPreview(this.#window.URL.createObjectURL(file));
    }

    public onFailed(): void {
        this.summary.set('Исходник не прочитался');
        this.#setPreview(null);
    }

    #setPreview(url: string | null): void {
        if (this.#previewUrl !== null) {
            this.#window.URL.revokeObjectURL(this.#previewUrl);
        }
        this.#previewUrl = url;
        this.preview.set(url);
    }
}
