import {
    ChangeDetectionStrategy,
    Component,
    computed,
    effect,
    inject,
    input,
    InputSignal,
    linkedSignal,
    output,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import {
    colorPaletteArea,
    colorPaletteChannel,
    colorPaletteFromHsv,
    colorPaletteFromRgb,
    colorPaletteHex,
    colorPaletteSpectrum,
    colorPaletteStep,
    colorPaletteToHsv,
    colorPaletteToRgb,
} from '../rt-color-palette.logic';
import { IRtColorPalette } from '../rt-color-palette.model';

const BEM_BLOCK: string = 'rt-color-picker';
const CHANNELS: readonly IRtColorPalette.Channel[] = ['r', 'g', 'b'];

/** Поле одного канала и канал, который оно правит. */
interface IChannelControl {
    channel: IRtColorPalette.Channel;
    /** Буква канала над полем: R, G, B одинаковы во всех языках. */
    name: string;
    control: FormControl<string>;
}

/**
 * Выбор своего цвета палитры: площадь насыщенности и яркости, полоса оттенка, поле шестнадцатеричной
 * записи, «Отмена» и «Применить». Рисует его кит сам — сторонний выбор цвета в кит не входит.
 *
 * Выбранное живёт здесь до «Применить»: поле палитры меняется только им. Начинается выбор с цвета,
 * который пришёл входом, и «Применить» недоступно, пока выбранное с ним совпадает.
 */
@Component({
    selector: 'rt-color-picker',
    templateUrl: './rt-color-picker.component.html',
    styleUrls: ['./rt-color-picker.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        ReactiveFormsModule,

        // standalone components / directives
        RtButtonDirective,
        RtInputComponent,
        BlockDirective,
        ElemDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtColorPickerComponent {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** Цвет в оттенке, насыщенности и яркости: оттенок серого не теряется, пока человек тянет яркость. */
    protected readonly hsv: WritableSignal<IRtColorPalette.Hsv> = linkedSignal<IRtColorPalette.Hsv>((): IRtColorPalette.Hsv =>
        colorPaletteToHsv(this.value())
    );

    protected readonly picked: Signal<string> = computed((): string => colorPaletteFromHsv(this.hsv()));
    protected readonly changed: Signal<boolean> = computed((): boolean => this.picked() !== this.value());

    /** Чистый оттенок площади: её правый верхний угол. */
    protected readonly hueColor: Signal<string> = computed((): string => colorPaletteFromHsv({ h: this.hsv().h, s: 1, v: 1 }));
    protected readonly area: Signal<string> = computed((): string => colorPaletteArea(this.hueColor()));
    protected readonly spectrum: string = colorPaletteSpectrum();
    protected readonly hueDegrees: Signal<number> = computed((): number => Math.round(this.hsv().h));
    protected readonly saturation: Signal<number> = computed((): number => Math.round(this.hsv().s * 100));
    protected readonly areaText: Signal<string> = computed((): string => `${this.saturation()}%, ${Math.round(this.hsv().v * 100)}%`);

    protected readonly hexControl: FormControl<string> = new FormControl<string>('', { nonNullable: true });

    /** Поля каналов по порядку строки: красный, зелёный, синий. */
    protected readonly channelControls: readonly IChannelControl[] = CHANNELS.map((channel: IRtColorPalette.Channel): IChannelControl => ({
        channel,
        name: channel.toUpperCase(),
        control: new FormControl<string>('', { nonNullable: true }),
    }));

    /** Доступные имена полей каналов из словаря кита. */
    protected readonly channelLabels: Signal<Readonly<Record<IRtColorPalette.Channel, string>>> = computed(
        (): Readonly<Record<IRtColorPalette.Channel, string>> => ({
            r: this.t().uiColorPickerRed,
            g: this.t().uiColorPickerGreen,
            b: this.t().uiColorPickerBlue,
        })
    );

    /** Цвет, с которого начинается выбор, `#rrggbb`. */
    public readonly value: InputSignal<string> = input.required<string>();

    /** Строка полей красного, зелёного и синего под записью hex. Без неё — площадь, полоса и hex. */
    public readonly channels: InputSignal<boolean> = input<boolean>(false);

    public readonly applied: OutputEmitterRef<string> = output<string>();
    public readonly cancelled: OutputEmitterRef<void> = output<void>();

    #dragging: boolean = false;

    constructor() {
        // Поле записи показывает выбранное и молчит в ответ: иначе его же изменение вернулось бы
        // набранной строкой и перебило бы неоконченный ввод.
        effect((): void => {
            const hex: string = this.picked();

            if (colorPaletteHex(this.hexControl.value) !== hex) {
                this.hexControl.setValue(hex, { emitEvent: false });
            }
        });

        this.hexControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((text: string): void => {
            const hex: string | null = colorPaletteHex(text);

            if (hex !== null && hex !== this.picked()) {
                this.hsv.set(colorPaletteToHsv(hex));
            }
        });

        // Поля каналов ведут себя так же: показывают выбранное и молчат в ответ, а набранное целое
        // от 0 до 255 меняет один свой канал.
        effect((): void => {
            const rgb: IRtColorPalette.Rgb = colorPaletteToRgb(this.picked());

            for (const { channel, control } of this.channelControls) {
                if (colorPaletteChannel(control.value) !== rgb[channel]) {
                    control.setValue(String(rgb[channel]), { emitEvent: false });
                }
            }
        });

        for (const { channel, control } of this.channelControls) {
            control.valueChanges.pipe(takeUntilDestroyed()).subscribe((text: string): void => {
                const value: number | null = colorPaletteChannel(text);
                const rgb: IRtColorPalette.Rgb = colorPaletteToRgb(this.picked());

                if (value !== null && value !== rgb[channel]) {
                    this.hsv.set(colorPaletteToHsv(colorPaletteFromRgb({ ...rgb, [channel]: value })));
                }
            });
        }
    }

    protected onAreaPointer(event: PointerEvent): void {
        if (event.type === 'pointerdown') {
            this.#dragging = true;
            (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        }

        if (!this.#dragging) {
            return;
        }

        if (event.type === 'pointerup') {
            this.#dragging = false;
        }

        const box: DOMRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const s: number = box.width > 0 ? (event.clientX - box.left) / box.width : 0;
        const v: number = box.height > 0 ? 1 - (event.clientY - box.top) / box.height : 0;

        this.hsv.update((hsv: IRtColorPalette.Hsv): IRtColorPalette.Hsv => ({
            ...hsv,
            s: Math.min(1, Math.max(0, s)),
            v: Math.min(1, Math.max(0, v)),
        }));
    }

    protected onHuePointer(event: PointerEvent): void {
        if (event.type === 'pointerdown') {
            this.#dragging = true;
            (event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId);
        }

        if (!this.#dragging) {
            return;
        }

        if (event.type === 'pointerup') {
            this.#dragging = false;
        }

        const box: DOMRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
        const share: number = box.width > 0 ? Math.min(1, Math.max(0, (event.clientX - box.left) / box.width)) : 0;

        this.hsv.update((hsv: IRtColorPalette.Hsv): IRtColorPalette.Hsv => ({ ...hsv, h: Math.min(359, share * 360) }));
    }

    protected onKey(target: 'area' | 'hue', event: KeyboardEvent): void {
        const next: IRtColorPalette.Hsv | null = colorPaletteStep(target, event.key, this.hsv());

        if (next === null) {
            return;
        }

        event.preventDefault();
        this.hsv.set(next);
    }

    protected onApply(): void {
        if (this.changed()) {
            this.applied.emit(this.picked());
        }
    }
}
