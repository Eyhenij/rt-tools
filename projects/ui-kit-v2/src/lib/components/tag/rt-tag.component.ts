import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterRenderEffect,
    booleanAttribute,
    inject,
    input,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OnDestroy,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '../../i18n';
import { RtIconComponent, IRtIcon } from '../icon';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { IRtTag } from './rt-tag.model';

const BEM_BLOCK: string = 'rt-tag';

/** Ступень значка по ступени пилюли. `md` оставляет значок таким, каким он был до ступеней. */
const ICON_BY_SIZE: Readonly<Record<IRtTag.Size, IRtIcon.Size>> = { sm: 'xs', md: 'sm', lg: 'md' };

/**
 * Status/label pill для отображения статусов и счётчиков.
 * Поддерживает 6 severity-вариантов (`info` / `success` / `warning` / `danger` /
 * `secondary` / `neutral`), 2 формы (`pill` / `square`) и опциональный close-control
 * (рендерит `rt-icon-button` с иконкой `ico-close` и emits `closed` MouseEvent).
 *
 * Все цвета — через семантические `--rt-color-state-*` токены; layout через
 * primitive `--rt-space-*` / `--rt-radius-*` / `--rt-text-*`. BEM-разметка через
 * директивы `rtBlock` / `rtElem` / `rtMod` из `@rt-tools/core`.
 */
@Component({
    selector: 'rt-tag',
    templateUrl: './rt-tag.component.html',
    styleUrl: './rt-tag.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconComponent,
        RtIconButtonComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtTagComponent implements OnDestroy {
    /** Текст pill — обязательный input. */
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    #resizeObserver: ResizeObserver | null = null;

    protected readonly textRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('text');

    /** Подписи не хватило места: она урезана многоточием, и целое значение показывает подсказка. */
    protected readonly overflowing: WritableSignal<boolean> = signal<boolean>(false);

    /** Размер значка ведёт ступень пилюли: свой вход у него был бы вторым числом об одном. */
    protected readonly iconSize: Signal<IRtIcon.Size> = computed((): IRtIcon.Size => ICON_BY_SIZE[this.size()]);

    public readonly value: InputSignal<string> = input.required<string>();

    /** Семантическая палитра. По умолчанию `neutral` (нейтральный серый). */
    public readonly severity: InputSignal<IRtTag.Severity> = input<IRtTag.Severity>('neutral');

    /**
     * Ступень размера. Умолчание `md` — тот размер, каким метка рисовалась до появления ступеней.
     * Отступы, кегль и значок двигаются вместе: кегль, названный отдельно, оставил бы отступы от
     * другой ступени, и ряд пилюль перестал бы выстраиваться.
     */
    public readonly size: InputSignal<IRtTag.Size> = input<IRtTag.Size>('md');

    /** Форма tag'а. По умолчанию `pill` (фуллскруглённый). */
    public readonly shape: InputSignal<IRtTag.Shape> = input<IRtTag.Shape>('pill');

    /** Вид заливки. По умолчанию `solid`; `outlined` — прозрачный фон + рамка. */
    public readonly appearance: InputSignal<IRtTag.Appearance> = input<IRtTag.Appearance>('solid');

    /** Переопределение скругления поверх `shape`. `null` — радиус по `shape`. */
    public readonly radius: InputSignal<IRtTag.Radius | null> = input<IRtTag.Radius | null>(null);

    /** Префикс-иконка слева от текста. `null` (дефолт) — без иконки. */
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Суффикс-иконка справа от текста (напр. `external-link` у тега-ссылки). */
    public readonly iconEnd: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Рендерит крестик `rt-icon-button` справа от текста. */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Эмиттит MouseEvent при клике на close-button (только если `closable=true`). */
    public readonly closed: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    constructor() {
        afterRenderEffect((): void => {
            this.value();
            this.size();
            this.#observeText();
            this.#measure();
        });
    }

    public ngOnDestroy(): void {
        this.#resizeObserver?.disconnect();
        this.#resizeObserver = null;
    }

    protected onClose(event: MouseEvent): void {
        event.stopPropagation();
        this.closed.emit(event);
    }

    /**
     * Переполнение считается наблюдателем за размером, а не отсчётом после отрисовки: отсчёт
     * отвечает о машине, а не о раскладке — на свободной его всегда хватает, на занятой нет, а
     * подпись, переполнившаяся позже, подсказки не получила бы вовсе.
     */
    #observeText(): void {
        const node: HTMLElement | undefined = this.textRef()?.nativeElement;

        if (node === undefined || this.#resizeObserver !== null || typeof ResizeObserver === 'undefined') {
            return;
        }

        this.#resizeObserver = new ResizeObserver((): void => this.#measure());
        this.#resizeObserver.observe(node);
    }

    #measure(): void {
        const node: HTMLElement | undefined = this.textRef()?.nativeElement;

        if (node !== undefined) {
            this.overflowing.set(node.scrollWidth > node.clientWidth);
        }
    }
}
