import { ChangeDetectionStrategy, Component, DebugElement, WritableSignal, signal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, qa, qaAll } from '../../../testing/rt-kit-testing';
import { RtTabDirective } from './rt-tab.directive';
import { RtTabsComponent } from './rt-tabs.component';
import { IRtTabs } from './rt-tabs.model';

interface ITabItem {
    id: string;
    label: string;
}

/** Хозяин держит набор вкладок сам: закрытие только просит убрать вкладку. */
@Component({
    selector: 'rt-tabs-additions-host',
    template: `
        <rt-tabs [activeId]="activeId()" [headerOnly]="headerOnly()" (activeIdChange)="activeId.set($event)" (tabClose)="close($event)">
            @for (item of items(); track item.id) {
                <ng-template closable [rtTab]="item.id" [label]="item.label">Содержимое {{ item.label }}</ng-template>
            }
            <ng-template rtTab="icon-only" glyph="pets" tooltip="Питомцы">Питомцы</ng-template>
            <ng-template rtTab="locked" label="Отчёт" closable disabled tooltip="Нет прав на отчёт">Отчёт</ng-template>
            <ng-template rtTab="bad" label="Анкета" invalid invalidMessage="Не заполнено имя" tooltip="Анкета гостя">Анкета</ng-template>
        </rt-tabs>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtTabsComponent, RtTabDirective],
})
class TabsAdditionsHostComponent {
    public readonly items: WritableSignal<ITabItem[]> = signal<ITabItem[]>([
        { id: 'a', label: 'Первая' },
        { id: 'b', label: 'Вторая' },
    ]);
    public readonly activeId: WritableSignal<IRtTabs.Id | null> = signal<IRtTabs.Id | null>(null);
    public readonly headerOnly: WritableSignal<boolean> = signal<boolean>(false);
    public closed: IRtTabs.Id[] = [];

    public close(id: IRtTabs.Id): void {
        this.closed.push(id);
        this.items.update((items: ITabItem[]): ITabItem[] => items.filter((item: ITabItem): boolean => item.id !== id));
    }
}

function setup(): ComponentFixture<TabsAdditionsHostComponent> {
    return createRtFixture(TabsAdditionsHostComponent);
}

function tab(fixture: ComponentFixture<TabsAdditionsHostComponent>, id: string): HTMLButtonElement {
    return (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(`[data-tabid="${id}"]`) as HTMLButtonElement;
}

function hoverTooltip(fixture: ComponentFixture<TabsAdditionsHostComponent>, node: HTMLElement): string | null {
    node.dispatchEvent(new Event('mouseenter'));
    jest.advanceTimersByTime(300);
    fixture.detectChanges();
    return document.querySelector('rt-tooltip')?.textContent ?? null;
}

describe('RtTabsComponent — закрытие, подсказки, glyph, только полоса', (): void => {
    afterEach((): void => {
        document.querySelector('rt-tooltip')?.remove();
        jest.useRealTimers();
    });

    describe('SC-UKV-922 — закрываемая вкладка', (): void => {
        it('SC-UKV-922 — крестик просит закрыть вкладку и не выбирает её', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            const closes: DebugElement[] = qaAll(fixture, 'tabs-tab-close');

            expect(closes.length).toBe(2);

            (closes[1].nativeElement as HTMLElement).click();
            fixture.detectChanges();

            expect(fixture.componentInstance.closed).toEqual(['b']);
            expect(fixture.componentInstance.activeId()).toBeNull();
            expect(tab(fixture, 'b')).toBeNull();
        });

        it('SC-UKV-922 — Delete на активной вкладке закрывает её, выбор уходит на первую доступную', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            tab(fixture, 'a').dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.closed).toEqual(['a']);
            expect(tab(fixture, 'b').getAttribute('aria-selected')).toBe('true');
        });

        it('SC-UKV-922 — закрытие активной вкладки сообщает владельцу новую активную', async (): Promise<void> => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            tab(fixture, 'b').click();
            fixture.detectChanges();
            expect(fixture.componentInstance.activeId()).toBe('b');

            (qaAll(fixture, 'tabs-tab-close')[1].nativeElement as HTMLElement).click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.closed).toEqual(['b']);
            expect(fixture.componentInstance.activeId()).toBe('a');
        });

        it('SC-UKV-922 — закрытие неактивной вкладки выбор не трогает', async (): Promise<void> => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            tab(fixture, 'a').click();
            fixture.detectChanges();

            (qaAll(fixture, 'tabs-tab-close')[1].nativeElement as HTMLElement).click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.activeId()).toBe('a');
        });

        it('SC-UKV-922 — у отключённой вкладки крестика нет, и Delete её не закрывает', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            const locked: HTMLButtonElement = tab(fixture, 'locked');

            expect(locked.parentElement?.querySelector('[qa-dataid="tabs-tab-close"]')).toBeNull();

            locked.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.closed).toEqual([]);
        });

        it('SC-UKV-922 — вкладка без closable крестика не имеет и не закрывается по Delete', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            const iconOnly: HTMLButtonElement = tab(fixture, 'icon-only');

            expect(iconOnly.getAttribute('aria-keyshortcuts')).toBeNull();
            expect(iconOnly.parentElement?.querySelector('[qa-dataid="tabs-tab-close"]')).toBeNull();

            iconOnly.dispatchEvent(new KeyboardEvent('keydown', { key: 'Delete', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.closed).toEqual([]);
        });
    });

    describe('SC-UKV-1019 — крестик вкладки доступен с клавиатуры', (): void => {
        function closeOf(fixture: ComponentFixture<TabsAdditionsHostComponent>, id: string): HTMLButtonElement | null {
            return tab(fixture, id)?.parentElement?.querySelector<HTMLButtonElement>('[qa-dataid="tabs-tab-close"]') ?? null;
        }

        it('SC-UKV-1019 — крестик — своя кнопка рядом с вкладкой, не внутри неё, и названа подписью', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            const close: HTMLButtonElement = closeOf(fixture, 'a') as HTMLButtonElement;

            expect(close.tagName).toBe('BUTTON');
            expect(close.getAttribute('type')).toBe('button');
            expect(close.closest('[role="tab"]')).toBeNull();
            expect(close.previousElementSibling).toBe(tab(fixture, 'a'));
            expect(close.getAttribute('aria-hidden')).toBeNull();
            expect(close.getAttribute('aria-label')).toBe('Close');
            expect(tab(fixture, 'a').getAttribute('aria-keyshortcuts')).toBe('Delete');
        });

        it('SC-UKV-1019 — в таб-порядке только крестик вкладки в фокусе', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

            expect(tab(fixture, 'a').getAttribute('tabindex')).toBe('0');
            expect(closeOf(fixture, 'a')?.getAttribute('tabindex')).toBe('0');
            expect(closeOf(fixture, 'b')?.getAttribute('tabindex')).toBe('-1');

            tab(fixture, 'b').click();
            fixture.detectChanges();

            expect(closeOf(fixture, 'a')?.getAttribute('tabindex')).toBe('-1');
            expect(closeOf(fixture, 'b')?.getAttribute('tabindex')).toBe('0');
        });

        it('SC-UKV-1019 — нажатие крестика в фокусе закрывает вкладку и отдаёт фокус оставшейся', async (): Promise<void> => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            const close: HTMLButtonElement = closeOf(fixture, 'a') as HTMLButtonElement;

            close.focus();
            close.click();
            fixture.detectChanges();
            await fixture.whenStable();

            expect(fixture.componentInstance.closed).toEqual(['a']);
            expect(document.activeElement).toBe(tab(fixture, 'b'));
        });
    });

    describe('SC-UKV-923 — подсказка вкладки', (): void => {
        beforeEach((): void => {
            jest.useFakeTimers();
        });

        it('SC-UKV-923 — подсказка показывается при наведении на вкладку', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

            expect(hoverTooltip(fixture, tab(fixture, 'icon-only'))).toBe('Питомцы');
        });

        it('SC-UKV-923 — у вкладки из одного значка подсказка становится её именем', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

            expect(tab(fixture, 'icon-only').getAttribute('aria-label')).toBe('Питомцы');
            expect(tab(fixture, 'locked').getAttribute('aria-label')).toBeNull();
        });

        it('SC-UKV-923 — у неверной вкладки подсказка объясняет ошибку', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

            expect(hoverTooltip(fixture, tab(fixture, 'bad'))).toBe('Не заполнено имя');
        });
    });

    describe('SC-UKV-924 — подсказка отключённой вкладки', (): void => {
        beforeEach((): void => {
            jest.useFakeTimers();
        });

        it('SC-UKV-924 — отключённая вкладка принимает наведение и показывает, почему недоступна', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();
            const locked: HTMLButtonElement = tab(fixture, 'locked');

            expect(locked.disabled).toBe(false);
            expect(locked.getAttribute('aria-disabled')).toBe('true');
            expect(hoverTooltip(fixture, locked)).toBe('Нет прав на отчёт');
        });

        it('SC-UKV-924 — клик по отключённой вкладке её не выбирает', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

            tab(fixture, 'locked').click();
            fixture.detectChanges();

            expect(tab(fixture, 'locked').getAttribute('aria-selected')).toBe('false');
            expect(fixture.componentInstance.activeId()).toBeNull();
        });
    });

    it('SC-UKV-925 — glyph рисует значок Material в заголовке', (): void => {
        const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

        expect(tab(fixture, 'icon-only').querySelector('.rt-icon__glyph')?.textContent?.trim()).toBe('pets');
    });

    describe('SC-UKV-926 — только полоса', (): void => {
        it('SC-UKV-926 — без панели и без ссылок на неё, выбор по-прежнему сообщается', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = createRtFixture(
                TabsAdditionsHostComponent,
                {},
                { skipInitialDetect: true }
            );
            fixture.componentInstance.headerOnly.set(true);
            fixture.detectChanges();

            expect(qa(fixture, 'tabs-panel')).toBeNull();
            expect(el(fixture, '[role="tabpanel"]')).toBeNull();
            expect(tab(fixture, 'a').getAttribute('aria-controls')).toBeNull();

            tab(fixture, 'b').click();
            fixture.detectChanges();

            expect(fixture.componentInstance.activeId()).toBe('b');
            expect(tab(fixture, 'b').getAttribute('aria-selected')).toBe('true');
        });

        it('SC-UKV-926 — без режима панель на месте и связана с вкладкой', (): void => {
            const fixture: ComponentFixture<TabsAdditionsHostComponent> = setup();

            expect(qa(fixture, 'tabs-panel')).not.toBeNull();
            expect(tab(fixture, 'a').getAttribute('aria-controls')).toBe('rt-tabpanel-a');
        });
    });
});
