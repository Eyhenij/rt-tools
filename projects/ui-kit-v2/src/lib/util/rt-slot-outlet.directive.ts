import { effect, inject, input, untracked, Directive, EmbeddedViewRef, InputSignal, TemplateRef, ViewContainerRef } from '@angular/core';

/** Слот, переданный директивой слота: шаблон или `null` у элемента прежней формы. */
export interface IRtSlot {
    readonly template: TemplateRef<unknown> | null;
}

/**
 * Рисует шаблоны одного слота на месте узла, все в порядке записи; элементы прежней формы
 * пропускает. Ставится на `<ng-container>` внутри ветки, где слот открыт: закрытая ветка не создаёт
 * ни узла, ни содержимого слота.
 *
 * Вид шаблона живёт, пока шаблон стоит в слоте: пришедший или ушедший сосед не пересоздаёт
 * остальные, и их состояние — фокус, ввод, открытый список — остаётся на месте.
 */
@Directive({ selector: '[rtSlotOutlet]' })
export class RtSlotOutletDirective {
    readonly #container: ViewContainerRef = inject(ViewContainerRef);

    /** Нарисованные виды по их шаблону. */
    readonly #views: Map<TemplateRef<unknown>, EmbeddedViewRef<unknown>> = new Map<TemplateRef<unknown>, EmbeddedViewRef<unknown>>();

    public readonly rtSlotOutlet: InputSignal<readonly IRtSlot[]> = input.required<readonly IRtSlot[]>();

    constructor() {
        effect((): void => {
            const templates: TemplateRef<unknown>[] = this.rtSlotOutlet()
                .map((slot: IRtSlot): TemplateRef<unknown> | null => slot.template)
                .filter((template: TemplateRef<unknown> | null): template is TemplateRef<unknown> => template !== null);

            untracked((): void => this.#render(templates));
        });
    }

    #render(templates: readonly TemplateRef<unknown>[]): void {
        const kept: Set<TemplateRef<unknown>> = new Set<TemplateRef<unknown>>(templates);

        this.#views.forEach((view: EmbeddedViewRef<unknown>, template: TemplateRef<unknown>): void => {
            if (!kept.has(template)) {
                view.destroy();
                this.#views.delete(template);
            }
        });

        templates.forEach((template: TemplateRef<unknown>, index: number): void => {
            const view: EmbeddedViewRef<unknown> | undefined = this.#views.get(template);

            if (!view) {
                this.#views.set(template, this.#container.createEmbeddedView(template, undefined, index));
                return;
            }

            if (this.#container.indexOf(view) !== index) {
                this.#container.move(view, index);
            }
        });
    }
}
