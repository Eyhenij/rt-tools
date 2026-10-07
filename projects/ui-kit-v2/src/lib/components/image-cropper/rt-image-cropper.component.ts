import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import { DOCUMENT } from '@angular/common';
import {
    afterNextRender,
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    DestroyRef,
    effect,
    ElementRef,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    untracked,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective, PlatformService, WINDOW } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelKey, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtSpinnerComponent } from '@rt-tools/ui-kit-v2/spinner';
import {
    cropArea,
    fieldDelta,
    fitSource,
    frameInField,
    frameRatio,
    initialFrame,
    keyDelta,
    moveFrame,
    resizeFrame,
    resultFileName,
    resultQuality,
    resultType,
    RT_IMAGE_CROPPER_HANDLES,
    RT_IMAGE_CROPPER_QUALITY,
} from './rt-image-cropper.logic';
import { IRtImageCropper } from './rt-image-cropper.model';

const BEM_BLOCK: string = 'rt-image-cropper';

/** Наименьший размер рамки по умолчанию, в пикселях исходника */
const DEFAULT_MIN_SIZE: number = 16;

/** Подпись каждой ручки — ключ словаря кита */
const HANDLE_LABELS: Readonly<Record<IRtImageCropper.Handle, TRtKitLabelKey>> = {
    n: 'uiImageCropperHandleN',
    s: 'uiImageCropperHandleS',
    e: 'uiImageCropperHandleE',
    w: 'uiImageCropperHandleW',
    ne: 'uiImageCropperHandleNe',
    nw: 'uiImageCropperHandleNw',
    se: 'uiImageCropperHandleSe',
    sw: 'uiImageCropperHandleSw',
};

/** Состояние поля: пусто, читается, не прочиталось, готово */
type TCropperState = 'empty' | 'loading' | 'refusal' | 'ready';

/** Жест, который сейчас идёт: что тянут, откуда и какая рамка была на старте */
interface IDrag {
    readonly pointerId: number;
    readonly handle: IRtImageCropper.Handle | null;
    readonly startX: number;
    readonly startY: number;
    readonly startFrame: IRtImageCropper.Rect;
}

function sameRect(a: IRtImageCropper.Rect, b: IRtImageCropper.Rect): boolean {
    return a.x === b.x && a.y === b.y && a.width === b.width && a.height === b.height;
}

function optionalNumber(value: NumberInput): number | null {
    return value === null || value === undefined || value === '' ? null : numberAttribute(value, 0);
}

/**
 * Обрезка изображения: исходник вписан в поле целиком, поверх — рамка с восемью
 * ручками. Рамка живёт в пикселях исходника и двигается указателем, пальцем и
 * стрелками; после прочтения исходника и после каждого законченного изменения
 * компонент отдаёт файл, вырезанный рамкой, в выбранном формате и качестве.
 *
 * Поворот снимка по EXIF делает сам браузер: картинка и холст читают исходник с
 * `image-orientation: from-image`, и размеры, которые видит логика, уже
 * повёрнутые.
 */
@Component({
    selector: 'rt-image-cropper',
    templateUrl: './rt-image-cropper.component.html',
    styleUrl: './rt-image-cropper.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtSpinnerComponent,
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-image-cropper--round]': 'round()',
        '[class.rt-image-cropper--disabled]': 'disabled()',
        '[style.--rt-image-cropper-image-x]': "image().x + 'px'",
        '[style.--rt-image-cropper-image-y]': "image().y + 'px'",
        '[style.--rt-image-cropper-image-width]': "image().width + 'px'",
        '[style.--rt-image-cropper-image-height]': "image().height + 'px'",
        '[style.--rt-image-cropper-frame-x]': "frameBox().x + 'px'",
        '[style.--rt-image-cropper-frame-y]': "frameBox().y + 'px'",
        '[style.--rt-image-cropper-frame-width]': "frameBox().width + 'px'",
        '[style.--rt-image-cropper-frame-height]': "frameBox().height + 'px'",
    },
})
export class RtImageCropperComponent {
    readonly #destroyRef: DestroyRef = inject(DestroyRef);

    readonly #window: Window & typeof globalThis = inject(WINDOW) as Window & typeof globalThis;

    readonly #document: Document = inject(DOCUMENT);

    readonly #platform: PlatformService = inject(PlatformService);

    readonly #fieldSize: WritableSignal<IRtImageCropper.Size> = signal({ width: 0, height: 0 });

    readonly #source: WritableSignal<IRtImageCropper.Size> = signal({ width: 0, height: 0 });

    readonly #frame: WritableSignal<IRtImageCropper.Rect> = signal({ x: 0, y: 0, width: 0, height: 0 });

    readonly #ratio: Signal<number | null> = computed((): number | null => frameRatio(this.ratio(), this.round()));

