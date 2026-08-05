import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    input,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    TemplateRef,
} from '@angular/core';

import { translateSignal } from '@jsverse/transloco';

import { IRtIcon } from '../icon/rt-icon.model';
import { IRtTabs } from './rt-tabs.model';

/**
 * Декларирует одну вкладку `<rt-tabs>`. Ставится на `<ng-template>`: контент
 * шаблона становится телом панели и рендерится только когда вкладка активна.
 *
 * Метаданные (label, icon, disabled, badge, invalid) — signal-inputs, поэтому
 * шапка вкладки реагирует на их изменение без ручной перерегистрации. Сам
 * список вкладок `rt-tabs` собирает через `contentChildren`.
 */
@Directive({
    selector: '[rtTab]',
})
export class RtTabDirective {
    readonly #t_uiTabInvalid: Signal<string> = translateSignal('rtKit.uiTabInvalid');

    /** Шаблон тела панели — рендерится в области контента при активной вкладке. */
    public readonly templateRef: TemplateRef<unknown> = inject<TemplateRef<unknown>>(TemplateRef);

    /** Стабильный идентификатор вкладки (значение атрибута `rtTab`). */
    public readonly id: InputSignal<IRtTabs.Id> = input<IRtTabs.Id>('', { alias: 'rtTab' });

    /** Текстовый заголовок. Игнорируется, если задан `titleTemplate`. */
    public readonly label: InputSignal<string> = input<string>('');

    /** Кастомный шаблон заголовка — замещает `label`. */
    public readonly titleTemplate: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    /** Иконка слева от заголовка. */
    public readonly icon: InputSignal<IRtIcon.Name | null> = input<IRtIcon.Name | null>(null);

    /** Семантический цвет иконки заголовка. */
    public readonly iconColor: InputSignal<IRtTabs.TitleColor> = input<IRtTabs.TitleColor>('current');

    /** Значение бейджа справа от заголовка (число/строка). `null` — без бейджа. */
    public readonly badge: InputSignal<string | number | null> = input<string | number | null>(null);

    /** Заблокированная вкладка: не выбирается и не получает фокус. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Скрытая вкладка: не рендерится ни в шапке, ни в контенте. */
    public readonly hidden: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Вкладка с ошибками: подсвечивается danger-цветом. */
    public readonly invalid: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Подсказка для невалидной вкладки. Пусто — берётся переведённое умолчание. */
    public readonly invalidMessage: InputSignal<string> = input<string>('');

    /** Готовый текст подсказки: своя формулировка важнее умолчания. */
    public readonly invalidTitle: Signal<string> = computed((): string => this.invalidMessage() || this.#t_uiTabInvalid());
}
