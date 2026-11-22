import { effect, inject, input, untracked, Directive, InputSignal, TemplateRef, ViewContainerRef } from '@angular/core';

/** Слот, переданный директивой слота: шаблон или `null` у элемента прежней формы. */
export interface IRtSlot {
    readonly template: TemplateRef<unknown> | null;
}

/**
 * Рисует шаблоны одного слота на месте узла, все в порядке записи; элементы прежней формы
 * пропускает. Ставится на `<ng-container>` внутри ветки, где слот открыт: закрытая ветка не создаёт
 * ни узла, ни содержимого слота.
 */
@Directive({ selector: '[rtSlotOutlet]' })
export class RtSlotOutletDirective {
    readonly #container: ViewContainerRef = inject(ViewContainerRef);

    public readonly rtSlotOutlet: InputSignal<readonly IRtSlot[]> = input.required<readonly IRtSlot[]>();

    constructor() {
        effect((): void => {
            const templates: TemplateRef<unknown>[] = this.rtSlotOutlet()
                .map((slot: IRtSlot): TemplateRef<unknown> | null => slot.template)
                .filter((template: TemplateRef<unknown> | null): template is TemplateRef<unknown> => template !== null);

            untracked((): void => {
                this.#container.clear();
                for (const template of templates) {
                    this.#container.createEmbeddedView(template);
                }
            });
        });
    }
}
