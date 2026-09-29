import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal, WritableSignal } from '@angular/core';

import { WINDOW } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { RtFileDropComponent } from '../../../file-drop';
import { RtImageCropperComponent } from '../../rt-image-cropper.component';
import { IRtImageCropper } from '../../rt-image-cropper.model';

/** Размер нарисованного исходника: шире поля, чтобы вписывание было видно */
const SAMPLE_WIDTH: number = 1200;
const SAMPLE_HEIGHT: number = 800;

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Исходник рисуется холстом на месте: витрина не ходит в сеть, а файл из дерева
 * пришлось бы держать ради одной истории. Своё фото бросается на поле — оно
 * обёрнуто зоной перетаскивания кита. Под полем — то, что отдал компонент.
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

    readonly #document: Document = inject(DOCUMENT);

    #previewUrl: string | null = null;

    public readonly file: WritableSignal<Blob | null> = signal(null);

    public readonly summary: WritableSignal<string> = signal('Результата ещё нет');

    public readonly preview: WritableSignal<string | null> = signal(null);

    public ratio: number | null = null;
    public round: boolean = false;
    public minSize: number = 16;
    public format: IRtImageCropper.Format | null = null;
    public quality: number = 92;
    public disabled: boolean = false;

    constructor() {
        this.#drawSample();
        inject(DestroyRef).onDestroy((): void => this.#setPreview(null));
    }

    public onDropped(files: File[]): void {
        this.file.set(files[0] ?? null);
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

    /** Картинка с сеткой и кругами: по ней видно, что вырезано и не искажено ли */
    #drawSample(): void {
        const canvas: HTMLCanvasElement = this.#document.createElement('canvas');
        canvas.width = SAMPLE_WIDTH;
        canvas.height = SAMPLE_HEIGHT;
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (context === null) {
            return;
        }
        const gradient: CanvasGradient = context.createLinearGradient(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
        gradient.addColorStop(0, '#1e3a8a');
        gradient.addColorStop(1, '#f59e0b');
        context.fillStyle = gradient;
        context.fillRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
        context.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        for (let x: number = 0; x <= SAMPLE_WIDTH; x += 100) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, SAMPLE_HEIGHT);
            context.stroke();
        }
        for (let y: number = 0; y <= SAMPLE_HEIGHT; y += 100) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(SAMPLE_WIDTH, y);
            context.stroke();
        }
        context.fillStyle = 'rgba(255, 255, 255, 0.85)';
        context.beginPath();
        context.arc(SAMPLE_WIDTH / 2, SAMPLE_HEIGHT / 2, 200, 0, Math.PI * 2);
        context.fill();
        context.fillStyle = '#111827';
        context.font = 'bold 64px sans-serif';
        context.textAlign = 'center';
        context.fillText('1200 × 800', SAMPLE_WIDTH / 2, SAMPLE_HEIGHT / 2 + 22);
        canvas.toBlob((blob: Blob | null): void => {
            if (blob !== null && this.file() === null) {
                this.file.set(new this.#window.File([blob], 'sample.png', { type: 'image/png' }));
            }
        }, 'image/png');
    }
}
