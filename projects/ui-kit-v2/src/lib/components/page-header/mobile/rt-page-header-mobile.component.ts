import {
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
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_TRANSLATOR, RtKitLabelPipe, TRtKitLabelMap, TRtKitTranslator } from '@rt-tools/ui-kit-v2/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { ERtPageHeaderEntry, IRtPageHeaderView } from '../rt-page-header.logic';

const BEM_BLOCK: string = 'rt-page-header-mobile';

/**
 * Меню разделов узкого экрана `rt-page-header`: его открывают бургер и кнопка «ещё» сжатой полосы.
 *
 * Раздел с панелью — аккордеон, внутри него те же группы, что и в панели широкого экрана, без
 * колонок. Какие разделы раскрыты и какой выбран, держит шапка: она же закрывает меню после
 * перехода и нажатия пункта. Вид блока задан в `rt-page-header-mobile.scss` шапки.
 */
@Component({
    selector: 'rt-page-header-mobile',
    templateUrl: './rt-page-header-mobile.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        RtKitLabelPipe,
        // Angular
        RouterLink,
        RouterLinkActive,

        // standalone components / directives
        RtIconComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        role: 'menu',
    },
})
export class RtPageHeaderMobileComponent {
    readonly #translate: Signal<TRtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    /** Переводчик для чистого пайпа подписи: шаблон отдаёт его вторым доводом. */
    protected readonly translate: Signal<TRtKitTranslator> = this.#translate;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly EntryKind: typeof ERtPageHeaderEntry = ERtPageHeaderEntry;

    /** Разделы шапки в порядке списка. */
    public readonly sections: InputSignal<ReadonlyArray<IRtPageHeaderView.Section>> = input<ReadonlyArray<IRtPageHeaderView.Section>>([]);

    /** Раскрытые разделы с панелью. */
    public readonly expanded: InputSignal<ReadonlySet<string>> = input<ReadonlySet<string>>(new Set<string>());

    /** Разделы, в которых лежит текущий адрес. */
    public readonly active: InputSignal<ReadonlySet<string>> = input<ReadonlySet<string>>(new Set<string>());

    /** Нажат заголовок раздела с панелью — приходит его идентификатор. */
    public readonly sectionToggle: OutputEmitterRef<string> = output<string>();

    /** Нажат пункт без адреса — приходит его идентификатор. */
    public readonly itemClick: OutputEmitterRef<string> = output<string>();

    /** Нажата ссылка: переход уже идёт, меню закрывается. */
    public readonly navigate: OutputEmitterRef<void> = output<void>();

    protected onToggle(id: string): void {
        this.sectionToggle.emit(id);
    }

    protected onItemClick(id: string): void {
        this.itemClick.emit(id);
    }

    protected onNavigate(): void {
        this.navigate.emit();
    }
}
