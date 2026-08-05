import { BooleanInput, NumberInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    numberAttribute,
    output,
    OutputEmitterRef,
    Signal,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RtIconComponent } from '../icon/rt-icon.component';
import { IRtIcon } from '../icon/rt-icon.model';
import { RtTooltipDirective } from '../tooltip/rt-tooltip.directive';
import { IRtIconButton } from './rt-icon-button.model';

const BEM_BLOCK: string = 'rt-icon-button';

/**
 * Универсальная icon-only кнопка кита.
 *
 * Рендерит свой собственный `<button type="...">` внутри template (НЕ host-button).
 * Все цвета и размеры — через семантические `--rt-*` токены; геометрия квадрата
 * выставляется CSS-custom-property `--rt-icon-button-size` (overridable inline
 * через `style="--rt-icon-button-size: 35px"` — нужно для миграции rt-header 35×35).
 *
 * Loading state — заменяет иконку на `<rt-icon name="spinner">` и блокирует
 * клики (`button[disabled]`). Active state управляет `aria-pressed` (для toggle-кнопок).
 * Indicator — небольшой dot top-right через BEM-элемент `__indicator`.
 *
 * BEM-разметка — через `rtBlock="rt-icon-button"` + `[rtMod]` объект; камелкейс
 * модификаторов автоматически конвертируется директивой в kebab-case
 * (`hasIndicator` → `rt-icon-button--has-indicator`).
 */
@Component({
    selector: 'rt-icon-button',
    templateUrl: './rt-icon-button.component.html',
    styleUrls: ['./rt-icon-button.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // standalone components / directives
        RtIconComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtIconButtonComponent {
    /**
     * Размер дочерней `<rt-icon>`. По умолчанию маппится 1-к-1 от размера кнопки,
     * но потребитель может задать свой: у крупной кнопки-действия (плавающая
     * кнопка чата) иконка во весь диаметр выглядит тяжеловесно, а сама кнопка
     * должна остаться большой — в неё целятся пальцем.
     */
    protected readonly resolvedIconSize: Signal<IRtIcon.Size> = computed((): IRtIcon.Size => {
        const map: Readonly<Record<IRtIconButton.Size, IRtIcon.Size>> = {
            sm: 'sm',
            md: 'md',
            lg: 'lg',
        };
        return this.iconSize() ?? map[this.size()];
    });

    /** Кнопка отключена, если установлен disabled ИЛИ loading. */
    protected readonly isDisabled: Signal<boolean> = computed((): boolean => this.disabled() || this.loading());

    /**
     * BEM-модификаторы для `[rtMod]`. Собираем в .ts (а не в шаблоне), потому что
     * Angular template-parser не поддерживает computed property keys в inline-объектах.
     * camelCase ключи `hasIndicator` директива автоматически конвертирует в `has-indicator`.
     */
    protected readonly bemMods: Signal<Record<string, boolean>> = computed((): Record<string, boolean> => ({
        [this.variant()]: true,
        [this.size()]: true,
        [this.shape()]: true,
        loading: this.loading(),
        active: this.active(),
        hasIndicator: this.indicator(),
    }));

    /** Имя иконки — обязательно. */
    public readonly icon: InputSignal<IRtIcon.Name> = input.required<IRtIcon.Name>();

    /** Доступное имя для screen-reader'ов — обязательно (icon-only кнопка). */
    public readonly ariaLabel: InputSignal<string> = input.required<string>();

    /** Семантическая палитра. */
    public readonly variant: InputSignal<IRtIconButton.Variant> = input<IRtIconButton.Variant>('ghost');

    /**
     * Цвет самой иконки. Default `current` — иконка наследует цвет текста кнопки
     * (поведение по умолчанию). Явное значение нужно, когда иконка должна
     * отличаться от текста кнопки — например крестик-очистка внутри поля,
     * который должен совпадать по цвету с иконками-аффордансами самого поля.
     */
    public readonly iconColor: InputSignal<IRtIcon.Color> = input<IRtIcon.Color>('current');

    /** Размер квадрата. */
    public readonly size: InputSignal<IRtIconButton.Size> = input<IRtIconButton.Size>('md');

    /** Размер иконки; пусто — берётся от размера кнопки. */
    public readonly iconSize: InputSignal<IRtIcon.Size | null> = input<IRtIcon.Size | null>(null);

    /** Форма (круг или скруглённый квадрат). */
    public readonly shape: InputSignal<IRtIconButton.Shape> = input<IRtIconButton.Shape>('square');

    /** HTML-type для нативного `<button>`. */
    public readonly type: InputSignal<IRtIconButton.Type> = input<IRtIconButton.Type>('button');

    /**
     * Текст styled-tooltip'а (`rtTooltip`), показывается на hover/focus. Пустая
     * строка → tooltip выключен. Для icon-only кнопок обычно дублирует `ariaLabel`.
     */
    public readonly tooltip: InputSignal<string> = input<string>('');

    /**
     * Tabindex внутренней `<button>`. Default `0` (в обычном таб-порядке).
     * Значение `-1` исключает кнопку из таб-навигации, оставляя клик мышью —
     * нужно для вспомогательных аффордансов вроде крестика-очистки внутри поля.
     */
    public readonly tabIndex: InputSignalWithTransform<number, NumberInput> = input<number, NumberInput>(0, { transform: numberAttribute });

    /** Состояние загрузки: показывает spinner вместо иконки + disabled. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Нативное отключение кнопки. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Toggle-состояние — превращается в `aria-pressed="true"`. */
    public readonly active: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Бейдж-индикатор (dot top-right через BEM-модификатор). */
    public readonly indicator: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Эмиттит MouseEvent при клике (только когда не disabled и не loading). */
    public readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

    protected onClick(event: MouseEvent): void {
        if (this.isDisabled()) {
            return;
        }
        this.clicked.emit(event);
    }
}
