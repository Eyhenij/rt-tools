import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    inject,
    input,
    output,
    signal,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { IRtDynamicSelector } from '../rt-dynamic-selector.model';

const BEM_BLOCK: string = 'rt-dynamic-selector-list';

/**
 * Список выбранного семьи динамических селекторов: строки с удалением, ручкой перетаскивания и
 * правкой, под ними полоса с кнопкой добавления вызывающего, сбросом и очисткой. Значения список
 * не держит: он сообщает, что человек сделал, а селектор и поле списка строк решают, что из этого
 * выходит.
 */
@Component({
    selector: 'rt-dynamic-selector-list',
    templateUrl: './rt-dynamic-selector-list.component.html',
    styleUrl: './rt-dynamic-selector-list.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        // Angular
        FormsModule,
        NgTemplateOutlet,

        // CDK
        CdkDrag,
        CdkDragHandle,
        CdkDropList,

        // standalone components / directives
        BlockDirective,
        ElemDirective,
        ModDirective,
        RtIconButtonComponent,
        RtInputComponent,
        RtTooltipDirective,
    ],
    host: { class: BEM_BLOCK },
})
export class RtDynamicSelectorListComponent<TItem> {
    readonly #breakpoints: BreakpointsService = inject(BreakpointsService);

    /** На узком экране подсказки кнопок не показываются: наведения там нет. */
    protected readonly isNarrow: Signal<boolean> = this.#breakpoints.narrow;
    protected readonly dragLabel: Signal<string> = rtKitLabel('dynamicSelectorDrag');
    protected readonly removeLabel: Signal<string> = rtKitLabel('dynamicSelectorRemove');
    protected readonly editLabel: Signal<string> = rtKitLabel('dynamicSelectorEdit');
    protected readonly applyLabel: Signal<string> = rtKitLabel('dynamicSelectorApply');
    protected readonly cancelLabel: Signal<string> = rtKitLabel('uiCancel');
    protected readonly resetLabel: Signal<string> = rtKitLabel('dynamicSelectorReset');
    protected readonly clearLabel: Signal<string> = rtKitLabel('dynamicSelectorClear');

    /** Строка, открытая для правки, и текст в её поле. */
    protected readonly editedIndex: WritableSignal<number | null> = signal<number | null>(null);
    protected readonly draft: WritableSignal<string> = signal<string>('');

    public readonly rows: InputSignal<ReadonlyArray<IRtDynamicSelector.ListRow<TItem>>> = input<
        ReadonlyArray<IRtDynamicSelector.ListRow<TItem>>
    >([]);
    public readonly draggable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly editable: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    /** Полоса под строками; приглашение вызывающего встаёт на её место. */
    public readonly actionsShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Сброс и очистка в полосе; без них в полосе остаётся кнопка добавления. */
    public readonly resetClearShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Корзина строк; без неё строки двигаются и правятся, но не убираются. */
    public readonly removeShown: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly resetDisabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    public readonly clearDisabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(true, {
        transform: booleanAttribute,
    });
    /** Шаг скругления кнопок-иконок списка; по умолчанию они круглые. */
    public readonly buttonRadius: InputSignal<TRtRadius | null> = input<TRtRadius | null>('full');
    public readonly titleTpl: InputSignal<TemplateRef<IRtDynamicSelector.RowContext<TItem>> | null> = input<TemplateRef<
        IRtDynamicSelector.RowContext<TItem>
    > | null>(null);
    public readonly controlsTpl: InputSignal<TemplateRef<IRtDynamicSelector.RowContext<TItem>> | null> = input<TemplateRef<
        IRtDynamicSelector.RowContext<TItem>
    > | null>(null);

    public readonly removed: OutputEmitterRef<unknown> = output<unknown>();
    public readonly moved: OutputEmitterRef<IRtDynamicSelector.Move> = output<IRtDynamicSelector.Move>();
    public readonly edited: OutputEmitterRef<IRtDynamicSelector.TextEdit> = output<IRtDynamicSelector.TextEdit>();
    public readonly resetClicked: OutputEmitterRef<void> = output<void>();
    public readonly cleared: OutputEmitterRef<void> = output<void>();

    /** Строка, взятая из чужого списка, ничего не меняет; брошенная на своё место — тоже. */
    protected onDrop(event: CdkDragDrop<unknown>): void {
        if (event.previousContainer !== event.container || event.previousIndex === event.currentIndex) {
            return;
        }

        this.moved.emit({ from: event.previousIndex, to: event.currentIndex });
    }

    protected onRemove(row: IRtDynamicSelector.ListRow<TItem>): void {
        if (!row.locked && !this.disabled()) {
            this.removed.emit(row.key);
        }
    }

    protected onEditStart(index: number, row: IRtDynamicSelector.ListRow<TItem>): void {
        this.draft.set(row.label);
        this.editedIndex.set(index);
    }

    protected onEditApply(row: IRtDynamicSelector.ListRow<TItem>): void {
        this.edited.emit({ previous: row.label, next: this.draft() });
        this.editedIndex.set(null);
    }

    protected onEditCancel(): void {
        this.editedIndex.set(null);
    }
}
