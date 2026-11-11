import { BooleanInput } from '@angular/cdk/coercion';
import {
    afterNextRender,
    booleanAttribute,
    computed,
    inject,
    input,
    linkedSignal,
    output,
    signal,
    viewChild,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    ElementRef,
    Injector,
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

import { BreakpointsService, RT_KIT_LABELS, TRtKitLabelMap } from '@rt-tools/ui-kit-v2/core';

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

    readonly #injector: Injector = inject(Injector);

    #closeTimer: number | null = null;

    /** Раздел, чью панель открыло наведение перед нажатием: касание шлёт его перед `click`. */
    #hoverOpenedId: string | null = null;

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

    /** Столбец телефона открыт бургером. Смена ширины за порог узкого экрана его закрывает. */
    protected readonly phoneMenuOpen: WritableSignal<boolean> = linkedSignal<boolean, boolean>({
        source: inject(BreakpointsService).narrow,
        computation: (): boolean => false,
    });

    protected readonly burgerRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('burger');

    protected readonly phoneColumnRef: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('phoneColumn');

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
        if (this.#openId() !== id) {
            this.#hoverOpenedId = id;
        }
        this.#openId.set(id);
    }

    /**
     * Касание и клавиатура: раздел открывает и закрывает само нажатие. Нажатие, перед которым
     * наведение открыло эту панель, её оставляет: так касание, которое шлёт наведение и нажатие
     * подряд, открывает панель с первого раза. Нажатие мышью не закрывает панель никогда.
     */
    protected togglePanel(id: string, event: Event): void {
        event.stopPropagation();
        const byMouse: boolean = 'pointerType' in event && event.pointerType === 'mouse';
        const keep: boolean = byMouse || this.#hoverOpenedId === id;

        this.#hoverOpenedId = null;
        this.#openId.set(!keep && this.#openId() === id ? null : id);
    }

    protected closePanel(): void {
        this.cancelPanelClose();
        this.#hoverOpenedId = null;
        this.#openId.set(null);
    }

    protected closeAll(): void {
        this.closePanel();
        if (this.phoneMenuOpen()) {
            this.closePhoneMenu();
        }
    }

    /** Открытый столбец берёт фокус на первую строку: он окно поверх страницы. */
    protected openPhoneMenu(): void {
        this.phoneMenuOpen.set(true);
        afterNextRender((): void => this.phoneColumnRef()?.nativeElement.querySelector<HTMLElement>('button, a[href]')?.focus(), {
            injector: this.#injector,
        });
    }

    /** Закрытый столбец возвращает фокус бургеру, откуда его открыли. */
    protected closePhoneMenu(): void {
        this.phoneMenuOpen.set(false);
        this.burgerRef()?.nativeElement.focus();
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
