import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { classesOf, createRtFixture, el, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtWorkspaceComponent } from './rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from './rt-workspace.directives';

/**
 * Три зоны объявляются директивами на `ng-template`, и без обёртки их не объявить.
 *
 * Обёртка нужна и там, где слоты как будто ни при чём: рабочий стол не рисует панель, для которой
 * шаблон не объявлен, — значит голый компонент не даёт ни ручек, ни панелей, и проверять на нём
 * ширины и клавиши нечего.
 */
@Component({
    selector: 'rt-workspace-host',
    template: `
        <rt-workspace [hasActive]="hasActive" [storageKey]="storageKey" [listDefaultWidth]="listDefaultWidth" [listMinWidth]="listMinWidth">
            <ng-template rtWorkspaceList><span qa-dataid="slot-list">Список</span></ng-template>
            <ng-template rtWorkspaceCenter><span qa-dataid="slot-center">Карточка</span></ng-template>
            <ng-template rtWorkspaceAside><span qa-dataid="slot-aside">Подробности</span></ng-template>
        </rt-workspace>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWorkspaceComponent, RtWorkspaceListDirective, RtWorkspaceCenterDirective, RtWorkspaceAsideDirective],
})
class WorkspaceHostComponent {
    public hasActive: boolean = false;
    public storageKey: string | null = null;
    public listDefaultWidth: number = 320;
    public listMinWidth: number = 240;
}

/** Только середина: панелей по краям и ручек между ними быть не должно. */
@Component({
    selector: 'rt-workspace-center-only-host',
    template: `
        <rt-workspace>
            <ng-template rtWorkspaceCenter><span qa-dataid="slot-center">Карточка</span></ng-template>
        </rt-workspace>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWorkspaceComponent, RtWorkspaceCenterDirective],
})
class WorkspaceCenterOnlyHostComponent {}

