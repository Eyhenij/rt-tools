import { inject, Directive, TemplateRef } from '@angular/core';

import { IRtTree } from '../tree/rt-tree.model';

/**
 * Разметка приложения вместо подписи строки `rt-draggable-tree`. Узел строки приходит в контексте
 * как `$implicit`.
 */
@Directive({ selector: 'ng-template[rtDraggableTreeNode]' })
export class RtDraggableTreeNodeDirective<TValue> {
    public readonly templateRef: TemplateRef<IRtTree.NodeContext<TValue>> = inject<TemplateRef<IRtTree.NodeContext<TValue>>>(TemplateRef);
}
