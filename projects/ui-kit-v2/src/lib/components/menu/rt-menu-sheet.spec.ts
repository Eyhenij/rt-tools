import { ApplicationRef, ChangeDetectionStrategy, Component, Provider, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RT_POPOVER_SHEET } from '../popover/rt-popover-sheet.token';
import { RtMenuContentDirective } from './rt-menu-content.directive';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RtMenuComponent } from './rt-menu.component';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class BreakpointsStub {
    public readonly viewportNarrow: WritableSignal<boolean> = signal<boolean>(true);
    public readonly phone: WritableSignal<boolean> = this.viewportNarrow;
    public readonly narrow: WritableSignal<boolean> = signal<boolean>(true);
}

@Component({
    selector: 'rt-menu-sheet-host',
    template: `
        <rt-menu ariaLabel="Действия" [sheet]="sheet()" (openedChange)="opened.push($event)">
            <ng-template rtMenuContent>
                <rt-menu-item label="Открыть" icon="ico-eye" (selected)="picked = picked + 1" />
                <rt-menu-item label="Удалить" icon="ico-trash" />
            </ng-template>
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuComponent, RtMenuContentDirective, RtMenuItemComponent],
})
class MenuSheetHostComponent {
    public readonly sheet: WritableSignal<boolean> = signal<boolean>(true);
    public readonly opened: boolean[] = [];
    public picked: number = 0;
}

let lastStub: BreakpointsStub;

function setup(narrow: boolean, sheet: boolean = true, extra: Provider[] = []): ComponentFixture<MenuSheetHostComponent> {
    const stub: BreakpointsStub = new BreakpointsStub();
    stub.viewportNarrow.set(narrow);
    lastStub = stub;
    const providers: Provider[] = [{ provide: BreakpointsService, useValue: stub }, ...extra];
    const fixture: ComponentFixture<MenuSheetHostComponent> = createRtFixture(MenuSheetHostComponent, {}, { providers });
    fixture.componentInstance.sheet.set(sheet);
    fixture.detectChanges();
    return fixture;
}

function settle(fixture: ComponentFixture<MenuSheetHostComponent>): void {
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();
}

function openMenu(fixture: ComponentFixture<MenuSheetHostComponent>): void {
    ((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="menu-trigger"] button') as HTMLButtonElement).click();
    settle(fixture);
}

function sheetPanel(): HTMLElement | null {
    return document.querySelector('.rt-popover-sheet [qa-dataid="menu-panel"]');
}

describe('RtMenuComponent — нижняя шторка', (): void => {
    afterEach((): void => {
        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
    });

    it('SC-UKV-1687 — на телефоне меню открывается в нижней шторке с подписью кнопки в заголовке', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(true);

        openMenu(fixture);

        expect(sheetPanel()).not.toBeNull();
        expect(document.querySelectorAll('.rt-popover-sheet rt-menu-item').length).toBe(2);
        expect(document.querySelector('[qa-dataid="popover-sheet-title"]')?.textContent?.trim()).toBe('Действия');
        expect(document.querySelectorAll('[qa-dataid="menu-panel"]').length).toBe(1);
    });

    it('SC-UKV-1688 — пункт в шторке делает своё и закрывает шторку', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(true);
        openMenu(fixture);

        (document.querySelector('.rt-popover-sheet rt-menu-item[role="menuitem"]') as HTMLElement).click();
        settle(fixture);

        expect(fixture.componentInstance.picked).toBe(1);
        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(fixture.componentInstance.opened).toEqual([true, false]);
    });

    it('SC-UKV-1689 — подложка шторки закрывает меню', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(true);
        openMenu(fixture);

        (document.querySelector('.rt-popover-sheet [qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(fixture.componentInstance.opened).toEqual([true, false]);
    });

    it('SC-UKV-1690 — выключенная шторка и широкий экран оставляют меню у кнопки', (): void => {
        openMenu(setup(true, false));
        expect(sheetPanel()).toBeNull();
        expect(document.querySelector('[qa-dataid="menu-panel"]')).not.toBeNull();

        document.querySelectorAll('.cdk-overlay-container').forEach((node: Element): void => node.remove());
        openMenu(setup(false));
        expect(sheetPanel()).toBeNull();
        expect(document.querySelector('[qa-dataid="menu-panel"]')).not.toBeNull();
    });
    it('SC-UKV-1586: токен RT_POPOVER_SHEET со значением false оставляет меню у кнопки на телефоне', (): void => {
        openMenu(setup(true, true, [{ provide: RT_POPOVER_SHEET, useValue: false }]));

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelector('[qa-dataid="menu-panel"]')).not.toBeNull();
    });

    it('SC-UKV-1587: в шторке фокус встаёт на первый пункт, стрелки ходят по пунктам, Escape закрывает и возвращает фокус кнопке', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(true);
        openMenu(fixture);
        const items: NodeListOf<HTMLElement> = document.querySelectorAll<HTMLElement>('.rt-popover-sheet [role="menuitem"]');
        expect(document.activeElement).toBe(items[0]);

        document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', keyCode: 40, bubbles: true }));
        expect(document.activeElement).toBe(items[1]);

        document.activeElement?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.activeElement).toBe((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="menu-trigger"] button'));
    });

    it('SC-UKV-1587: закрытие подложкой возвращает фокус кнопке меню', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(true);
        openMenu(fixture);

        (document.querySelector('.rt-popover-sheet [qa-dataid="bottom-sheet-backdrop"]') as HTMLElement).click();
        settle(fixture);

        expect(document.activeElement).toBe((fixture.nativeElement as HTMLElement).querySelector('[qa-dataid="menu-trigger"] button'));
    });

    it('SC-UKV-1589: порог ширины, пересечённый при открытом в шторке меню, не рисует вторую панель у кнопки', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(true);
        openMenu(fixture);

        lastStub.viewportNarrow.set(false);
        settle(fixture);

        expect(document.querySelectorAll('[qa-dataid="menu-panel"]').length).toBe(1);
        expect(document.querySelector('.rt-popover-sheet [qa-dataid="menu-panel"]')).not.toBeNull();
    });

    it('SC-UKV-1589: порог ширины, пересечённый при открытом у кнопки меню, не открывает шторку поверх него', (): void => {
        const fixture: ComponentFixture<MenuSheetHostComponent> = setup(false);
        openMenu(fixture);

        lastStub.viewportNarrow.set(true);
        settle(fixture);

        expect(document.querySelector('.rt-popover-sheet')).toBeNull();
        expect(document.querySelectorAll('[qa-dataid="menu-panel"]').length).toBe(1);
    });
});
