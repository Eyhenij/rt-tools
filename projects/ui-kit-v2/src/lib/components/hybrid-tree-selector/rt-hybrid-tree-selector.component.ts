import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { FormsModule } from '@angular/forms';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { RtButtonDirective } from '@rt-tools/ui-kit-v2/button';
import { RtHybridTreeComponent } from '@rt-tools/ui-kit-v2/hybrid-tree';
import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtInputComponent } from '@rt-tools/ui-kit-v2/input';
import { RtToggleSwitchComponent } from '@rt-tools/ui-kit-v2/toggle-switch';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { RtTreeComponent } from '@rt-tools/ui-kit-v2/tree';
import { RtTreeSelectorComponent } from '@rt-tools/ui-kit-v2/tree-selector';

/** Блок разметки — блок `rt-tree-selector`: панель у селекторов одна, отличается дерево внутри. */
const BEM_BLOCK: string = 'rt-tree-selector';

/**
 * Выбор гибридным деревом: поле поиска, строка контролов и `rt-hybrid-tree` под ними.
 *
 * Панель, черновик, «Применить», поиск по словам и кнопки строки берёт у `rt-tree-selector` — та
 * же разметка и те же стили. Своё здесь одно: внутри стоит дерево, где часть групп выбирает один
 * лист. Узлы — `IRtHybridTree.Node`, признак `single` доходит до дерева нетронутым.
 */
@Component({
    selector: 'rt-hybrid-tree-selector',
    templateUrl: '../tree-selector/rt-tree-selector.component.html',
    styleUrl: '../tree-selector/rt-tree-selector.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        FormsModule,
        BlockDirective,
        ElemDirective,
        RtButtonDirective,
        RtIconComponent,
        RtInputComponent,
        RtToggleSwitchComponent,
        RtTooltipDirective,
        RtTreeComponent,
        RtHybridTreeComponent,
    ],
    host: { class: BEM_BLOCK },
})
export class RtHybridTreeSelectorComponent<TValue> extends RtTreeSelectorComponent<TValue> {
    protected override readonly hybrid: boolean = true;
}
