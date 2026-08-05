import {
    activeSectionIds,
    entryKindOf,
    ERtPageHeaderEntry,
    IRtPageHeaderView,
    panelGroupsOf,
    panelItemsOf,
    pathOf,
    toEntry,
    toSections,
    unreadOf,
} from './rt-page-header.logic';
import { IRtPageHeader } from './rt-page-header.model';

function item(id: string, overrides: Partial<IRtPageHeader.Item> = {}): IRtPageHeader.Item {
    return { id, label: id, ...overrides };
}

function group(id: string, items: ReadonlyArray<IRtPageHeader.Item>, overrides: Partial<IRtPageHeader.Group> = {}): IRtPageHeader.Group {
    return { id, items, ...overrides };
}

function column(id: string, groups: ReadonlyArray<IRtPageHeader.Group>): IRtPageHeader.Column {
    return { id, groups };
}

const SETTINGS: IRtPageHeader.Item = item('settings', {
    icon: 'cog',
    columns: [
        column('main', [group('main-plain', [item('organization', { route: '/settings' }), item('users', { disabled: true })])]),
        column('references', [
            group('books', [item('tags', { route: '/settings/tags' })], { label: 'Справочники', icon: 'book' }),
            group('mail', [item('mail', { route: '/settings/mail' })], { label: 'Почта', icon: 'at' }),
        ]),
        column('marketing', [group('promo', [item('promo-codes', { route: '/settings/marketing/promo-codes' })], { label: 'Маркетинг' })]),
    ],
});

describe('panelItemsOf', () => {
    it('раскрывает колонки и группы в один список пунктов', () => {
        expect(panelItemsOf(SETTINGS).map((entry: IRtPageHeader.Item): string => entry.id)).toEqual([
            'organization',
            'users',
            'tags',
            'mail',
            'promo-codes',
        ]);
    });

    it('у раздела без панели список пуст', () => {
        expect(panelItemsOf(item('bookings', { route: '/bookings' }))).toEqual([]);
    });
});

describe('panelGroupsOf', () => {
    it('группы всех колонок идут одним списком в порядке колонок', () => {
        const columns: ReadonlyArray<IRtPageHeaderView.Column> = toSections([SETTINGS])[0].columns;

        expect(panelGroupsOf(columns).map((each: IRtPageHeaderView.Group): string => each.id)).toEqual([
            'main-plain',
            'books',
            'mail',
            'promo',
        ]);
    });

    it('у раздела без панели групп нет', () => {
        expect(panelGroupsOf(toSections([item('bookings', { route: '/bookings' })])[0].columns)).toEqual([]);
    });
});

describe('unreadOf', () => {
    it('без признака у себя и внутри маркера нет', () => {
        expect(unreadOf(SETTINGS)).toBe(false);
    });

    it('свой признак пункта зажигает маркер', () => {
        expect(unreadOf(item('chat', { route: '/chat', unread: true }))).toBe(true);
    });

    it('признак пункта панели поднимается на раздел', () => {
        expect(
            unreadOf(item('settings', { columns: [column('c', [group('g', [item('mail', { route: '/settings/mail', unread: true })])])] }))
        ).toBe(true);
    });

    it('маркер раздела горит от пункта в любой колонке, не только в первой', () => {
        expect(
            unreadOf(
                item('settings', {
                    columns: [
                        column('first', [group('plain', [item('organization', { route: '/settings' })])]),
                        column('second', [group('promo', [item('promo-codes', { route: '/settings/promo', unread: true })])]),
                    ],
                })
            )
        ).toBe(true);
    });
});

describe('entryKindOf', () => {
    it('пункт с непустой панелью отрисуется панелью', () => {
        expect(entryKindOf(SETTINGS)).toBe(ERtPageHeaderEntry.Panel);
    });

    it('колонки без единого пункта панелью не считаются', () => {
        expect(entryKindOf(item('empty', { route: '/empty', columns: [column('one', [group('none', [])])] }))).toBe(
            ERtPageHeaderEntry.Link
        );
    });

    it('пункт с адресом отрисуется ссылкой', () => {
        expect(entryKindOf(item('bookings', { route: '/bookings' }))).toBe(ERtPageHeaderEntry.Link);
    });

    it('недоступный пункт с адресом отрисуется кнопкой, а не ссылкой', () => {
        expect(entryKindOf(item('guests', { route: '/guests', disabled: true }))).toBe(ERtPageHeaderEntry.Button);
    });

    it('пункт без адреса отрисуется кнопкой', () => {
        expect(entryKindOf(item('finance'))).toBe(ERtPageHeaderEntry.Button);
    });
});

