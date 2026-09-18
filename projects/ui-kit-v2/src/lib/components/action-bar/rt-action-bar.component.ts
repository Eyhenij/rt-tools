import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
    computed,
    input,
    output,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { rtKitLabel } from '../../i18n';
import { TRtKitLabelParams } from '../../i18n/rt-kit-labels.model';
import { RtIconButtonComponent } from '../icon-button/rt-icon-button.component';
import { RtIconComponent } from '../icon/rt-icon.component';
import { RtMenuItemComponent } from '../menu/rt-menu-item.component';
import { RtPopoverDirective } from '../popover/rt-popover.directive';
import { IRtActionBar } from './rt-action-bar.model';

const BEM_BLOCK: string = 'rt-action-bar';

/** Действие вместе с готовой записью модификаторов: шаблон методов не зовёт. */
interface IActionView {
    readonly action: IRtActionBar.Action;
    readonly modifiers: Readonly<Record<string, boolean>>;
}

/**
 * Полоса массовых действий: счёт слева, действия рядом, крестик справа.
 *
 * Своего состояния не держит вовсе — ни выбранного, ни открытости. Ей дают
 * настройку входом, а наружу она сообщает две вещи: что нажали действие и что
 * нажали крестик. Держатель `rt-action-bar-holder` решает, стоит ли она в
 * разметке и где над страницей приколота.
 *
 * Действие с вложенным списком само не срабатывает: оно заголовок группы, и
 * список раскрывается всплывающим слоем кита. Нажатие пункта списка закрывает
 * полосу так же, как нажатие обычного действия: где человек нажал — в полосе
 * или на шаг глубже — о трате выбранного не говорит ничего.
 */
@Component({
    selector: 'rt-action-bar',
    templateUrl: './rt-action-bar.component.html',
    styleUrl: './rt-action-bar.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        RtIconComponent,
        RtIconButtonComponent,
        RtMenuItemComponent,
        RtPopoverDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'toolbar',
    },
})
export class RtActionBarComponent {
    /** Подстановки счётчика: подпись собирает словарь, а не склейка слов в шаблоне. */
    readonly #countParams: Signal<TRtKitLabelParams> = computed((): TRtKitLabelParams => ({
        count: this.config().selected,
        total: this.config().total,
    }));

    protected readonly countText: Signal<string> = rtKitLabel('uiSelectedOf', this.#countParams);

    protected readonly closeLabel: Signal<string> = rtKitLabel('uiClose');

    /**
     * Действия с готовыми модификаторами. Признак значка стоит модификатором, а не
     * условием в шаблоне: подпись у действия со значком снимает правило стиля по
     * грубому указателю, и решать это условием значило бы увезти оформление в код.
     */
    protected readonly actions: Signal<readonly IActionView[]> = computed((): readonly IActionView[] =>
        this.config().actions.map((action: IRtActionBar.Action): IActionView => ({
            action,
            modifiers: { danger: action.look === 'danger', withIcon: !!action.icon },
        }))
    );

    public readonly config: InputSignal<IRtActionBar.Config> = input.required<IRtActionBar.Config>();

    public readonly actionRun: OutputEmitterRef<IRtActionBar.Action> = output<IRtActionBar.Action>();

    public readonly closed: OutputEmitterRef<void> = output<void>();

    protected onAction(action: IRtActionBar.Action): void {
        action.run?.();
        this.actionRun.emit(action);
        this.closed.emit();
    }

    protected onClose(): void {
        this.closed.emit();
    }
}
