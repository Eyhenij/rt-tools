import { DOCUMENT } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    inject,
    input,
    InputSignal,
    Signal,
    signal,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { WINDOW } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { RtButtonDirective } from '../../../button';
import { RtEmptyStateComponent } from '../../../empty-state';
import { RtFileDropComponent } from '../../../file-drop';
import { RtFileInputComponent } from '../../../file-input';
import { RtImageCropperComponent } from '../../rt-image-cropper.component';
import { IRtImageCropper } from '../../rt-image-cropper.model';
import { drawStoryCropperSample } from './story-cropper-sample';

/** Как приложение предлагает выбрать файл: кнопкой над полем или зоной, куда его бросают */
export type TImageCropperStoryMode = 'button' | 'dropzone';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое
 * Storybook вешает контролы. Входы кита сигнальные и извне не пишутся — поэтому
 * история целится сюда, а не в сам компонент. В пакет обёртка не уезжает.
 *
 * Показ повторяет то, как обрезкой пользуется приложение: файл выбирают кнопкой или бросают на
 * поле, рамку двигают, «Применить» берёт последний отданный файл, «Отмена» возвращает пустое поле.
 * В режиме `dropzone` пустое состояние — зона загрузки, как у первого кита, а обрезка появляется,
 * когда файл выбран.
 */
@Component({
    selector: 'app-image-cropper',
    templateUrl: './test-image-cropper.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // angular
        ReactiveFormsModule,

        // components
        RtButtonDirective,
        RtEmptyStateComponent,
        RtFileDropComponent,
        RtFileInputComponent,
        RtImageCropperComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
    ],
})
export class TestRtImageCropperComponent {
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #document: Document = inject(DOCUMENT);

    #appliedUrl: string | null = null;

    public readonly mode: InputSignal<TImageCropperStoryMode> = input<TImageCropperStoryMode>('button');

    /** В режиме зоны кнопка выбора живёт в самой зоне, над полем остаётся только демо-картинка */
    public readonly toolbar: Signal<readonly string[]> = computed((): readonly string[] =>
        this.mode() === 'dropzone' ? ['sample'] : ['choose', 'sample']
    );

    public readonly caption: Signal<string> = computed((): string =>
        this.mode() === 'dropzone' ? 'Зона загрузки, затем обрезка' : 'Выбрать изображение кнопкой, обрезать, применить'
    );

    public readonly actions: readonly string[] = ['cancel', 'apply'];

    public readonly picker: FormControl<File[]> = new FormControl<File[]>([], { nonNullable: true });

    public readonly file: WritableSignal<Blob | null> = signal(null);

    /** Последний файл, отданный обрезкой, — его и берёт «Применить» */
    public readonly cropped: WritableSignal<IRtImageCropper.Result | null> = signal(null);

    public readonly applied: WritableSignal<string | null> = signal(null);

    public readonly summary: WritableSignal<string> = signal(
        'Выберите изображение кнопкой, бросьте его на поле или подставьте демо-картинку.'
    );

    /** Зона загрузки стоит, пока файла нет; с файлом её место занимает обрезка */
    public readonly showDropzone: Signal<boolean> = computed((): boolean => this.mode() === 'dropzone' && this.file() === null);

    public placeholder: string = '';
    public ratio: number | null = null;
    public round: boolean = false;
    public minSize: number = 16;
    public format: IRtImageCropper.Format | null = null;
    public quality: number = 92;
    public disabled: boolean = false;

    constructor() {
        this.picker.valueChanges.pipe(takeUntilDestroyed()).subscribe((files: File[]): void => {
            if (files.length > 0) {
                this.choose(files[0]);
                this.picker.setValue([], { emitEvent: false });
            }
        });
        inject(DestroyRef).onDestroy((): void => this.#setApplied(null));
    }

    /** Подписей под кнопками ряда нет: кнопка называет себя сама */
    public readonly noLabel: () => string = (): string => '';

    public choose(file: File | undefined): void {
        this.file.set(file ?? null);
        this.cropped.set(null);
    }

    public takeSample(): void {
        void drawStoryCropperSample(this.#document, this.#window).then((sample: File | null): void => this.choose(sample ?? undefined));
    }

    public onCropped(result: IRtImageCropper.Result): void {
        this.cropped.set(result);
        const { frame, file }: IRtImageCropper.Result = result;
        this.summary.set(
            `Рамка ${frame.width}×${frame.height} с точки ${frame.x}, ${frame.y} · ${file.type} · ${Math.round(file.size / 1024)} КБ. «Применить» возьмёт этот файл.`
        );
    }

    public onFailed(): void {
        this.cropped.set(null);
        this.summary.set('Файл не прочитался как изображение.');
    }

    public cancel(): void {
        this.choose(undefined);
        this.summary.set('Отменено. Выберите изображение заново.');
    }

    public apply(): void {
        const result: IRtImageCropper.Result | null = this.cropped();
        if (result === null) {
            return;
        }
        this.#setApplied(this.#window.URL.createObjectURL(result.file));
        this.choose(undefined);
        this.summary.set(
            `Применено: ${result.file.name}, ${result.frame.width}×${result.frame.height}. Так приложение получает готовый файл.`
        );
    }

    #setApplied(url: string | null): void {
        if (this.#appliedUrl !== null) {
            this.#window.URL.revokeObjectURL(this.#appliedUrl);
        }
        this.#appliedUrl = url;
        this.applied.set(url);
    }
}
