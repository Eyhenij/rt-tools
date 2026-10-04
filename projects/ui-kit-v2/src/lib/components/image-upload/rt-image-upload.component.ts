import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    linkedSignal,
    numberAttribute,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective, WINDOW } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '../../i18n';
import { IButton, RtButtonDirective } from '../button';
import { RtEmptyStateComponent } from '../empty-state';
import { RtFileDropComponent } from '../file-drop';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtIconButtonComponent } from '../icon-button';
import { IRtImageCropper, RT_IMAGE_CROPPER_QUALITY, RtImageCropperComponent } from '../image-cropper';
import { TRtRadius } from '../radius/rt-radius.model';
import { RtSpinnerComponent } from '../spinner';
import { RtTooltipDirective } from '../tooltip';
import { isImageFile, uploadState } from './rt-image-upload.logic';
import { IRtImageUpload } from './rt-image-upload.model';

const BEM_BLOCK: string = 'rt-image-upload';

/**
 * Загрузчик одного изображения: одно место, в котором по очереди стоят зона загрузки, обрезка и
 * сама картинка. Файл выбирают кнопкой зоны или бросают на неё; выбранный открывает обрезку, а
 * «Применить» ставит результат на место картинки и отдаёт файл приложению. Нажатие на картинку
 * выбирает другой файл.
 *
 * Картинка — адрес: приложение даёт свой, а адрес применённого файла загрузчик делает сам и
 * отпускает его, когда картинку сменили или компонент ушёл. Файл приложение получает в
 * `imageChanged`.
 */
@Component({
    selector: 'rt-image-upload',
    templateUrl: './rt-image-upload.component.html',
    styleUrl: './rt-image-upload.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtButtonDirective,
        RtTooltipDirective,

        // components
        RtEmptyStateComponent,
        RtFileDropComponent,
        RtIconButtonComponent,
        RtImageCropperComponent,
        RtSpinnerComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-image-upload--disabled]': 'disabled()',
    },
})
export class RtImageUploadComponent {
    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #document: Document = inject(DOCUMENT);

    /** Адрес, сделанный загрузчиком под применённый файл: его и только его он отпускает */
    #ownUrl: string | null = null;

    protected readonly picker: Signal<ElementRef<HTMLInputElement>> = viewChild.required<ElementRef<HTMLInputElement>>('picker');

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Выбранный файл, который сейчас режет обрезка */
    protected readonly source: WritableSignal<File | null> = signal(null);

    /** Последний результат обрезки — его берёт «Применить» */
    protected readonly result: WritableSignal<IRtImageCropper.Result | null> = signal(null);

    /** Что сейчас стоит в месте загрузчика */
    protected readonly state: Signal<IRtImageUpload.State> = computed((): IRtImageUpload.State =>
        uploadState(this.loading(), this.source() !== null, this.image())
    );

    /** Подсказка над картинкой: своя приложения или подпись кита */
    protected readonly hint: Signal<string> = computed((): string => this.tooltip() || this.t().uiImageUploadChange);

    /** Круглая ли кнопка скачивания: подложка под размытием повторяет её скругление */
    protected readonly downloadRound: Signal<boolean> = computed((): boolean => this.downloadShape() === 'circle');

    /** Шаг скругления кнопки скачивания: круг — полный шаг, квадрат — скругление кнопки по умолчанию */
    protected readonly downloadRadius: Signal<TRtRadius | null> = computed((): TRtRadius | null => (this.downloadRound() ? 'full' : null));

    /**
     * Адрес текущей картинки: данный приложением или сделанный под применённый файл. Новый адрес от
     * приложения снова берёт верх над применённым.
     */
    protected readonly image: WritableSignal<string | null> = linkedSignal((): string | null => this.imageUrl());

    /** Адрес картинки от приложения */
    public readonly imageUrl: InputSignal<string | null> = input<string | null>(null);

    /** Имя файла, под которым картинку скачивают и отдают приложению */
    public readonly fileName: InputSignal<string> = input<string>('image');

    /** Подсказка над картинкой; пустая — подпись кита */
    public readonly tooltip: InputSignal<string> = input<string>('');

