import { ChangeDetectionStrategy, Component } from '@angular/core';

import { IRtTree } from '../../../tree/rt-tree.model';
import { RtHybridTreeComponent } from '../../rt-hybrid-tree.component';
import { IRtHybridTree } from '../../rt-hybrid-tree.model';
import { HYBRID_TREE_STORY_NODES } from './hybrid-tree-story-nodes';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-hybrid-tree',
    templateUrl: './test-hybrid-tree.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtHybridTreeComponent,
    ],
})
export class TestRtHybridTreeComponent {
    public nodes: ReadonlyArray<IRtHybridTree.Node<string>> = HYBRID_TREE_STORY_NODES;
    public value: ReadonlyArray<string> = ['hotel', 'ty-revenue'];
    public mode: IRtTree.Mode = 'multiple';
    public cascade: boolean = true;
    public searchTerm: string = '';
    public showSelectAll: boolean = true;
    public branchMarks: boolean = true;
    public exclusive: boolean = false;
    public disabled: boolean = false;
}
