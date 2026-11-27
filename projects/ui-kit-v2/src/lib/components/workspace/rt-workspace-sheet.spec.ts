import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { createRtFixture, el } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtWorkspaceComponent } from './rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from './rt-workspace.directives';

@Component({
    selector: 'rt-workspace-sheet-host',
    template: `
        <rt-workspace hasActive asideTitle="Бронь 42" [singleColumnBreakpoint]="600">
            <ng-template rtWorkspaceList><span qa-dataid="slot-list">Список</span></ng-template>
            <ng-template rtWorkspaceCenter><span qa-dataid="slot-center">Карточка</span></ng-template>
            <ng-template rtWorkspaceAside><span qa-dataid="slot-aside">Подробности</span></ng-template>
        </rt-workspace>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWorkspaceComponent, RtWorkspaceListDirective, RtWorkspaceCenterDirective, RtWorkspaceAsideDirective],
})
class WorkspaceSheetHostComponent {}

/** Телефон: место и окно 375 точек. jsdom страницу не раскладывает, и ширину задаёт тест. */
interface IPhonePlace {
    readonly placeWidth: WritableSignal<number | null>;
    readonly narrow: WritableSignal<boolean>;
    readonly phone: WritableSignal<boolean>;
}

function phonePlace(): IPhonePlace {
    return { placeWidth: signal<number | null>(375), narrow: signal<boolean>(true), phone: signal<boolean>(true) };
}

type TFixture = ComponentFixture<WorkspaceSheetHostComponent>;

/** Открывает сведения и ждёт кадра, в который шторка поднимается. */
async function openDetails(): Promise<TFixture> {
    const fixture: TFixture = createRtFixture(
        WorkspaceSheetHostComponent,
        {},
        { providers: [{ provide: BreakpointsService, useValue: phonePlace() }] }
    );
    (el(fixture, 'rt-workspace')?.componentInstance as RtWorkspaceComponent).openAside();
    fixture.detectChanges();
    const app: ApplicationRef = TestBed.inject(ApplicationRef);
    app.tick();
    await new Promise<void>((resolve: () => void): void => {
        requestAnimationFrame((): void => resolve());
    });
    app.tick();

    return fixture;
}

function node(id: string): HTMLElement | null {
    return document.querySelector(`[qa-dataid="${id}"]`);
}

describe('Сведения рабочего стола на телефоне — шторка', (): void => {
    afterEach((): void => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
    });

    it('SC-UKV-1807 — сведения поднимаются шторкой во всю высоту с заголовком рабочего стола', async (): Promise<void> => {
        await openDetails();

        expect(node('aside-sheet')?.classList).toContain('rt-bottom-sheet--open');
        expect(node('bottom-sheet-panel')?.classList).toContain('rt-bottom-sheet__panel--full');
        expect(node('bottom-sheet-header')?.querySelector('[qa-dataid="aside-title"]')?.textContent?.trim()).toBe('Бронь 42');
        expect(node('bottom-sheet-body')?.querySelector('[qa-dataid="slot-aside"]')).not.toBeNull();
    });

    it('SC-UKV-1835 — «Закрыть» подвала в шторке не рисуется, «×» закрывает сведения', async (): Promise<void> => {
        const fixture: TFixture = await openDetails();
        const workspace: RtWorkspaceComponent = el(fixture, 'rt-workspace')?.componentInstance as RtWorkspaceComponent;

        expect(node('workspace-aside-overlay-close')).toBeNull();
        // В подвале шторки всегда стоят места справки и главной кнопки; пустые они не в счёт.
        const footer: Element[] = Array.from(node('bottom-sheet-footer')?.children ?? []).filter(
            (child: Element): boolean => !child.matches('.rt-bottom-sheet__info:empty, .rt-bottom-sheet__primary:empty')
        );
        expect(footer).toHaveLength(0);

        node('aside-sheet-close')?.querySelector('button')?.click();
        fixture.detectChanges();

        expect(workspace.asideOpen()).toBe(false);
        expect(node('slot-center')).not.toBeNull();
    });
});
