import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    inject,
    input,
    output,
    signal,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    InputSignal,
    InputSignalWithTransform,
    OutputEmitterRef,
    Signal,
    TemplateRef,
    ViewEncapsulation,
    WritableSignal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { BlockDirective, ElemDirective, ModDirective, WINDOW } from '@rt-tools/core';

import { RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

import { RtIconComponent } from '@rt-tools/ui-kit-v2/icon';
import { RtTooltipDirective } from '@rt-tools/ui-kit-v2/tooltip';
import { ERtPageHeaderEntry, IRtPageHeaderView } from '../rt-page-header.logic';
import { IRtPageHeader } from '../rt-page-header.model';
import { RtPageActionsComponent } from './rt-page-actions.component';
import { RtPagePhoneMenuComponent } from './rt-page-phone-menu.component';

const BEM_BLOCK: string = 'rt-page-rail';

/** Сколько панель ждёт возврата указателя: перевести его с пункта на панель — не значит уйти. */
const PANEL_CLOSE_DELAY_MS: number = 150;

/**
 * Вертикальная шапка: рейка 50 с разделами и панель раздела 220 поверх страницы. На телефоне та же
 * часть становится строкой 50: бургер открывает разделы столбцом `rt-page-phone-menu`. Адрес и
 * подсветку считает `rt-page-header`: у одного списка разделов одна подсветка в обоих видах.
 */
@Component({
    selector: 'rt-page-rail',
    templateUrl: './rt-page-rail.component.html',
    styleUrl: './rt-page-rail.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        RouterLink,
        RouterLinkActive,
        RtIconComponent,
        RtPageActionsComponent,
        RtPagePhoneMenuComponent,
        RtTooltipDirective,
        BlockDirective,
        ElemDirective,
        ModDirective,
    ],
    host: {
        class: BEM_BLOCK,
        '(mouseleave)': 'schedulePanelClose()',
        '(mouseenter)': 'cancelPanelClose()',
        '(document:keydown.escape)': 'closeAll()',
        '(document:click)': 'onDocumentClick($event)',
    },
})
export class RtPageRailComponent {
    readonly #host: HTMLElement = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    readonly #win: Window = inject(WINDOW);

    #closeTimer: number | null = null;

    readonly #openId: WritableSignal<string | null> = signal<string | null>(null);

    protected readonly t: Signal<TRtKitLabelMap> = inject(RT_KIT_LABELS);

    protected readonly EntryKind: typeof ERtPageHeaderEntry = ERtPageHeaderEntry;

    /** Открытый раздел: панель рисуется только для раздела с панелью. */
    protected readonly openSection: Signal<IRtPageHeaderView.Section | null> = computed(
        (): IRtPageHeaderView.Section | null =>
            this.sections().find(
                (section: IRtPageHeaderView.Section): boolean => section.id === this.#openId() && section.kind === ERtPageHeaderEntry.Panel
            ) ?? null
    );

    /** Столбец телефона открыт бургером. */
    protected readonly phoneMenuOpen: WritableSignal<boolean> = signal<boolean>(false);

    public readonly sections: InputSignal<ReadonlyArray<IRtPageHeaderView.Section>> =
        input.required<ReadonlyArray<IRtPageHeaderView.Section>>();

    public readonly activeIds: InputSignal<ReadonlySet<string>> = input.required<ReadonlySet<string>>();

    public readonly navLabel: InputSignal<string> = input<string>('');

    public readonly user: InputSignal<IRtPageHeader.User | null> = input<IRtPageHeader.User | null>(null);

    public readonly userMenu: InputSignal<TemplateRef<unknown> | null> = input<TemplateRef<unknown> | null>(null);

    /** Подвал рейки: вид с вкладками его убирает и ставит те же кнопки в ряд с вкладками. */
    public readonly foot: InputSignalWithTransform<boolean, BooleanInput> = input<boolean, BooleanInput>(true, {
        transform: booleanAttribute,
    });

    public readonly footItems: InputSignal<ReadonlyArray<IRtPageHeader.Item>> = input<ReadonlyArray<IRtPageHeader.Item>>([]);

    public readonly itemClick: OutputEmitterRef<string> = output<string>();

    public readonly userClick: OutputEmitterRef<void> = output<void>();

    constructor() {
        inject(DestroyRef).onDestroy((): void => this.cancelPanelClose());
    }

    protected openPanel(id: string): void {
        this.cancelPanelClose();
        this.#openId.set(id);
    }

    /** Касание и клавиатура: наведения нет, раздел открывает и закрывает само нажатие. */
    protected togglePanel(id: string, event: Event): void {
        event.stopPropagation();
        // Наведение успело открыть панель, и нажатие мышью её не закрывает: так работает и шапка.
        const byMouse: boolean = 'pointerType' in event && event.pointerType === 'mouse';
        this.#openId.set(!byMouse && this.#openId() === id ? null : id);
    }

    protected closePanel(): void {
        this.cancelPanelClose();
        this.#openId.set(null);
    }

    protected closeAll(): void {
        this.closePanel();
        this.phoneMenuOpen.set(false);
    }

    protected schedulePanelClose(): void {
        this.cancelPanelClose();
        this.#closeTimer = this.#win.setTimeout((): void => this.closePanel(), PANEL_CLOSE_DELAY_MS);
    }

    protected cancelPanelClose(): void {
        if (this.#closeTimer !== null) {
            this.#win.clearTimeout(this.#closeTimer);
            this.#closeTimer = null;
        }
    }

    protected onDocumentClick(event: MouseEvent): void {
        if (event.target instanceof Node && !this.#host.contains(event.target)) {
            this.closePanel();
        }
    }

    protected onEntryClick(id: string): void {
        this.itemClick.emit(id);
        this.closePanel();
    }
}
