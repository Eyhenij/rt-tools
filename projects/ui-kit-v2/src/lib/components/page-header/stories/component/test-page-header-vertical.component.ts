import { NgTemplateOutlet } from '@angular/common';
import {
    booleanAttribute,
    inject,
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    InputSignal,
    InputSignalWithTransform,
    Signal,
    ViewEncapsulation,
    WritableSignal,
    computed,
    input,
    signal,
} from '@angular/core';
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
import { RtRailLogoDirective, RtRailPageDirective } from '../../rt-page-header-slots.directive';
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
        RtRailLogoDirective,
        RtRailPageDirective,
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

    /** Первый отбор — статус брони: его шторка на телефоне названа «Статус», как в кадре 8497:17962. */
    protected readonly statusLabel: string = 'Статус';

    protected readonly statusOptions: ReadonlyArray<IRtSelect.Option<string>> = [
        { value: 'all', label: 'Все' },
        { value: 'pending', label: 'Ожидает' },
        { value: 'confirmed', label: 'Подтверждена' },
        { value: 'declined', label: 'Отклонена' },
        { value: 'cancelled', label: 'Отменена' },
    ];

    protected readonly assistantMessages: readonly IRtAiChat.Message[] = ASSISTANT_MESSAGES;

    protected readonly assistantUsage: number = ASSISTANT_USAGE;

    protected readonly barActions: ReadonlyArray<IRtPageBar.Action> = [
        { id: 'new', label: 'Создать бронь', icon: 'ico-plus' },
        { id: 'refresh', label: 'Обновить', icon: 'sync' },
        { id: 'columns', label: 'Настроить колонки', icon: 'sliders-v' },
    ];

    protected readonly tabList: Signal<readonly number[]> = computed((): readonly number[] =>
        Array.from({ length: this.tabs() }, (_: unknown, index: number): number => index + 1)
    );

    protected readonly tabLabels: Signal<readonly string[]> = computed((): readonly string[] =>
        this.tabs() > SHORT_TAB_LIST ? TAB_LABELS_LONG : TAB_LABELS_SHORT
    );

    protected readonly assistantOpen: Signal<boolean> = computed((): boolean => this.assistantPicked() ?? this.assistant());

    protected readonly sections: Signal<ReadonlyArray<IRtPageHeader.Item>> = computed((): ReadonlyArray<IRtPageHeader.Item> => {
        if (this.disabledSection()) {
            return PAGE_SECTIONS_DISABLED;
        }
        return this.manySections() ? PAGE_SECTIONS_MANY : PAGE_SECTIONS;
    });

    protected readonly railActions: Signal<ReadonlyArray<IRtPageHeader.Item>> = computed((): ReadonlyArray<IRtPageHeader.Item> => [
        { id: ASSISTANT_ACTION, label: 'Ассистент', icon: 'sparkle', active: this.assistantOpen() },
        { id: 'bell', label: 'Уведомления', icon: 'bell', unread: true },
    ]);

    /** С открытым ассистентом и во второй строке кадры берут короткие подписи. */
    protected readonly shownFilters: Signal<readonly string[]> = computed((): readonly string[] =>
        (this.filterCount() > FILTERS_IN_ONE_ROW || this.assistantOpen() ? FILTERS_NARROW : FILTERS).slice(0, this.filterCount())
    );

    protected readonly searchPlaceholder: Signal<string> = computed((): string =>
        this.assistantOpen() ? 'Поиск по гостю' : 'Поиск по гостю и почте'
    );

    public readonly bar: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public readonly pageTitle: InputSignal<string> = input<string>('Все брони');
    public readonly filterCount: InputSignal<number> = input<number>(3);
    public readonly filtersActive: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly tabs: InputSignal<number> = input<number>(0);
    public readonly assistant: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public readonly overflow: InputSignal<IRtTabs.Overflow> = input<IRtTabs.Overflow>('more');
    public readonly disabledSection: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly manySections: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, {
        transform: booleanAttribute,
    });
    public readonly screenHeight: InputSignal<number | null> = input<number | null>(null);
    /** История открывает панель жестом: съёмка ждёт её и не снимает кадр без неё. */
    public readonly overlay: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(false, { transform: booleanAttribute });
    public readonly user: InputSignal<IRtPageHeader.User> = input<IRtPageHeader.User>({ name: 'Анна' });

    constructor() {
        // Любой адрес витрины отвечает пустым экраном: пункты меню переходят, и подсветка идёт за ними.
        inject(Router).resetConfig([{ path: '**', children: [] }]);
        const follow: (event: MediaQueryListEvent) => void = (event: MediaQueryListEvent): void => this.phone.set(event.matches);
        this.#phoneQuery.addEventListener('change', follow);
        inject(DestroyRef).onDestroy((): void => this.#phoneQuery.removeEventListener('change', follow));
    }

    protected onAction(id: string): void {
        if (id === ASSISTANT_ACTION) {
            this.assistantPicked.set(!this.assistantOpen());
        }
    }
}
