import { join } from 'node:path';

import { OverlayContainer } from '@angular/cdk/overlay';
import { ApplicationRef, ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import * as sass from 'sass';

import { classesOf, createRtFixture, el, qa } from '../../../testing/rt-kit-testing';
import { BreakpointsService } from '../../platform';
import { RtWorkspaceComponent } from './rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from './rt-workspace.directives';

const STYLES: string = join(__dirname, 'rt-workspace.component.scss');
const STYLES_ROOT: string = join(__dirname, '../../../styles');

@Component({
    selector: 'rt-workspace-breakpoint-host',
    template: `
        <rt-workspace hasActive [singleColumnBreakpoint]="breakpoint" [asideOverlayWidth]="overlayWidth">
            <ng-template rtWorkspaceList><span qa-dataid="slot-list">Список</span></ng-template>
            <ng-template rtWorkspaceCenter><span qa-dataid="slot-center">Карточка</span></ng-template>
            <ng-template rtWorkspaceAside><span qa-dataid="slot-aside">Подробности</span></ng-template>
        </rt-workspace>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWorkspaceComponent, RtWorkspaceListDirective, RtWorkspaceCenterDirective, RtWorkspaceAsideDirective],
})
class WorkspaceBreakpointHostComponent {
    public breakpoint: number | null = 600;
    public overlayWidth: number = 540;
}

/** Ширина места страницы задаётся тестом: jsdom страницу не раскладывает. */
interface IPlace {
    readonly placeWidth: WritableSignal<number | null>;
    readonly narrow: WritableSignal<boolean>;
    readonly phone: WritableSignal<boolean>;
}

function place(width: number): IPlace {
    return { placeWidth: signal<number | null>(width), narrow: signal<boolean>(width <= 1080), phone: signal<boolean>(false) };
}

function setup(width: number, inputs: Partial<WorkspaceBreakpointHostComponent> = {}): ComponentFixture<WorkspaceBreakpointHostComponent> {
    const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = createRtFixture(
        WorkspaceBreakpointHostComponent,
        {},
        { skipInitialDetect: true, providers: [{ provide: BreakpointsService, useValue: place(width) }] }
    );
    Object.assign(fixture.componentInstance, inputs);
    fixture.detectChanges();

    return fixture;
}

function workspace(fixture: ComponentFixture<unknown>): RtWorkspaceComponent {
    return el(fixture, 'rt-workspace')?.componentInstance as RtWorkspaceComponent;
}

function root(fixture: ComponentFixture<unknown>): HTMLElement {
    return el(fixture, 'rt-workspace')?.nativeElement as HTMLElement;
}

/** Открывает панель сведений и даёт оверлею отрисоваться: без зоны его поднимает `tick`. */
function openAside(fixture: ComponentFixture<unknown>): void {
    workspace(fixture).openAside();
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
}

function overlayPanel(): HTMLElement | null {
    return document.querySelector('.rt-aside-overlay');
}

describe('порог одной колонки рабочего стола', (): void => {
    afterEach((): void => {
        TestBed.inject(OverlayContainer).ngOnDestroy();
    });

    it('SC-UKV-1241 — без входа порога вид держат стили, панель сведений рисуется на месте', (): void => {
        const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = setup(768, { breakpoint: null });

        expect(classesOf(root(fixture))).not.toContain('rt-workspace--breakpoint');
        expect(classesOf(root(fixture))).not.toContain('rt-workspace--single');
        expect(workspace(fixture).asideOverlay()).toBe(false);

        openAside(fixture);

        expect(overlayPanel()).toBeNull();
        expect(qa(fixture, 'workspace-aside')?.nativeElement.querySelector('[qa-dataid="slot-aside"]')).not.toBeNull();
    });

    it('SC-UKV-1242 — место не шире порога из входа: одна колонка, панель сведений на месте', (): void => {
        const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = setup(375);

        expect(classesOf(root(fixture))).toEqual(expect.arrayContaining(['rt-workspace--breakpoint', 'rt-workspace--single']));
        expect(workspace(fixture).asideOverlay()).toBe(false);

        openAside(fixture);

        expect(overlayPanel()).toBeNull();
        expect(classesOf(qa(fixture, 'workspace-aside'))).toContain('rt-workspace__aside--open');
    });

    it('SC-UKV-1243 — шире порога список и середина рядом, панель сведений открывается поверх окна', (): void => {
        const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = setup(768);

        expect(classesOf(root(fixture))).toContain('rt-workspace--breakpoint');
        expect(classesOf(root(fixture))).not.toContain('rt-workspace--single');
        expect(workspace(fixture).asideOverlay()).toBe(true);
        // Колонки панели нет: её шаблон выводит панель поверх окна
        expect(classesOf(qa(fixture, 'workspace-aside'))).toContain('rt-workspace__aside--overlay');
        expect(qa(fixture, 'slot-aside')).toBeNull();

        openAside(fixture);

        const panel: HTMLElement = overlayPanel() as HTMLElement;
        expect(classesOf(panel)).toContain('rt-workspace-aside-pane');
        expect(panel.querySelector('[qa-dataid="slot-aside"]')?.textContent).toBe('Подробности');
        expect(panel.querySelector('[qa-dataid="aside"]')?.getAttribute('role')).toBe('dialog');
        expect((panel.querySelector('[qa-dataid="aside"]') as HTMLElement).style.getPropertyValue('--rt-aside-width')).toBe(
            'min(540px, 100dvw)'
        );
        expect(document.querySelector('.cdk-overlay-backdrop')).not.toBeNull();
    });

    it('SC-UKV-1244 — кнопка «Закрыть» закрывает панель поверх окна', (): void => {
        const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = setup(768);
        openAside(fixture);

        const close: HTMLButtonElement = overlayPanel()?.querySelector('[qa-dataid="workspace-aside-overlay-close"]') as HTMLButtonElement;
        close.click();

        expect(close.type).toBe('button');
        expect(workspace(fixture).asideOpen()).toBe(false);
    });

    it('SC-UKV-1245 — щелчок по затемнению и клавиша Esc закрывают панель поверх окна', (): void => {
        const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = setup(768);

        openAside(fixture);
        (document.querySelector('.cdk-overlay-backdrop') as HTMLElement).click();
        expect(workspace(fixture).asideOpen()).toBe(false);

        openAside(fixture);
        expect(workspace(fixture).asideOpen()).toBe(true);
        document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(workspace(fixture).asideOpen()).toBe(false);
    });

    it('SC-UKV-1246 — ширина панели поверх окна задаётся входом', (): void => {
        const fixture: ComponentFixture<WorkspaceBreakpointHostComponent> = setup(768, { overlayWidth: 420 });
        openAside(fixture);

        const frame: HTMLElement = overlayPanel()?.querySelector('[qa-dataid="aside"]') as HTMLElement;

        expect(frame.style.getPropertyValue('--rt-aside-width')).toBe('min(420px, 100dvw)');
    });

    it('SC-UKV-1247 — с порогом из входа правила порога 768 снимает класс рабочего стола', (): void => {
        const css: string = sass.compile(STYLES, { style: 'expanded', loadPaths: [STYLES_ROOT] }).css;

        expect(css).toMatch(/\.rt-workspace:not\(\.rt-workspace--breakpoint\) \.rt-workspace__list \{\s+flex-basis: 100%;/);
        expect(css).toMatch(/\.rt-workspace--has-active:not\(\.rt-workspace--breakpoint\) \.rt-workspace__list \{\s+display: none;/);
        expect(css).toMatch(/\.rt-workspace--single\.rt-workspace--has-active \.rt-workspace__list \{\s+display: none;/);
        // Панель поверх окна держит свою ширину и на узком окне: иначе затемнение негде нажать
        expect(css).toMatch(/\.rt-aside-overlay\.rt-workspace-aside-pane \{\s+width: auto;/);
    });
});
