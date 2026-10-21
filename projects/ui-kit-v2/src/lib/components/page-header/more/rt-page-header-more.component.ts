import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    output,
    ChangeDetectionStrategy,
    Component,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    ViewEncapsulation,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective } from '@rt-tools/core';

import { RT_KIT_LABELS, RT_KIT_TRANSLATOR, RtKitLabelPipe, TRtKitLabelMap, TRtKitTranslator } from '@rt-tools/ui-kit-v2/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtPopoverDirective } from '@rt-tools/ui-kit-v2/popover';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { ERtPageHeaderEntry, IRtPageHeaderView } from '../rt-page-header.logic';

const BEM_BLOCK: string = 'rt-page-header-more';

/**
 * Пункт «Ещё» в конце верхнего ряда `rt-page-header` и его панель: разделы, которым не хватило
 * ширины ряда.
 *
 * Кнопка носит вид пункта ряда — элементы блока `rt-page-header`, — и подсвечивается так же, как
 * выбранный раздел, когда выбранный раздел ушёл сюда. Панель открывается тем же поповером, что и
 * панели разделов, по наведению и по нажатию. Раздел с панелью показан в ней заголовком и пунктами
 * своих групп, как в меню узкого экрана, и берёт его блок с модификатором `more`.
 *
 * Какие разделы ушли, решает шапка: здесь ничего не меряется.
 */
@Component({
    selector: 'rt-page-header-more',
    templateUrl: './rt-page-header-more.component.html',
    styleUrl: './rt-page-header-more.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        RtKitLabelPipe,
        // Angular
        RouterLink,
        RouterLinkActive,

        // standalone components / directives
        RtIconComponent,
        RtPopoverDirective,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
    },
})
export class RtPageHeaderMoreComponent {
    readonly #translate: Signal<TRtKitTranslator> = inject(RT_KIT_TRANSLATOR);

    /** Переводчик для чистого пайпа подписи: шаблон отдаёт его вторым доводом. */
    protected readonly translate: Signal<TRtKitTranslator> = this.#translate;

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly EntryKind: typeof ERtPageHeaderEntry = ERtPageHeaderEntry;

    /** Точка у «Ещё»: непросмотренное ушедшего раздела иначе видно только в открытой панели. */
    protected readonly unread: Signal<boolean> = computed((): boolean =>
        this.sections().some((section: IRtPageHeaderView.Section): boolean => section.unread)
    );

    /** Разделы, ушедшие из ряда, в порядке списка. */
    public readonly sections: InputSignal<ReadonlyArray<IRtPageHeaderView.Section>> = input<ReadonlyArray<IRtPageHeaderView.Section>>([]);

    /** Выбранный раздел среди ушедших: «Ещё» подсвечивается, как выбранный пункт ряда. */
    public readonly active: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute,
    });

    /** Нажат пункт без адреса — приходит его идентификатор. */
    public readonly itemClick: OutputEmitterRef<string> = output<string>();

    protected onItemClick(id: string): void {
        this.itemClick.emit(id);
    }
}
