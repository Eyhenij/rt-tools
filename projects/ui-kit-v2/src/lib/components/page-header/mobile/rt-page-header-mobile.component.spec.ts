import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { createRtFixture, hostClasses, qaAll, setInputs, textOf } from '../../../../testing/rt-kit-testing';
import { ERtPageHeaderEntry, IRtPageHeaderView } from '../rt-page-header.logic';
import { RtPageHeaderMobileComponent } from './rt-page-header-mobile.component';

/** Страница любого адреса: переход по ссылке меню находит её, а не падает на пустом маршрутизаторе. */
@Component({
    selector: 'rt-page-header-mobile-page',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
class AnyPageComponent {}

function entry(id: string, kind: ERtPageHeaderEntry, route: string = ''): IRtPageHeaderView.Entry {
    return { id, label: id, icon: null, route, routerLinkActiveExact: false, disabled: false, unread: false, kind };
}

function section(base: IRtPageHeaderView.Entry, groups: ReadonlyArray<IRtPageHeaderView.Group> = []): IRtPageHeaderView.Section {
    return {
        ...base,
        columns: [],
        columnCount: 0,
        panelItems: groups.flatMap((group: IRtPageHeaderView.Group): ReadonlyArray<IRtPageHeaderView.Entry> => group.items),
        panelGroups: groups,
        priority: 0,
    };
}

const SECTIONS: ReadonlyArray<IRtPageHeaderView.Section> = [
    section(entry('catalog', ERtPageHeaderEntry.Panel), [
        {
            id: 'goods',
            label: 'Товары',
            icon: null,
            items: [entry('list', ERtPageHeaderEntry.Link, '/list'), entry('import', ERtPageHeaderEntry.Button)],
        },
    ]),
    section(entry('orders', ERtPageHeaderEntry.Link, '/orders')),
    section(entry('help', ERtPageHeaderEntry.Button)),
];

describe('RtPageHeaderMobileComponent', (): void => {
    let fixture: ComponentFixture<RtPageHeaderMobileComponent>;
    let toggled: string[];
    let clicked: string[];
    let navigated: number;

    beforeEach((): void => {
        fixture = createRtFixture(
            RtPageHeaderMobileComponent,
            { sections: SECTIONS },
            { providers: [provideRouter([{ path: '**', component: AnyPageComponent }])] }
        );
        toggled = [];
        clicked = [];
        navigated = 0;
        fixture.componentInstance.sectionToggle.subscribe((id: string): number => toggled.push(id));
        fixture.componentInstance.itemClick.subscribe((id: string): number => clicked.push(id));
        fixture.componentInstance.navigate.subscribe((): void => {
            navigated += 1;
        });
    });

    it('SC-UKV-1749 — меню узкого экрана — блок на хосте с ролью меню, раздел с панелью свёрнут', (): void => {
        expect(hostClasses(fixture)).toContain('rt-page-header-mobile');
        expect(fixture.nativeElement.getAttribute('role')).toBe('menu');
        expect(qaAll(fixture, 'header-nav-mobile-trigger').map(textOf)).toEqual(['catalog']);
        expect(qaAll(fixture, 'header-nav-mobile-group')).toHaveLength(0);
        expect(qaAll(fixture, 'header-nav-mobile-item').map(textOf)).toEqual(['orders', 'help']);
    });

    it('SC-UKV-1749 — меню узкого экрана — нажатие раздела с панелью сообщает шапке, раскрытый раздел показывает группы', (): void => {
        (qaAll(fixture, 'header-nav-mobile-trigger')[0].nativeElement as HTMLElement).click();
        expect(toggled).toEqual(['catalog']);

        setInputs(fixture, { expanded: new Set<string>(['catalog']), active: new Set<string>(['catalog']) });
        fixture.detectChanges();

        const trigger: HTMLElement = qaAll(fixture, 'header-nav-mobile-trigger')[0].nativeElement as HTMLElement;
        expect(trigger.getAttribute('aria-expanded')).toBe('true');
        expect(trigger.classList).toContain('rt-page-header-mobile__section--is-expanded');
        expect(trigger.classList).toContain('rt-page-header-mobile__section--is-active');
        expect(qaAll(fixture, 'header-nav-mobile-group').map(textOf)).toEqual(['Товары']);
        expect(qaAll(fixture, 'header-nav-mobile-item').map(textOf)).toEqual(['list', 'import', 'orders', 'help']);
    });

    it('SC-UKV-1749 — меню узкого экрана — пункт без адреса приходит идентификатором, ссылка сообщает о переходе', (): void => {
        setInputs(fixture, { expanded: new Set<string>(['catalog']) });
        fixture.detectChanges();
        const items: HTMLElement[] = qaAll(fixture, 'header-nav-mobile-item').map(
            (item: { nativeElement: HTMLElement }): HTMLElement => item.nativeElement
        );

        items[1].click();
        items[3].click();
        expect(clicked).toEqual(['import', 'help']);

        items[0].click();
        items[2].click();
        expect(navigated).toBe(2);
    });
});
