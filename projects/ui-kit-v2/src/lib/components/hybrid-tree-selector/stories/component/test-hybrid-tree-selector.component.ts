import { ChangeDetectionStrategy, Component } from '@angular/core';

import { HYBRID_TREE_STORY_NODES } from '../../../hybrid-tree/stories/component/hybrid-tree-story-nodes';
import { IRtHybridTree } from '../../../hybrid-tree/rt-hybrid-tree.model';
import { RtHybridTreeSelectorComponent } from '../../rt-hybrid-tree-selector.component';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Селектор берёт высоту места, куда его поставили, поэтому стоит в коробке своей высоты.
 * В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-hybrid-tree-selector',
    templateUrl: './test-hybrid-tree-selector.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtHybridTreeSelectorComponent,
    ],
})
export class TestRtHybridTreeSelectorComponent {
    public nodes: ReadonlyArray<IRtHybridTree.Node<string>> = HYBRID_TREE_STORY_NODES;
    public value: ReadonlyArray<string> = ['hotel', 'ty-revenue'];
    public confirm: boolean = true;
    public expandControls: boolean = true;
    public clearable: boolean = true;
    public revertable: boolean = true;
    public selectAll: boolean = true;
    public branchMarks: boolean = true;
    public label: string = 'Поля отчёта';
    public searchTerm: string = '';
    public disabled: boolean = false;
}
