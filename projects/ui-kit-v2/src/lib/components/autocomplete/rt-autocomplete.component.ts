import { BooleanInput } from '@angular/cdk/coercion';
import { NgTemplateOutlet } from '@angular/common';
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
    TemplateRef,
    viewChild,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';

import { TranslocoPipe } from '@jsverse/transloco';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtFormControlBase } from '../form-control/rt-form-control.base';
import { RtIconComponent, IRtIcon } from '../icon';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { IRtAutocomplete } from './rt-autocomplete.model';

const BEM_BLOCK: string = 'rt-autocomplete';

let panelIdSeed: number = 0;

function nextPanelId(): number {
    panelIdSeed += 1;
    return panelIdSeed;
}

/**
 * Typeahead/autocomplete с server-side filter через `(complete)` event.
 *
 * Panel рендерится через CDK Overlay (`[rtPopover]` trigger="manual" на input'е)
 * — открывается по набору текста (не click/hover), не обрезается overflow.
 * Подписчик получает `(complete)` с текущей строкой и сам грузит подсказки.
 *
 * CVA через общий `RtFormControlBase`. Generic `TItem` — тип подсказки и
 * selected value. Крестик (`clearable`) виден при непустом тексте — очищает и
 * текст, и выбранный объект. Keyboard-nav (activedescendant): ArrowUp/Down —
 * highlight, Enter — выбрать активную, Escape — закрыть. Home/End — deferred.
 */
@Component({
    selector: 'rt-autocomplete',
    templateUrl: './rt-autocomplete.component.html',
    styleUrl: './rt-autocomplete.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        NgTemplateOutlet,

        // standalone components / directives
        RtIconButtonComponent,
        RtIconComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
        TranslocoPipe,
    ],
    providers: [
        // Алиас базового токена — для contentChild(RtFormControlBase) в rt-field.
        { provide: RtFormControlBase, useExisting: forwardRef(() => RtAutocompleteComponent) },
    ],
    host: {
        class: BEM_BLOCK,
        '[class.rt-autocomplete--open]': 'isOpen()',
        '[class.rt-autocomplete--disabled]': 'isDisabled()',
        '[class.rt-autocomplete--readonly]': 'isReadonly()',
        '[class.rt-autocomplete--invalid]': 'isInvalid()',
        '[class.rt-autocomplete--borderless]': '!bordered()',
        '[class.rt-autocomplete--size--sm]': "size() === 'sm'",
        '[class.rt-autocomplete--size--lg]': "size() === 'lg'",
    },
})
export class RtAutocompleteComponent<TItem> extends RtFormControlBase<TItem | null> {
    protected readonly panelId: string = `rt-autocomplete-panel-${nextPanelId()}`;

    protected readonly popover: Signal<RtPopoverDirective> = viewChild.required(RtPopoverDirective);

    protected readonly fieldEl: Signal<ElementRef<HTMLInputElement> | undefined> = viewChild<ElementRef<HTMLInputElement>>('fieldEl');

    protected readonly inputText: WritableSignal<string> = signal<string>('');
    protected readonly activeIndex: WritableSignal<number> = signal<number>(-1);

    protected readonly isOpen: Signal<boolean> = computed((): boolean => this.popover().isOpen());

    protected readonly hasValue: Signal<boolean> = computed((): boolean => this.inputText() !== '');

    public readonly displayText: Signal<string> = computed((): string => this.displayWith()(this.value()));

    public readonly suggestions: InputSignal<ReadonlyArray<TItem>> = input<ReadonlyArray<TItem>>([]);

    public readonly displayWith: InputSignal<(item: TItem | null) => string> = input<(item: TItem | null) => string>(
        (item: TItem | null): string => String(item ?? '')
    );

    public readonly placeholder: InputSignal<string> = input<string>('');
    public readonly minLength: InputSignal<number> = input<number>(1);

    /** Префикс-иконка слева в поле (например, `map` для поиска). */
    public readonly iconLeft: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    public readonly openOnFocus: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    public readonly itemTemplate: InputSignal<TemplateRef<{ $implicit: TItem }> | null> = input<TemplateRef<{ $implicit: TItem }> | null>(
        null
    );

    public readonly complete: OutputEmitterRef<IRtAutocomplete.CompleteEvent> = output<IRtAutocomplete.CompleteEvent>();

    public readonly itemSelect: OutputEmitterRef<TItem> = output<TItem>();

    public override writeValue(value: TItem | null): void {
        super.writeValue(value);
        this.inputText.set(this.displayWith()(this.value()));
    }

    public override setDisabledState(disabled: boolean): void {
        super.setDisabledState(disabled);
        if (disabled) {
            this.popover().close();
        }
    }

    protected getEmptyValue(): TItem | null {
        return null;
    }

    protected focusAfterClear(): void {
        this.fieldEl()?.nativeElement.focus();
    }

    protected override clearValue(): void {
        super.clearValue();
        this.inputText.set('');
    }

    protected onInput(event: Event): void {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const query: string = target.value;
        this.inputText.set(query);
        this.activeIndex.set(-1);
        if (query.length >= this.minLength()) {
            this.complete.emit({ query, originalEvent: event });
            this.popover().open();
        } else {
            this.popover().close();
        }
    }

    protected onFocus(): void {
        if (!this.openOnFocus()) {
            return;
        }
        this.complete.emit({ query: this.inputText(), originalEvent: new Event('focus') });
        this.popover().open();
    }

    protected onBlur(): void {
        this.markTouched();
    }

    protected onClosed(): void {
        this.activeIndex.set(-1);
    }

    protected onSelect(item: TItem): void {
        this.value.set(item);
        this.inputText.set(this.displayWith()(item));
        this.emitChange(item);
        this.itemSelect.emit(item);
        this.popover().close();
    }

    protected onInputKeydown(event: KeyboardEvent): void {
        if (this.isDisabled()) {
            return;
        }
        const key: string = event.key;
        if (!this.isOpen()) {
            return;
        }
        switch (key) {
            case 'ArrowDown':
                event.preventDefault();
                this.#moveActive(1);
                break;
            case 'ArrowUp':
                event.preventDefault();
                this.#moveActive(-1);
                break;
            case 'Enter':
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
        const items: ReadonlyArray<TItem> = this.suggestions();
        if (items.length === 0) {
            this.activeIndex.set(-1);
            return;
        }
        const index: number = this.activeIndex();
        const next: number = (index + delta + items.length) % items.length;
        this.activeIndex.set(next);
    }

    #selectActive(): void {
        const items: ReadonlyArray<TItem> = this.suggestions();
        const index: number = this.activeIndex();
        if (index >= 0 && index < items.length) {
            this.onSelect(items[index]);
        }
    }
}