    /** Кнопка скачивания рядом с картинкой */
    public readonly downloadable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Форма кнопки скачивания; она заходит за правый верхний угол картинки при любой форме */
    public readonly downloadShape: InputSignal<IRtImageUpload.DownloadShape> = input<IRtImageUpload.DownloadShape>('circle');

    /** Размер значка кнопки скачивания; пусто — от размера кнопки */
    public readonly downloadIconSize: InputSignal<IRtIcon.Size | null> = input<IRtIcon.Size | null>(null);

    /** Вид кнопки выбора файла в пустом загрузчике */
    public readonly chooseAppearance: InputSignal<IButton.Appearance> = input<IButton.Appearance>('outlined');

    /** Значок кнопки выбора файла; пусто — кнопка без значка */
    public readonly chooseIcon: InputSignal<string | null> = input<string | null>('ico-upload');

    /** Без кнопок «Отмена» и «Применить»: каждый результат обрезки применяется сразу */
    public readonly autoApply: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Приложение загружает картинку: на месте стоит индикатор */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Недоступный загрузчик не берёт файлов и не отзывается на нажатие картинки */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Соотношение рамки обрезки; пусто — свободная рамка */
    public readonly ratio: InputSignalWithTransform<number | null, NumberInput> = input<number | null, NumberInput>(null, {
        transform: (value: NumberInput): number | null => (value === null || value === '' ? null : numberAttribute(value, 0) || null),
    });

    /** Круглая маска обрезки для аватара */
    public readonly round: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Формат результата; пусто — формат исходника */
    public readonly format: InputSignal<IRtImageCropper.Format | null> = input<IRtImageCropper.Format | null>(null);

    /** Качество результата, от 0 до 100 */
    public readonly quality: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(RT_IMAGE_CROPPER_QUALITY, {
        transform: (value: NumberInput): number => numberAttribute(value, RT_IMAGE_CROPPER_QUALITY),
    });

    /** Применённый файл — его приложение отправляет, куда ему надо */
    public readonly imageChanged: OutputEmitterRef<File> = output<File>();

    /** Картинку скачали */
    public readonly downloaded: OutputEmitterRef<void> = output<void>();

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.#release());
    }

    /** Открывает выбор файла, если загрузчик доступен */
    public pick(): void {
        if (!this.disabled()) {
            this.picker().nativeElement.click();
        }
    }

    /** Файл выбран кнопкой или брошен: изображение открывает обрезку, остальное пропускается */
    public choose(file: File | null | undefined): void {
        if (this.disabled() || !isImageFile(file)) {
            return;
        }
        this.result.set(null);
        this.source.set(file);
    }

    protected onPicked(event: Event): void {
        const input: HTMLInputElement = event.target as HTMLInputElement;
        this.choose(input.files?.[0]);
        // Тот же файл, выбранный второй раз, иначе не даёт события
        input.value = '';
    }

    protected onSpace(event: Event): void {
        event.preventDefault();
        this.pick();
    }

    protected onCropped(result: IRtImageCropper.Result): void {
        this.result.set(result);
        if (this.autoApply()) {
            this.#applyResult(result, false);
        }
    }

    protected apply(): void {
        const result: IRtImageCropper.Result | null = this.result();
        if (result !== null) {
            this.#applyResult(result, true);
        }
    }

    protected cancel(): void {
        this.source.set(null);
        this.result.set(null);
    }

    protected download(): void {
        const url: string | null = this.image();
        if (url === null) {
            return;
        }
        const link: HTMLAnchorElement = this.#document.createElement('a');
        link.href = url;
        link.download = this.fileName();
        this.#document.body.appendChild(link);
        link.click();
        link.remove();
        this.downloaded.emit();
    }

    /** Результат становится картинкой; `close` убирает обрезку — при автоприменении она остаётся */
    #applyResult(result: IRtImageCropper.Result, close: boolean): void {
        const file: File = new File([result.file], this.fileName(), { type: result.file.type });
        this.#release();
        this.#ownUrl = this.#window.URL.createObjectURL(file);
        this.image.set(this.#ownUrl);
        this.imageChanged.emit(file);
        if (close) {
            this.cancel();
        }
    }

    #release(): void {
        if (this.#ownUrl !== null) {
            this.#window.URL.revokeObjectURL(this.#ownUrl);
            this.#ownUrl = null;
        }
    }
}
