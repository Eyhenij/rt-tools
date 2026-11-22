import { inject, isDevMode, TemplateRef } from '@angular/core';

/**
 * Шаблон слота компонента кита. Директива слота стоит на `<ng-template>` потребителя, и компонент
 * рисует шаблон только в открытой ветке: содержимое закрытой ветки не создаётся.
 *
 * Прежняя форма — атрибут слота на элементе — шаблона не даёт: на экран она не попадает, а в режиме
 * разработки пишет предупреждение с компонентом, слотом и новой формой.
 *
 * Зовётся в инициализаторе поля директивы слота. `warn` выключает предупреждение, когда атрибут той же
 * формы законно служит слотом-элементом другого компонента.
 */
export function rtSlotTemplate(host: string, slot: string, warn: boolean = true): TemplateRef<unknown> | null {
    const template: TemplateRef<unknown> | null = inject<TemplateRef<unknown>>(TemplateRef, { optional: true });

    if (template === null && warn && isDevMode()) {
        // eslint-disable-next-line no-console -- предупреждение разработчику приложения: другого канала у кита нет
        console.warn(
            `${host}: слот ${slot} передаётся шаблоном — <ng-template ${slot}>…</ng-template>; элемент с атрибутом ${slot} не рисуется.`
        );
    }

    return template;
}

/** Шаблоны слота, переданные шаблоном: элементы прежней формы отбрасываются. */
export function rtSlotTemplates(slots: readonly { readonly template: TemplateRef<unknown> | null }[]): TemplateRef<unknown>[] {
    return slots
        .map((slot: { readonly template: TemplateRef<unknown> | null }): TemplateRef<unknown> | null => slot.template)
        .filter((template: TemplateRef<unknown> | null): template is TemplateRef<unknown> => template !== null);
}
