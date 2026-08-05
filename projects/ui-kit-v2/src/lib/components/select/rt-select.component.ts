import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    ElementRef,
    forwardRef,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    signal,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { translateSignal, TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconComponent, IRtIcon } from '../icon';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtInputComponent } from '../input/rt-input.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { IRtSelect } from './rt-select.model';

const BEM_BLOCK: string = 'rt-select';

/** Клавиши, открывающие закрытый dropdown с фокуса на trigger'е. */
const OPEN_KEYS: ReadonlySet<string> = new Set<string>(['ArrowDown', 'ArrowUp', 'Enter', ' ']);

type IBooleanInput = boolean | string;

let panelIdSeed: number = 0;

function nextPanelId(): number {
    panelIdSeed += 1;
    return panelIdSeed;
}

/**
 * Single-select dropdown с опциональным filter input.
 *
 * Panel рендерится через CDK Overlay (директива `[rtPopover]` на trigger'е) —
 * не обрезается `overflow: hidden` предками (таблицы, aside, карточки) и
 * авто-flip'ается у края viewport. CVA через общий `RtFormControlBase`. Крестик
 * (`clearable`) слева от шеврона — виден при наличии значения, очищает выбор.
 *
 * Keyboard-nav (activedescendant): фокус на trigger'е, ArrowUp/Down двигают
 * виртуальный highlight (`aria-activedescendant`), Enter выбирает, Escape
 * закрывает. Home/End/typeahead — deferred.
 */
@Component({
    selector: 'rt-select',
    templateUrl: './rt-select.component.html',
    styleUrl: './rt-select.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,

        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        RtInputComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtSelectComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-select--open]': 'isOpen()',
        '[class.rt-select--disabled]': 'isDisabled()',
        '[class.rt-select--readonly]': 'isReadonly()',
        '[class.rt-select--invalid]': 'isInvalid()',
        '[class.rt-select--borderless]': '!bordered()',
        '[class.rt-select--size--sm]': "size() === 'sm'",
        '[class.rt-select--size--lg]': "size() === 'lg'",
        '[class.rt-select--with-icon-left]': '!!iconLeft()',
    },
})
export class RtSelectComponent<TValue> extends RtFormControlBase<TValue | null> {
    readonly #t_uiSearch: Signal<string> = translateSignal('rtKit.uiSearch');

    protected readonly panelId: string = `rt-select-panel-${nextPanelId()}`;

    protected readonly filterPlaceholderText: Signal<string> = computed((): string => this.filterPlaceholder() || this.#t_uiSearch());

    protected readonly popover: Signal<RtPopoverDirective> = viewChild.required(RtPopoverDirective);

    protected readonly triggerEl: Signal<ElementRef<HTMLButtonElement> | undefined> = viewChild<ElementRef<HTMLButtonElement>>('triggerEl');

    protected readonly filterTerm: WritableSignal<string> = signal<string>('');
    protected readonly activeIndex: WritableSignal<number> = signal<number>(-1);

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover().isOpen());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.value() !== null);

    protected readonly selectedLabel: Signal<string> = computed((): string => {
        const v: TValue | null = this.value();
        if (v === null) {
            return '';
        }
        const match: IRtSelect.Option<TValue> | undefined = this.options().find((o: IRtSelect.Option<TValue>): boolean => o.value === v);
        return match?.label ?? '';
    });

    protected readonly filteredOptions: Signal<ReadonlyArray<IRtSelect.Option<TValue>>> = computed(
        (): ReadonlyArray<IRtSelect.Option<TValue>> => {
            const term: string = this.filterTerm().toLowerCase().trim();
            const all: ReadonlyArray<IRtSelect.Option<TValue>> = this.options();
            if (!term) {
                return all;
            }
            return all.filter((o: IRtSelect.Option<TValue>): boolean => o.label.toLowerCase().includes(term));
        }
    );

    public readonly displayText: Signal<string> = computed((): string => this.selectedLabel());

    public readonly options: InputSignal<ReadonlyArray<IRtSelect.Option<TValue>>> = input<ReadonlyArray<IRtSelect.Option<TValue>>>([]);

    public readonly placeholder: InputSignal<string> = input<string>('');

    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    public readonly filter: InputSignalWithTransform<boolean, IBooleanInput> = input<boolean, IBooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Пусто — берётся переведённая подпись по умолчанию */
    public readonly filterPlaceholder: InputSignal<string> = input<string>('');

    public readonly selectionChange: OutputEmitterRef<TValue | null> = output<TValue | null>();

    public override setDisabledState(disabled: boolean): void {
        super.setDisabledState(disabled);
        if (disabled) {
            this.popover().close();
        }
    }

    protected getEmptyValue(): TValue | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.triggerEl()?.nativeElement.focus();
    }

    protected override clear(event?: Event): void {
        if (this.isDisabled()) {
            return;
        }
        super.clear(event);
        this.selectionChange.emit(null);
    }

    protected onClosed(): void {
        // Закрытие (outside-click / Escape / выбор) = пользователь увёл фокус.
        this.filterTerm.set('');
        this.activeIndex.set(-1);
        this.markTouched();
    }

    protected select(opt: IRtSelect.Option<TValue>): void {
        if (opt.disabled) {
            return;
        }
        this.value.set(opt.value);
        this.emitChange(opt.value);
        this.selectionChange.emit(opt.value);
        this.popover().close();
    }

    protected setFilter(term: string): void {
        this.filterTerm.set(term);
        this.activeIndex.set(-1);
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
                this.#selectActive();
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
        const opts: ReadonlyArray<IRtSelect.Option<TValue>> = this.filteredOptions();
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

    #selectActive(): void {
        const opts: ReadonlyArray<IRtSelect.Option<TValue>> = this.filteredOptions();
        const index: number = this.activeIndex();
        if (index >= 0 && index < opts.length) {
            this.select(opts[index]);
        }
    }
}
