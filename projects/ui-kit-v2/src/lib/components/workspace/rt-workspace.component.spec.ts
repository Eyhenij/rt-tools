import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, el, hostClasses, qa, textOf } from '../../../testing/rt-kit-testing';
import { RtWorkspaceComponent } from './rt-workspace.component';
import { RtWorkspaceAsideDirective, RtWorkspaceCenterDirective, RtWorkspaceListDirective } from './rt-workspace.directives';

/** Три зоны объявляются директивами на `ng-template` — нужна host-обёртка. */
@Component({
    selector: 'rt-workspace-host',
    template: `
        <rt-workspace [hasActive]="hasActive" [storageKey]="storageKey">
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
}

function setup(inputs: Readonly<Record<string, unknown>> = {}): ComponentFixture<RtWorkspaceComponent> {
    return createRtFixture(RtWorkspaceComponent, inputs);
}

function widthVar(fixture: ComponentFixture<RtWorkspaceComponent>, name: string): string {
    return (fixture.nativeElement as HTMLElement).style.getPropertyValue(name);
}

function key(fixture: ComponentFixture<RtWorkspaceComponent>, id: string, name: string): void {
    qa(fixture, id)?.nativeElement.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }));
    fixture.detectChanges();
}

describe('RtWorkspaceComponent', (): void => {
    beforeEach((): void => {
        localStorage.clear();
    });

    it('рисует три зоны и две ручки между ними', (): void => {
        const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

        expect(qa(fixture, 'workspace-list')).not.toBeNull();
        expect(qa(fixture, 'workspace-center')).not.toBeNull();
        expect(qa(fixture, 'workspace-aside')).not.toBeNull();
        expect(qa(fixture, 'workspace-handle-list')).not.toBeNull();
        expect(qa(fixture, 'workspace-handle-aside')).not.toBeNull();
    });

    it('содержимое зон приходит шаблонами', (): void => {
        const fixture: ComponentFixture<WorkspaceHostComponent> = createRtFixture(WorkspaceHostComponent);

        expect(textOf(qa(fixture, 'workspace-list'))).toBe('Список');
        expect(textOf(qa(fixture, 'workspace-aside'))).toBe('Подробности');
    });

    describe('ширины', (): void => {
        it('без входов берутся умолчания', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('320px');
            expect(widthVar(fixture, '--rt-workspace-aside-size')).toBe('360px');
        });

        it('умолчание задаётся входом', (): void => {
            expect(widthVar(setup({ listDefaultWidth: 280 }), '--rt-workspace-list-size')).toBe('280px');
        });

        it('стрелки двигают ручку с шагом', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

            key(fixture, 'workspace-handle-list', 'ArrowRight');

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('336px');
        });

        it('стрелки у правой ручки двигают её в другую сторону — панель растёт влево', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

            key(fixture, 'workspace-handle-aside', 'ArrowLeft');

            expect(widthVar(fixture, '--rt-workspace-aside-size')).toBe('376px');
        });

        it('ширина не уходит за заданные границы', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup({ listDefaultWidth: 250, listMinWidth: 240 });

            key(fixture, 'workspace-handle-list', 'ArrowLeft');

            expect(widthVar(fixture, '--rt-workspace-list-size')).toBe('240px');
        });

        it('двойной клик по ручке возвращает умолчание', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();
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
            expect(setup().componentInstance.asideOpen()).toBe(false);
        });

        it('открывается и закрывается вызовом', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

            fixture.componentInstance.openAside();
            fixture.detectChanges();
            expect(fixture.componentInstance.asideOpen()).toBe(true);

            fixture.componentInstance.closeAside();
            fixture.detectChanges();
            expect(fixture.componentInstance.asideOpen()).toBe(false);
        });

        it('сворачивание помечает host — на широком экране панель просто прячется', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

            fixture.componentInstance.toggleAsideCollapsed();
            fixture.detectChanges();

            expect(hostClasses(fixture)).toContain('rt-workspace--aside-collapsed');
        });
    });

    describe('узкий экран', (): void => {
        it('без выбранной записи панели действий нет', (): void => {
            expect(qa(setup(), 'workspace-back')).toBeNull();
        });

        it('с выбранной записью появляются кнопки «назад» и «подробности»', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup({ hasActive: true });

            expect(qa(fixture, 'workspace-back')).not.toBeNull();
            expect(qa(fixture, 'workspace-open-details')).not.toBeNull();
            expect(hostClasses(fixture)).toContain('rt-workspace--has-active');
        });

        it('кнопка «назад» закрывает панель подробностей и сообщает наружу', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup({ hasActive: true });
            const backs: jest.Mock = jest.fn();
            fixture.componentInstance.backClicked.subscribe(backs);
            fixture.componentInstance.openAside();
            fixture.detectChanges();

            el(fixture, '[qa-dataid="workspace-back"] [qa-dataid="icon-button-control"]')?.nativeElement.click();
            fixture.detectChanges();

            expect(backs).toHaveBeenCalledTimes(1);
            expect(fixture.componentInstance.asideOpen()).toBe(false);
        });
    });

    describe('память ширин', (): void => {
        it('без ключа ничего не сохраняется', (): void => {
            const fixture: ComponentFixture<RtWorkspaceComponent> = setup();

            key(fixture, 'workspace-handle-list', 'ArrowRight');

            expect(localStorage.length).toBe(0);
        });

        it('с ключом ширина переживает пересоздание', (): void => {
            // Раскладку рабочего стола настраивают один раз: сбрасывать её на
            // каждом заходе было бы хуже, чем помнить.
            const first: ComponentFixture<RtWorkspaceComponent> = setup({ storageKey: 'inbox' });
            key(first, 'workspace-handle-list', 'ArrowRight');

            const second: ComponentFixture<RtWorkspaceComponent> = setup({ storageKey: 'inbox' });

            expect(widthVar(second, '--rt-workspace-list-size')).toBe('336px');
        });
    });
});
