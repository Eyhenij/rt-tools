import { ChangeDetectionStrategy, Component } from '@angular/core';

import { RtTreeComponent } from '../../rt-tree.component';
import { IRtTree } from '../../rt-tree.model';
import { TREE_STORY_NODES } from './tree-story-nodes';

/**
 * Демонстрационная обёртка для витрины: держит изменяемое состояние, на которое Storybook вешает
 * контролы. Входы кита сигнальные и извне не пишутся — поэтому история целится сюда, а не в сам
 * компонент. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-tree',
    templateUrl: './test-tree.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtTreeComponent,
    ],
})
export class TestRtTreeComponent {
    public nodes: ReadonlyArray<IRtTree.Node<string>> = TREE_STORY_NODES;
    public value: ReadonlyArray<string> = ['msk'];
    public mode: IRtTree.Mode = 'multiple';
    public cascade: boolean = true;
    public searchTerm: string = '';
    public showSelectAll: boolean = false;
}
