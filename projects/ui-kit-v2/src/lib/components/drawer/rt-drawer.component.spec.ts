import { ChangeDetectionStrategy, Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';

import { createRtFixture, qa } from '../../../testing/rt-kit-testing';
import { RtDrawerContainerComponent } from './rt-drawer-container.component';
import { RtDrawerComponent } from './rt-drawer.component';
import { IRtDrawer } from './rt-drawer.model';

/** Участок страницы с панелью: все входы панели — сигналы владельца. */
@Component({
    selector: 'rt-drawer-test-host',
    template: `
        <rt-drawer-container>
            <rt-drawer
                ariaLabel="Фильтры"
                [mode]="mode()"
                [position]="position()"
                [hasBackdrop]="backdrop()"
                [disableClose]="disableClose()"
                [resizable]="resizable()"
                [(opened)]="opened"
                [(width)]="width">
                <input qa-dataid="drawer-field" />
            </rt-drawer>
            <button type="button" qa-dataid="page-button">Отчёт</button>
        </rt-drawer-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [RtDrawerContainerComponent, RtDrawerComponent],
})
class DrawerHostComponent {
    public readonly mode: WritableSignal<IRtDrawer.Mode> = signal<IRtDrawer.Mode>('side');
    public readonly position: WritableSignal<IRtDrawer.Position> = signal<IRtDrawer.Position>('start');
    public readonly backdrop: WritableSignal<boolean> = signal(true);
    public readonly disableClose: WritableSignal<boolean> = signal(false);
    public readonly resizable: WritableSignal<boolean> = signal(false);
    public readonly opened: WritableSignal<boolean> = signal(false);
    public readonly width: WritableSignal<number> = signal(320);
}

function setup(apply: (host: DrawerHostComponent) => void = (): void => undefined): ComponentFixture<DrawerHostComponent> {
    const fixture: ComponentFixture<DrawerHostComponent> = createRtFixture(DrawerHostComponent);

    apply(fixture.componentInstance);
    fixture.detectChanges();
    return fixture;
}

function panel(fixture: ComponentFixture<DrawerHostComponent>): HTMLElement {
    return qa(fixture, 'drawer-panel')?.nativeElement as HTMLElement;
}

function change(fixture: ComponentFixture<DrawerHostComponent>, apply: (host: DrawerHostComponent) => void): void {
    apply(fixture.componentInstance);
    fixture.detectChanges();
}

function escape(fixture: ComponentFixture<DrawerHostComponent>): void {
    panel(fixture).dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
}

function over(fixture: ComponentFixture<DrawerHostComponent>): void {
    change(fixture, (it: DrawerHostComponent): void => {
        it.mode.set('over');
        it.opened.set(true);
    });
}

describe('RtDrawerComponent', (): void => {
    describe('рядом с содержимым', (): void => {
        it('SC-UKV-939 — панель стоит в строке контейнера рядом с содержимым и рисует ширину', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));
            const container: HTMLElement = qa(fixture, 'drawer-container')?.nativeElement as HTMLElement;

            expect(panel(fixture).classList).toContain('rt-drawer__panel--mode--side');
            expect(panel(fixture).classList).toContain('rt-drawer__panel--position--start');
            expect(panel(fixture).classList).toContain('rt-drawer__panel--opened');
            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('320px');
            expect(qa(fixture, 'drawer-backdrop')).toBeNull();
            expect(container.querySelector('[qa-dataid="drawer-container-content"] [qa-dataid="page-button"]')).not.toBeNull();
        });

        it('SC-UKV-939 — ширина вне пределов рисуется на пределе', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.width.set(5000));

            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('640px');
        });

        it('SC-UKV-939 — Escape в панели рядом с содержимым её не закрывает', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));

            escape(fixture);

            expect(fixture.componentInstance.opened()).toBe(true);
        });
    });

    describe('поверх содержимого', (): void => {
        it('SC-UKV-939 — подложка видна при открытой панели и закрывает её', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup();
            over(fixture);
            const backdrop: HTMLElement = qa(fixture, 'drawer-backdrop')?.nativeElement as HTMLElement;

            expect(backdrop.classList).toContain('rt-drawer__backdrop--visible');

            backdrop.click();
            fixture.detectChanges();

            expect(fixture.componentInstance.opened()).toBe(false);
            expect(backdrop.classList).not.toContain('rt-drawer__backdrop--visible');
        });

        it('SC-UKV-939 — Escape в панели закрывает её и не уходит выше', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup();
            const above: jest.Mock = jest.fn();
            over(fixture);
            (fixture.nativeElement as HTMLElement).addEventListener('keydown', above);

            escape(fixture);

            expect(fixture.componentInstance.opened()).toBe(false);
            expect(above).not.toHaveBeenCalled();
        });

        it('SC-UKV-939 — с disableClose ни подложка, ни Escape панель не закрывают', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.disableClose.set(true));
            over(fixture);

            (qa(fixture, 'drawer-backdrop')?.nativeElement as HTMLElement).click();
            escape(fixture);

            expect(fixture.componentInstance.opened()).toBe(true);
        });

        it('SC-UKV-939 — без подложки её нет и поверх', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.backdrop.set(false));
            over(fixture);

            expect(qa(fixture, 'drawer-backdrop')).toBeNull();
        });
    });

    it('SC-UKV-940 — закрытая панель недоступна фокусу, набранный текст переживает закрытие', (): void => {
        const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => it.opened.set(true));
        const field: HTMLInputElement = qa(fixture, 'drawer-field')?.nativeElement as HTMLInputElement;

        expect(panel(fixture).hasAttribute('inert')).toBe(false);
        field.value = 'Москва';

        change(fixture, (it: DrawerHostComponent): void => it.opened.set(false));
        expect(panel(fixture).hasAttribute('inert')).toBe(true);
        expect(panel(fixture).classList).not.toContain('rt-drawer__panel--opened');

        change(fixture, (it: DrawerHostComponent): void => it.opened.set(true));
        expect((qa(fixture, 'drawer-field')?.nativeElement as HTMLInputElement).value).toBe('Москва');
    });

    describe('ширина', (): void => {
        it('SC-UKV-938 — ручка стоит у внутреннего края и пишет ширину владельцу', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => {
                it.opened.set(true);
                it.resizable.set(true);
            });
            const handle: HTMLElement = qa(fixture, 'resize-handle')?.nativeElement as HTMLElement;

            expect(handle.classList).toContain('rt-resize-handle--edge--end');
            expect(handle.getAttribute('aria-label')).toBe('Фильтры');

            handle.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
            fixture.detectChanges();

            expect(fixture.componentInstance.width()).toBe(336);
            expect(panel(fixture).style.getPropertyValue('--rt-drawer-width')).toBe('336px');
        });

        it('SC-UKV-938 — у панели справа ручка стоит у левого края', (): void => {
            const fixture: ComponentFixture<DrawerHostComponent> = setup((it: DrawerHostComponent): void => {
                it.position.set('end');
                it.resizable.set(true);
            });

            expect((qa(fixture, 'resize-handle')?.nativeElement as HTMLElement).classList).toContain('rt-resize-handle--edge--start');
        });

        it('без resizable ручки нет', (): void => {
            expect(qa(setup(), 'resize-handle')).toBeNull();
        });
    });
});
