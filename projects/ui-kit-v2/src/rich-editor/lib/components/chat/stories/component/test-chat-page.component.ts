import { ChangeDetectionStrategy, Component } from '@angular/core';

import { StoryPresetsComponent } from '../../../../../../showcase/story-presets.component';
import { RtIconComponent } from '../../../../../../lib/components/icon/rt-icon.component';
import { RtIconButtonComponent } from '../../../../../../lib/components/icon-button/rt-icon-button.component';
import { RtMenuItemComponent } from '../../../../../../lib/components/menu/rt-menu-item.component';
import { RtMenuComponent } from '../../../../../../lib/components/menu/rt-menu.component';
import { IRtServiceLogo } from '../../../../../../lib/components/service-logo/rt-service-logo.model';
import { RtTabDirective } from '../../../../../../lib/components/tabs/rt-tab.directive';
import { RtTabsComponent } from '../../../../../../lib/components/tabs/rt-tabs.component';
import { RtThreadListComponent } from '../../../../../../lib/components/thread-list/rt-thread-list.component';
import {
    RtThreadListFiltersDirective,
    RtThreadListRowDirective,
    RtThreadListTabsDirective,
} from '../../../../../../lib/components/thread-list/rt-thread-list.directives';
import { IRtThreadList } from '../../../../../../lib/components/thread-list/rt-thread-list.model';
import { RtToggleButtonGroupComponent } from '../../../../../../lib/components/toggle-button-group/rt-toggle-button-group.component';
import { IRtToggleButtonGroup } from '../../../../../../lib/components/toggle-button-group/rt-toggle-button-group.model';
import { RtWorkspaceDetailsComponent } from '../../../../../../lib/components/workspace-details/rt-workspace-details.component';
import { IRtWorkspaceDetails } from '../../../../../../lib/components/workspace-details/rt-workspace-details.model';
import {
    RtWorkspaceAsideDirective,
    RtWorkspaceCenterDirective,
    RtWorkspaceListDirective,
} from '../../../../../../lib/components/workspace/rt-workspace.directives';
import { RtWorkspaceComponent } from '../../../../../../lib/components/workspace/rt-workspace.component';
import { RtChatMessageActionsDirective, RtChatMessageButtonsDirective } from '../../rt-chat-message-actions.directive';
import { RtChatComponent } from '../../rt-chat.component';
import { ERtChatMessageStatus, IRtChat } from '../../rt-chat.model';

/** Строка списка разговоров: номер с именем, последняя реплика, время и число непрочитанных */
interface IPageRow extends IRtThreadList.Row {
    readonly title: string;
    readonly preview: string;
    readonly time: string;
    readonly unread: number;
    /** Последняя реплика своя и прочитана гостем: перед временем двойная галочка */
    readonly read?: boolean;
}

/** Знак канала в круге кита: тот же SVG, что стоит в кадре макета (Simple Icons, CC0) */
function mark(label: string, color: string, path: string): IRtServiceLogo.ImageItem {
    const svg: string = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 22"><path d="${path}" fill="${color}"/></svg>`;

    return { src: `data:image/svg+xml,${encodeURIComponent(svg)}`, label };
}

