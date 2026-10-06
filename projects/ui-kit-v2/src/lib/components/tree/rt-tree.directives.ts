import { inject, Directive, TemplateRef } from '@angular/core';

import { IRtTree } from './rt-tree.model';

/**
 * Разметка приложения в конце каждой строки `rt-tree`. Узел строки приходит в контексте как
 * `$implicit`: дерево не заводит вход под каждый такой элемент.
 */
@Directive({ selector: 'ng-template[rtTreeNodeEnd]' })
export class RtTreeNodeEndDirective<TValue> {
    public readonly templateRef: TemplateRef<IRtTree.NodeContext<TValue>> = inject<TemplateRef<IRtTree.NodeContext<TValue>>>(TemplateRef);
}

/**
 * Разметка приложения под подписью строки, в одной линии с метками узла. Узел строки приходит в
 * контексте как `$implicit`.
 */
@Directive({ selector: 'ng-template[rtTreeNodeMeta]' })
export class RtTreeNodeMetaDirective<TValue> {
    public readonly templateRef: TemplateRef<IRtTree.NodeContext<TValue>> = inject<TemplateRef<IRtTree.NodeContext<TValue>>>(TemplateRef);
}
