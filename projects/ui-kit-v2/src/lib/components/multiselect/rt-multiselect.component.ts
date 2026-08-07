import {
    computed,
    forwardRef,
    inject,
    input,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    InputSignal,
    Signal,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RtKitLabelMap, rtKitLabel } from '../../i18n';
import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { IRtSelect } from '../select/rt-select.model';
import { RtTagComponent } from '../tag/rt-tag.component';
import { RtMultiselectLabelPipe } from './rt-multiselect-label.pipe';

const BEM_BLOCK: string = 'rt-multiselect';

/** Клавиши, открывающие закрытый dropdown с фокуса на trigger'е. */
const OPEN_KEYS: ReadonlySet<string> = new Set<string>(['ArrowDown', 'ArrowUp', 'Enter', ' ']);

let panelIdSeed: number = 0;

function nextPanelId(): number {
    panelIdSeed += 1;
    return panelIdSeed;
}

/**
 * Multi-select с chip-rendering выбранных значений в trigger.
 *
 * Panel рендерится через CDK Overlay (`[rtPopover]`) — не обрезается overflow,
 * авто-flip. Панель НЕ закрывается после выбора (multi vs single). CVA через
 * общий `RtFormControlBase`. Reuses `IRtSelect.Option<TValue>` (type-import).
 * Чипы закрываются поштучно; крестик (`clearable`) слева от шеврона очищает весь
 * выбор.
 *
 * Keyboard-nav (activedescendant): фокус на trigger'е, ArrowUp/Down — highlight,
 * Enter — toggle опции (panel остаётся открытой), Escape — закрыть. Home/End —
 * deferred.
 */
@Component({
    selector: 'rt-multiselect',
    templateUrl: './rt-multiselect.component.html',
    styleUrl: './rt-multiselect.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        RtPopoverDirective,
        RtTagComponent,
        BlockDirective,
        ElemDirective,
        ModDirective,

        // pipes
        RtMultiselectLabelPipe,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtMultiselectComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-multiselect--open]': 'isOpen()',
        '[class.rt-multiselect--disabled]': 'isDisabled()',
        '[class.rt-multiselect--readonly]': 'isReadonly()',
        '[class.rt-multiselect--invalid]': 'isInvalid()',
        '[class.rt-multiselect--borderless]': '!bordered()',
        '[class.rt-multiselect--size--sm]': "size() === 'sm'",
        '[class.rt-multiselect--size--lg]': "size() === 'lg'",
    },
})
export class RtMultiselectComponent<TValue> extends RtFormControlBase<ReadonlyArray<TValue>> {
    readonly #t_uiSelectValues: Signal<string> = rtKitLabel('uiSelectValues');

    protected readonly t: Signal<RtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly panelId: string = `rt-multiselect-panel-${nextPanelId()}`;

    protected readonly placeholderText: Signal<string> = computed((): string => this.placeholder() || this.#t_uiSelectValues());

    protected readonly popover: Signal<RtPopoverDirective> = viewChild.required(RtPopoverDirective);

    protected readonly triggerEl: Signal<ElementRef<HTMLButtonElement> | undefined> = viewChild<ElementRef<HTMLButtonElement>>('triggerEl');

    protected readonly activeIndex: WritableSignal<number> = signal<number>(-1);

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover().isOpen());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value().length > 0);

    protected readonly visibleChips: Signal<ReadonlyArray<TValue>> = computed((): ReadonlyArray<TValue> =>
        this.value().slice(0, this.maxChips())
    );

    protected readonly extraChipsCount: Signal<number> = computed((): number => Math.max(0, this.value().length - this.maxChips()));

    public readonly displayText: Signal<string> = computed((): string =>
        this.value()
            .map((v: TValue): string => this.labelOf(v))
            .join(', ')
    );

    public readonly options: InputSignal<ReadonlyArray<IRtSelect.Option<TValue>>> = input<ReadonlyArray<IRtSelect.Option<TValue>>>([]);

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly maxChips: InputSignal<number> = input<number>(3);

    public override setDisabledState(disabled: boolean): void {
        super.setDisabledState(disabled);
        if (disabled) {
            this.popover().close();
        }
    }

    protected getEmptyValue(): ReadonlyArray<TValue> {
        return [];
    }

    protected focusAfterClear(): void {
        this.triggerEl()?.nativeElement.focus();
    }

    protected labelOf(value: TValue): string {
        const match: IRtSelect.Option<TValue> | undefined = this.options().find(
            (o: IRtSelect.Option<TValue>): boolean => o.value === value
        );
        return match?.label ?? String(value);
    }

    protected isSelected(value: TValue): boolean {
        return this.value().includes(value);
    }

    protected onClosed(): void {
        this.activeIndex.set(-1);
        this.markTouched();
    }

    protected toggleOption(opt: IRtSelect.Option<TValue>): void {
        if (opt.disabled || this.isDisabled()) {
            return;
        }
        const current: ReadonlyArray<TValue> = this.value();
        const next: ReadonlyArray<TValue> = this.isSelected(opt.value)
            ? current.filter((v: TValue): boolean => v !== opt.value)
            : [...current, opt.value];
        this.value.set(next);
        this.emitChange([...next]);
    }

    protected removeChip(value: TValue, event: MouseEvent): void {
        event.stopPropagation();
        if (this.isDisabled()) {
            return;
        }
        const next: ReadonlyArray<TValue> = this.value().filter((v: TValue): boolean => v !== value);
        this.value.set(next);
        this.emitChange([...next]);
    }

    protected onTriggerKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            return;
        }
        if (!this.isOpen()) {
            if (OPEN_KEYS.has(event.key)) {
                event.preventDefault();
                this.popover().open();
                this.#moveActive(1);
            }
            return;
        }
        this.#handleOpenKeydown(event);
    }

    #handleOpenKeydown(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.#moveActive(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.#moveActive(-1);
                break;
            case 'Enter':
            case ' ':
                event.preventDefault();
                this.#toggleActive();
                break;
            case 'Escape':
                event.preventDefault();
                this.popover().close();
                break;
            default:
                break;
        }
    }

    #moveActive(delta: number): void {
        const opts: ReadonlyArray<IRtSelect.Option<TValue>> = this.options();
        if (opts.length === 0) {
            this.activeIndex.set(-1);
            return;
        }
        let index: number = this.activeIndex();
        for (let step: number = 0; step < opts.length; step += 1) {
            index = (index + delta + opts.length) % opts.length;
            if (!opts[index].disabled) {
                this.activeIndex.set(index);
                return;
            }
        }
    }

    #toggleActive(): void {
        const opts: ReadonlyArray<IRtSelect.Option<TValue>> = this.options();
        const index: number = this.activeIndex();
        if (index >= 0 && index < opts.length) {
            this.toggleOption(opts[index]);
        }
    }
}