/** Список и середина: правой панели нет, левая ручка есть. */
@Component({
    selector: 'rt-workspace-no-aside-host',
    template: `
        <rt-workspace>
            <ng-template rtWorkspaceList><span qa-dataid="slot-list">Список</span></ng-template>
            <ng-template rtWorkspaceCenter><span qa-dataid="slot-center">Карточка</span></ng-template>
        </rt-workspace>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtWorkspaceComponent, RtWorkspaceListDirective, RtWorkspaceCenterDirective],
})
class WorkspaceNoAsideHostComponent {}

function setup(inputs: Partial<WorkspaceHostComponent> = {}): ComponentFixture<WorkspaceHostComponent> {
    // Поля обёртки ставятся до первой отрисовки: рабочий стол считает ширины при подъёме, и
    // значение, приехавшее после, их уже не меняет.
    const fixture: ComponentFixture<WorkspaceHostComponent> = createRtFixture(WorkspaceHostComponent, {}, { skipInitialDetect: true });
    Object.assign(fixture.componentInstance, inputs);
    fixture.detectChanges();

    return fixture;
}

/** Сам рабочий стол внутри обёртки: на нём стоят и переменные ширин, и классы состояния. */
function workspace(fixture: ComponentFixture<unknown>): RtWorkspaceComponent {
    return el(fixture, 'rt-workspace')?.componentInstance as RtWorkspaceComponent;
}

function root(fixture: ComponentFixture<unknown>): HTMLElement {
    return el(fixture, 'rt-workspace')?.nativeElement as HTMLElement;
}

function widthVar(fixture: ComponentFixture<unknown>, name: string): string {
    return root(fixture).style.getPropertyValue(name);
}

function key(fixture: ComponentFixture<unknown>, id: string, name: string): void {
    qa(fixture, id)?.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
}

describe('RtWorkspaceComponent', (): void => {
    beforeEach((): void => {
        localStorage.clear();
    });

    it('рисует три зоны и две ручки между ними, когда объявлены все три слота', (): void => {
        const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

        expect(qa(fixture, 'workspace-list')).not.toBeNull();
        expect(qa(fixture, 'workspace-center')).not.toBeNull();
        expect(qa(fixture, 'workspace-aside')).not.toBeNull();
        expect(qa(fixture, 'workspace-handle-list')).not.toBeNull();
        expect(qa(fixture, 'workspace-handle-aside')).not.toBeNull();
    });

    it('содержимое зон приходит шаблонами', (): void => {
        const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

        expect(textOf(qa(fixture, 'workspace-list'))).toBe('Список');
        expect(textOf(qa(fixture, 'workspace-aside'))).toBe('Подробности');
    });

    describe('необъявленные слоты', (): void => {
        it('SC-UKV-145 — рабочий стол с одной серединой рисует одну панель', (): void => {
            const fixture: ComponentFixture<WorkspaceCenterOnlyHostComponent> = createRtFixture(WorkspaceCenterOnlyHostComponent);

            expect(qa(fixture, 'workspace-center')).not.toBeNull();
            expect(qa(fixture, 'workspace-list')).toBeNull();
            expect(qa(fixture, 'workspace-aside')).toBeNull();
            expect(qa(fixture, 'workspace-handle-list')).toBeNull();
            expect(qa(fixture, 'workspace-handle-aside')).toBeNull();
        });

        it('SC-UKV-146 — незаявленная панель уносит свою ручку', (): void => {
            const fixture: ComponentFixture<WorkspaceNoAsideHostComponent> = createRtFixture(WorkspaceNoAsideHostComponent);

            expect(qa(fixture, 'workspace-handle-list')).not.toBeNull();
            expect(qa(fixture, 'workspace-handle-aside')).toBeNull();
            expect(qa(fixture, 'workspace-aside')).toBeNull();
        });

        it('SC-UKV-147 — объявленная закрытая панель подробностей остаётся нарисованной', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            expect(workspace(fixture).asideOpen()).toBe(false);
            expect(qa(fixture, 'workspace-aside')).not.toBeNull();
            expect(qa(fixture, 'workspace-handle-aside')).not.toBeNull();
        });
    });

    describe('ширины', (): void => {
        it('без входов берутся умолчания', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('320px');
            expect(widthVar(fixture, '--rt-workspace-aside-size')).toBe('360px');
        });

        it('умолчание задаётся входом', (): void => {
            expect(widthVar(setup({ listDefaultWidth: 280 }), '--rt-workspace-list-size')).toBe('280px');
        });

        it('стрелки двигают ручку с шагом', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            key(fixture, 'workspace-handle-list', 'ArrowRight');

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('336px');
        });

        it('стрелки у правой ручки двигают её в другую сторону — панель растёт влево', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            key(fixture, 'workspace-handle-aside', 'ArrowLeft');

            expect(widthVar(fixture, '--rt-workspace-aside-size')).toBe('376px');
        });

        it('ширина не уходит за заданные границы', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup({ listDefaultWidth: 250, listMinWidth: 240 });

            key(fixture, 'workspace-handle-list', 'ArrowLeft');

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('240px');
        });

        it('двойной клик по ручке возвращает умолчание', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();
            key(fixture, 'workspace-handle-list', 'ArrowRight');

            qa(fixture, 'workspace-handle-list')?.nativeElement.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
            fixture.detectChanges();

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('320px');
        });
    });

    describe('ручки', (): void => {
        it('объявлены разделителями и доступны с клавиатуры', (): void => {
            const handle: HTMLElement = qa(setup(), 'workspace-handle-list')?.nativeElement as HTMLElement;

            expect(handle.getAttribute('role')).toBe('separator');
            expect(handle.getAttribute('aria-orientation')).toBe('vertical');
            expect(handle.getAttribute('tabindex')).toBe('0');
        });

        it('сообщают текущую ширину и её границы', (): void => {
            const handle: HTMLElement = qa(setup(), 'workspace-handle-list')?.nativeElement as HTMLElement;

            expect(handle.getAttribute('aria-valuenow')).toBe('320');
            expect(handle.getAttribute('aria-valuemin')).toBe('240');
            expect(handle.getAttribute('aria-valuemax')).toBe('480');
        });
    });

    describe('панель подробностей', (): void => {
        it('изначально закрыта', (): void => {
            expect(workspace(setup()).asideOpen()).toBe(false);
        });

        it('открывается и закрывается вызовом', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            workspace(fixture).openAside();
            fixture.detectChanges();
            expect(workspace(fixture).asideOpen()).toBe(true);

            workspace(fixture).closeAside();
            fixture.detectChanges();
            expect(workspace(fixture).asideOpen()).toBe(false);
        });

        it('сворачивание помечает host — на широком экране панель просто прячется', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            workspace(fixture).toggleAsideCollapsed();
            fixture.detectChanges();

            expect(classesOf(root(fixture))).toContain('rt-workspace--aside-collapsed');
        });
    });

    describe('узкий экран', (): void => {
        it('без выбранной записи панели действий нет', (): void => {
            expect(qa(setup(), 'workspace-back')).toBeNull();
        });

        it('с выбранной записью появляются кнопки «назад» и «подробности»', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup({ hasActive: true });

            expect(qa(fixture, 'workspace-back')).not.toBeNull();
            expect(qa(fixture, 'workspace-open-details')).not.toBeNull();
            expect(classesOf(root(fixture))).toContain('rt-workspace--has-active');
        });

        it('кнопка «назад» закрывает панель подробностей и сообщает наружу', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup({ hasActive: true });
            const backs: jest.Mock = jest.fn();
            workspace(fixture).backClicked.subscribe(backs);
            workspace(fixture).openAside();
            fixture.detectChanges();

            el(fixture, '[qa-dataid="workspace-back"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(backs).toHaveBeenCalledTimes(1);
            expect(workspace(fixture).asideOpen()).toBe(false);
        });
    });

    describe('память ширин', (): void => {
        it('без ключа ничего не сохраняется', (): void => {
            const fixture: ComponentFixture<WorkspaceHostComponent> = setup();

            key(fixture, 'workspace-handle-list', 'ArrowRight');

            expect(localStorage.length).toBe(0);
        });

        it('с ключом ширина переживает пересоздание', (): void => {
            // Раскладку рабочего стола настраивают один раз: сбрасывать её на
            // каждом заходе было бы хуже, чем помнить.
            const first: ComponentFixture<WorkspaceHostComponent> = setup({ storageKey: 'inbox' });
            key(first, 'workspace-handle-list', 'ArrowRight');

            const second: ComponentFixture<WorkspaceHostComponent> = setup({ storageKey: 'inbox' });

            expect(widthVar(second, '--rt-workspace-list-size')).toBe('336px');
        });
    });
});
