import { NgTemplateOutlet } from '@angular/common';
import { computed, ChangeDetectionStrategy, Component, Signal, ViewEncapsulation } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtCheckboxComponent } from '../checkbox/rt-checkbox.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtRadioButtonComponent } from '../radio-button/rt-radio-button.component';
import { RtTagComponent } from '../tag/rt-tag.component';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { RtTreeComponent } from '../tree/rt-tree.component';
import { IRtTree } from '../tree/rt-tree.model';
import {
    rtHybridTreeChoose,
    rtHybridTreeChosenCount,
    rtHybridTreeIsSingleGroup,
    rtHybridTreeMark,
    rtHybridTreeSelectAll,
    rtHybridTreeSelectAllMark,
    rtHybridTreeSingleLeaves,
} from './rt-hybrid-tree.logic';

/** Блок разметки — блок `rt-tree`: разметка и стили у деревьев одни, отличается только расчёт выбора. */
const BEM_BLOCK: string = 'rt-tree';

/**
 * Дерево выбора, где часть групп выбирает один лист.
 *
 * Строки, клавиши, поиск, метки и разметку приложения берёт у `rt-tree` — та же разметка и те же
 * стили. Своё здесь только то, как считается выбор: группа с `single` держит один прямой лист, её
 * листья не набираются ни «выбрать всё», ни каскадом ветки, а группа без отметки показывает число
 * выбранного под ней. Узлы — `IRtHybridTree.Node`.
 */
@Component({
    selector: 'rt-hybrid-tree',
    templateUrl: '../tree/rt-tree.component.html',
    styleUrl: '../tree/rt-tree.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        FormsModule,
        RtCheckboxComponent,
        RtIconComponent,
        RtRadioButtonComponent,
        RtTagComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'tree',
        tabindex: '0',
        '[attr.aria-label]': 'ariaLabel()',
        '[attr.aria-multiselectable]': "mode() === 'multiple'",
        '(keydown)': 'handleKeydown($event)',
    },
})
export class RtHybridTreeComponent<TValue> extends RtTreeComponent<TValue> {
    /** Листья групп «один лист». */
    protected readonly singles: Signal<ReadonlySet<TValue>> = computed((): ReadonlySet<TValue> => rtHybridTreeSingleLeaves(this.nodes()));

    protected override rowState(row: IRtTree.Row<TValue>, value: ReadonlyArray<TValue>, cascade: boolean): IRtTree.RowState {
        const node: IRtTree.Node<TValue> = row.option;
        const single: boolean = this.singles().has(node.value) || rtHybridTreeIsSingleGroup(node);
        const count: number = rtHybridTreeChosenCount(node, value);
        return {
            mark: rtHybridTreeMark(node, value, cascade, this.singles()),
            radio: this.mode() === 'single' || (this.mode() === 'multiple' && single),
            count: count > 0 ? count : null,
        };
    }

    protected override selectAllMarkOf(rows: ReadonlyArray<IRtTree.Row<TValue>>, value: ReadonlyArray<TValue>): IRtTree.Mark {
        return rtHybridTreeSelectAllMark(rows, value, this.singles());
    }

    protected override selectAllChoice(rows: ReadonlyArray<IRtTree.Row<TValue>>, value: ReadonlyArray<TValue>): ReadonlyArray<TValue> {
        return rtHybridTreeSelectAll(rows, value, this.singles());
    }

    protected override nextChoice(node: IRtTree.Node<TValue>, additive: boolean): ReadonlyArray<TValue> {
        return rtHybridTreeChoose(this.nodes(), node, this.value(), {
            mode: this.mode(),
            cascade: this.cascade(),
            alone: this.exclusive() && !additive,
        });
    }
}
