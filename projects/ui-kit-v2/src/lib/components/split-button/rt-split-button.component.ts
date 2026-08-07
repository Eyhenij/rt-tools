import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
    InputSignal,
    InputSignalWithTransform,
    output,
    OutputEmitterRef,
    Signal,
    viewChild,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { RtButtonDirective } from '../button/rt-button.directive';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { IRtSplitButton } from './rt-split-button.model';

const BEM_BLOCK: string = 'rt-split-button';

/**
 * Кнопка с раздельным действием: основной CTA («лицо») + каретка, по клику на
 * которую раскрывается меню второстепенных действий. Применяется, когда у
 * сценария ДВА позитивных действия и нужно явно выделить главное, не пряча
 * второстепенное (например, футер формы: лицо «Сохранить», в меню
 * «Сохранить черновик»).
 *
 * Меню — поверх `[rtPopover]` (CDK Overlay): авто-flip у края, outside-click и
 * Escape закрывают, не режется `overflow: hidden` предками (футер aside'а).
 * Лицо и каретка — две `[rtButton]`, визуально сшитые в один контрол.
 *
 * `ViewEncapsulation.None` — стили префиксованы `.rt-split-button`.
 */
@Component({
    selector: 'rt-split-button',
    templateUrl: './rt-split-button.component.html',
    styleUrl: './rt-split-button.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtButtonDirective, RtPopoverDirective, BlockDirective, ElemDirective],
    host: {
        class: BEM_BLOCK,
        '[class.rt-split-button--open]': 'menu()?.isOpen()',
    },
})
export class RtSplitButtonComponent {
    readonly #t_uiMoreActions: Signal<string> = rtKitLabel('uiMoreActions');

    protected readonly menu: Signal<RtPopoverDirective | undefined> = viewChild(RtPopoverDirective);

    /** Своё имя каретки важнее умолчания: экран знает, что за действия в меню */
    protected readonly menuAriaText: Signal<string> = computed((): string => this.menuAriaLabel() || this.#t_uiMoreActions());

    /** Подпись основного действия («лицо»). */
    public readonly label: InputSignal<string> = input.required<string>();

    /** Пункты выпадающего меню второстепенных действий. */
    public readonly menuItems: InputSignal<readonly IRtSplitButton.MenuItem[]> = input.required<readonly IRtSplitButton.MenuItem[]>();

    /** Семантическая палитра лица и каретки. */
    public readonly theme: InputSignal<IRtSplitButton.Theme> = input<IRtSplitButton.Theme>('primary');

    /** Размер контрола. */
    public readonly size: InputSignal<IRtSplitButton.Size> = input<IRtSplitButton.Size>('md');

    /** Доступное имя для каретки (icon-only кнопка открытия меню). */
    public readonly menuAriaLabel: InputSignal<string> = input<string>('');

    /** Загрузка: спиннер на лице + блокировка обеих кнопок. */
    public readonly loading: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Нативное отключение обеих кнопок. */
    public readonly disabled: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Клик по лицу (основное действие). */
    public readonly faceClick: OutputEmitterRef<void> = output<void>();

    /** Выбор пункта меню — эмитит `value` выбранного пункта. */
    public readonly itemSelect: OutputEmitterRef<string> = output<string>();

    protected onFace(): void {
        if (this.disabled() || this.loading()) {
            return;
        }
        this.faceClick.emit();
    }

    protected onToggle(): void {
        if (this.disabled() || this.loading()) {
            return;
        }
        this.menu()?.toggle();
    }

    protected onItem(item: IRtSplitButton.MenuItem): void {
        if (item.disabled) {
            return;
        }
        this.menu()?.close();
        this.itemSelect.emit(item.value);
    }
}
