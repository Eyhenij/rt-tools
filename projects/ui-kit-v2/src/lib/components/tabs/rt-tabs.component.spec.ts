import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, els, hostClasses, qa, qaAll, textOf } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

/** Вкладки объявляются директивами на `ng-template` — нужна host-обёртка. */
@Component({
    selector: 'rt-tabs-host',
    template: `
        <rt-tabs [activeId]="activeId()" [direction]="direction()" [stretch]="stretch()" (activeIdChange)="picked = $event">
            <ng-template rtTab="main" label="Основное">Содержимое основного</ng-template>
            <ng-template rtTab="extra" label="Дополнительно" [badge]="3">Содержимое дополнительного</ng-template>
            <ng-template rtTab="locked" label="Закрытое" [disabled]="lockedDisabled()">Закрытое содержимое</ng-template>
            <ng-template rtTab="hidden" label="Скрытое" [hidden]="true">Скрытое содержимое</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsHostComponent {
    public readonly activeId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);
    public readonly direction: WritableSignal<IRtTabs.Direction> = signal<IRtTabs.Direction>('horizontal');
    public readonly stretch: WritableSignal<boolean> = signal<boolean>(false);
    public readonly lockedDisabled: WritableSignal<boolean> = signal<boolean>(true);
    public picked: IRtTabs.Id | null = null;
}

function setup(): ComponentFixture<TabsHostComponent> {
    return createRtFixture(TabsHostComponent);
}

function tabs(fixture: ComponentFixture<TabsHostComponent>): HTMLButtonElement[] {
    return qaAll(fixture, 'tabs-tab').map((node: DebugElement): HTMLButtonElement => node.nativeElement as HTMLButtonElement);
}

function labels(fixture: ComponentFixture<TabsHostComponent>): string[] {
    return tabs(fixture).map((node: HTMLButtonElement): string => (node.textContent ?? '').trim());
}

function key(fixture: ComponentFixture<TabsHostComponent>, name: string): void {
    const selected: HTMLButtonElement | undefined = tabs(fixture).find(
        (node: HTMLButtonElement): boolean => node.getAttribute('aria-selected') === 'true'
    );
    selected?.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
}

describe('RtTabsComponent', (): void => {
    it('скрытая вкладка не попадает в шапку', (): void => {
        expect(labels(setup())).toEqual(['Основное', 'Дополнительно3', 'Закрытое']);
    });

    it('без заданной вкладки открывается первая доступная', (): void => {
        const fixture: ComponentFixture<TabsHostComponent> = setup();

        expect(tabs(fixture)[0].getAttribute('aria-selected')).toBe('true');
        expect(textOf(qa(fixture, 'tabs-panel'))).toBe('Содержимое основного');
    });

    it('заданная снаружи вкладка открывается сразу', (): void => {
        const fixture: ComponentFixture<TabsHostComponent> = createRtFixture(TabsHostComponent, {}, { skipInitialDetect: true });
        fixture.componentInstance.activeId.set('extra');
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'tabs-panel'))).toBe('Содержимое дополнительного');
    });

    it('несуществующая вкладка снаружи откатывается на первую доступную', (): void => {
        // Идентификатор мог прийти из адреса страницы и указывать на вкладку,
        // которой больше нет: пустая шапка вместо содержимого была бы хуже.
        const fixture: ComponentFixture<TabsHostComponent> = createRtFixture(TabsHostComponent, {}, { skipInitialDetect: true });
        fixture.componentInstance.activeId.set('нет-такой');
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'tabs-panel'))).toBe('Содержимое основного');
    });

    it('отключённая вкладка не может быть активной', (): void => {
        const fixture: ComponentFixture<TabsHostComponent> = createRtFixture(TabsHostComponent, {}, { skipInitialDetect: true });
        fixture.componentInstance.activeId.set('locked');
        fixture.detectChanges();

        expect(textOf(qa(fixture, 'tabs-panel'))).toBe('Содержимое основного');
    });

    describe('переключение', (): void => {
        it('клик открывает вкладку и сообщает наружу', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            tabs(fixture)[1].click();
            fixture.detectChanges();

            expect(fixture.componentInstance.picked).toBe('extra');
            expect(textOf(qa(fixture, 'tabs-panel'))).toBe('Содержимое дополнительного');
        });

        it('клик по отключённой вкладке ничего не меняет', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            tabs(fixture)[2].dispatchEvent(new MouseEvent('click', { bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.picked).toBeNull();
        });

        it('вкладки переключаются даже без входа снаружи — состояние держится внутри', (): void => {
            // Вход `activeId` необязателен: без него компонент помнит выбор сам.
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            tabs(fixture)[1].click();
            fixture.detectChanges();

            expect(tabs(fixture)[1].getAttribute('aria-selected')).toBe('true');
        });
    });

    describe('клавиатура', (): void => {
        it('стрелка вправо переходит к следующей доступной вкладке', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            key(fixture, 'ArrowRight');

            expect(fixture.componentInstance.picked).toBe('extra');
        });

        it('стрелки перешагивают отключённую вкладку и заворачиваются по кругу', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            key(fixture, 'ArrowRight');
            key(fixture, 'ArrowRight');

            expect(fixture.componentInstance.picked).toBe('main');
        });

        it('End открывает последнюю доступную вкладку, Home — первую', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            key(fixture, 'End');
            expect(fixture.componentInstance.picked).toBe('extra');

            key(fixture, 'Home');
            expect(fixture.componentInstance.picked).toBe('main');
        });

        it('в вертикальной раскладке работают стрелки вверх и вниз', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = createRtFixture(TabsHostComponent, {}, { skipInitialDetect: true });
            fixture.componentInstance.direction.set('vertical');
            fixture.detectChanges();

            key(fixture, 'ArrowDown');

            expect(fixture.componentInstance.picked).toBe('extra');
        });
    });

    describe('доступность', (): void => {
        it('шапка объявлена списком вкладок с направлением', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();
            const list: HTMLElement = qa(fixture, 'tabs-tab-list')?.nativeElement as HTMLElement;

            expect(list.getAttribute('role')).toBe('tablist');
            expect(list.getAttribute('aria-orientation')).toBe('horizontal');
        });

        it('панель связана с активной вкладкой в обе стороны', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();
            const panel: HTMLElement = qa(fixture, 'tabs-panel')?.nativeElement as HTMLElement;

            expect(panel.getAttribute('role')).toBe('tabpanel');
            expect(panel.id).toBe('rt-tabpanel-main');
            expect(panel.getAttribute('aria-labelledby')).toBe('rt-tab-main');
            expect(tabs(fixture)[0].getAttribute('aria-controls')).toBe('rt-tabpanel-main');
        });

        it('в таб-порядке стоит только активная вкладка — остальные достаются стрелками', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            expect(tabs(fixture).map((node: HTMLButtonElement): string | null => node.getAttribute('tabindex'))).toEqual(['0', '-1', '-1']);
        });
    });

    describe('оформление', (): void => {
        it('направление помечает host модификатором', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = createRtFixture(TabsHostComponent, {}, { skipInitialDetect: true });
            fixture.componentInstance.direction.set('vertical');
            fixture.detectChanges();

            expect(Array.from((fixture.nativeElement as HTMLElement).querySelector('rt-tabs')?.classList ?? [])).toContain(
                'rt-tabs--direction--vertical'
            );
        });

        it('растягивание помечает и список, и сами вкладки', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = createRtFixture(TabsHostComponent, {}, { skipInitialDetect: true });
            fixture.componentInstance.stretch.set(true);
            fixture.detectChanges();

            expect(classesOf(qa(fixture, 'tabs-tab-list'))).toContain('rt-tabs__tab-list--stretch');
            expect(classesOf(tabs(fixture)[0])).toContain('rt-tab-item--stretch');
        });

        it('счётчик рисуется отдельным элементом рядом с подписью', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            expect(textOf(el(fixture, '.rt-tab-item__badge'))).toBe('3');
            expect(els(fixture, '.rt-tab-item__title').map((node: DebugElement): string => textOf(node))).toEqual([
                'Основное',
                'Дополнительно',
                'Закрытое',
            ]);
        });

        it('стрелки прокрутки есть всегда, но по умолчанию скрыты модификатором', (): void => {
            const fixture: ComponentFixture<TabsHostComponent> = setup();

            expect(classesOf(qa(fixture, 'tabs-scroll-prev'))).not.toContain('rt-tabs__rest--visible');
            expect(classesOf(qa(fixture, 'tabs-scroll-next'))).not.toContain('rt-tabs__rest--visible');
        });
    });

    it('host не несёт BEM-блока сам — блок объявлен на внутреннем контейнере', (): void => {
        expect(hostClasses(setup())).toEqual([]);
    });
});