const WHATSAPP: IRtServiceLogo.ImageItem = mark(
    'WhatsApp',
    '#25D366',
    'M16.016 13.1835C15.7437 13.047 14.4045 12.3888 14.1552 12.2971C13.9049 12.2064 13.7234 12.1615 13.541 12.4346C13.3604 12.7069 12.8379 13.3201 12.6793 13.5016C12.5207 13.684 12.3612 13.706 12.089 13.5704C11.8167 13.4329 10.9386 13.146 9.89817 12.2183C9.08875 11.496 8.5415 10.604 8.38292 10.3309C8.22433 10.0586 8.36642 9.91104 8.50208 9.77537C8.62492 9.65345 8.77525 9.45729 8.91092 9.2987C9.0475 9.1392 9.09242 9.02554 9.18408 8.84312C9.27483 8.66162 9.22992 8.50304 9.16117 8.36645C9.09242 8.22987 8.54792 6.88879 8.3215 6.34337C8.09967 5.81262 7.87508 5.88504 7.70825 5.87587C7.54967 5.86854 7.36817 5.8667 7.18575 5.8667C7.00425 5.8667 6.70908 5.93454 6.45975 6.2077C6.21042 6.47995 5.50642 7.13904 5.50642 8.48012C5.50642 9.82029 6.48267 11.1155 6.61833 11.298C6.75492 11.4795 8.53967 14.2313 11.2722 15.411C11.9222 15.6915 12.4291 15.8593 12.8251 15.984C13.4777 16.192 14.0717 16.1627 14.5402 16.0921C15.0636 16.0142 16.1517 15.433 16.379 14.7969C16.6063 14.1607 16.6063 13.6153 16.5376 13.5016C16.4697 13.388 16.2892 13.3201 16.016 13.1835ZM11.0458 19.9696H11.0422C9.41945 19.9698 7.82657 19.5335 6.43042 18.7065L6.0995 18.5103L2.67025 19.4105L3.58508 16.0665L3.36967 15.7236C2.46257 14.2792 1.9827 12.6076 1.9855 10.902C1.98642 5.90612 6.05183 1.84162 11.0495 1.84162C13.4695 1.84162 15.7447 2.78579 17.4552 4.49812C18.2991 5.33835 18.9681 6.33762 19.4233 7.43809C19.8785 8.53857 20.1109 9.71839 20.1071 10.9093C20.1043 15.9051 16.0398 19.9696 11.0458 19.9696ZM18.7577 3.19737C17.7478 2.18072 16.546 1.37461 15.2222 0.825771C13.8984 0.276929 12.4789 -0.00373656 11.0458 3.75628e-05C5.03708 3.75628e-05 0.146667 4.89045 0.143917 10.901C0.143917 12.8224 0.645333 14.6979 1.59958 16.3506L0.0522499 22L5.83183 20.4839C7.43013 21.3546 9.22115 21.811 11.0412 21.8112H11.0458C17.0537 21.8112 21.945 16.9208 21.9478 10.9093C21.9522 9.47679 21.6725 8.05763 21.125 6.7339C20.5774 5.41017 19.7728 4.20815 18.7577 3.19737Z'
);
const LINE: IRtServiceLogo.ImageItem = mark(
    'LINE',
    '#00C300',
    'M17.7512 9.04116C18.0712 9.04116 18.3288 9.30241 18.3288 9.61958C18.3288 9.93583 18.0712 10.1971 17.7512 10.1971H16.1425V11.2283H17.7512C18.0712 11.2283 18.3288 11.4877 18.3288 11.8058C18.3288 12.1212 18.0712 12.3824 17.7512 12.3824H15.5641C15.2478 12.3824 14.9893 12.1212 14.9893 11.8058V7.43241C14.9893 7.11616 15.2478 6.85491 15.5668 6.85491H17.754C18.0712 6.85491 18.3288 7.11616 18.3288 7.43241C18.3288 7.75233 18.0712 8.00991 17.7512 8.00991H16.1425V9.04116H17.7512ZM14.2175 11.8058C14.2175 12.0533 14.058 12.2733 13.8215 12.3522C13.7628 12.3714 13.6996 12.3806 13.6391 12.3806C13.4457 12.3806 13.2807 12.2981 13.1716 12.1514L10.9322 9.11083V11.8058C10.9322 12.1212 10.6764 12.3824 10.3538 12.3824C10.0366 12.3824 9.77992 12.1212 9.77992 11.8058V7.43241C9.77992 7.18491 9.9385 6.96491 10.1741 6.887C10.2291 6.86591 10.2988 6.85675 10.3519 6.85675C10.5307 6.85675 10.6957 6.95208 10.8057 7.08958L13.0625 10.1421V7.43241C13.0625 7.11616 13.321 6.85491 13.64 6.85491C13.9563 6.85491 14.2175 7.11616 14.2175 7.43241V11.8058ZM8.95492 11.8058C8.95492 12.1212 8.69642 12.3824 8.3765 12.3824C8.06025 12.3824 7.80175 12.1212 7.80175 11.8058V7.43241C7.80175 7.11616 8.06025 6.85491 8.37925 6.85491C8.69642 6.85491 8.95492 7.11616 8.95492 7.43241V11.8058ZM6.69442 12.3824H4.50725C4.191 12.3824 3.92975 12.1212 3.92975 11.8058V7.43241C3.92975 7.11616 4.191 6.85491 4.50725 6.85491C4.82625 6.85491 5.08475 7.11616 5.08475 7.43241V11.2283H6.69442C7.01342 11.2283 7.271 11.4877 7.271 11.8058C7.271 12.1212 7.0125 12.3824 6.69442 12.3824ZM22 9.45458C22 4.53116 17.0637 0.524414 11 0.524414C4.93625 0.524414 0 4.53116 0 9.45458C0 13.8647 3.91417 17.5597 9.19875 18.2619C9.55717 18.3371 10.0448 18.4984 10.1686 18.8027C10.2786 19.0787 10.241 19.5049 10.2034 19.7927L10.0531 20.7277C10.0118 21.0037 9.83308 21.8149 11.0147 21.319C12.1981 20.8249 17.3543 17.5808 19.6643 14.9252C21.2447 13.1937 22 11.4199 22 9.45458Z'
);
const TELEGRAM: IRtServiceLogo.ImageItem = mark(
    'Telegram',
    '#26A5E4',
    'M10.9487 2.99445e-05C8.04019 0.013603 5.25547 1.17852 3.20366 3.23995C1.15184 5.30138 -3.167e-05 8.09152 6.53065e-10 11C6.53071e-10 13.9174 1.15893 16.7153 3.22183 18.7782C5.28473 20.8411 8.08262 22 11 22C13.9174 22 16.7153 20.8411 18.7782 18.7782C20.8411 16.7153 22 13.9174 22 11C22 8.08265 20.8411 5.28476 18.7782 3.22186C16.7153 1.15896 13.9174 2.99445e-05 11 2.99445e-05C10.9829 -9.9815e-06 10.9658 -9.9815e-06 10.9487 2.99445e-05ZM15.4972 6.62203C15.5888 6.6202 15.7914 6.64311 15.9234 6.75036C16.0111 6.82654 16.0671 6.93285 16.0802 7.04828C16.0948 7.13353 16.1132 7.32878 16.0985 7.48095C15.9335 9.22078 15.2167 13.4411 14.8518 15.389C14.6978 16.214 14.3944 16.4899 14.1002 16.5165C13.4622 16.5761 12.9773 16.0949 12.3585 15.6897C11.3905 15.0544 10.8433 14.6594 9.90367 14.0397C8.81742 13.3247 9.52142 12.9305 10.1402 12.2889C10.3024 12.1202 13.1166 9.55995 13.1716 9.32803C13.178 9.2987 13.1844 9.19053 13.1202 9.1337C13.0561 9.07686 12.9608 9.09611 12.892 9.1117C12.7948 9.1337 11.2484 10.1567 8.25275 12.1779C7.81275 12.4804 7.41583 12.6271 7.05925 12.6179C6.66692 12.6106 5.91158 12.397 5.34967 12.2146C4.66033 11.99 4.11308 11.8718 4.16075 11.4914C4.1855 11.2934 4.45867 11.0908 4.97933 10.8836C8.18583 9.48661 10.3235 8.56536 11.3942 8.12078C14.4485 6.85028 15.0838 6.62936 15.4972 6.62203Z'
);

