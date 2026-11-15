import { inject, Directive, TemplateRef } from '@angular/core';

import { IRtTree } from '@rt-tools/ui-kit-v2/tree';

/**
 * Разметка приложения вместо подписи строки `rt-draggable-tree`. Узел строки приходит в контексте
 * как `$implicit`.
 */
@Directive({ selector: 'ng-template[rtDraggableTreeNode]' })
export class RtDraggableTreeNodeDirective<TValue> {
    public readonly templateRef: TemplateRef<IRtTree.NodeContext<TValue>> = inject<TemplateRef<IRtTree.NodeContext<TValue>>>(TemplateRef);
}

/**
 * Свой вид пустого дерева: `<ng-template rtDraggableTreeEmpty>` встаёт вместо строки «Нет вариантов».
 * Данные дерева местные, поэтому ошибки загрузки у него нет. Поиска у дерева нет — строка в контексте
 * пустая.
 */
@Directive({ selector: 'ng-template[rtDraggableTreeEmpty]' })
export class RtDraggableTreeEmptyDirective {
    public readonly templateRef: TemplateRef<{ $implicit: string }> = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
    public static ngTemplateContextGuard(_directive: RtDraggableTreeEmptyDirective, context: unknown): context is { $implicit: string } {
        return true;
    }
}
