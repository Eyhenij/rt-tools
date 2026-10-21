import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList } from '@angular/cdk/drag-drop';
import { NgTemplateOutlet } from '@angular/common';
import { inject, signal, ChangeDetectionStrategy, Component, Signal, TemplateRef, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { BreakpointsService } from '@rt-tools/ui-kit-v2/core';
import { RtIconButtonComponent } from '@rt-tools/ui-kit-v2/icon-button';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { IRtIcon, TRtRadius } from '@rt-tools/ui-kit-v2/core';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { IRtDynamicSelector } from '../rt-dynamic-selector.model';
import { RtDynamicSelectorPartsService } from '../rt-dynamic-selector-parts.service';
import { IRtDynamicSelectorParts } from '../rt-dynamic-selector-parts.model';

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
    readonly #source: IRtDynamicSelectorParts.ListSource<TItem> =
        inject<RtDynamicSelectorPartsService<TItem>>(RtDynamicSelectorPartsService).list;

    /** На узком экране подсказки кнопок не показываются: наведения там нет. */
    protected readonly isNarrow: Signal<boolean> = this.#breakpoints.viewportNarrow;
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

    /* Строки и настройки приходят от корня: список стоит только внутри него. */
    protected readonly rows: Signal<ReadonlyArray<IRtDynamicSelector.ListRow<TItem>>> = this.#source.rows;
    protected readonly draggable: Signal<boolean> = this.#source.draggable;
    protected readonly editable: Signal<boolean> = this.#source.editable;
    protected readonly disabled: Signal<boolean> = this.#source.disabled;
    protected readonly actionsShown: Signal<boolean> = this.#source.actionsShown;
    protected readonly resetClearShown: Signal<boolean> = this.#source.resetClearShown;
    protected readonly removeShown: Signal<boolean> = this.#source.removeShown;
    protected readonly resetDisabled: Signal<boolean> = this.#source.resetDisabled;
    protected readonly clearDisabled: Signal<boolean> = this.#source.clearDisabled;
    protected readonly buttonRadius: Signal<TRtRadius | null> = this.#source.buttonRadius;
    protected readonly clearIcon: Signal<IRtIcon.Name> = this.#source.clearIcon;
    protected readonly titleWrap: Signal<boolean> = this.#source.titleWrap;
    protected readonly titleTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<TItem>> | null> = this.#source.titleTpl;
    protected readonly controlsTpl: Signal<TemplateRef<IRtDynamicSelector.RowContext<TItem>> | null> = this.#source.controlsTpl;

    /** Строка, взятая из чужого списка, ничего не меняет; брошенная на своё место — тоже. */
    protected onDrop(event: CdkDragDrop<unknown>): void {
        if (event.previousContainer !== event.container || event.previousIndex === event.currentIndex) {
            return;
        }

        this.#source.move({ from: event.previousIndex, to: event.currentIndex });
    }

    protected onRemove(row: IRtDynamicSelector.ListRow<TItem>): void {
        if (!row.locked && !this.disabled()) {
            this.#source.remove(row.key);
        }
    }

    protected onEditStart(index: number, row: IRtDynamicSelector.ListRow<TItem>): void {
        this.draft.set(row.label);
        this.editedIndex.set(index);
    }

    protected onEditApply(row: IRtDynamicSelector.ListRow<TItem>): void {
        this.#source.edit({ previous: row.label, next: this.draft() });
        this.editedIndex.set(null);
    }

    protected onEditCancel(): void {
        this.editedIndex.set(null);
    }

    protected onReset(): void {
        this.#source.reset();
    }

    protected onClear(): void {
        this.#source.clear();
    }
}