/** Сегодняшнее время по часам браузера: макет пишет время ленты местными часами */
function today(hours: number, minutes: number): string {
    const date: Date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
}

/**
 * Страница переписки целиком: список разговоров, разговор и сведения о госте.
 *
 * Данные взяты из кадра экрана «Новый вид — переписка, разговор из WhatsApp» файла макетов, чтобы
 * историю можно было наложить на этот кадр. Знаки каналов те же, что в кадре, и живут только в
 * истории.
 *
 * В пакет не уезжает: `tsconfig.lib.json` исключает папки историй.
 */
@Component({
    selector: 'app-chat-page',
    templateUrl: './test-chat-page.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        // components
        RtChatComponent,
        RtChatMessageActionsDirective,
        RtChatMessageButtonsDirective,
        RtIconButtonComponent,
        RtIconComponent,
        RtMenuComponent,
        RtMenuItemComponent,
        RtTabDirective,
        RtTabsComponent,
        RtThreadListComponent,
        RtThreadListFiltersDirective,
        RtThreadListRowDirective,
        RtThreadListTabsDirective,
        RtToggleButtonGroupComponent,
        RtWorkspaceAsideDirective,
        RtWorkspaceCenterDirective,
        RtWorkspaceComponent,
        RtWorkspaceDetailsComponent,
        RtWorkspaceListDirective,

        // showcase
        StoryPresetsComponent,
    ],
})
export class TestRtChatPageComponent {
    public readonly sign: IRtServiceLogo.ImageItem = WHATSAPP;

