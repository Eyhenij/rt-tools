import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { from } from 'rxjs';

import { WINDOW } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { drawStoryCropperSample } from '../../../image-cropper/stories/component/story-cropper-sample';
import { IButton } from '../../../button/rt-button.model';
import { IRtIcon } from '../../../icon/rt-icon.model';
import { RtImageUploadComponent } from '../../rt-image-upload.component';
import { IRtImageUpload } from '../../rt-image-upload.model';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TImageUploadMatrixPart = 'states' | 'presets' | 'themes' | 'options';

/** Состояние места: какая картинка дана и что загрузчику велено */
interface IImageUploadStateCase {
    readonly name: string;
    readonly imageUrl: string | null;
    readonly downloadable: boolean;
    readonly downloadShape: IRtImageUpload.DownloadShape;
    readonly loading: boolean;
    readonly disabled: boolean;
}

/** Значок кнопки выбора по умолчанию — тот же, что у загрузчика */
const UPLOAD_ICON: string = 'ico-upload';

/** Настройка кнопок: входы и свойства блока, заданные на самом загрузчике */
interface IImageUploadOptionCase {
    readonly name: string;
    readonly imageUrl: string | null;
    readonly chooseAppearance: IButton.Appearance;
    readonly chooseIcon: string | null;
    readonly downloadIconSize: IRtIcon.Size | null;
    readonly style: Readonly<Record<string, string>>;
}

/**
 * Матрицы состояний `rt-image-upload` для витрины.
 *
 * Картинка одна на все ячейки — нарисованная холстом, её адрес делает обёртка и отпускает, уходя.
 * Обрезку в матрице не показать: её открывает выбранный файл, а не вход, — её показывают истории
 * с жестом, `Cropping` и `Applied`.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-image-upload-matrix',
    templateUrl: './test-image-upload-matrix.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtImageUploadComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtImageUploadMatrixComponent {
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #sample: Signal<File | null> = toSignal(from(drawStoryCropperSample(inject(DOCUMENT), this.#window)), {
        initialValue: null,
    });

    /** Адрес нарисованной картинки: пока холст не отдал файл, картинки нет */
    readonly #url: Signal<string | null> = computed((): string | null => {
        const sample: File | null = this.#sample();
        return sample === null ? null : this.#window.URL.createObjectURL(sample);
    });

    public part: TImageUploadMatrixPart = 'states';

    /** Ширина ячейки: загрузчик берёт ширину коробки, и ячейка её задаёт. */
    public readonly cellWidth: string = '18rem';

    public readonly stateCases: Signal<readonly IImageUploadStateCase[]> = computed((): readonly IImageUploadStateCase[] => [
        { name: 'пусто', imageUrl: null, downloadable: false, downloadShape: 'circle', loading: false, disabled: false },
        { name: 'картинка', imageUrl: this.#url(), downloadable: false, downloadShape: 'circle', loading: false, disabled: false },
        {
            name: 'скачивание, круглая',
            imageUrl: this.#url(),
            downloadable: true,
            downloadShape: 'circle',
            loading: false,
            disabled: false,
        },
        {
            name: 'скачивание, квадратная',
            imageUrl: this.#url(),
            downloadable: true,
            downloadShape: 'square',
            loading: false,
            disabled: false,
        },
        { name: 'загрузка', imageUrl: this.#url(), downloadable: false, downloadShape: 'circle', loading: true, disabled: false },
        { name: 'недоступен, пусто', imageUrl: null, downloadable: false, downloadShape: 'circle', loading: false, disabled: true },
        {
            name: 'недоступен, картинка',
            imageUrl: this.#url(),
            downloadable: true,
            downloadShape: 'circle',
            loading: false,
            disabled: true,
        },
    ]);

    public readonly optionCases: Signal<readonly IImageUploadOptionCase[]> = computed((): readonly IImageUploadOptionCase[] => [
        { name: 'выбор: заливка', imageUrl: null, chooseAppearance: 'filled', chooseIcon: UPLOAD_ICON, downloadIconSize: null, style: {} },
        { name: 'выбор: текст без значка', imageUrl: null, chooseAppearance: 'text', chooseIcon: null, downloadIconSize: null, style: {} },
        {
            name: 'скачивание: крупная, значок lg',
            imageUrl: this.#url(),
            chooseAppearance: 'outlined',
            chooseIcon: UPLOAD_ICON,
            downloadIconSize: 'lg',
            style: { '--rt-image-upload-download-size': 'var(--rt-control-height-xl)' },
        },
        {
            name: 'скачивание: мелкая, значок xs, без размытия',
            imageUrl: this.#url(),
            chooseAppearance: 'outlined',
            chooseIcon: UPLOAD_ICON,
            downloadIconSize: 'xs',
            style: { '--rt-image-upload-download-size': 'var(--rt-control-height-sm)', '--rt-image-upload-download-blur': '0px' },
        },
    ]);

    public readonly presetCases: Signal<readonly { readonly name: string; readonly imageUrl: string | null }[]> = computed(
        (): readonly { readonly name: string; readonly imageUrl: string | null }[] => [
            { name: 'пусто', imageUrl: null },
            { name: 'картинка', imageUrl: this.#url() },
        ]
    );

    constructor() {
        inject(DestroyRef).onDestroy((): void => {
            const url: string | null = this.#url();
            if (url !== null) {
                this.#window.URL.revokeObjectURL(url);
            }
        });
    }

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
