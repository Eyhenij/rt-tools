import { ChangeDetectionStrategy, Component, Directive, OnDestroy } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { RtDialogService } from '../dialog/rt-dialog.service';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { RtMenuContentDirective } from './rt-menu-content.directive';
import { RtMenuItemComponent } from './rt-menu-item.component';
import { RtMenuComponent } from './rt-menu.component';

/** Счёт построенных и разрушенных пунктов: директива висит на каждом пункте шаблона. */
const life: { built: number; destroyed: number } = { built: 0, destroyed: 0 };

@Directive({ selector: '[rtProbe]' })
class ProbeDirective implements OnDestroy {
    constructor() {
        life.built++;
    }

    public ngOnDestroy(): void {
        life.destroyed++;
    }
}

/** Окно подтверждения, ответ которого тест даёт сам. */
class DialogStub {
    public readonly answer: Subject<boolean> = new Subject<boolean>();
    public opened: number = 0;

    public open(): { afterClosed: () => Observable<boolean> } {
        this.opened++;
        return { afterClosed: (): Observable<boolean> => this.answer };
    }
}

@Component({
    selector: 'rt-menu-slots-host',
    template: `
        <rt-menu ariaLabel="Действия">
            <ng-template rtMenuContent>
                <rt-menu-item rtProbe label="Открыть" (selected)="opened = opened + 1" />
                <rt-menu-item rtProbe label="Копировать" />
                <rt-menu-item rtProbe label="Удалить" confirmMessage="Удалить запись?" (selected)="removed = removed + 1" />
            </ng-template>
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuComponent, RtMenuContentDirective, RtMenuItemComponent, ProbeDirective],
})
class MenuSlotsHostComponent {
    public opened: number = 0;
    public removed: number = 0;
}

@Component({
    selector: 'rt-menu-stray-host',
    template: `
        <rt-menu ariaLabel="Действия">
            <rt-menu-item label="Открыть" />
        </rt-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtMenuComponent, RtMenuItemComponent],
})
class MenuStrayHostComponent {}

function items(): HTMLElement[] {
    return Array.from(document.querySelectorAll('rt-menu-item'));
}

function pressTrigger(fixture: ComponentFixture<unknown>): void {
    el(fixture, '[qa-dataid="menu-trigger"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
    fixture.detectChanges();
}

describe('RtMenuComponent — пункты шаблоном', (): void => {
    let dialog: DialogStub;

    function setup(): ComponentFixture<MenuSlotsHostComponent> {
        dialog = new DialogStub();
        return createRtFixture(MenuSlotsHostComponent, {}, { providers: [{ provide: RtDialogService, useValue: dialog }] });
    }

    beforeEach((): void => {
        life.built = 0;
        life.destroyed = 0;
    });

    it('SC-UKV-1724: закрытое меню не строит ни одного пункта шаблона', (): void => {
        setup();

        expect([life.built, items().length]).toEqual([0, 0]);
    });

    it('SC-UKV-1725: открытое меню рисует три пункта, и фокус стоит на первом', (): void => {
        const fixture: ComponentFixture<MenuSlotsHostComponent> = setup();

        pressTrigger(fixture);

        expect([items().length, document.activeElement === items()[0]]).toEqual([3, true]);
    });

    it('SC-UKV-1726: закрытое меню разрушает пункты, которые нарисовало', (): void => {
        const fixture: ComponentFixture<MenuSlotsHostComponent> = setup();

        pressTrigger(fixture);
        pressTrigger(fixture);

        expect([life.built, life.destroyed, items().length]).toEqual([3, 3, 0]);
    });

    it('SC-UKV-1727: нажатый пункт доходит до обработчика потребителя и закрывает меню', (): void => {
        const fixture: ComponentFixture<MenuSlotsHostComponent> = setup();

        pressTrigger(fixture);
        items()[0].click();
        fixture.detectChanges();

        expect([fixture.componentInstance.opened, items().length]).toEqual([1, 0]);
    });

    it('SC-UKV-1733: подтверждённое действие доходит до потребителя один раз после закрытия меню', (): void => {
        const fixture: ComponentFixture<MenuSlotsHostComponent> = setup();

        pressTrigger(fixture);
        items()[2].click();
        fixture.detectChanges();
        pressTrigger(fixture);
        const heldOpen: boolean = items().length === 3;
        dialog.answer.next(true);
        dialog.answer.complete();
        fixture.detectChanges();

        expect([dialog.opened, heldOpen, fixture.componentInstance.removed, items().length]).toEqual([1, true, 1, 0]);
    });

    it('SC-UKV-1746: меню с пунктами шаблоном не предупреждает и после открытия', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const fixture: ComponentFixture<MenuSlotsHostComponent> = setup();

        pressTrigger(fixture);
        const said: string[] = warn.mock.calls
            .map((call: unknown[]): string => String(call[0]))
            .filter((line: string): boolean => line.startsWith('rt-menu:'));
        warn.mockRestore();

        expect(said).toEqual([]);
    });
});

describe('RtMenuComponent — пункт вне шаблона', (): void => {
    it('SC-UKV-1746: пункт без rtMenuContent предупреждает в режиме разработки и не рисуется', (): void => {
        const warn: jest.SpyInstance = jest.spyOn(console, 'warn').mockImplementation((): void => undefined);
        const fixture: ComponentFixture<MenuStrayHostComponent> = createRtFixture(MenuStrayHostComponent);

        pressTrigger(fixture);
        const said: string[] = warn.mock.calls
            .map((call: unknown[]): string => String(call[0]))
            .filter((line: string): boolean => line.startsWith('rt-menu:'));
        warn.mockRestore();

        expect([said.length, said[0]?.includes('rtMenuContent'), items().length]).toEqual([1, true, 0]);
    });
});