    public readonly tabOptions: ReadonlyArray<IRtToggleButtonGroup.Option<string>> = [
        { value: 'all', label: 'Все' },
        { value: 'waiting', label: 'Ждут ответа' },
        { value: 'archive', label: 'Архив' },
    ];

    public readonly rows: readonly IPageRow[] = [
        {
            id: 12,
            hasUnread: false,
            sign: WHATSAPP,
            title: '№12 Анна Смирнова',
            preview: 'Можно заехать на час раньше?',
            time: '13:05',
            unread: 0,
        },
        {
            id: 11,
            hasUnread: true,
            sign: LINE,
            title: '№11 Kim Minjun',
            preview: 'Подогревается ли бассейн в январе?',
            time: '12:52',
            unread: 2,
        },
        {
            id: 10,
            hasUnread: false,
            sign: TELEGRAM,
            title: '№10 Thomas Weber',
            preview: 'Спасибо, приедем в пятницу',
            time: '12:40',
            unread: 0,
        },
        {
            id: 9,
            hasUnread: false,
            sign: { icon: 'globe', label: 'Сайт' },
            title: '№9 Ольга Петрова',
            preview: 'Трансфер из аэропорта — 800 THB',
            time: 'Вчера',
            read: true,
            unread: 0,
        },
    ];

    public readonly messages: readonly IRtChat.Message[] = [
        { id: 1, author: 'Анна', own: false, text: 'Добрый день! Можно заехать на час раньше?', createdAt: today(12, 58) },
        {
            id: 2,
            author: 'Вы',
            own: true,
            text: 'Здравствуйте! Да, дом будет готов к 13:00.',
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
        },
        {
            id: 3,
            author: 'Вы',
            own: true,
            text: 'Ключи оставлю у охраны на въезде.',
            createdAt: today(13, 2),
            status: ERtChatMessageStatus.Read,
        },
        { id: 4, author: 'Анна', own: false, text: 'Спасибо, отлично!', createdAt: today(13, 5) },
    ];

    public readonly profile: IRtWorkspaceDetails.Profile = {
        sign: WHATSAPP,
        name: 'Анна Смирнова',
        contact: '+66 81 234 5678',
    };

    public readonly details: readonly IRtWorkspaceDetails.Row[] = [
        { label: 'Местное время', value: '06:05, у вас 13:05' },
        { label: 'Где находится', value: 'Лондон, Великобритания' },
        { label: 'Язык', value: 'Английский' },
        { label: 'Устройство', value: 'Телефон · Safari · iOS' },
    ];
}
