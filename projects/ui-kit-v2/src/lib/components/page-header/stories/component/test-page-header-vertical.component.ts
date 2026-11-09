import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { RtChatComponent } from '../../../../../rich-editor/lib/components/chat/rt-chat.component';
import { CHAT_MESSAGES } from '../../../../../rich-editor/lib/components/chat/stories/component/chat.fixture';
import { IRtChat } from '../../../../../rich-editor/lib/components/chat/rt-chat.model';
import { RtInputComponent } from '../../../input/rt-input.component';
import { RtProfileMenuComponent } from '../../../profile-menu/rt-profile-menu.component';
import { PROFILE_MENU_LOCALES } from '../../../profile-menu/stories/component/test-profile-menu.data';
import { RtSelectComponent } from '../../../select/rt-select.component';
import { IRtSelect } from '../../../select/rt-select.model';
import { RtTabDirective } from '../../../tabs/rt-tab.directive';
import { RtTabsControlDirective } from '../../../tabs/rt-tabs-control.directive';
import { RtTabsComponent } from '../../../tabs/rt-tabs.component';
import { RtPageBarFilterDirective, RtPageBarSearchDirective } from '../../bar/rt-page-bar-slots.directive';
import { RtPageBarComponent } from '../../bar/rt-page-bar.component';
import { IRtPageBar } from '../../bar/rt-page-bar.model';
import { RtPageActionsComponent } from '../../rail/rt-page-actions.component';
import { RtPageHeaderComponent } from '../../rt-page-header.component';
import { IRtPageHeader } from '../../rt-page-header.model';

const TAB_LABELS: readonly string[] = ['Главная', 'Все брони', 'Календарь', 'База гостей', 'Кассовые смены'];

const FILTERS: readonly string[] = ['Все', 'Любая оплата', 'Все объекты', 'Источник', 'Менеджер', 'Партнёр', 'Канал', 'Город'];

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
        RtChatComponent,
        RtInputComponent,
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
    ],
})
export class TestRtPageHeaderVerticalComponent {
    /** Телефон узнаётся один раз: показ снимается в окне своей ширины и на лету её не меняет. */
    protected readonly phone: boolean = globalThis.matchMedia('(width <= 768px)').matches;

    protected readonly filterNames: readonly string[] = FILTERS;

    protected readonly tabLabels: readonly string[] = TAB_LABELS;

    protected readonly profileLocales: typeof PROFILE_MENU_LOCALES = PROFILE_MENU_LOCALES;

    protected readonly options: ReadonlyArray<IRtSelect.Option<string>> = [{ value: 'all', label: 'Все' }];

    protected readonly messages: readonly IRtChat.Message[] = CHAT_MESSAGES;

    protected readonly barActions: ReadonlyArray<IRtPageBar.Action> = [
        { id: 'new', label: 'Создать бронь', icon: 'ico-plus' },
        { id: 'refresh', label: 'Обновить', icon: 'sync' },
        { id: 'columns', label: 'Настроить колонки', icon: 'sliders-v' },
    ];

    protected readonly railActions: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'assistant', label: 'Ассистент', icon: 'sparkle' },
        { id: 'bell', label: 'Уведомления', icon: 'bell', unread: true },
    ];

    public bar: boolean = false;
    public pageTitle: string = 'Все брони';
    public filterCount: number = 3;
    public filtersActive: boolean = false;
    public tabs: number = 0;
    public assistant: boolean = false;
    public user: IRtPageHeader.User = { name: 'Анна' };
    public items: ReadonlyArray<IRtPageHeader.Item> = [
        { id: 'home', label: 'Главная', icon: 'home', route: '/iframe.html' },
        { id: 'calendar', label: 'Календарь', icon: 'calendar', route: '/calendar', unread: true },
        {
            id: 'docs',
            label: 'Документы',
            icon: 'folder',
            columns: [
                {
                    id: 'main',
                    groups: [
                        {
                            id: 'contracts',
                            label: 'Договоры',
                            items: [
                                { id: 'active', label: 'Действующие', route: '/active' },
                                { id: 'drafts', label: 'Черновики', route: '/drafts' },
                                { id: 'history', label: 'История', route: '/history' },
                            ],
                        },
                        {
                            id: 'acts',
                            label: 'Акты',
                            items: [
                                { id: 'signed', label: 'Подписанные', route: '/signed' },
                                { id: 'archive', label: 'Архив', disabled: true },
                            ],
                        },
                    ],
                },
            ],
        },
        { id: 'people', label: 'Люди', icon: 'users', route: '/people' },
        { id: 'reports', label: 'Отчёты', icon: 'chart-bar', disabled: true },
    ];

    protected get tabList(): readonly number[] {
        return Array.from({ length: this.tabs }, (_: unknown, index: number): number => index + 1);
    }

    protected get shownFilters(): readonly string[] {
        return this.filterNames.slice(0, this.filterCount);
    }
}