describe('toEntry', () => {
    it('отсутствующая иконка приходит пустым значением, а не ломает пункт', () => {
        expect(toEntry(item('tags', { route: '/settings/tags' })).icon).toBeNull();
    });

    it('иконка раздела сохраняется', () => {
        expect(toEntry(item('settings', { icon: 'cog' })).icon).toBe('cog');
    });

    it('пункт без признака непросмотренного маркера не получает', () => {
        expect(toEntry(item('tags', { route: '/settings/tags' })).unread).toBe(false);
    });
});

describe('toSections', () => {
    it('ширина панели считается числом колонок', () => {
        expect(toSections([SETTINGS])[0].columnCount).toBe(3);
    });

    it('группа без заголовка приходит с пустой подписью и места под неё не занимает', () => {
        const columns: ReadonlyArray<IRtPageHeaderView.Column> = toSections([SETTINGS])[0].columns;

        expect(columns[0].groups[0].label).toBe('');
        expect(columns[1].groups[0].label).toBe('Справочники');
    });

    it('в колонке остаётся столько групп, сколько объявлено', () => {
        expect(toSections([SETTINGS])[0].columns[1].groups.map((each: IRtPageHeaderView.Group): string => each.label)).toEqual([
            'Справочники',
            'Почта',
        ]);
    });

    it('раздел без панели колонок не получает', () => {
        expect(toSections([item('bookings', { route: '/bookings' })])[0].columnCount).toBe(0);
    });

    it('группы для узкого экрана приходят без деления на колонки', () => {
        expect(toSections([SETTINGS])[0].panelGroups.map((each: IRtPageHeaderView.Group): string => each.id)).toEqual([
            'main-plain',
            'books',
            'mail',
            'promo',
        ]);
    });

    it('маркер раздела зажигается пунктом его панели', () => {
        const sections: ReadonlyArray<IRtPageHeaderView.Section> = toSections([
            item('settings', { columns: [column('c', [group('g', [item('mail', { route: '/settings/mail', unread: true })])])] }),
        ]);

        expect(sections[0].unread).toBe(true);
        expect(sections[0].panelItems[0].unread).toBe(true);
    });
});

describe('pathOf', () => {
    it('строка запроса и якорь в подсветке не участвуют', () => {
        expect(pathOf('/settings/tags?page=2#top')).toBe('/settings/tags');
    });
});

describe('activeSectionIds', () => {
    const sections: ReadonlyArray<IRtPageHeaderView.Section> = toSections([SETTINGS, item('bookings', { route: '/bookings' })]);

    it('раздел подсвечен, когда открыт вложенный экран его пункта', () => {
        expect(activeSectionIds(sections, '/settings/marketing/promo-codes/42').has('settings')).toBe(true);
    });

    it('обход идёт на два уровня вниз: пункт лежит в группе внутри колонки', () => {
        expect(activeSectionIds(sections, '/settings/tags').has('settings')).toBe(true);
    });

    it('чужой адрес раздел не подсвечивает', () => {
        expect(activeSectionIds(sections, '/bookings').has('settings')).toBe(false);
    });

    it('недоступный пункт раздел не подсвечивает', () => {
        expect(
            activeSectionIds(
                toSections([
                    item('x', { columns: [column('c', [group('g', [item('users', { route: '/settings/users', disabled: true })])])] }),
                ]),
                '/settings/users'
            ).size
        ).toBe(0);
    });

    it('раздел без панели в подсветке по адресу не участвует — за него отвечает routerLinkActive', () => {
        expect(activeSectionIds(sections, '/bookings').has('bookings')).toBe(false);
    });
});
