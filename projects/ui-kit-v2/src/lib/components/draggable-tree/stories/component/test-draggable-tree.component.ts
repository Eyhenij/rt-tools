import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { IRtTree } from '../../../tree/rt-tree.model';
import { RtDraggableTreeComponent } from '../../rt-draggable-tree.component';
import { IRtDraggableTree } from '../../rt-draggable-tree.model';
import { DRAGGABLE_TREE_STORY_NODES } from './draggable-tree-story-nodes';

/**
 * Демонстрационная обёртка для витрины: держит порядок узлов и последний перенос, чтобы человек на
 * витрине видел, что дерево сообщает наружу. В пакет обёртка не уезжает.
 */
@Component({
    selector: 'app-draggable-tree',
    templateUrl: './test-draggable-tree.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // directives
        BlockDirective,
        ElemDirective,

        // components
        RtDraggableTreeComponent,
    ],
})
export class TestRtDraggableTreeComponent {
    public nodes: ReadonlyArray<IRtTree.Node<string>> = DRAGGABLE_TREE_STORY_NODES;
    public lastMove: string = '—';

    protected onMoved(event: IRtDraggableTree.Moved<string>): void {
        this.lastMove = `${event.node.label} → ${event.parent ?? 'верхний уровень'}, место ${event.index + 1}`;
    }
}
