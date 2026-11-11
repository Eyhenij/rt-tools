import { NgTemplateOutlet } from '@angular/common';
import { inject, ChangeDetectionStrategy, Component, DestroyRef, ViewEncapsulation, WritableSignal, signal } from '@angular/core';
import { Router } from '@angular/router';

import { WINDOW } from '@rt-tools/core';

import { RtAiChatComponent } from '../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.component';
import { IRtAiChat } from '../../../../../rich-editor/lib/components/ai-chat/rt-ai-chat.model';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtMenuItemComponent } from '../../../menu/rt-menu-item.component';
import { RtProfileMenuComponent } from '../../../profile-menu/rt-profile-menu.component';
import { PROFILE_MENU_LOCALES } from '../../../profile-menu/stories/component/test-profile-menu.data';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtTabDirective } from '../../../tabs/rt-tab.directive';
import { RtTabsControlDirective } from '../../../tabs/rt-tabs-control.directive';
import { RtTabsComponent } from '../../../tabs/rt-tabs.component';
import { IRtTabs } from '../../../tabs/rt-tabs.model';
import { RtPageBarFilterDirective, RtPageBarSearchDirective } from '../../bar/rt-page-bar-slots.directive';
import { RtPageBarComponent } from '../../bar/rt-page-bar.component';
import { IRtPageBar } from '../../bar/rt-page-bar.model';
import { RtPageActionsComponent } from '../../rail/rt-page-actions.component';
import { RtPageHeaderComponent } from '../../rt-page-header.component';
import { IRtPageHeader } from '../../rt-page-header.model';
import {
    ASSISTANT_MESSAGES,
    ASSISTANT_USAGE,
    PAGE_SECTIONS,
    PAGE_SECTIONS_DISABLED,
    PAGE_SECTIONS_MANY,
    TAB_LABELS_LONG,
    TAB_LABELS_SHORT,
} from './test-page-header-vertical.data';
import { TestRtPageTableComponent } from './test-page-table.component';

const FILTERS: readonly string[] = ['Все', 'Любая оплата', 'Все объекты', 'Источник', 'Менеджер', 'Партнёр', 'Канал'];

/** Во второй строке у отбора оплаты короткое имя: так в кадрах. */
const FILTERS_NARROW: readonly string[] = ['Все', 'Оплата', 'Все объекты', 'Источник', 'Менеджер', 'Партнёр', 'Канал'];

/** Сколько отборов встаёт в одну строку с заголовком. */
const FILTERS_IN_ONE_ROW: number = 3;

const ASSISTANT_ACTION: string = 'assistant';

/** До этого числа вкладок история берёт короткий список кадров. */
const SHORT_TAB_LIST: number = 5;

/**
 * Обёртка вертикальной шапки: экран целиком, из рейки, вкладок, компактной шапки и ассистента.
 * Рейка берёт высоту от окна, а панель стоит от окна по всем краям: ящик показа зажимает и то и
 * другое (`contain: paint`), иначе обе части ушли бы из кадра.
 */
@Component({
    selector: 'app-page-header-vertical',
    templateUrl: './test-page-header-vertical.component.html',
    styleUrl: './test-page-header-vertical.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgTemplateOutlet,
        RtAiChatComponent,
        RtInputComponent,
        RtMenuItemComponent,
        RtPageBarComponent,
        RtPageBarFilterDirective,
        RtPageBarSearchDirective,
        RtPageHeaderComponent,
        RtPageActionsComponent,
        RtProfileMenuComponent,
        RtSelectComponent,
        RtTabDirective,
        RtTabsComponent,
        RtTabsControlDirective,
        TestRtPageTableComponent,
    ],
})
export class TestRtPageHeaderVerticalComponent {
    readonly #phoneQuery: MediaQueryList = inject(WINDOW).matchMedia('(width <= 768px)');

