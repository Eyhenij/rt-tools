import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { from } from 'rxjs';

import { WINDOW } from '@rt-tools/core';

import { StoryPresetsComponent } from '../../../../../showcase/story-presets.component';
import { StoryRowComponent } from '../../../../../showcase/story-row.component';
import { StoryThemesComponent } from '../../../../../showcase/story-themes.component';
import { RtImageCropperComponent } from '../../rt-image-cropper.component';
import { drawStoryCropperSample } from './story-cropper-sample';

/** Какую матрицу рисовать: у каждой оси своя история, и выбирает её этот вход. */
export type TImageCropperMatrixPart = 'ratios' | 'looks' | 'states' | 'presets' | 'themes';

/** Пропорция рамки: свободная и три заданных */
interface IImageCropperRatioCase {
    readonly name: string;
    readonly ratio: number | null;
}

/** Вид рамки: прямоугольный и круглый */
interface IImageCropperLookCase {
    readonly name: string;
    readonly round: boolean;
}

/** Состояние поля: какой исходник дан и доступна ли обрезка */
interface IImageCropperStateCase {
    readonly name: string;
    readonly file: File | null;
    readonly disabled: boolean;
}

/**
 * Матрицы состояний `rt-image-cropper` для витрины.
 *
 * Исходник один на все ячейки — картинка, нарисованная холстом; каждая обрезка читает его сама.
 * Нечитаемый исходник — текстовый файл: браузер отказывается его декодировать, и поле показывает
 * отказ.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-image-cropper-matrix',
    template: `
        @switch (part) {
            @case ('ratios') {
                <app-story-presets caption="Пропорции рамки в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="ratioCases" [itemLabel]="caseLabel" [slotWidth]="cellWidth">
                            <ng-template let-ratioCase>
                                <rt-image-cropper class="app-image-cropper-matrix__cropper" [file]="sample()" [ratio]="ratioCase.ratio" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('looks') {
                <app-story-presets caption="Вид рамки в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="lookCases" [itemLabel]="caseLabel" [slotWidth]="cellWidth">
                            <ng-template let-lookCase>
                                <rt-image-cropper class="app-image-cropper-matrix__cropper" [file]="sample()" [round]="lookCase.round" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('states') {
                <app-story-presets caption="Состояния поля в обоих наборах">
                    <ng-template>
                        <app-story-row [items]="stateCases()" [itemLabel]="caseLabel" [slotWidth]="cellWidth">
                            <ng-template let-stateCase>
                                <rt-image-cropper
                                    class="app-image-cropper-matrix__cropper"
                                    [file]="stateCase.file"
                                    [ratio]="1"
                                    [disabled]="stateCase.disabled" />
                            </ng-template>
                        </app-story-row>
                    </ng-template>
                </app-story-presets>
            }

            @case ('presets') {
                <app-story-presets caption="Обрезка в обоих наборах">
                    <ng-template>
                        <div class="app-image-cropper-matrix__pane">
                            <rt-image-cropper class="app-image-cropper-matrix__cropper" [file]="sample()" [ratio]="1" />
                        </div>
                    </ng-template>
                </app-story-presets>
            }

            @case ('themes') {
                <app-story-presets caption="Обрезка в обеих темах в обоих наборах">
                    <ng-template>
                        <app-story-themes>
                            <ng-template>
                                <div class="app-image-cropper-matrix__pane">
                                    <rt-image-cropper class="app-image-cropper-matrix__cropper" round [file]="sample()" />
                                </div>
                            </ng-template>
                        </app-story-themes>
                    </ng-template>
                </app-story-presets>
            }
        }
    `,
    styles: `
        /* Ячейка ряда центрирует содержимое, а поле обрезки берёт ширину коробки: без ширины
           оно схлопнулось бы в ноль и рамки не было бы видно. Высота поля — его собственное
           свойство, в матрице поле ниже умолчания, чтобы ряд помещался в кадр. */
        .app-image-cropper-matrix__cropper {
            --rt-image-cropper-height: 9rem;

            width: 100%;
        }

        .app-image-cropper-matrix__pane {
            width: 16rem;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtImageCropperComponent,

        // showcase
        StoryPresetsComponent,
        StoryRowComponent,
        StoryThemesComponent,
    ],
})
export class TestRtImageCropperMatrixComponent {
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #broken: File = new this.#window.File(['это не картинка'], 'notes.txt', { type: 'text/plain' });

    public part: TImageCropperMatrixPart = 'ratios';

    /** Нарисованный исходник: пока холст не отдал файл, ячейки стоят без исходника */
    public readonly sample: Signal<File | null> = toSignal(from(drawStoryCropperSample(inject(DOCUMENT), this.#window)), {
        initialValue: null,
    });

    /** Ширина ячейки: поле тянется на всю ширину родителя и по содержимому схлопнулось бы. */
    public readonly cellWidth: string = '14rem';

    public readonly ratioCases: readonly IImageCropperRatioCase[] = [
        { name: 'свободная', ratio: null },
        { name: '1 : 1', ratio: 1 },
        { name: '16 : 9', ratio: 16 / 9 },
        { name: '3 : 4', ratio: 3 / 4 },
    ];

    public readonly lookCases: readonly IImageCropperLookCase[] = [
        { name: 'прямоугольная', round: false },
        { name: 'круглая', round: true },
    ];

    /** Ячейки состояний ждут нарисованный исходник, поэтому собираются от него */
    public readonly stateCases: Signal<readonly IImageCropperStateCase[]> = computed((): readonly IImageCropperStateCase[] => [
        { name: 'без исходника', file: null, disabled: false },
        { name: 'готова', file: this.sample(), disabled: false },
        { name: 'недоступна', file: this.sample(), disabled: true },
        { name: 'не прочиталось', file: this.#broken, disabled: false },
    ]);

    /** Подпись случая: у всех наборов этой матрицы имя лежит в одном поле. */
    public readonly caseLabel: (value: { readonly name: string }) => string = (value: { readonly name: string }): string => value.name;
}
