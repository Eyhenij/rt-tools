import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { LOCAL_STORAGE } from '@rt-tools/core';

import { BreakpointsService } from '../../platform';
import { createRtFixture, qa, qaAll } from '../../../testing/rt-kit-testing';
import { provideRtSideMenuSettings } from './rt-side-menu-settings.service';
import { RtSideMenuComponent } from './rt-side-menu.component';
import { RtSideMenuEmptyDirective } from './rt-side-menu.directives';
import { IRtSideMenu } from './rt-side-menu.model';

/** Подмена наблюдателя ширины: сам он в тестовой среде ничего не измеряет. */
class StubBreakpointsService {
    public readonly narrow: WritableSignal<boolean> = signal(false);
}

const ITEMS: IRtSideMenu.Item[] = [
    { id: 'home', icon: 'users', name: 'Главная', link: '/home' },
    { id: 'reports', icon: 'chart-bar', name: 'Отчёты', submenu: [{ id: 'sales', name: 'Продажи', link: '/reports/sales' }] },
];

@Component({
    selector: 'rt-test-side-menu-states-host',
    template: `
        <rt-side-menu [menuItems]="items" [activeMenuIds]="[]">
            @if (withSlot()) {
                <ng-template rtSideMenuEmpty let-term>
                    <span qa-dataid="own-empty">нет «{{ term }}»</span>
                </ng-template>
            }
        </rt-side-menu>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtSideMenuComponent, RtSideMenuEmptyDirective],
})
class StatesHostComponent {
    public readonly items: IRtSideMenu.Item[] = ITEMS;
    public readonly withSlot: WritableSignal<boolean> = signal<boolean>(false);
}

/** Подменю отчётов, поиск без совпадений. */
function searchNothing(withSlot: boolean): ComponentFixture<StatesHostComponent> {
    const fixture: ComponentFixture<StatesHostComponent> = createRtFixture(
        StatesHostComponent,
        {},
        {
            providers: [
                provideRouter([{ path: '**', children: [] }]),
                provideRtSideMenuSettings(),
                { provide: LOCAL_STORAGE, useValue: window.sessionStorage },
                { provide: BreakpointsService, useValue: new StubBreakpointsService() },
            ],
            skipInitialDetect: true,
        }
    );

    fixture.componentInstance.withSlot.set(withSlot);
    fixture.detectChanges();
    (qaAll(fixture, 'side-menu-item')[1].nativeElement as HTMLElement).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const input: HTMLInputElement = (qa(fixture, 'side-menu-search')?.nativeElement as HTMLElement).querySelector(
        'input'
    ) as HTMLInputElement;
    input.value = 'нет такого';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    return fixture;
}

describe('RtSideMenuComponent — свой вид пустого поиска', (): void => {
    it('SC-UKV-1291 — свой шаблон встаёт вместо строки «Ничего не найдено» и получает строку поиска', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = searchNothing(true);

        expect(qa(fixture, 'own-empty')?.nativeElement.textContent).toContain('нет «нет такого»');
        expect(qa(fixture, 'side-menu-empty')).toBeNull();
    });

    it('SC-UKV-1296 — без шаблона строка «Ничего не найдено» стоит как раньше', (): void => {
        const fixture: ComponentFixture<StatesHostComponent> = searchNothing(false);

        expect(qa(fixture, 'side-menu-empty')).not.toBeNull();
    });
});
