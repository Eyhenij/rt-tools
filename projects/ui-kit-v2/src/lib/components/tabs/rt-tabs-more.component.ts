import {
    computed,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { RtTabDirective } from './rt-tab.directive';
import { IRtTabs } from './rt-tabs.model';

const BEM_BLOCK: string = 'rt-tabs-more';

/**
 * Пункт «Ещё» в конце ряда вкладок и его меню. Строка меню показывает то же, что вкладка, и потому
 * собрана здесь, а не из `rt-menu-item`: у пункта меню нет места под крестик рядом с кнопкой.
 * Вид панели и строк берётся из тех же токенов `--rt-overlay-menu-*`, что у `rt-menu`.
 */
@Component({
    selector: 'rt-tabs-more',
    templateUrl: './rt-tabs-more.component.html',
    styleUrl: './rt-tabs-more.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [RtIconComponent, RtPopoverDirective, RtTooltipDirective, BlockDirective, ElemDirective, ModDirective],
    host: {
        class: BEM_BLOCK,
        role: 'presentation',
        '[class.rt-tabs-more--idle]': '!tabs().length',
    },
})
export class RtTabsMoreComponent {
    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    /** В меню есть ошибка: выбранной её не показать, и точка стоит на самом пункте. */
    protected readonly hasError: Signal<boolean> = computed((): boolean =>
        this.tabs().some((tab: RtTabDirective): boolean => tab.invalid())
    );

    /** Вкладки меню в порядке объявления. Пустой список прячет пункт, но оставляет его для замера. */
    public readonly tabs: InputSignal<readonly RtTabDirective[]> = input<readonly RtTabDirective[]>([]);

    public readonly pick: OutputEmitterRef<IRtTabs.Id> = output<IRtTabs.Id>();

    public readonly closeTab: OutputEmitterRef<RtTabDirective> = output<RtTabDirective>();
}
