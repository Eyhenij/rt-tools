import { computed, contentChild, input, output, Directive, InputSignal, OutputEmitterRef, Signal, TemplateRef } from '@angular/core';

import { IRtLoadError } from '@rt-tools/ui-kit-v2/empty-state';
import { RtDynamicSelectorEmptyDirective, RtDynamicSelectorErrorDirective } from './rt-dynamic-selector.directives';

/**
 * Ошибка загрузки и свои виды окна выбора — одним местом для корня и окна самого по себе. Стоит у
 * них директивой хоста: входы и событие выходят наружу под своими именами, а шаблоны ищутся среди
 * содержимого хоста.
 */
@Directive({})
export class RtDynamicSelectorLoadStateDirective {
    protected readonly emptySlot: Signal<RtDynamicSelectorEmptyDirective | undefined> = contentChild(RtDynamicSelectorEmptyDirective);
    protected readonly errorSlot: Signal<RtDynamicSelectorErrorDirective | undefined> = contentChild(RtDynamicSelectorErrorDirective);

    /** Свой вид пустого результата; `null` — заглушка кита. */
    public readonly emptyTemplate: Signal<TemplateRef<{ $implicit: string }> | null> = computed(
        (): TemplateRef<{ $implicit: string }> | null => this.emptySlot()?.templateRef ?? null
    );

    /** Свой вид ошибки загрузки; `null` — заглушка кита с кнопкой «Повторить». */
    public readonly errorTemplate: Signal<TemplateRef<IRtLoadError.Context> | null> = computed(
        (): TemplateRef<IRtLoadError.Context> | null => this.errorSlot()?.templateRef ?? null
    );

    /**
     * Ошибка загрузки записей: не `null` — окно выбора рисует ошибку с кнопкой «Повторить» вместо
     * записей. Пустая строка — ошибка без своего текста, заголовок из подписи кита.
     */
    public readonly error: InputSignal<string | null> = input<string | null>(null);

    /** Подсказка под заголовком ошибки; пусто — подпись кита `uiLoadErrorHint`. */
    public readonly errorDescription: InputSignal<string> = input<string>('');

    /** Нажата «Повторить»: повторить загрузку — дело потребителя. */
    public readonly retry: OutputEmitterRef<void> = output<void>();
}
