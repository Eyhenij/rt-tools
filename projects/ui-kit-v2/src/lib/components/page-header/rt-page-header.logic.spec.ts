import {
    activeSectionIds,
    compactSectionsOf,
    entryKindOf,
    ERtPageHeaderEntry,
    fitRow,
    hasActiveSection,
    IRtPageHeaderFit,
    IRtPageHeaderView,
    isStuck,
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

describe('compactSectionsOf', () => {
    const sections: ReadonlyArray<IRtPageHeaderView.Section> = toSections([
        item('tours', { icon: 'book' }),
        item('clients'),
        item('reports', { icon: 'bars' }),
        SETTINGS,
    ]);

    it('в круги идут первые разделы с иконкой, число — по входу', () => {
        expect(compactSectionsOf(sections, 2).map((each: IRtPageHeaderView.Section): string => each.id)).toEqual(['tours', 'reports']);
    });

    it('раздел без иконки в круг не попадает, даже когда место есть', () => {
        expect(compactSectionsOf(sections, 10).map((each: IRtPageHeaderView.Section): string => each.id)).toEqual([
            'tours',
            'reports',
            'settings',
        ]);
    });

    it('ноль и отрицательное число кругов не дают', () => {
        expect(compactSectionsOf(sections, 0)).toEqual([]);
        expect(compactSectionsOf(sections, -3)).toEqual([]);
    });
});

describe('isStuck', () => {
    it('шапка прилипла, когда видна не целиком: верхний пиксель ушёл за край', () => {
        expect(isStuck(0.98, true)).toBe(true);
    });

    it('до прокрутки шапка видна целиком', () => {
        expect(isStuck(1, true)).toBe(false);
    });

    it('шапка, ушедшая из области целиком, прилипшей не считается', () => {
        expect(isStuck(0, false)).toBe(false);
    });
});

describe('fitRow', () => {
    /** Пять разделов по сто пикселей: с промежутком 10 ряд целиком занимает 540. */
    function slots(priorities: ReadonlyArray<number> = [0, 0, 0, 0, 0]): ReadonlyArray<IRtPageHeaderFit.Slot> {
        return priorities.map((priority: number, index: number): IRtPageHeaderFit.Slot => ({ id: `s${index + 1}`, width: 100, priority }));
    }

    function fit(available: number, priorities?: ReadonlyArray<number>): IRtPageHeaderFit.Result {
        return fitRow({ slots: slots(priorities), moreWidth: 60, available, gap: 10 });
    }

    it('SC-UKV-868: всё помещается — «Ещё» нет', () => {
        expect(fit(540)).toEqual({ row: ['s1', 's2', 's3', 's4', 's5'], more: [] });
    });

    it('SC-UKV-869: без важности уходят разделы с конца списка', () => {
        // Три раздела и «Ещё»: 300 + 60 + три промежутка = 390.
        expect(fit(400)).toEqual({ row: ['s1', 's2', 's3'], more: ['s4', 's5'] });
    });

    it('SC-UKV-869: «Ещё» тоже занимает место: раздел, вставший бы без него, уходит', () => {
        // Четыре раздела без «Ещё» заняли бы 430 — но с «Ещё» нужно 500.
        expect(fit(450).more).toEqual(['s4', 's5']);
    });

    it('SC-UKV-870: первыми уходят наименее важные', () => {
        expect(fit(400, [0, -1, 0, 5, -2])).toEqual({ row: ['s1', 's3', 's4'], more: ['s2', 's5'] });
    });

    it('SC-UKV-870: порядок оставшихся в ряду и ушедших не меняется', () => {
        expect(fit(290, [3, 0, 2, 1, 4])).toEqual({ row: ['s1', 's5'], more: ['s2', 's3', 's4'] });
    });

    it('SC-UKV-870: при равной важности уходит стоящий дальше от начала', () => {
        expect(fit(400, [1, 1, 0, 1, 1]).more).toEqual(['s3', 's5']);
    });

    it('SC-UKV-869: без места даже для одного раздела в ряду остаётся только «Ещё»', () => {
        expect(fit(80)).toEqual({ row: [], more: ['s1', 's2', 's3', 's4', 's5'] });
    });

    it('SC-UKV-869: доля пикселя замера раздел в «Ещё» не уводит', () => {
        expect(fit(539.7).more).toEqual([]);
    });
});

describe('hasActiveSection', () => {
    const sections: ReadonlyArray<IRtPageHeaderView.Section> = toSections([SETTINGS, item('bookings', { route: '/bookings' })]);

    it('SC-UKV-872: активный раздел-ссылка в «Ещё» подсвечивает «Ещё»', () => {
        expect(hasActiveSection(sections.slice(1), '/bookings/42?tab=info')).toBe(true);
    });

    it('SC-UKV-872: активный пункт панели в «Ещё» подсвечивает «Ещё»', () => {
        expect(hasActiveSection(sections.slice(0, 1), '/settings/mail')).toBe(true);
    });

    it('SC-UKV-872: активный раздел вне «Ещё» его не подсвечивает', () => {
        expect(hasActiveSection(sections.slice(0, 1), '/bookings')).toBe(false);
    });
});