    readonly #fit: Signal<IRtImageCropper.Fit> = computed((): IRtImageCropper.Fit => fitSource(this.#source(), this.#fieldSize()));

    #image: HTMLImageElement | null = null;

    /** Картинка, которая сейчас читается: ответ прежней после смены исходника не принимается */
    #pending: HTMLImageElement | null = null;

    #sourceType: string = '';

    #sourceName: string = '';

    #drag: IDrag | null = null;

    /** Номер последнего запроса результата: поздний ответ холста по старой рамке отбрасывается */
    #resultTicket: number = 0;

    protected readonly field: Signal<ElementRef<HTMLElement>> = viewChild.required<ElementRef<HTMLElement>>('field');

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly handles: readonly IRtImageCropper.Handle[] = RT_IMAGE_CROPPER_HANDLES;

    protected readonly handleLabels: Readonly<Record<IRtImageCropper.Handle, TRtKitLabelKey>> = HANDLE_LABELS;

    protected readonly state: WritableSignal<TCropperState> = signal('empty');

    /** Текст пустого поля: свой, если задан, иначе подпись кита */
    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.t().uiImageCropperPlaceholder);

    /** Адрес исходника для картинки в поле */
    protected readonly url: WritableSignal<string | null> = signal(null);

    /** Где картинка лежит в поле, в пикселях поля */
    protected readonly image: Signal<IRtImageCropper.Rect> = computed((): IRtImageCropper.Rect => {
        const fit: IRtImageCropper.Fit = this.#fit();
        return { x: fit.offsetX, y: fit.offsetY, width: fit.width, height: fit.height };
    });

    /** Рамка в пикселях поля */
    protected readonly frameBox: Signal<IRtImageCropper.Rect> = computed((): IRtImageCropper.Rect =>
        frameInField(this.#frame(), this.#fit())
    );

    /** Подсказка пустого поля; пусто — подпись кита `uiImageCropperPlaceholder` */
    public readonly placeholder: InputSignal<string> = input<string>('');

    /** Исходник: файл, который надо обрезать; пусто — поле с подсказкой */
    public readonly file: InputSignal<Blob | null> = input<Blob | null>(null);

    /** Пропорция рамки, ширина к высоте; пусто — рамка свободная */
    public readonly ratio: InputSignalWithTransform<number | null, NumberInput> = input<number | null, NumberInput>(null, {
        transform: optionalNumber,
    });

    /** Круглый вид: маска на экране и пропорция один к одному; результат — квадрат */
    public readonly round: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Наименьший размер рамки в пикселях исходника */
    public readonly minSize: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(DEFAULT_MIN_SIZE, {
        transform: (value: NumberInput): number => numberAttribute(value, DEFAULT_MIN_SIZE),
    });

    /** Формат результата; пусто — формат исходника, png, когда он не из трёх */
    public readonly format: InputSignal<IRtImageCropper.Format | null> = input<IRtImageCropper.Format | null>(null);

    /** Качество результата в процентах — для jpeg и webp */
    public readonly quality: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(RT_IMAGE_CROPPER_QUALITY, {
        transform: (value: NumberInput): number => numberAttribute(value, RT_IMAGE_CROPPER_QUALITY),
    });

    /** Недоступна: рамка видна, но не меняется ни указателем, ни клавишами */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Файл, вырезанный рамкой: после прочтения исходника и после каждого законченного изменения */
    public readonly cropped: OutputEmitterRef<IRtImageCropper.Result> = output<IRtImageCropper.Result>();

    /** Исходник не прочитался */
    public readonly loadFailed: OutputEmitterRef<void> = output<void>();

    constructor() {
        effect((): void => {
            const file: Blob | null = this.file();
            untracked((): void => this.#load(file));
        });

        effect((): void => {
            const ratio: number | null = this.#ratio();
            untracked((): void => {
                if (this.state() === 'ready') {
                    this.#frame.set(initialFrame(this.#source(), ratio));
                    this.#emitResult();
                }
            });
        });

        afterNextRender((): void => this.#observe(this.field().nativeElement));

        this.#destroyRef.onDestroy((): void => this.#revoke());
    }

    protected onPointerDown(event: PointerEvent, handle: IRtImageCropper.Handle | null): void {
        if (this.disabled() || this.#drag !== null || (event.pointerType === 'mouse' && event.button !== 0)) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const target: EventTarget | null = event.currentTarget;
        if (target instanceof this.#window.HTMLElement && typeof target.setPointerCapture === 'function') {
            target.setPointerCapture(event.pointerId);
        }
        this.#drag = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startFrame: this.#frame(), handle };
    }

    protected onPointerMove(event: PointerEvent): void {
        const drag: IDrag | null = this.#drag;
        if (drag === null || drag.pointerId !== event.pointerId) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const delta: IRtImageCropper.Delta = fieldDelta(event.clientX - drag.startX, event.clientY - drag.startY, this.#fit().scale);
        this.#frame.set(this.#change(drag.startFrame, drag.handle, delta));
    }

    protected onPointerUp(event: PointerEvent): void {
        const drag: IDrag | null = this.#drag;
        if (drag === null || drag.pointerId !== event.pointerId) {
            return;
        }
        event.stopPropagation();
        this.#drag = null;
        const target: EventTarget | null = event.currentTarget;
        if (target instanceof this.#window.HTMLElement && typeof target.releasePointerCapture === 'function') {
            target.releasePointerCapture(event.pointerId);
        }
        if (!sameRect(drag.startFrame, this.#frame())) {
            this.#emitResult();
        }
    }

    protected onKeyDown(event: KeyboardEvent, handle: IRtImageCropper.Handle | null): void {
        if (this.disabled()) {
            return;
        }
        const delta: IRtImageCropper.Delta | null = keyDelta(event.key, event.shiftKey, this.#fit().scale);
        if (delta === null) {
            return;
        }
        event.preventDefault();
        event.stopPropagation();
        const before: IRtImageCropper.Rect = this.#frame();
        const next: IRtImageCropper.Rect = this.#change(before, handle, delta);
        if (!sameRect(before, next)) {
            this.#frame.set(next);
            this.#emitResult();
        }
    }

    /** Одна точка для указателя и клавиш: внутри рамки — сдвиг, на ручке — растяжение */
    #change(frame: IRtImageCropper.Rect, handle: IRtImageCropper.Handle | null, delta: IRtImageCropper.Delta): IRtImageCropper.Rect {
        return handle === null
            ? moveFrame(frame, delta, this.#source())
            : resizeFrame(frame, handle, delta, this.#source(), this.#ratio(), this.minSize());
    }

    #load(file: Blob | null): void {
        this.#revoke();
        this.#image = null;
        this.#pending = null;
        this.#drag = null;
        this.#resultTicket++;
        if (file === null || !this.#platform.isPlatformBrowser) {
            this.state.set('empty');
            return;
        }
        this.#sourceType = file.type;
        this.#sourceName = file instanceof this.#window.File ? file.name : '';
        const url: string = this.#window.URL.createObjectURL(file);
        const image: HTMLImageElement = new this.#window.Image();
        this.#pending = image;
        this.url.set(url);
        this.state.set('loading');
        image.onload = (): void => {
            if (this.#pending === image) {
                this.#pending = null;
                this.#ready(image);
            }
        };
        image.onerror = (): void => {
            if (this.#pending === image) {
                this.#pending = null;
                this.#refuse();
            }
        };
        image.src = url;
    }

    #ready(image: HTMLImageElement): void {
        if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
            this.#refuse();
            return;
        }
        this.#image = image;
        this.#source.set({ width: image.naturalWidth, height: image.naturalHeight });
        this.#frame.set(initialFrame(this.#source(), this.#ratio()));
        this.state.set('ready');
        this.#emitResult();
    }

    #refuse(): void {
        this.state.set('refusal');
        this.loadFailed.emit();
    }

    #revoke(): void {
        const url: string | null = this.url();
        if (url !== null) {
            this.#window.URL.revokeObjectURL(url);
            this.url.set(null);
        }
    }

    #observe(field: HTMLElement): void {
        const measure: () => void = (): void => this.#fieldSize.set({ width: field.clientWidth, height: field.clientHeight });
        measure();
        if (typeof this.#window.ResizeObserver !== 'function') {
            return;
        }
        const observer: ResizeObserver = new this.#window.ResizeObserver(measure);
        observer.observe(field);
        this.#destroyRef.onDestroy((): void => observer.disconnect());
    }

    /** Вырезает рамку холстом и отдаёт файл; ответ по устаревшей рамке не выходит */
    #emitResult(): void {
        const image: HTMLImageElement | null = this.#image;
        if (image === null) {
            return;
        }
        this.#resultTicket++;
        const ticket: number = this.#resultTicket;
        const area: IRtImageCropper.Rect = cropArea(this.#frame(), this.#source());
        const canvas: HTMLCanvasElement = this.#document.createElement('canvas');
        canvas.width = area.width;
        canvas.height = area.height;
        const context: CanvasRenderingContext2D | null = canvas.getContext('2d');
        if (context === null) {
            return;
        }
        context.drawImage(image, area.x, area.y, area.width, area.height, 0, 0, area.width, area.height);
        const type: string = resultType(this.format(), this.#sourceType);
        canvas.toBlob(
            (blob: Blob | null): void => {
                if (blob === null || ticket !== this.#resultTicket) {
                    return;
                }
                const file: File = new this.#window.File([blob], resultFileName(this.#sourceName, type), { type });
                this.cropped.emit({ file, frame: area });
            },
            type,
            resultQuality(this.quality())
        );
    }
}
