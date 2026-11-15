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

/**
 * Свой вид пустого дерева: `<ng-template rtTreeEmpty let-term>` встаёт вместо строки «Нет вариантов»
 * и «Ничего не найдено». Данные дерева местные, поэтому ошибки загрузки у него нет. В контексте —
 * строка поиска; без поиска она пустая.
 */
@Directive({ selector: 'ng-template[rtTreeEmpty]' })
export class RtTreeEmptyDirective {
    public readonly templateRef: TemplateRef<{ $implicit: string }> = inject<TemplateRef<{ $implicit: string }>>(TemplateRef);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- второй довод стража контекста шаблона стоит только в типе-предикате; убрать его нечем, подпись задаёт каркас
    public static ngTemplateContextGuard(_directive: RtTreeEmptyDirective, context: unknown): context is { $implicit: string } {
        return true;
    }
}
