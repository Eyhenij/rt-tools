import { Directive, InputSignal, TemplateRef, ViewContainerRef, effect, inject, input } from '@angular/core';

/**
 * @description Context a `rtLet` template gets: the same value under the implicit name and under
 * the directive's own name.
 *
 * The second name is there for content that declares several names at once, where the implicit one
 * is already taken.
 */
export interface IRtLetContext<T> {
    $implicit: T;
    rtLet: T;
}

/**
 * @description Name a value once and read it by that name inside the template.
 *
 * Unlike a condition, this directive never decides whether to show anything: the content renders
 * for every value, empty ones included. A directive that hides content on an empty value silently
 * cancels the condition written next to it — the author sees their own condition in the markup and
 * does not see this one.
 *
 * The view is created once and the new value is delivered into it. Recreating it on every change
 * would drop the state of everything inside — typed text, an open panel, a scroll position.
 *
 * @example
 * ```html
 * <ng-container *rtLet="user()?.profile?.settings as settings">
 *     <span>{{ settings.theme }}</span>
 *     <span>{{ settings.locale }}</span>
 * </ng-container>
 * ```
 */
@Directive({
    selector: '[rtLet]',
})
export class RtLetDirective<T> {
    readonly #context: IRtLetContext<T> = { $implicit: undefined as T, rtLet: undefined as T };

    public readonly rtLet: InputSignal<T> = input.required<T>();

    constructor() {
        const template: TemplateRef<IRtLetContext<T>> = inject<TemplateRef<IRtLetContext<T>>>(TemplateRef);
        const container: ViewContainerRef = inject(ViewContainerRef);

        container.createEmbeddedView(template, this.#context);

        effect((): void => {
            const value: T = this.rtLet();

            // Пометки перерисовки здесь нет нарочно. Поля контекста сигналами не являются, но и
            // помечать нечего: значение приезжает привязкой из шаблона хозяина, хозяин от неё сам
            // становится грязным, а созданное здесь представление проверяется вместе с ним.
            // Пометка стояла и была снята опытом: с ней и без неё содержимое показывает новое
            // значение одинаково.
            this.#context.$implicit = value;
            this.#context.rtLet = value;
        });
    }

    /**
     * @description Carry the value's type into the content.
     *
     * Without it strict template checking infers the name as unknown, and every field access has to
     * be cast by hand — that is, checking is given up in the very place the name was introduced for.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- оба довода живут в объявлении типа: тело гарда компилятор не зовёт, он читает предикат
    public static ngTemplateContextGuard<T>(_directive: RtLetDirective<T>, context: unknown): context is IRtLetContext<T> {
        return true;
    }
}
