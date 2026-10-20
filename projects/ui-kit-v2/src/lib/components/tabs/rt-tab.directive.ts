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
    signal,
    TemplateRef,
    WritableSignal,
} from '@angular/core';

import { rtKitLabel } from '@rt-tools/ui-kit-v2/core';
import { IRtIcon } from '@rt-tools/ui-kit-v2/core';
import { IRtTooltip } from '@rt-tools/ui-kit-v2/tooltip';
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
    readonly #t_uiTabInvalid: Signal<string> = rtKitLabel('uiTabInvalid');

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

    /**
     * Имя значка Material вместо `icon` — рисуется так же, как вход `glyph` у `rt-icon`.
     * Задан вместе с `icon` — решает `rt-icon`.
     */
    public readonly glyph: InputSignal<string | null> = input<string | null>(null);

    /** Семантический цвет иконки заголовка. */
    public readonly iconColor: InputSignal<IRtTabs.TitleColor> = input<IRtTabs.TitleColor>('current');

    /** Значение бейджа справа от заголовка (число/строка). `null` — без бейджа. */
    public readonly badge: InputSignal<string | number | null> = input<string | number | null>(null);

    /**
     * Подсказка при наведении на бейдж. Подсказка самой кнопки занята неверной вкладкой,
     * поэтому у бейджа своя. Пусто — подсказки нет.
     */
    public readonly badgeTitle: InputSignal<string> = input<string>('');

    /**
     * Подпись бейджа для чтения с экрана: точка или число сами по себе не говорят, что значат.
     * Пусто — атрибут не ставится, и озвучивается значение бейджа как есть.
     */
    public readonly badgeAriaLabel: InputSignal<string> = input<string>('');

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

    /**
     * Подсказка при наведении на вкладку — в том числе на отключённую, чтобы объяснить, почему она
     * недоступна. У вкладки без подписи она же становится её именем для чтения с экрана.
     */
    public readonly tooltip: InputSignal<string> = input<string>('');

    /** Вкладку можно закрыть: крестик в шапке и клавиша Delete поднимают `tabClose` у `rt-tabs`. */
    public readonly closable: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Подсказка крестика закрываемой вкладки. Пусто — подсказки нет. */
    public readonly closeTooltip: InputSignal<string> = input<string>('');

    /** Сторона подсказки крестика. Не задана — сторона подсказки по умолчанию. */
    public readonly closeTooltipPlacement: InputSignal<IRtTooltip.Placement | null> = input<IRtTooltip.Placement | null>(null);

    /**
     * Указатель стоит на крестике. Выставляет `rt-tabs`: пока он там, подсказка самой вкладки
     * молчит, и видна только подсказка крестика.
     */
    public readonly closeHovered: WritableSignal<boolean> = signal<boolean>(false);

    /** Готовый текст подсказки: своя формулировка важнее умолчания. */
    public readonly invalidTitle: Signal<string> = computed((): string => this.invalidMessage() || this.#t_uiTabInvalid());

    /**
     * Подсказка кнопки вкладки: у неверной — объяснение ошибки, иначе своя подсказка. Пока
     * указатель на крестике, пусто: две подсказки разом читались бы как одна. Крестик, убранный
     * из-под указателя, ухода не сообщает, поэтому признак читается вместе с `showClose`.
     */
    public readonly buttonTooltip: Signal<string> = computed((): string => {
        if (this.closeHovered() && this.showClose()) {
            return '';
        }

        return this.invalid() ? this.invalidTitle() : this.tooltip();
    });

    /**
     * Имя вкладки для чтения с экрана, когда видимой подписи нет: вкладка из одного значка
     * называется своей подсказкой. С подписью или своим заголовком атрибут не ставится.
     */
    public readonly ariaLabel: Signal<string | null> = computed((): string | null =>
        this.label() || this.titleTemplate() ? null : this.tooltip() || null
    );

    /** Крестик рисуется только у доступной вкладки: отключённую закрыть нельзя. */
    public readonly showClose: Signal<boolean> = computed((): boolean => this.closable() && !this.disabled());
}