    /** Телефон следует за окном: витрина задаёт узкое окно, и оно может успеть после первой отрисовки. */
    protected readonly phone: WritableSignal<boolean> = signal<boolean>(this.#phoneQuery.matches);

    /** Выбранная нажатием вкладка: крестик идёт за ней, из меню она встаёт в ряд. */
    protected readonly pickedTab: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);

    /** Нажатие открывает и закрывает ассистента; до первого нажатия решает аргумент истории. */
    protected readonly assistantPicked: WritableSignal<boolean | null> = signal<boolean | null>(null);

    protected readonly profileLocales: typeof PROFILE_MENU_LOCALES = PROFILE_MENU_LOCALES;

    protected readonly options: ReadonlyArray<IRtSelect.Option<string>> = [{ value: 'all', label: 'Все' }];

    protected readonly assistantMessages: readonly IRtAiChat.Message[] = ASSISTANT_MESSAGES;

    protected readonly assistantUsage: number = ASSISTANT_USAGE;

    protected readonly barActions: ReadonlyArray<IRtPageBar.Action> = [
        { id: 'new', label: 'Создать бронь', icon: 'ico-plus' },
        { id: 'refresh', label: 'Обновить', icon: 'sync' },
        { id: 'columns', label: 'Настроить колонки', icon: 'sliders-v' },
    ];

    public bar: boolean = false;
    public pageTitle: string = 'Все брони';
    public filterCount: number = 3;
    public filtersActive: boolean = false;
    public tabs: number = 0;
    public assistant: boolean = false;
    public overflow: IRtTabs.Overflow = 'more';
    public disabledSection: boolean = false;
    public manySections: boolean = false;
    public screenHeight: number | null = null;
    /** История открывает панель жестом: съёмка ждёт её и не снимает кадр без неё. */
    public overlay: boolean = false;
    public user: IRtPageHeader.User = { name: 'Анна' };

    constructor() {
        // Любой адрес витрины отвечает пустым экраном: пункты меню переходят, и подсветка идёт за ними.
        inject(Router).resetConfig([{ path: '**', children: [] }]);
        const follow: (event: MediaQueryListEvent) => void = (event: MediaQueryListEvent): void => this.phone.set(event.matches);
        this.#phoneQuery.addEventListener('change', follow);
        inject(DestroyRef).onDestroy((): void => this.#phoneQuery.removeEventListener('change', follow));
    }

    protected get tabList(): readonly number[] {
        return Array.from({ length: this.tabs }, (_: unknown, index: number): number => index + 1);
    }

    protected get tabLabels(): readonly string[] {
        return this.tabs > SHORT_TAB_LIST ? TAB_LABELS_LONG : TAB_LABELS_SHORT;
    }

    protected get assistantOpen(): boolean {
        return this.assistantPicked() ?? this.assistant;
    }

    protected get sections(): ReadonlyArray<IRtPageHeader.Item> {
        if (this.disabledSection) {
            return PAGE_SECTIONS_DISABLED;
        }
        return this.manySections ? PAGE_SECTIONS_MANY : PAGE_SECTIONS;
    }

    protected get railActions(): ReadonlyArray<IRtPageHeader.Item> {
        return [
            { id: ASSISTANT_ACTION, label: 'Ассистент', icon: 'sparkle', active: this.assistantOpen },
            { id: 'bell', label: 'Уведомления', icon: 'bell', unread: true },
        ];
    }

    /** С открытым ассистентом и во второй строке кадры берут короткие подписи. */
    protected get shownFilters(): readonly string[] {
        return (this.filterCount > FILTERS_IN_ONE_ROW || this.assistantOpen ? FILTERS_NARROW : FILTERS).slice(0, this.filterCount);
    }

    protected get searchPlaceholder(): string {
        return this.assistantOpen ? 'Поиск по гостю' : 'Поиск по гостю и почте';
    }

    protected onAction(id: string): void {
        if (id === ASSISTANT_ACTION) {
            this.assistantPicked.set(!this.assistantOpen);
        }
    }
}
